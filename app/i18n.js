// i18n.js - Trilingual dictionary (English, Español, Português) and Paper Criterion Engine

window.I18N = {
  en: {
    appTitle: "Scientometric Specialization Explorer — OpenAlex",
    appSubtitle: "Interactive evaluation of Activity Index (AI), F-measure, and their underlying share components across the 3-level OpenAlex classification (1980–2024)",
    lblDocType: "Document Set",
    docAll: "All Documents (Total Output)",
    docCitable: "Citable Documents (Articles, Reviews, Letters)",
    lblTaxLevel: "OpenAlex Classification Level",
    lvlDomains: "Level 1: Domains (4 macro areas)",
    lvlFields: "Level 2: Fields (26 ASJC areas — Paper level)",
    lvlSubfields: "Level 3: Subfields (252 specialized areas)",
    lblAreaSelect: "Research Domain / Field / Subfield",
    lblCountrySelect: "Country / Economy",
    lblRefYear: "Reference Year (Previous Complete Year)",
    tabScenario1Badge: "Scenario 1 • Global Context",
    tabScenario1Title: "Countries Comparison (Fixed Domain)",
    tabScenario1Desc: "Compare specialization across countries within a selected domain, field, or subfield",
    tabScenario2Badge: "Scenario 2 • Local Context",
    tabScenario2Title: "Domains Comparison (Fixed Country)",
    tabScenario2Desc: "Compare specialization across research areas within a single selected country",
    tabEvolutionBadge: "Longitudinal Profile • 5×3 Grid",
    tabEvolutionTitle: "14 Indicator Evolution Charts (Country × Area)",
    tabEvolutionDesc: "Inspect complete 1980–2024 trajectories of outputs, shares, AI, RSI, F-measure, and means",
    diagHeaderGlobal: "Methodological Criterion (Countries Comparison — Global Context)",
    diagHeaderLocal: "Methodological Criterion (Domains Comparison — Local Context)",
    btnDownloadSeriesCSV: "Download 5×3 Time Series (CSV)",
    btnDownloadRankingCSV: "Download Current Scenario Table (CSV)",
    btnDownloadCorrelationsCSV: "Download All Correlations Table (CSV)",
    btnJumpTo5x3: "View 5×3 Evolution Grid for Selected Country & Area",
    llmPanelTitle: "AI Methodological Interpreter (dinamica1 Local LLM)",
    llmBtnGenerate: "Generate Deep Analysis with Local LLM",
    llmBtnConfig: "Configure dinamica1 Endpoint",
    llmGenerating: "Querying local LLM model on dinamica1...",
    chartScatterTitleGlobal: "Bivariate Component & Indicator Space (Countries in Selected Area)",
    chartBarTitleGlobal: "Top Countries Comparison: AI vs. F-measure vs. Constituent Shares",
    chartScatterTitleLocal: "Thematic Profile: DShareC vs. CShareD across Areas in Selected Country",
    chartBarTitleLocal: "Specialization Profile by Area (AI, F-measure, DShareC, CShareD)",
    tableGlobalTitle: "Countries Ranking & Specialization Indicators in Selected Area",
    tableLocalTitle: "Research Areas Ranking & Specialization Indicators in Selected Country",
    tableCorrSummaryTitle: "Summary of Pearson (r) & Spearman (ρ) Correlations across All Entities",
    grid5x3Title: "5×3 Longitudinal Evolution Grid (1980–2024)",
    grid5x3Subtitle: "F-measure = Harmonic mean of DShareC & CShareD | A-measure = Arithmetic mean | G-measure = Geometric mean | GAggregation = √DShareC + √CShareD",
    verdictHigh: "High Component Convergence — Single Indicator Sufficient",
    verdictMid: "Moderate Component Alignment — Dual Reporting Recommended",
    verdictLow: "Orthogonal / Decoupled Dimensions — Report Both Indicators Separately",
    verdictHighOutput: "High-Output Country Regime — F-measure Driven by DShareC",
    verdictLowOutput: "Low-Output Country Regime — F-measure Driven by CShareD",
    verdictMidOutput: "Medium-Output Transitional Regime — Mixed Component Influence",
    subplotTitles: (unit, area) => [
      `${unit}'s Total Publications (Oc)`,
      `World's Total Publications (Ow)`,
      `${unit}'s Global Share (Oc / Ow)`,
      `${unit}'s Publications in ${area} (Ocd)`,
      `World's Publications in ${area} (Owd)`,
      `F-measure vs. AI Ratio Trajectory`,
      `Domain Share in ${unit} (DShareC = Ocd/Oc)`,
      `Domain Share in World (DShareW = Owd/Ow)`,
      `${unit}'s Share in ${area} (CShareD = Ocd/Owd)`,
      `Activity Index (AI = DShareC / DShareW)`,
      `Relative Specialization Index (RSI)`,
      `F-measure (Harmonic Mean of Shares)`,
      `A-measure (Arithmetic Mean of Shares)`,
      `G-measure (Geometric Mean of Shares)`,
      `Geometric Aggregation (√DShareC + √CShareD)`
    ]
  },
  es: {
    appTitle: "Explorador de Indicadores de Especialización Cienciométrica — OpenAlex",
    appSubtitle: "Evaluación interactiva del Índice de Actividad (AI), F-measure y sus componentes subyacentes en los 3 primeros niveles de OpenAlex (1980–2024)",
    lblDocType: "Conjunto de Documentos",
    docAll: "Todos los Documentos (Producción Total)",
    docCitable: "Documentos Citables (Artículos, Reviews, Letters)",
    lblTaxLevel: "Nivel de Clasificación de OpenAlex",
    lvlDomains: "Nivel 1: Dominios (4 macroáreas)",
    lvlFields: "Nivel 2: Campos / Fields (26 áreas ASJC — Nivel del Artículo)",
    lvlSubfields: "Nivel 3: Subcampos / Subfields (252 áreas especializadas)",
    lblAreaSelect: "Dominio / Campo / Subcampo de Investigación",
    lblCountrySelect: "País / Economía",
    lblRefYear: "Año de Referencia (Año Anterior Completo)",
    tabScenario1Badge: "Escenario 1 • Contexto Global",
    tabScenario1Title: "Comparación de Países (Área Fija)",
    tabScenario1Desc: "Compara el nivel de especialización de múltiples países dentro de un dominio, campo o subcampo fijo",
    tabScenario2Badge: "Escenario 2 • Contexto Local",
    tabScenario2Title: "Comparación de Dominios/Áreas (País Fijo)",
    tabScenario2Desc: "Compara el perfil de especialización a través de múltiples áreas dentro de un país específico",
    tabEvolutionBadge: "Perfil Longitudinal • Cuadrícula 5×3",
    tabEvolutionTitle: "14 Gráficas de Evolución Temporal (País × Área)",
    tabEvolutionDesc: "Explora las series históricas 1980–2024 de producción, shares, AI, RSI, F-measure y otras medias",
    diagHeaderGlobal: "Criterio Metodológico del Artículo (Comparación de Países — Contexto Global)",
    diagHeaderLocal: "Criterio Metodológico del Artículo (Comparación de Dominios — Contexto Local)",
    btnDownloadSeriesCSV: "Descargar Series 5×3 (CSV)",
    btnDownloadRankingCSV: "Descargar Tabla del Escenario Actual (CSV)",
    btnDownloadCorrelationsCSV: "Descargar Tabla General de Correlaciones (CSV)",
    btnJumpTo5x3: "Ver Cuadrícula 5×3 de Evolución (País × Área)",
    llmPanelTitle: "Intérprete Metodológico con IA (Modelo Local en dinamica1)",
    llmBtnGenerate: "Generar Análisis con LLM Local",
    llmBtnConfig: "Configurar Conexión a dinamica1",
    llmGenerating: "Consultando al modelo LLM local en dinamica1...",
    chartScatterTitleGlobal: "Espacio Bivariado de Componentes e Indicadores (Países en el Área Seleccionada)",
    chartBarTitleGlobal: "Comparación de Países Top: AI vs. F-measure vs. Shares Constituyentes",
    chartScatterTitleLocal: "Perfil Temático: DShareC vs. CShareD entre las Áreas del País Seleccionado",
    chartBarTitleLocal: "Perfil de Especialización por Área (AI, F-measure, DShareC, CShareD)",
    tableGlobalTitle: "Ranking de Países e Indicadores de Especialización en el Área Seleccionada",
    tableLocalTitle: "Ranking de Áreas e Indicadores de Especialización en el País Seleccionado",
    tableCorrSummaryTitle: "Resumen de Correlaciones de Pearson (r) y Spearman (ρ) en Todas las Entidades",
    grid5x3Title: "Cuadrícula 5×3 de Evolución Longitudinal (1980–2024)",
    grid5x3Subtitle: "F-measure = Media armónica de DShareC y CShareD | A-measure = Media aritmética | G-measure = Media geométrica | GAggregation = √DShareC + √CShareD",
    verdictHigh: "Alta Convergencia de Componentes — Un Solo Indicador es Suficiente",
    verdictMid: "Alineación Moderada — Se Recomienda Reportar Ambos Indicadores",
    verdictLow: "Dimensiones Desacopladas / Ortogonales — Usar Ambos Indicadores por Separado",
    verdictHighOutput: "Régimen de País de Alta Producción — F-measure Dominado por DShareC",
    verdictLowOutput: "Régimen de País de Baja Producción — F-measure Dominado por CShareD",
    verdictMidOutput: "Régimen Transicional de Producción Media — Influencia Mixta de Componentes",
    subplotTitles: (unit, area) => [
      `Publicaciones Totales de ${unit} (Oc)`,
      `Publicaciones Totales del Mundo (Ow)`,
      `Share Global de ${unit} (Oc / Ow)`,
      `Publicaciones de ${unit} en ${area} (Ocd)`,
      `Publicaciones del Mundo en ${area} (Owd)`,
      `Razón F-measure / AI en el Tiempo`,
      `Share del Área en ${unit} (DShareC = Ocd/Oc)`,
      `Share del Área en el Mundo (DShareW = Owd/Ow)`,
      `Share de ${unit} en ${area} (CShareD = Ocd/Owd)`,
      `Índice de Actividad (AI = DShareC / DShareW)`,
      `Índice de Especialización Relativa (RSI)`,
      `F-measure (Media Armónica de Shares)`,
      `A-measure (Media Aritmética de Shares)`,
      `G-measure (Media Geométrica de Shares)`,
      `Agregación Geométrica (√DShareC + √CShareD)`
    ]
  },
  pt: {
    appTitle: "Explorador de Indicadores de Especialização Cientométrica — OpenAlex",
    appSubtitle: "Avaliação interativa do Índice de Atividade (AI), F-measure e seus componentes subjacentes nos 3 primeiros níveis do OpenAlex (1980–2024)",
    lblDocType: "Conjunto de Documentos",
    docAll: "Todos os Documentos (Produção Total)",
    docCitable: "Documentos Citáveis (Artigos, Reviews, Letters)",
    lblTaxLevel: "Nível de Classificação do OpenAlex",
    lvlDomains: "Nível 1: Domínios (4 macroáreas)",
    lvlFields: "Nível 2: Campos / Fields (26 áreas ASJC — Nível do Artigo)",
    lvlSubfields: "Nível 3: Subcampos / Subfields (252 áreas especializadas)",
    lblAreaSelect: "Domínio / Campo / Subcampo de Pesquisa",
    lblCountrySelect: "País / Economia",
    lblRefYear: "Ano de Referência (Ano Anterior Completo)",
    tabScenario1Badge: "Cenário 1 • Contexto Global",
    tabScenario1Title: "Comparação de Países (Área Fixa)",
    tabScenario1Desc: "Compara os níveis de especialização de vários países dentro de um domínio, campo ou subcampo fixo",
    tabScenario2Badge: "Cenário 2 • Contexto Local",
    tabScenario2Title: "Comparação de Domínios/Áreas (País Fixo)",
    tabScenario2Desc: "Compara o perfil de especialização através de múltiplas áreas dentro de um único país selecionado",
    tabEvolutionBadge: "Perfil Longitudinal • Grade 5×3",
    tabEvolutionTitle: "14 Gráficos de Evolução Temporal (País × Área)",
    tabEvolutionDesc: "Inspecione as trajetórias históricas 1980–2024 de produção, shares, AI, RSI, F-measure e médias",
    diagHeaderGlobal: "Critério Metodológico do Artigo (Comparação de Países — Contexto Global)",
    diagHeaderLocal: "Critério Metodológico do Artigo (Comparação de Domínios — Contexto Local)",
    btnDownloadSeriesCSV: "Baixar Séries 5×3 (CSV)",
    btnDownloadRankingCSV: "Baixar Tabela do Cenário Atual (CSV)",
    btnDownloadCorrelationsCSV: "Baixar Tabela Geral de Correlações (CSV)",
    btnJumpTo5x3: "Ver Grade 5×3 de Evolução (País × Área)",
    llmPanelTitle: "Intérprete Metodológico com IA (Modelo Local em dinamica1)",
    llmBtnGenerate: "Gerar Análise com LLM Local",
    llmBtnConfig: "Configurar Conexão com dinamica1",
    llmGenerating: "Consultando o modelo LLM local em dinamica1...",
    chartScatterTitleGlobal: "Espaço Bivariado de Componentes e Indicadores (Países na Área Selecionada)",
    chartBarTitleGlobal: "Comparação dos Principais Países: AI vs. F-measure vs. Shares Constituintes",
    chartScatterTitleLocal: "Perfil Temático: DShareC vs. CShareD entre as Áreas do País Selecionado",
    chartBarTitleLocal: "Perfil de Especialização por Área (AI, F-measure, DShareC, CShareD)",
    tableGlobalTitle: "Ranking de Países e Indicadores de Especialização na Área Selecionada",
    tableLocalTitle: "Ranking de Áreas e Indicadores de Especialização no País Selecionado",
    tableCorrSummaryTitle: "Resumo das Correlações de Pearson (r) e Spearman (ρ) em Todas as Entidades",
    grid5x3Title: "Grade 5×3 de Evolução Longitudinal (1980–2024)",
    grid5x3Subtitle: "F-measure = Média harmônica de DShareC e CShareD | A-measure = Média aritmética | G-measure = Média geométrica | GAggregation = √DShareC + √CShareD",
    verdictHigh: "Alta Convergência de Componentes — Um Único Indicador é Suficiente",
    verdictMid: "Alinhamento Moderado — Recomenda-se Reportar Ambos os Indicadores",
    verdictLow: "Dimensões Desacopladas / Ortogonais — Usar Ambos os Indicadores Separadamente",
    verdictHighOutput: "Regime de País de Alta Produção — F-measure Dominado por DShareC",
    verdictLowOutput: "Regime de País de Baixa Produção — F-measure Dominado por CShareD",
    verdictMidOutput: "Regime Transicional de Produção Média — Influência Mista dos Componentes",
    subplotTitles: (unit, area) => [
      `Publicações Totais de ${unit} (Oc)`,
      `Publicações Totais do Mundo (Ow)`,
      `Share Global de ${unit} (Oc / Ow)`,
      `Publicações de ${unit} em ${area} (Ocd)`,
      `Publicações do Mundo em ${area} (Owd)`,
      `Razão F-measure / AI no Tempo`,
      `Share da Área em ${unit} (DShareC = Ocd/Oc)`,
      `Share da Área no Mundo (DShareW = Owd/Ow)`,
      `Share de ${unit} em ${area} (CShareD = Ocd/Owd)`,
      `Índice de Atividade (AI = DShareC / DShareW)`,
      `Índice de Especialização Relativa (RSI)`,
      `F-measure (Média Harmônica de Shares)`,
      `A-measure (Média Aritmética de Shares)`,
      `G-measure (Média Geométrica de Shares)`,
      `Agregação Geométrica (√DShareC + √CShareD)`
    ]
  }
};

