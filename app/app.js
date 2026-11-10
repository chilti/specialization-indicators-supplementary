/**
 * app.js
 * ------
 * Scientometric Specialization Explorer — OpenAlex (3 Hierarchy Levels)
 * Implements:
 * - Scenario 1: Countries Comparison (Global Context)
 * - Scenario 2: Domains Comparison (Local Context)
 * - 5x3 Longitudinal Evolution Grid (14 subplots per Country x Area)
 * - Pearson & Spearman Correlation Engine (including previous complete year & historical comparison)
 * - CSV Data Export (Time series, Scenario ranking tables, Correlation matrices)
 * - Local LLM Integration for dinamica1 (Ollama / OpenAI-compatible proxy or direct)
 */

(function() {
  const STATE = {
    lang: "es",
    docType: "all",       // 'all' | 'citable'
    taxLevel: "fields",   // 'domains' | 'fields' | 'subfields'
    scenario: "global",   // 'global' | 'local' | 'evolution'
    selectedArea: "Agricultural and Biological Sciences",
    selectedCountry: "MX",
    refYear: 2024,
    taxonomy: null,
    countriesMap: {},
    datasets: {
      all: null,
      citable: null,
      subfields: null
    },
    currentTableRows: [],
    currentCorrelationsSummary: [],
    llmConfig: {
      url: "http://localhost:11434",
      model: "llama3.1",
      online: false
    }
  };

  // --- Statistical & Indicator Utilities ---
  function pearson(x, y) {
    const n = x.length;
    if (n < 3) return NaN;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i]; }
    const mx = sx / n, my = sy / n;
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) {
      const vx = x[i] - mx;
      const vy = y[i] - my;
      num += vx * vy;
      dx += vx * vx;
      dy += vy * vy;
    }
    if (dx === 0 || dy === 0) return NaN;
    return num / Math.sqrt(dx * dy);
  }

  function rankArray(arr) {
    const n = arr.length;
    const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j + 1 < n && indexed[j + 1].v === indexed[i].v) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[indexed[k].i] = avg;
      i = j + 1;
    }
    return ranks;
  }

  function spearman(x, y) {
    if (x.length < 3) return NaN;
    return pearson(rankArray(x), rankArray(y));
  }

  function calcPointIndicators(ocd, oc, owd, ow) {
    const DShareC = oc > 0 ? ocd / oc : 0;
    const CShareD = owd > 0 ? ocd / owd : 0;
    const DShareW = ow > 0 ? owd / ow : 0;
    const AI = DShareW > 0 ? DShareC / DShareW : 0;
    const RSI = (AI + 1) > 0 ? (AI - 1) / (AI + 1) : -1;
    const FMeasure = (oc + owd) > 0 ? (2 * ocd) / (oc + owd) : 0;
    const AMeasure = 0.5 * (DShareC + CShareD);
    const GMeasure = (DShareC > 0 && CShareD > 0) ? Math.sqrt(DShareC * CShareD) : 0;
    const GAggregation = Math.sqrt(Math.max(0, DShareC)) + Math.sqrt(Math.max(0, CShareD));
    return {
      Output: ocd,
      CountryTotal: oc,
      WorldAreaTotal: owd,
      WorldTotal: ow,
      CountryGlobalShare: ow > 0 ? oc / ow : 0,
      DShareC,
      DShareW,
      CShareD,
      AI,
      RSI,
      FMeasure,
      AMeasure,
      GMeasure,
      GAggregation
    };
  }

  function computeCorrelationBundle(rows) {
    // Filter rows with positive output for Countries Comparison or valid entries
    const active = rows.filter(r => r.Output > 0);
    const target = active.length >= 4 ? active : rows;
    const AI = target.map(r => r.AI);
    const FM = target.map(r => r.FMeasure);
    const DShareC = target.map(r => r.DShareC);
    const CShareD = target.map(r => r.CShareD);
    const GAgg = target.map(r => r.GAggregation);
    const RSI = target.map(r => r.RSI);

    return {
      n: target.length,
      pearson: {
        AI_DShareC: pearson(AI, DShareC),
        AI_CShareD: pearson(AI, CShareD),
        FM_DShareC: pearson(FM, DShareC),
        FM_CShareD: pearson(FM, CShareD),
        GAgg_DShareC: pearson(GAgg, DShareC),
        GAgg_CShareD: pearson(GAgg, CShareD),
        AI_FM: pearson(AI, FM),
        DShareC_CShareD: pearson(DShareC, CShareD)
      },
      spearman: {
        AI_DShareC: spearman(AI, DShareC),
        AI_CShareD: spearman(AI, CShareD),
        FM_DShareC: spearman(FM, DShareC),
        FM_CShareD: spearman(FM, CShareD),
        GAgg_DShareC: spearman(GAgg, DShareC),
        GAgg_CShareD: spearman(GAgg, CShareD),
        AI_RSI: spearman(AI, RSI),
        AI_FM: spearman(AI, FM),
        DShareC_CShareD: spearman(DShareC, CShareD)
      }
    };
  }

  // --- Data Accessors across 3 Hierarchy Levels ---
  function getActiveBaseData() {
    return STATE.datasets[STATE.docType] || STATE.datasets.all;
  }

  function getAreasForLevel(level) {
    const base = getActiveBaseData();
    if (!base) return [];
    if (level === "domains") return base.domains;
    if (level === "fields") return base.fields;
    if (level === "subfields" && STATE.datasets.subfields) {
      return STATE.datasets.subfields.subfields.map(s => s.name);
    }
    return base.fields;
  }

  function getSubfieldMeta(sfName) {
    if (!STATE.datasets.subfields) return null;
    return STATE.datasets.subfields.subfields.find(s => s.name === sfName) || null;
  }

  function getWorldAreaSeries(level, areaName) {
    const base = getActiveBaseData();
    if (level === "domains") return base.world_domains[areaName] || new Array(base.years.length).fill(0);
    if (level === "fields") return base.world_fields[areaName] || new Array(base.years.length).fill(0);
    if (level === "subfields" && STATE.datasets.subfields) {
      const sfSeries = STATE.datasets.subfields.world_subfields[areaName];
      if (!sfSeries) return new Array(base.years.length).fill(0);
      if (STATE.docType === "citable") {
        // Scale subfield series by citable/all ratio of parent field
        const meta = getSubfieldMeta(areaName);
        if (meta && STATE.datasets.all && STATE.datasets.citable) {
          const allF = STATE.datasets.all.world_fields[meta.field] || [];
          const citF = STATE.datasets.citable.world_fields[meta.field] || [];
          return sfSeries.map((v, idx) => {
            const ratio = allF[idx] > 0 ? citF[idx] / allF[idx] : 0.85;
            return Math.round(v * ratio);
          });
        }
      }
      return sfSeries;
    }
    return new Array(base.years.length).fill(0);
  }

  function getCountryAreaSeries(level, countryCode, areaName) {
    const base = getActiveBaseData();
    const nYears = base.years.length;
    if (level === "domains") {
      return (base.units_domains[countryCode] && base.units_domains[countryCode][areaName]) || new Array(nYears).fill(0);
    }
    if (level === "fields") {
      return (base.units_fields[countryCode] && base.units_fields[countryCode][areaName]) || new Array(nYears).fill(0);
    }
    if (level === "subfields" && STATE.datasets.subfields) {
      const sfUnit = STATE.datasets.subfields.units_sf_23_24[countryCode];
      if (!sfUnit || !sfUnit[areaName]) return new Array(nYears).fill(0);
      const [v23, v24] = sfUnit[areaName];
      const meta = getSubfieldMeta(areaName);
      const parentField = meta ? meta.field : null;
      const parentSeries = (parentField && base.units_fields[countryCode] && base.units_fields[countryCode][parentField]) || new Array(nYears).fill(0);
      const allParent = (parentField && STATE.datasets.all.units_fields[countryCode] && STATE.datasets.all.units_fields[countryCode][parentField]) || new Array(nYears).fill(0);
      const p23_24 = (allParent[nYears - 2] || 0) + (allParent[nYears - 1] || 0);
      const shareInField = p23_24 > 0 ? Math.min(1.0, (v23 + v24) / p23_24) : 0.08;

      return base.years.map((yr, idx) => {
        const citRatio = (STATE.docType === "citable" && allParent[idx] > 0) ? (parentSeries[idx] / allParent[idx]) : 1.0;
        if (yr === 2023) return Math.round(v23 * citRatio);
        if (yr === 2024) return Math.round(v24 * citRatio);
        return Math.round(parentSeries[idx] * shareInField);
      });
    }
    return new Array(nYears).fill(0);
  }

  function getCountryName(code) {
    if (STATE.countriesMap && STATE.countriesMap[code]) {
      return `${STATE.countriesMap[code].name} (${code})`;
    }
    return code;
  }

  // --- Data Builders for Scenarios ---
  function buildScenario1Rows(level, areaName, year) {
    const base = getActiveBaseData();
    const yIdx = base.years.indexOf(Number(year));
    if (yIdx < 0) return [];
    const ow = base.world_total[yIdx] || 0;
    const owd = getWorldAreaSeries(level, areaName)[yIdx] || 0;
    const units = Object.keys(base.units_total);
    const rows = [];

    for (const u of units) {
      const oc = (base.units_total[u] && base.units_total[u][yIdx]) || 0;
      const ocd = getCountryAreaSeries(level, u, areaName)[yIdx] || 0;
      if (oc <= 0 && ocd <= 0) continue;
      const ind = calcPointIndicators(ocd, oc, owd, ow);
      rows.push({
        id: u,
        label: getCountryName(u),
        ...ind
      });
    }
    rows.sort((a, b) => b.Output - a.Output);
    return rows;
  }

  function buildScenario2Rows(level, countryCode, year) {
    const base = getActiveBaseData();
    const yIdx = base.years.indexOf(Number(year));
    if (yIdx < 0) return [];
    const ow = base.world_total[yIdx] || 0;
    const oc = (base.units_total[countryCode] && base.units_total[countryCode][yIdx]) || 0;
    const areas = getAreasForLevel(level);
    const rows = [];

    for (const a of areas) {
      const owd = getWorldAreaSeries(level, a)[yIdx] || 0;
      const ocd = getCountryAreaSeries(level, countryCode, a)[yIdx] || 0;
      const ind = calcPointIndicators(ocd, oc, owd, ow);
      rows.push({
        id: a,
        label: a,
        ...ind
      });
    }
    rows.sort((a, b) => b.Output - a.Output);
    return rows;
  }

  function buildTimeSeriesFor5x3(level, countryCode, areaName) {
    const base = getActiveBaseData();
    const years = base.years;
    const owArr = base.world_total;
    const ocArr = base.units_total[countryCode] || new Array(years.length).fill(0);
    const owdArr = getWorldAreaSeries(level, areaName);
    const ocdArr = getCountryAreaSeries(level, countryCode, areaName);

    return years.map((yr, idx) => {
      const ind = calcPointIndicators(ocdArr[idx] || 0, ocArr[idx] || 0, owdArr[idx] || 0, owArr[idx] || 0);
      return { year: yr, ...ind };
    });
  }

  // --- UI Initialization & Rendering ---
  async function initApp() {
    try {
      const [taxRes, allRes, sfRes] = await Promise.all([
        fetch("data/taxonomy.json").then(r => r.json()),
        fetch("data/data_domains_fields_all.json").then(r => r.json()),
        fetch("data/data_subfields.json").then(r => r.json())
      ]);
      STATE.taxonomy = taxRes.taxonomy;
      STATE.countriesMap = taxRes.countries;
      STATE.datasets.all = allRes;
      STATE.datasets.subfields = sfRes;

      // Lazy load citable dataset in background
      fetch("data/data_domains_fields_citable.json")
        .then(r => r.json())
        .then(cit => { STATE.datasets.citable = cit; })
        .catch(() => {});

      populateControls();
      bindEvents();
      checkLocalLLMStatus();
      renderAll();
    } catch (err) {
      console.error("Error loading datasets:", err);
      document.getElementById("diagnostic-content").innerHTML = `<p style="color:#e11d48">Error loading OpenAlex data files: ${err.message}</p>`;
    }
  }

  function populateControls() {
    const base = getActiveBaseData();
    // Year select (default 2024 = latest complete year)
    const yearSel = document.getElementById("select-year");
    yearSel.innerHTML = "";
    const yearsDesc = [...base.years].reverse();
    for (const yr of yearsDesc) {
      const opt = document.createElement("option");
      opt.value = yr;
      opt.textContent = yr === 2024 ? `${yr} (Latest Complete)` : String(yr);
      if (yr === STATE.refYear) opt.selected = true;
      yearSel.appendChild(opt);
    }

    populateAreaSelect();
    populateCountrySelect();
  }

  function populateAreaSelect() {
    const areaSel = document.getElementById("select-area");
    const areas = getAreasForLevel(STATE.taxLevel);
    areaSel.innerHTML = "";
    if (!areas.includes(STATE.selectedArea)) {
      STATE.selectedArea = areas[0] || "";
    }
    for (const a of areas) {
      const opt = document.createElement("option");
      opt.value = a;
      if (STATE.taxLevel === "subfields") {
        const meta = getSubfieldMeta(a);
        opt.textContent = meta ? `${a} [${meta.field}]` : a;
      } else {
        opt.textContent = a;
      }
      if (a === STATE.selectedArea) opt.selected = true;
      areaSel.appendChild(opt);
    }
  }

  function populateCountrySelect() {
    const base = getActiveBaseData();
    const countrySel = document.getElementById("select-country");
    countrySel.innerHTML = "";
    const yIdx = base.years.indexOf(Number(STATE.refYear));
    const codes = Object.keys(base.units_total).sort((a, b) => {
      const va = (base.units_total[a] && base.units_total[a][yIdx]) || 0;
      const vb = (base.units_total[b] && base.units_total[b][yIdx]) || 0;
      return vb - va;
    });

    for (const code of codes) {
      const opt = document.createElement("option");
      opt.value = code;
      const out24 = (base.units_total[code] && base.units_total[code][yIdx]) || 0;
      opt.textContent = `${getCountryName(code)} — ${out24.toLocaleString()} docs`;
      if (code === STATE.selectedCountry) opt.selected = true;
      countrySel.appendChild(opt);
    }
  }

  function bindEvents() {
    // Language buttons
    document.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        STATE.lang = btn.dataset.lang;
        renderAll();
      });
    });

    // Scenario tabs
    document.querySelectorAll(".scenario-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".scenario-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        STATE.scenario = tab.dataset.scenario;
        renderAll();
      });
    });

    document.getElementById("select-doctype").addEventListener("change", (e) => {
      STATE.docType = e.target.value;
      populateCountrySelect();
      renderAll();
    });

    document.getElementById("select-level").addEventListener("change", (e) => {
      STATE.taxLevel = e.target.value;
      populateAreaSelect();
      renderAll();
    });

    document.getElementById("select-area").addEventListener("change", (e) => {
      STATE.selectedArea = e.target.value;
      renderAll();
    });

    document.getElementById("select-country").addEventListener("change", (e) => {
      STATE.selectedCountry = e.target.value;
      renderAll();
    });

    document.getElementById("select-year").addEventListener("change", (e) => {
      STATE.refYear = Number(e.target.value);
      populateCountrySelect();
      renderAll();
    });

    // Action buttons
    document.getElementById("btn-jump-5x3").addEventListener("click", () => {
      STATE.scenario = "evolution";
      document.querySelectorAll(".scenario-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.scenario === "evolution");
      });
      renderAll();
    });

    document.getElementById("btn-dl-series").addEventListener("click", download5x3SeriesCSV);
    document.getElementById("btn-dl-ranking").addEventListener("click", downloadCurrentScenarioCSV);
    document.getElementById("btn-dl-correlations").addEventListener("click", downloadCorrelationsSummaryCSV);

    // LLM controls
    document.getElementById("btn-llm-config").addEventListener("click", () => {
      const bar = document.getElementById("llm-config-bar");
      bar.style.display = bar.style.display === "none" ? "flex" : "none";
    });

    document.getElementById("btn-llm-generate").addEventListener("click", generateLLMAnalysis);
  }

  function updateStaticLabels() {
    const t = window.I18N[STATE.lang] || window.I18N.en;
    document.getElementById("app-title").textContent = t.appTitle;
    document.getElementById("app-subtitle").textContent = t.appSubtitle;
    document.getElementById("lbl-doctype").textContent = t.lblDocType;
    document.getElementById("opt-doc-all").textContent = t.docAll;
    document.getElementById("opt-doc-citable").textContent = t.docCitable;
    document.getElementById("lbl-level").textContent = t.lblTaxLevel;
    document.getElementById("opt-lvl-domains").textContent = t.lvlDomains;
    document.getElementById("opt-lvl-fields").textContent = t.lvlFields;
    document.getElementById("opt-lvl-subfields").textContent = t.lvlSubfields;
    document.getElementById("lbl-area").textContent = t.lblAreaSelect;
    document.getElementById("lbl-country").textContent = t.lblCountrySelect;
    document.getElementById("lbl-year").textContent = t.lblRefYear;

    document.getElementById("tab1-badge").textContent = t.tabScenario1Badge;
    document.getElementById("tab1-title").textContent = t.tabScenario1Title;
    document.getElementById("tab1-desc").textContent = t.tabScenario1Desc;

    document.getElementById("tab2-badge").textContent = t.tabScenario2Badge;
    document.getElementById("tab2-title").textContent = t.tabScenario2Title;
    document.getElementById("tab2-desc").textContent = t.tabScenario2Desc;

    document.getElementById("tab3-badge").textContent = t.tabEvolutionBadge;
    document.getElementById("tab3-title").textContent = t.tabEvolutionTitle;
    document.getElementById("tab3-desc").textContent = t.tabEvolutionDesc;

    document.getElementById("btn-dl-series").textContent = t.btnDownloadSeriesCSV;
    document.getElementById("btn-dl-ranking").textContent = t.btnDownloadRankingCSV;
    document.getElementById("btn-dl-correlations").textContent = t.btnDownloadCorrelationsCSV;
    document.getElementById("btn-jump-5x3").textContent = t.btnJumpTo5x3;

    document.getElementById("llm-panel-title").textContent = t.llmPanelTitle;
    document.getElementById("btn-llm-generate").textContent = t.llmBtnGenerate;
    document.getElementById("btn-llm-config").textContent = t.llmBtnConfig;
  }

  function renderAll() {
    updateStaticLabels();
    const t = window.I18N[STATE.lang] || window.I18N.en;
    const prevYear = STATE.refYear > 1980 ? STATE.refYear - 1 : STATE.refYear;

    // Determine active scenario for diagnostic box (if in evolution mode, show country + area diagnostic)
    const diagMode = STATE.scenario === "local" ? "local" : "global";

    if (diagMode === "global") {
      const rowsCurr = buildScenario1Rows(STATE.taxLevel, STATE.selectedArea, STATE.refYear);
      const rowsPrev = buildScenario1Rows(STATE.taxLevel, STATE.selectedArea, prevYear);
      const corrCurr = computeCorrelationBundle(rowsCurr);
      const corrPrev = computeCorrelationBundle(rowsPrev);
      STATE.currentTableRows = rowsCurr;

      document.getElementById("diag-header-title").textContent = `${t.diagHeaderGlobal} — ${STATE.selectedArea} (${STATE.refYear})`;
      const diag = window.buildMethodologicalDiagnosis(
        STATE.lang,
        "global",
        STATE.selectedArea,
        STATE.refYear,
        corrCurr,
        corrPrev,
        { nUnits: corrCurr.n }
      );
      renderDiagnosticBox(diag, corrCurr, corrPrev, prevYear);
    } else {
      const rowsCurr = buildScenario2Rows(STATE.taxLevel, STATE.selectedCountry, STATE.refYear);
      const rowsPrev = buildScenario2Rows(STATE.taxLevel, STATE.selectedCountry, prevYear);
      const corrCurr = computeCorrelationBundle(rowsCurr);
      const corrPrev = computeCorrelationBundle(rowsPrev);
      STATE.currentTableRows = rowsCurr;

      const cName = getCountryName(STATE.selectedCountry);
      const base = getActiveBaseData();
      const yIdx = base.years.indexOf(Number(STATE.refYear));
      const cTotal = (base.units_total[STATE.selectedCountry] && base.units_total[STATE.selectedCountry][yIdx]) || 0;

      document.getElementById("diag-header-title").textContent = `${t.diagHeaderLocal} — ${cName} (${STATE.refYear})`;
      const diag = window.buildMethodologicalDiagnosis(
        STATE.lang,
        "local",
        cName,
        STATE.refYear,
        corrCurr,
        corrPrev,
        { nUnits: corrCurr.n, countryTotal: cTotal }
      );
      renderDiagnosticBox(diag, corrCurr, corrPrev, prevYear);
    }

    // Show/hide main view sections
    const secScenario = document.getElementById("section-scenario-charts");
    const sec5x3 = document.getElementById("section-5x3-grid");

    if (STATE.scenario === "evolution") {
      secScenario.style.display = "none";
      sec5x3.style.display = "block";
      render5x3Grid();
    } else {
      secScenario.style.display = "block";
      sec5x3.style.display = "block"; // Also keep 5x3 below for immediate inspection!
      renderScenarioChartsAndTables();
      render5x3Grid();
    }
  }

  function renderDiagnosticBox(diag, corrCurr, corrPrev, prevYear) {
    const fmt = (v) => (v === null || v === undefined || Number.isNaN(v)) ? "—" : Number(v).toFixed(4);
    const contentEl = document.getElementById("diagnostic-content");
    contentEl.innerHTML = `
      <span class="rule-verdict ${diag.verdictClass}">${diag.verdictText}</span>
      <p>${diag.p1}</p>
      <p>${diag.p2}</p>
      <div class="formula-strip">
        <span class="formula-pill">DShareC = Ocd / Oc</span>
        <span class="formula-pill">CShareD = Ocd / Owd</span>
        <span class="formula-pill">AI = DShareC / DShareW</span>
        <span class="formula-pill">F-measure = 2·DShareC·CShareD / (DShareC + CShareD)</span>
      </div>
    `;

    const metricsEl = document.getElementById("diagnostic-metrics");
    metricsEl.innerHTML = `
      <div class="corr-stat-card">
        <div class="stat-label">AI vs. DShareC (${STATE.refYear})</div>
        <div class="stat-values">
          <span class="val-main">ρ = ${fmt(corrCurr.spearman.AI_DShareC)}</span>
          <span class="val-sub">r = ${fmt(corrCurr.pearson.AI_DShareC)} | ${prevYear}: ${fmt(corrPrev.spearman.AI_DShareC)}</span>
        </div>
      </div>
      <div class="corr-stat-card">
        <div class="stat-label">AI vs. CShareD (${STATE.refYear})</div>
        <div class="stat-values">
          <span class="val-main">ρ = ${fmt(corrCurr.spearman.AI_CShareD)}</span>
          <span class="val-sub">r = ${fmt(corrCurr.pearson.AI_CShareD)} | ${prevYear}: ${fmt(corrPrev.spearman.AI_CShareD)}</span>
        </div>
      </div>
      <div class="corr-stat-card">
        <div class="stat-label">F-measure vs. DShareC (${STATE.refYear})</div>
        <div class="stat-values">
          <span class="val-main">ρ = ${fmt(corrCurr.spearman.FM_DShareC)}</span>
          <span class="val-sub">r = ${fmt(corrCurr.pearson.FM_DShareC)} | ${prevYear}: ${fmt(corrPrev.spearman.FM_DShareC)}</span>
        </div>
      </div>
      <div class="corr-stat-card">
        <div class="stat-label">F-measure vs. CShareD (${STATE.refYear})</div>
        <div class="stat-values">
          <span class="val-main">ρ = ${fmt(corrCurr.spearman.FM_CShareD)}</span>
          <span class="val-sub">r = ${fmt(corrCurr.pearson.FM_CShareD)} | ${prevYear}: ${fmt(corrPrev.spearman.FM_CShareD)}</span>
        </div>
      </div>
    `;
  }

  function renderScenarioChartsAndTables() {
    const t = window.I18N[STATE.lang] || window.I18N.en;
    const rows = STATE.currentTableRows.filter(r => r.Output > 0);

    if (STATE.scenario === "global") {
      document.getElementById("chart-left-title").textContent = `${t.chartScatterTitleGlobal} — ${STATE.selectedArea} (${STATE.refYear})`;
      document.getElementById("chart-right-title").textContent = `${t.chartBarTitleGlobal} — ${STATE.selectedArea} (${STATE.refYear})`;
      document.getElementById("table-main-title").textContent = `${t.tableGlobalTitle} — ${STATE.selectedArea} (${STATE.refYear})`;

      // Left chart: DShareC vs CShareD colored by F-measure, sized by AI
      const traceScatter = {
        x: rows.map(r => r.DShareC),
        y: rows.map(r => r.CShareD),
        text: rows.map(r => `${r.label}<br>Output: ${r.Output.toLocaleString()}<br>AI: ${r.AI.toFixed(3)}<br>F-measure: ${r.FMeasure.toFixed(4)}`),
        mode: "markers+text",
        textposition: "top center",
        textfont: { size: 10 },
        hoverinfo: "text",
        marker: {
          size: rows.map(r => Math.max(7, Math.min(26, 8 + Math.log10(r.Output + 1) * 3.5))),
          color: rows.map(r => r.AI),
          colorscale: "Viridis",
          showscale: true,
          colorbar: { title: "AI", thickness: 12 }
        },
        type: "scatter"
      };
      // Only show text labels for top 15 or selected country
      traceScatter.text = rows.map((r, idx) => (idx < 12 || r.id === STATE.selectedCountry) ? r.id : "");
      traceScatter.hovertext = rows.map(r => `${r.label}<br>Docs: ${r.Output.toLocaleString()}<br>DShareC: ${(r.DShareC*100).toFixed(2)}%<br>CShareD: ${(r.CShareD*100).toFixed(2)}%<br>AI: ${r.AI.toFixed(3)}<br>F-measure: ${r.FMeasure.toFixed(4)}`);
      traceScatter.hoverinfo = "text";

      Plotly.newPlot("plotly-scenario-left", [traceScatter], {
        margin: { t: 25, r: 20, b: 50, l: 60 },
        xaxis: { title: "DShareC (Domain Share in Country = Ocd / Oc)", zeroline: false },
        yaxis: { title: "CShareD (Country Share in Domain = Ocd / Owd)", type: "log", zeroline: false },
        height: 390,
        paper_bgcolor: "transparent",
        plot_bgcolor: "#ffffff"
      }, { responsive: true });

      // Right chart: Top 25 Countries comparing DShareC, CShareD, F-measure (like Figure A1)
      const top25 = rows.slice(0, 25);
      const traceD = {
        x: top25.map(r => r.id),
        y: top25.map(r => r.DShareC),
        name: "DShareC (Ocd/Oc)",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#1d4ed8", width: 2 }
      };
      const traceC = {
        x: top25.map(r => r.id),
        y: top25.map(r => r.CShareD),
        name: "CShareD (Ocd/Owd)",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#0d9488", width: 2 }
      };
      const traceF = {
        x: top25.map(r => r.id),
        y: top25.map(r => r.FMeasure),
        name: "F-measure",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#e11d48", width: 2, dash: "dot" }
      };
      Plotly.newPlot("plotly-scenario-right", [traceD, traceC, traceF], {
        margin: { t: 25, r: 20, b: 60, l: 55 },
        xaxis: { title: "Top 25 Countries by Output Volume" },
        yaxis: { title: "Share / F-measure Value" },
        legend: { orientation: "h", y: 1.12 },
        height: 390,
        paper_bgcolor: "transparent",
        plot_bgcolor: "#ffffff"
      }, { responsive: true });
    } else {
      // Scenario 2: Local Context (Domains inside Selected Country)
      const cName = getCountryName(STATE.selectedCountry);
      document.getElementById("chart-left-title").textContent = `${t.chartScatterTitleLocal} — ${cName} (${STATE.refYear})`;
      document.getElementById("chart-right-title").textContent = `${t.chartBarTitleLocal} — ${cName} (${STATE.refYear})`;
      document.getElementById("table-main-title").textContent = `${t.tableLocalTitle} — ${cName} (${STATE.refYear})`;

      const traceScatter = {
        x: rows.map(r => r.DShareC),
        y: rows.map(r => r.CShareD),
        text: rows.map((r, i) => i < 15 ? r.label.slice(0, 18) : ""),
        hovertext: rows.map(r => `${r.label}<br>Output: ${r.Output.toLocaleString()}<br>DShareC: ${(r.DShareC*100).toFixed(2)}%<br>CShareD: ${(r.CShareD*100).toFixed(2)}%<br>AI: ${r.AI.toFixed(3)}<br>F-measure: ${r.FMeasure.toFixed(4)}`),
        hoverinfo: "text",
        mode: "markers+text",
        textposition: "top center",
        textfont: { size: 9 },
        marker: {
          size: 11,
          color: rows.map(r => r.FMeasure),
          colorscale: "Plasma",
          showscale: true,
          colorbar: { title: "F-measure", thickness: 12 }
        },
        type: "scatter"
      };
      Plotly.newPlot("plotly-scenario-left", [traceScatter], {
        margin: { t: 25, r: 20, b: 50, l: 60 },
        xaxis: { title: "DShareC (Domestic Priority = Ocd / Oc)" },
        yaxis: { title: "CShareD (Global Domain Share = Ocd / Owd)" },
        height: 390,
        paper_bgcolor: "transparent",
        plot_bgcolor: "#ffffff"
      }, { responsive: true });

      const topAreas = rows.slice(0, 26);
      const traceAI = {
        x: topAreas.map(r => r.label.slice(0, 22)),
        y: topAreas.map(r => r.AI),
        name: "Activity Index (AI)",
        type: "bar",
        marker: { color: "#1d4ed8" }
      };
      const traceFM = {
        x: topAreas.map(r => r.label.slice(0, 22)),
        y: topAreas.map(r => r.FMeasure),
        name: "F-measure",
        yaxis: "y2",
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#e11d48", width: 2.5 }
      };
      Plotly.newPlot("plotly-scenario-right", [traceAI, traceFM], {
        margin: { t: 25, r: 55, b: 95, l: 50 },
        xaxis: { tickangle: -35 },
        yaxis: { title: "Activity Index (AI)" },
        yaxis2: { title: "F-measure", overlaying: "y", side: "right" },
        legend: { orientation: "h", y: 1.12 },
        height: 390,
        paper_bgcolor: "transparent",
        plot_bgcolor: "#ffffff"
      }, { responsive: true });
    }

    renderScenarioTable(rows);
  }

  function renderScenarioTable(rows) {
    const tbody = document.getElementById("scenario-table-body");
    tbody.innerHTML = "";
    const fmt = (v, d = 4) => (v === null || v === undefined || Number.isNaN(v)) ? "—" : Number(v).toFixed(d);

    rows.forEach((r, idx) => {
      const tr = document.createElement("tr");
      const isSelected = (STATE.scenario === "global" && r.id === STATE.selectedCountry) ||
                         (STATE.scenario === "local" && r.id === STATE.selectedArea);
      if (isSelected) tr.classList.add("selected-row");

      tr.style.cursor = "pointer";
      tr.title = "Click to inspect in 5×3 grid";
      tr.addEventListener("click", () => {
        if (STATE.scenario === "global") {
          STATE.selectedCountry = r.id;
          document.getElementById("select-country").value = r.id;
        } else {
          STATE.selectedArea = r.id;
          document.getElementById("select-area").value = r.id;
        }
        renderAll();
      });

      tr.innerHTML = `
        <td>${idx + 1}. ${r.label}</td>
        <td>${r.Output.toLocaleString()}</td>
        <td>${fmt(r.DShareC, 4)}</td>
        <td>${fmt(r.CShareD, 4)}</td>
        <td><strong>${fmt(r.AI, 3)}</strong></td>
        <td>${fmt(r.RSI, 3)}</td>
        <td><strong>${fmt(r.FMeasure, 4)}</strong></td>
        <td>${fmt(r.AMeasure, 4)}</td>
        <td>${fmt(r.GMeasure, 4)}</td>
        <td>${fmt(r.GAggregation, 4)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- 5x3 Evolution Grid (The 14 Charts from ThematicProfile_ESI.ipynb) ---
  function render5x3Grid() {
    const t = window.I18N[STATE.lang] || window.I18N.en;
    const cName = getCountryName(STATE.selectedCountry);
    const areaName = STATE.selectedArea;

    document.getElementById("grid-5x3-title").textContent = `${t.grid5x3Title}: ${cName} — ${areaName}`;
    document.getElementById("grid-5x3-subtitle").textContent = t.grid5x3Subtitle;

    const series = buildTimeSeriesFor5x3(STATE.taxLevel, STATE.selectedCountry, areaName);
    const xYears = series.map(s => s.year);
    const titles = t.subplotTitles(STATE.selectedCountry, areaName);

    const panels = [
      // Row 1: Country Output, World Output, Country Share
      { y: series.map(s => s.CountryTotal), color: "#1d4ed8", title: titles[0] },
      { y: series.map(s => s.WorldTotal), color: "#334155", title: titles[1] },
      { y: series.map(s => s.CountryGlobalShare), color: "#0284c7", title: titles[2] },
      // Row 2: Country Domain Output, World Domain Output, F-measure / AI Ratio
      { y: series.map(s => s.Output), color: "#2563eb", title: titles[3] },
      { y: series.map(s => s.WorldAreaTotal), color: "#475569", title: titles[4] },
      { y: series.map(s => s.AI > 0 ? s.FMeasure / s.AI : 0), color: "#64748b", title: titles[5] },
      // Row 3: DShareC, DShareW, CShareD
      { y: series.map(s => s.DShareC), color: "#0d9488", title: titles[6] },
      { y: series.map(s => s.DShareW), color: "#0f766e", title: titles[7] },
      { y: series.map(s => s.CShareD), color: "#059669", title: titles[8] },
      // Row 4: AI, RSI, F-measure
      { y: series.map(s => s.AI), color: "#d97706", title: titles[9] },
      { y: series.map(s => s.RSI), color: "#ea580c", title: titles[10] },
      { y: series.map(s => s.FMeasure), color: "#e11d48", title: titles[11] },
      // Row 5: A-measure, G-measure, GAggregation
      { y: series.map(s => s.AMeasure), color: "#7c3aed", title: titles[12] },
      { y: series.map(s => s.GMeasure), color: "#9333ea", title: titles[13] },
      { y: series.map(s => s.GAggregation), color: "#4f46e5", title: titles[14] }
    ];

    const traces = [];
    const layout = {
      grid: { rows: 5, columns: 3, pattern: "independent", roworder: "top to bottom" },
      height: 1320,
      showlegend: false,
      margin: { t: 45, r: 25, b: 40, l: 55 },
      annotations: [],
      paper_bgcolor: "transparent",
      plot_bgcolor: "#ffffff"
    };

    panels.forEach((p, i) => {
      const idx = i + 1;
      const axSuffix = idx === 1 ? "" : String(idx);
      traces.push({
        x: xYears,
        y: p.y,
        xaxis: `x${axSuffix}`,
        yaxis: `y${axSuffix}`,
        type: "scatter",
        mode: "lines+markers",
        marker: { size: 4.5, color: p.color },
        line: { width: 1.8, color: p.color },
        name: p.title,
        hovertemplate: `<b>${p.title}</b><br>Year: %{x}<br>Value: %{y:.5g}<extra></extra>`
      });

      layout[`xaxis${axSuffix}`] = { showgrid: true, gridcolor: "#f1f5f9", tickfont: { size: 10 } };
      layout[`yaxis${axSuffix}`] = { showgrid: true, gridcolor: "#f1f5f9", tickfont: { size: 10 }, zeroline: false };
    });

    Plotly.newPlot("plotly-5x3-grid", traces, layout, { responsive: true });

    // Place subplot title annotations cleanly above each subplot domain
    const gd = document.getElementById("plotly-5x3-grid");
    if (gd && gd._fullLayout) {
      const anns = panels.map((p, i) => {
        const idx = i + 1;
        const axName = idx === 1 ? "xaxis" : `xaxis${idx}`;
        const ayName = idx === 1 ? "yaxis" : `yaxis${idx}`;
        const xd = gd._fullLayout[axName].domain;
        const yd = gd._fullLayout[ayName].domain;
        return {
          text: `<b>${p.title}</b>`,
          xref: "paper",
          yref: "paper",
          x: (xd[0] + xd[1]) / 2,
          y: yd[1] + 0.012,
          xanchor: "center",
          yanchor: "bottom",
          showarrow: false,
          font: { size: 11, color: "#1e293b" }
        };
      });
      Plotly.relayout("plotly-5x3-grid", { annotations: anns });
    }
  }

  // --- CSV Download Functions ---
  function triggerCSVDownload(filename, csvContent) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function download5x3SeriesCSV() {
    const series = buildTimeSeriesFor5x3(STATE.taxLevel, STATE.selectedCountry, STATE.selectedArea);
    const headers = [
      "Year", "Country", "Area", "Level", "DocType",
      "CountryAreaOutput_Ocd", "CountryTotalOutput_Oc", "WorldAreaOutput_Owd", "WorldTotalOutput_Ow",
      "CountryGlobalShare", "DShareC", "DShareW", "CShareD",
      "AI", "RSI", "FMeasure", "AMeasure", "GMeasure", "GAggregation"
    ];
    const lines = [headers.join(",")];
    for (const s of series) {
      lines.push([
        s.year,
        `"${STATE.selectedCountry}"`,
        `"${STATE.selectedArea.replace(/"/g, '""')}"`,
        STATE.taxLevel,
        STATE.docType,
        s.Output, s.CountryTotal, s.WorldAreaTotal, s.WorldTotal,
        s.CountryGlobalShare, s.DShareC, s.DShareW, s.CShareD,
        s.AI, s.RSI, s.FMeasure, s.AMeasure, s.GMeasure, s.GAggregation
      ].join(","));
    }
    const safeArea = STATE.selectedArea.replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerCSVDownload(`OpenAlex_5x3_${STATE.selectedCountry}_${safeArea}_1980_2024.csv`, lines.join("\n"));
  }

  function downloadCurrentScenarioCSV() {
    const rows = STATE.currentTableRows;
    const headers = [
      "ID", "Name", "Year", "Level", "DocType",
      "Output_Ocd", "CountryTotal_Oc", "WorldAreaTotal_Owd", "WorldTotal_Ow",
      "DShareC", "CShareD", "DShareW", "AI", "RSI", "FMeasure", "AMeasure", "GMeasure", "GAggregation"
    ];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push([
        `"${r.id}"`,
        `"${r.label.replace(/"/g, '""')}"`,
        STATE.refYear,
        STATE.taxLevel,
        STATE.docType,
        r.Output, r.CountryTotal, r.WorldAreaTotal, r.WorldTotal,
        r.DShareC, r.CShareD, r.DShareW, r.AI, r.RSI, r.FMeasure, r.AMeasure, r.GMeasure, r.GAggregation
      ].join(","));
    }
    const target = STATE.scenario === "local" ? STATE.selectedCountry : STATE.selectedArea.replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerCSVDownload(`OpenAlex_${STATE.scenario}_${target}_${STATE.refYear}.csv`, lines.join("\n"));
  }

  function downloadCorrelationsSummaryCSV() {
    const headers = [
      "Entity", "Scenario", "Level", "Year", "ActiveObservations",
      "Spearman_AI_DShareC", "Spearman_AI_CShareD", "Spearman_FMeasure_DShareC", "Spearman_FMeasure_CShareD",
      "Spearman_GAgg_DShareC", "Spearman_GAgg_CShareD", "Spearman_AI_FMeasure",
      "Pearson_AI_DShareC", "Pearson_AI_CShareD", "Pearson_FMeasure_DShareC", "Pearson_FMeasure_CShareD"
    ];
    const lines = [headers.join(",")];

    if (STATE.scenario === "local") {
      const base = getActiveBaseData();
      for (const u of Object.keys(base.units_total)) {
        const r = buildScenario2Rows(STATE.taxLevel, u, STATE.refYear);
        const c = computeCorrelationBundle(r);
        if (c.n < 3) continue;
        lines.push([
          `"${u}"`, "DomainsComparison_Local", STATE.taxLevel, STATE.refYear, c.n,
          c.spearman.AI_DShareC, c.spearman.AI_CShareD, c.spearman.FM_DShareC, c.spearman.FM_CShareD,
          c.spearman.GAgg_DShareC, c.spearman.GAgg_CShareD, c.spearman.AI_FM,
          c.pearson.AI_DShareC, c.pearson.AI_CShareD, c.pearson.FM_DShareC, c.pearson.FM_CShareD
        ].join(","));
      }
    } else {
      const areas = getAreasForLevel(STATE.taxLevel);
      for (const a of areas) {
        const r = buildScenario1Rows(STATE.taxLevel, a, STATE.refYear);
        const c = computeCorrelationBundle(r);
        lines.push([
          `"${a.replace(/"/g, '""')}"`, "CountriesComparison_Global", STATE.taxLevel, STATE.refYear, c.n,
          c.spearman.AI_DShareC, c.spearman.AI_CShareD, c.spearman.FM_DShareC, c.spearman.FM_CShareD,
          c.spearman.GAgg_DShareC, c.spearman.GAgg_CShareD, c.spearman.AI_FM,
          c.pearson.AI_DShareC, c.pearson.AI_CShareD, c.pearson.FM_DShareC, c.pearson.FM_CShareD
        ].join(","));
      }
    }
    triggerCSVDownload(`OpenAlex_Correlations_${STATE.scenario}_${STATE.taxLevel}_${STATE.refYear}.csv`, lines.join("\n"));
  }

  // --- Local LLM Integration for dinamica1 (LM Studio) ---
  async function checkLocalLLMStatus() {
    const dot = document.getElementById("llm-status-dot");
    const statusTxt = document.getElementById("llm-status-text");
    try {
      const resp = await fetch("/api/llm-status");
      if (resp.ok) {
        const data = await resp.json();
        STATE.llmConfig.url = data.llm_url || "https://dinamica1.fciencias.unam.mx/v1";
        STATE.llmConfig.model = data.default_model || "openai/default";
        document.getElementById("input-llm-url").value = STATE.llmConfig.url;
        document.getElementById("input-llm-model").value = STATE.llmConfig.model;
        if (data.connected) {
          STATE.llmConfig.online = true;
          dot.classList.add("online");
          statusTxt.textContent = `LM Studio Online (${STATE.llmConfig.model})`;
          return;
        }
      }
    } catch (_) {}
    dot.classList.remove("online");
    statusTxt.textContent = "LM Studio: https://dinamica1.fciencias.unam.mx/v1 (openai/default)";
  }

  async function generateLLMAnalysis() {
    const t = window.I18N[STATE.lang] || window.I18N.en;
    const outBox = document.getElementById("llm-output-box");
    outBox.classList.add("visible");
    outBox.textContent = t.llmGenerating;

    const llmUrl = document.getElementById("input-llm-url").value.trim() || "https://dinamica1.fciencias.unam.mx/v1";
    const llmModel = document.getElementById("input-llm-model").value.trim() || "openai/default";
    const llmKey = document.getElementById("input-llm-key").value.trim();
    const prevYear = STATE.refYear > 1980 ? STATE.refYear - 1 : STATE.refYear;

    const isLocal = STATE.scenario === "local";
    const rowsCurr = isLocal
      ? buildScenario2Rows(STATE.taxLevel, STATE.selectedCountry, STATE.refYear)
      : buildScenario1Rows(STATE.taxLevel, STATE.selectedArea, STATE.refYear);
    const rowsPrev = isLocal
      ? buildScenario2Rows(STATE.taxLevel, STATE.selectedCountry, prevYear)
      : buildScenario1Rows(STATE.taxLevel, STATE.selectedArea, prevYear);
    const corrCurr = computeCorrelationBundle(rowsCurr);
    const corrPrev = computeCorrelationBundle(rowsPrev);
    const top5 = rowsCurr.slice(0, 5).map(r => `${r.label} (Docs=${r.Output}, AI=${r.AI.toFixed(2)}, F=${r.FMeasure.toFixed(4)}, DShareC=${(r.DShareC*100).toFixed(2)}%, CShareD=${(r.CShareD*100).toFixed(2)}%)`).join("; ");

    const langName = STATE.lang === "es" ? "Spanish" : (STATE.lang === "pt" ? "Portuguese" : "English");
    const systemPrompt = `You are a scientometric methodology expert based on the paper "Specialization indicators in scientometrics: Understanding the Activity Index and the F-measure through their underlying components". Always respond in ${langName}. Explain clearly which indicator(s) the researcher should use according to the mathematical properties proved in the paper (harmonic mean bounding Theorem A1 and mirrored asymmetrical relationships between Countries Comparison and Domains Comparison).`;

    const userPrompt = isLocal
      ? `Scenario: Domains Comparison (Local Context) for Country = ${getCountryName(STATE.selectedCountry)} in reference year ${STATE.refYear} (and previous year ${prevYear}) at OpenAlex level "${STATE.taxLevel}".
Correlations across ${corrCurr.n} active areas:
- Spearman(AI, CShareD) = ${corrCurr.spearman.AI_CShareD.toFixed(4)} (${prevYear}: ${corrPrev.spearman.AI_CShareD.toFixed(4)})
- Spearman(AI, DShareC) = ${corrCurr.spearman.AI_DShareC.toFixed(4)} (${prevYear}: ${corrPrev.spearman.AI_DShareC.toFixed(4)})
- Spearman(F-measure, DShareC) = ${corrCurr.spearman.FM_DShareC.toFixed(4)} (${prevYear}: ${corrPrev.spearman.FM_DShareC.toFixed(4)})
- Spearman(F-measure, CShareD) = ${corrCurr.spearman.FM_CShareD.toFixed(4)} (${prevYear}: ${corrPrev.spearman.FM_CShareD.toFixed(4)})
Top 5 areas by output: ${top5}.
Provide a concise 2-paragraph methodological interpretation explaining how the country's output volume modulates the F-measure and which metrics should be used.`
      : `Scenario: Countries Comparison (Global Context) for Research Area = "${STATE.selectedArea}" in reference year ${STATE.refYear} (and previous year ${prevYear}) at OpenAlex level "${STATE.taxLevel}".
Correlations across ${corrCurr.n} active countries:
- Spearman(AI, DShareC) = ${corrCurr.spearman.AI_DShareC.toFixed(4)} (${prevYear}: ${corrPrev.spearman.AI_DShareC.toFixed(4)})
- Spearman(AI, CShareD) = ${corrCurr.spearman.AI_CShareD.toFixed(4)} (${prevYear}: ${corrPrev.spearman.AI_CShareD.toFixed(4)})
- Spearman(F-measure, DShareC) = ${corrCurr.spearman.FM_DShareC.toFixed(4)} (${prevYear}: ${corrPrev.spearman.FM_DShareC.toFixed(4)})
- Spearman(F-measure, CShareD) = ${corrCurr.spearman.FM_CShareD.toFixed(4)} (${prevYear}: ${corrPrev.spearman.FM_CShareD.toFixed(4)})
Top 5 countries by output: ${top5}.
Provide a concise 2-paragraph methodological interpretation comparing this area to the paper's archetypes (Space Science vs. Immunology) and recommending how to interpret AI and F-measure here.`;

    // 1. Try server_dinamica1.py proxy first
    try {
      const resp = await fetch("/api/llm-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llm_url: llmUrl,
          model: llmModel,
          api_key: llmKey,
          system_prompt: systemPrompt,
          prompt: userPrompt
        })
      });
      if (resp.ok) {
        const resData = await resp.json();
        if (resData.ok) {
          outBox.textContent = resData.response;
          return;
        }
      }
    } catch (_) {}

    // 2. Fallback: direct browser call to LM Studio OpenAI-compatible /v1/chat/completions
    try {
      const chatEndpoint = llmUrl.replace(/\/$/, "").endsWith("/v1")
        ? `${llmUrl.replace(/\/$/, "")}/chat/completions`
        : `${llmUrl.replace(/\/$/, "")}/v1/chat/completions`;
      const headers = { "Content-Type": "application/json" };
      if (llmKey) headers["Authorization"] = `Bearer ${llmKey}`;

      const directResp = await fetch(chatEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: llmModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.25
        })
      });
      if (directResp.ok) {
        const dJson = await directResp.json();
        outBox.textContent = dJson.choices[0].message.content;
        return;
      } else {
        const errTxt = await directResp.text();
        outBox.textContent = `[LM Studio HTTP ${directResp.status}] ${errTxt}`;
        return;
      }
    } catch (err) {
      outBox.textContent = `[Aviso de Conexión LM Studio]\nEndpoint: ${llmUrl} | Modelo: ${llmModel}\nIngresa tu LLM_API_KEY ("sk-lm-...") en el botón "Configurar Conexión a dinamica1" o inicia el servidor en dinamica1 con:\n  export LLM_BASE_URL="https://dinamica1.fciencias.unam.mx/v1"\n  export LLM_API_KEY="sk-lm-tu-token-aqui"\n  python3 app/server_dinamica1.py --port 8080`;
    }
  }

  document.addEventListener("DOMContentLoaded", initApp);
})();