/**
 * Generates the exact criterion explanation from the paper based on the scenario,
 * reference year correlations, and previous year correlations.
 */
window.buildMethodologicalDiagnosis = function(lang, scenario, entityName, year, corr, prevCorr, extraMeta) {
  const t = window.I18N[lang] || window.I18N.en;
  const fmt = (v) => (v === null || v === undefined || Number.isNaN(v)) ? "N/A" : Number(v).toFixed(4);

  if (scenario === "global") {
    // Countries Comparison in fixed Area
    const rho_AI_CShareD = corr.spearman.AI_CShareD;
    const rho_FM_DShareC = corr.spearman.FM_DShareC;
    const rho_FM_CShareD = corr.spearman.FM_CShareD;
    const r_FM_DShareC = corr.pearson.FM_DShareC;
    const prev_rho = prevCorr ? prevCorr.spearman.FM_DShareC : null;

    let verdictClass = "verdict-low";
    let verdictText = t.verdictLow;
    if (rho_FM_DShareC >= 0.62 && rho_AI_CShareD >= 0.58) {
      verdictClass = "verdict-high";
      verdictText = t.verdictHigh;
    } else if (rho_FM_DShareC >= 0.35 || rho_AI_CShareD >= 0.35) {
      verdictClass = "verdict-mid";
      verdictText = t.verdictMid;
    }

    if (lang === "es") {
      const p1 = `En el escenario de <strong>Comparación de Países (Contexto Global)</strong> dentro del área fija <strong>${entityName}</strong> (año <strong>${year}</strong>, ${extraMeta.nUnits} países activos), la participación mundial del área ($\\text{DShareW} = O_{wd}/O_w$) actúa como una constante de escala. Por identidad algebraica, el <strong>Índice de Actividad (AI) es exactamente proporcional y equivalente en rango a $\\text{DShareC}$</strong> ($r = 1.0000, \\rho = 1.0000$). Por su parte, debido a la propiedad de acotamiento de la media armónica ($H \\in [a, 2a]$ donde $a = \\min(\\text{DShareC}, \\text{CShareD})$, Teorema A1) y la distribución asimétrica de la producción mundial, $\\text{CShareD} \\ll \\text{DShareC}$ para la gran mayoría de los países, haciendo que el <strong>F-measure opere como un proxy directo de $\\text{CShareD}$</strong> ($\\rho = ${fmt(rho_FM_CShareD)}$).`;
      let p2 = "";
      if (verdictClass === "verdict-high") {
        p2 = `<strong>Recomendación Práctica para ${entityName}:</strong> En este dominio (análogo al caso de <em>Space Science</em> o <em>Engineering</em> en el artículo), la correlación de rango secundaria entre $\\text{AI}$ y $\\text{CShareD}$ ($\\rho = ${fmt(rho_AI_CShareD)}$) y entre $\\text{F-measure}$ y $\\text{DShareC}$ ($\\rho = ${fmt(rho_FM_DShareC)}$, año previo: ${fmt(prev_rho)}) es <strong>alta</strong>. Esto significa que los países que priorizan internamente esta área también suelen liderar el volumen mundial. Por tanto, <strong>cualquiera de los dos indicadores (AI o F-measure) puede utilizarse razonablemente como métrica sintética única</strong>.`;
      } else if (verdictClass === "verdict-mid") {
        p2 = `<strong>Recomendación Práctica para ${entityName}:</strong> Las correlaciones cruzadas secundarias ($\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$ y $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, año previo: ${fmt(prev_rho)}; Pearson $r = ${fmt(r_FM_DShareC)}$) muestran una <strong>asociación moderada</strong>. Usar únicamente AI favorecerá a países pequeños con alta prioridad doméstica, mientras que F-measure favorecerá a grandes productores globales. <strong>Se recomienda reportar ambos indicadores conjuntamente o inspeccionar directamente el plano $(\\text{DShareC}, \\text{CShareD})$</strong>.`;
      } else {
        p2 = `<strong>Recomendación Práctica para ${entityName}:</strong> Este campo se comporta como el caso de <em>Immunology</em> en el artículo: existe una <strong>baja o nula correlación entre prioridad interna y liderazgo global</strong> ($\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$, $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, año previo: ${fmt(prev_rho)}). <strong>No debe emplearse un solo indicador de forma aislada</strong>: utilice $\\text{AI}$ (o $\\text{DShareC}$) para identificar países especializados de nicho y $\\text{F-measure}$ (o $\\text{CShareD}$) para identificar a los líderes por volumen absoluto.`;
      }
      return { verdictClass, verdictText, p1, p2 };
    } else if (lang === "pt") {
      const p1 = `No cenário de <strong>Comparação de Países (Contexto Global)</strong> dentro da área fixa <strong>${entityName}</strong> (ano <strong>${year}</strong>, ${extraMeta.nUnits} países ativos), a participação mundial da área ($\\text{DShareW} = O_{wd}/O_w$) é constante para todos os países. Algebricamente, o <strong>Índice de Atividade (AI) é proporcional e equivalente em posto a $\\text{DShareC}$</strong> ($r = 1.0000, \\rho = 1.0000$). Já pela propriedade da média harmônica (Teorema A1), como $\\text{CShareD} \\ll \\text{DShareC}$ para a maioria dos países, o <strong>F-measure acompanha de perto o $\\text{CShareD}$</strong> ($\\rho = ${fmt(rho_FM_CShareD)}$).`;
      let p2 = "";
      if (verdictClass === "verdict-high") {
        p2 = `<strong>Recomendação Prática para ${entityName}:</strong> A correlação cruzada entre $\\text{AI}$ e $\\text{CShareD}$ ($\\rho = ${fmt(rho_AI_CShareD)}$) e entre $\\text{F-measure}$ e $\\text{DShareC}$ ($\\rho = ${fmt(rho_FM_DShareC)}$, ano anterior: ${fmt(prev_rho)}) é <strong>forte</strong>. Os países que priorizam internamente a área também concentram grande produção global. Assim, <strong>qualquer um dos indicadores (AI ou F-measure) fornece um resumo consistente de ambas as dimensões</strong>.`;
      } else if (verdictClass === "verdict-mid") {
        p2 = `<strong>Recomendação Prática para ${entityName}:</strong> As correlações secundárias ($\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$ e $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, ano anterior: ${fmt(prev_rho)}) indicam <strong>alinhamento moderado</strong>. <strong>Recomenda-se utilizar ambos os indicadores de forma complementar</strong> para distinguir especialização relativa de liderança em volume.`;
      } else {
        p2 = `<strong>Recomendação Práctica para ${entityName}:</strong> Análogo ao caso de <em>Immunology</em> no artigo, a correlação entre esforço doméstico e participação global é <strong>fraca</strong> ($\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$, $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$). <strong>Não utilize apenas um indicador</strong>: use $\\text{AI}$ (ou $\\text{DShareC}$) para medir prioridade doméstica e $\\text{F-measure}$ (ou $\\text{CShareD}$) para medir liderança global em volume.`;
      }
      return { verdictClass, verdictText, p1, p2 };
    } else {
      // English
      const p1 = `In the <strong>Countries Comparison (Global Context)</strong> scenario within the fixed research area <strong>${entityName}</strong> (year <strong>${year}</strong>, ${extraMeta.nUnits} active countries), the global domain share ($\\text{DShareW} = O_{wd}/O_w$) acts as a constant scaling factor. By algebraic identity, the <strong>Activity Index (AI) is linearly proportional and rank-equivalent to $\\text{DShareC}$</strong> ($r = 1.0000, \\rho = 1.0000$). Conversely, due to the harmonic mean bounding property ($H \\in [a, 2a]$ where $a = \\min(\\text{DShareC}, \\text{CShareD})$, Theorem A1) and the power-law skew of global output, $\\text{CShareD} \\ll \\text{DShareC}$ for most nations, causing the <strong>F-measure to closely track $\\text{CShareD}$</strong> ($\\rho = ${fmt(rho_FM_CShareD)}$).`;
      let p2 = "";
      if (verdictClass === "verdict-high") {
        p2 = `<strong>Practical Guideline for ${entityName}:</strong> Analogous to <em>Space Science</em> or <em>Engineering</em> in the manuscript, the secondary rank correlations $\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$ and $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$ (previous year: ${fmt(prev_rho)}) are <strong>strong</strong>. Nations prioritizing this domain domestically also tend to be the largest global contributors. Therefore, <strong>either AI or the F-measure can reasonably serve as a single summary metric</strong>.`;
      } else if (verdictClass === "verdict-mid") {
        p2 = `<strong>Practical Guideline for ${entityName}:</strong> Secondary cross-correlations ($\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$, $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, previous year: ${fmt(prev_rho)}; Pearson $r = ${fmt(r_FM_DShareC)}$) show <strong>moderate alignment</strong>. Relying solely on AI favors smaller niche specialists, whereas F-measure favors high-volume producers. <strong>Analysts should report both indicators or directly examine the 2D $(\\text{DShareC}, \\text{CShareD})$ plane</strong>.`;
      } else {
        p2 = `<strong>Practical Guideline for ${entityName}:</strong> Analogous to the <em>Immunology</em> case study in the paper, domestic priority and global share are <strong>weakly coupled or orthogonal</strong> ($\\rho(\\text{AI}, \\text{CShareD}) = ${fmt(rho_AI_CShareD)}$, $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, previous year: ${fmt(prev_rho)}). <strong>Do not use either indicator alone</strong>: use $\\text{AI}$ (or $\\text{DShareC}$) to identify relative specialization, and $\\text{F-measure}$ (or $\\text{CShareD}$) to identify global volume leadership.`;
      }
      return { verdictClass, verdictText, p1, p2 };
    }
  } else {
    // Domains Comparison in fixed Country (Local Context)
    const rho_FM_DShareC = corr.spearman.FM_DShareC;
    const rho_FM_CShareD = corr.spearman.FM_CShareD;
    const rho_AI_DShareC = corr.spearman.AI_DShareC;
    const prev_FM_D = prevCorr ? prevCorr.spearman.FM_DShareC : null;
    const prev_FM_C = prevCorr ? prevCorr.spearman.FM_CShareD : null;

    let verdictClass = "verdict-mid";
    let verdictText = t.verdictMidOutput;
    if (rho_FM_DShareC - rho_FM_CShareD > 0.15 && rho_FM_DShareC >= 0.75) {
      verdictClass = "verdict-high";
      verdictText = t.verdictHighOutput;
    } else if (rho_FM_CShareD - rho_FM_DShareC > 0.15 && rho_FM_CShareD >= 0.75) {
      verdictClass = "verdict-low";
      verdictText = t.verdictLowOutput;
    }

    if (lang === "es") {
      const p1 = `En el escenario de <strong>Comparación de Dominios/Áreas (Contexto Local)</strong> para <strong>${entityName}</strong> (año <strong>${year}</strong>, producción total $O_c = ${extraMeta.countryTotal.toLocaleString()}$ docs en ${extraMeta.nUnits} áreas activas), la inversión simétrica descrita en el artículo entra en efecto: dado que el país está fijo, la razón $O_c/O_w$ es constante para todas las áreas y el <strong>Índice de Actividad (AI) se vuelve exactamente proporcional y equivalente en rango a $\\text{CShareD}$</strong> ($r = 1.0000, \\rho = 1.0000$). Es decir, dentro de un país fijo, AI ordena las áreas según la cuota mundial que el país alcanza en cada disciplina.`;
      let p2 = "";
      if (verdictClass === "verdict-high") {
        p2 = `<strong>Diagnóstico por Escala de Producción (${entityName}):</strong> El volumen total del país ($O_c$) supera o compite con el volumen mundial de múltiples áreas individuales ($O_{wd}$), haciendo que $\\text{DShareC} < \\text{CShareD}$ en gran parte del perfil. Por el Teorema A1, el <strong>F-measure queda gobernado por el componente menor ($\\text{DShareC}$), alcanzando $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$</strong> (año previo: ${fmt(prev_FM_D)}) frente a $\\rho(\\text{F-measure}, \\text{CShareD}) = ${fmt(rho_FM_CShareD)}$. Aquí <strong>AI refleja competitividad global ($\text{CShareD}$) mientras que F-measure refleja la prioridad temática nacional ($\text{DShareC}$)</strong>.`;
      } else if (verdictClass === "verdict-low") {
        p2 = `<strong>Diagnóstico por Escala de Producción (${entityName}):</strong> Al ser la producción total del país ($O_c$) menor que la producción mundial de las áreas ($O_{wd}$), $\\text{CShareD}$ es sistemáticamente el componente más pequeño ($\\text{CShareD} \\ll \\text{DShareC}$). En consecuencia, el <strong>F-measure sigue estrechamente a $\\text{CShareD}$ ($\\rho = ${fmt(rho_FM_CShareD)}$, año previo: ${fmt(prev_FM_C)})</strong> frente a $\\text{DShareC}$ ($\\rho = ${fmt(rho_FM_DShareC)}$). Dado que tanto AI como F-measure quedan dominados por $\\text{CShareD}$, <strong>para evaluar qué áreas prioriza internamente ${entityName} debe observarse directamente $\\text{DShareC}$</strong>.`;
      } else {
        p2 = `<strong>Diagnóstico por Escala de Producción (${entityName}):</strong> Este país se ubica en un <strong>régimen intermedio/transicional</strong> donde $O_c$ es comparable al tamaño mundial de ciertas áreas pero menor que otras. Como resultado, ni $\\text{DShareC}$ ni $\\text{CShareD}$ es uniformemente el menor en todas las disciplinas ($\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, $\\rho(\\text{F-measure}, \\text{CShareD}) = ${fmt(rho_FM_CShareD)}$, $\\rho(\\text{AI}, \\text{DShareC}) = ${fmt(rho_AI_DShareC)}$). <strong>Se recomienda contrastar directamente $\\text{DShareC}$ (esfuerzo interno) y $\\text{CShareD}$ (cuota global, equivalente a AI)</strong>.`;
      }
      return { verdictClass, verdictText, p1, p2 };
    } else if (lang === "pt") {
      const p1 = `No cenário de <strong>Comparação de Domínios/Áreas (Contexto Local)</strong> para <strong>${entityName}</strong> (ano <strong>${year}</strong>, produção total $O_c = ${extraMeta.countryTotal.toLocaleString()}$ docs em ${extraMeta.nUnits} áreas ativas), ocorre a inversão simétrica demonstrada no artigo: como o país é fixo, a razão $O_c/O_w$ é constante e o <strong>Índice de Atividade (AI) torna-se linearmente proporcional e equivalente em posto a $\\text{CShareD}$</strong> ($r = 1.0000, \\rho = 1.0000$).`;
      let p2 = "";
      if (verdictClass === "verdict-high") {
        p2 = `<strong>Diagnóstico por Escala de Produção (${entityName}):</strong> Como o volume nacional ($O_c$) é elevado frente às áreas ($O_{wd}$), $\\text{DShareC}$ torna-se o menor componente, fazendo com que o <strong>F-measure acompanhe fortemente $\\text{DShareC}$ ($\\rho = ${fmt(rho_FM_DShareC)}$, ano anterior: ${fmt(prev_FM_D)})</strong> em comparação a $\\text{CShareD}$ ($\\rho = ${fmt(rho_FM_CShareD)}$). Neste caso, <strong>AI mede participação global ($\text{CShareD}$) e F-measure reflete prioridade doméstica ($\text{DShareC}$)</strong>.`;
      } else if (verdictClass === "verdict-low") {
        p2 = `<strong>Diagnóstico por Escala de Produção (${entityName}):</strong> Como a produção total do país ($O_c$) é menor que a produção mundial das áreas ($O_{wd}$), $\\text{CShareD} \\ll \\text{DShareC}$. Assim, o <strong>F-measure é governado por $\\text{CShareD}$ ($\\rho = ${fmt(rho_FM_CShareD)}$, ano anterior: ${fmt(prev_FM_C)})</strong>. Como tanto o AI quanto o F-measure refletem $\\text{CShareD}$, <strong>para avaliar a alocação interna de esforço de ${entityName} deve-se utilizar diretamente $\\text{DShareC}$</strong>.`;
      } else {
        p2 = `<strong>Diagnóstico por Escala de Produção (${entityName}):</strong> O país encontra-se em um <strong>regime intermediário</strong> onde nem $\\text{DShareC}$ nem $\\text{CShareD}$ é sistematicamente menor em todas as áreas ($\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, $\\rho(\\text{F-measure}, \\text{CShareD}) = ${fmt(rho_FM_CShareD)}$). <strong>Recomenda-se inspecionar diretamente o par $(\\text{DShareC}, \\text{CShareD})$</strong>.`;
      }
      return { verdictClass, verdictText, p1, p2 };
    } else {
      // English
      const p1 = `In the <strong>Domains Comparison (Local Context)</strong> scenario for <strong>${entityName}</strong> (year <strong>${year}</strong>, total national output $O_c = ${extraMeta.countryTotal.toLocaleString()}$ docs across ${extraMeta.nUnits} active areas), the mirrored asymmetrical reversal proved in the paper takes effect: because the country is fixed, $O_c/O_w$ is constant across all areas, making the <strong>Activity Index (AI) a linear transformation of and rank-equivalent to $\\text{CShareD}$</strong> ($r = 1.0000, \\rho = 1.0000$). Thus, within a single country, AI ranks domains strictly by the country's share of global output.`;
      let p2 = "";
      if (verdictClass === "verdict-high") {
        p2 = `<strong>Output-Scale Diagnosis (${entityName}):</strong> For a high-output nation where $O_c$ exceeds or rivals the global output of individual fields ($O_{wd}$), $\\text{DShareC}$ becomes systematically smaller than $\\text{CShareD}$. By Theorem A1, the <strong>F-measure is governed by the smaller component ($\\text{DShareC}$), yielding $\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$</strong> (previous year: ${fmt(prev_FM_D)}) vs. $\\rho(\\text{F-measure}, \\text{CShareD}) = ${fmt(rho_FM_CShareD)}$. Here, <strong>AI captures global market share ($\\text{CShareD}$) while F-measure captures domestic thematic priority ($\\text{DShareC}$)</strong>.`;
      } else if (verdictClass === "verdict-low") {
        p2 = `<strong>Output-Scale Diagnosis (${entityName}):</strong> Because the country's total output ($O_c$) is smaller than global domain outputs ($O_{wd}$), $\\text{CShareD} \\ll \\text{DShareC}$ across areas. Consequently, the <strong>F-measure is dominated by $\\text{CShareD}$ ($\\rho = ${fmt(rho_FM_CShareD)}$, previous year: ${fmt(prev_FM_C)})</strong> rather than $\\text{DShareC}$ ($\\rho = ${fmt(rho_FM_DShareC)}$). Since both AI and F-measure collapse onto $\\text{CShareD}$, <strong>analysts evaluating domestic research prioritization in ${entityName} should inspect $\\text{DShareC}$ directly</strong>.`;
      } else {
        p2 = `<strong>Output-Scale Diagnosis (${entityName}):</strong> This country operates in a <strong>medium-output transitional regime</strong> where $O_c$ is comparable to some global fields, so neither $\\text{DShareC}$ nor $\\text{CShareD}$ is uniformly smaller across all fields ($\\rho(\\text{F-measure}, \\text{DShareC}) = ${fmt(rho_FM_DShareC)}$, $\\rho(\\text{F-measure}, \\text{CShareD}) = ${fmt(rho_FM_CShareD)}$, $\\rho(\\text{AI}, \\text{DShareC}) = ${fmt(rho_AI_DShareC)}$). <strong>Analysts should examine both constituent shares $(\\text{DShareC}, \\text{CShareD})$ side by side</strong>.`;
      }
      return { verdictClass, verdictText, p1, p2 };
    }
  }
};
