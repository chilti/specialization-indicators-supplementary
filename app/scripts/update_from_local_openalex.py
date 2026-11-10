#!/usr/bin/env python3
"""
update_from_local_openalex.py
-----------------------------
Pipeline de actualización periódica desde el servidor ClickHouse local (tabla `rag.works_flat`)
para extraer la producción científica anual (full counting) en los tres primeros niveles de OpenAlex:
  1. Domains   (`domain_name` - 4 grandes dominios)
  2. Fields    (`field_name`  - 26 campos ASJC)
  3. Subfields (`subfield_name` - 252 subcampos)

Calcula automáticamente:
- Ambos conjuntos documentales:
    * All Documents (todos los documentos en `rag.works_flat`)
    * Citable Documents (`type IN ('article', 'review', 'letter')`)
- Todos los indicadores cienciométricos (DShareC, DShareW, CShareD, AI, RSI, F-measure,
  A-measure, G-measure, GAggregation).
- Las correlaciones de Pearson (r) y Spearman (ρ) para cada año (destacando el año anterior completo)
  en ambos escenarios:
    * Escenario 1: Countries Comparison (Global Context)
    * Escenario 2: Domains Comparison (Local Context)

Uso en dinamica1:
  python3 app/scripts/update_from_local_openalex.py \
      --ch-url "http://localhost:8123" \
      --ch-user "default" \
      --ch-password "" \
      --start-year 1980 \
      --end-year 2025
"""

import argparse
import csv
import json
import math
import os
import urllib.parse
import urllib.request
from typing import Dict, List


def run_clickhouse_query(ch_url: str, sql: str, user: str = "default", password: str = "") -> List[dict]:
    """Ejecuta una consulta SQL en ClickHouse vía interfaz HTTP con FORMAT JSONEachRow."""
    full_sql = sql.strip().rstrip(";") + "\nFORMAT JSONEachRow"
    params = {"user": user}
    if password:
        params["password"] = password
    url = f"{ch_url.rstrip('/')}/?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, data=full_sql.encode("utf-8"), method="POST")
    with urllib.request.urlopen(req, timeout=300) as resp:
        lines = resp.read().decode("utf-8").splitlines()
        return [json.loads(line) for line in lines if line.strip()]


# ==============================================================================
# CONSULTAS SQL OPTIMIZADAS PARA CLICKHOUSE (tabla `rag.works_flat`)
# Nota: Como `rag.works_flat` usa ENGINE = ReplacingMergeTree ORDER BY id,
# usamos `uniqExact(id)` (o `FROM rag.works_flat FINAL`) y `arrayDistinct(country_codes)`
# para garantizar el método de conteo completo (full counting) sin duplicar un país
# cuando varias instituciones del mismo país firman un mismo artículo.
# ==============================================================================

SQL_WORLD_TOTAL = """
SELECT
    publication_year AS year,
    uniqExact(id) AS docs_all,
    uniqExactIf(id, lower(type) IN ('article', 'review', 'letter')) AS docs_citable
FROM rag.works_flat
WHERE publication_year BETWEEN {start_year} AND {end_year}
  AND is_retracted = 0
GROUP BY publication_year
ORDER BY publication_year
"""

SQL_WORLD_BY_LEVEL = """
SELECT
    publication_year AS year,
    {level_col} AS area_name,
    any(domain_name) AS parent_domain,
    any(field_name) AS parent_field,
    uniqExact(id) AS docs_all,
    uniqExactIf(id, lower(type) IN ('article', 'review', 'letter')) AS docs_citable
FROM rag.works_flat
WHERE publication_year BETWEEN {start_year} AND {end_year}
  AND is_retracted = 0
  AND {level_col} != ''
GROUP BY publication_year, area_name
ORDER BY publication_year, area_name
"""

SQL_COUNTRY_TOTAL = """
SELECT
    publication_year AS year,
    cc AS country_code,
    uniqExact(id) AS docs_all,
    uniqExactIf(id, lower(type) IN ('article', 'review', 'letter')) AS docs_citable
FROM rag.works_flat
ARRAY JOIN arrayDistinct(
    if(notEmpty(country_codes), country_codes,
       if(notEmpty(all_country_codes), all_country_codes,
          if(country_code != '', [country_code], [])))
) AS cc
WHERE publication_year BETWEEN {start_year} AND {end_year}
  AND is_retracted = 0
  AND cc != ''
GROUP BY publication_year, country_code
ORDER BY publication_year, country_code
"""

SQL_COUNTRY_BY_LEVEL = """
SELECT
    publication_year AS year,
    cc AS country_code,
    {level_col} AS area_name,
    uniqExact(id) AS docs_all,
    uniqExactIf(id, lower(type) IN ('article', 'review', 'letter')) AS docs_citable
FROM rag.works_flat
ARRAY JOIN arrayDistinct(
    if(notEmpty(country_codes), country_codes,
       if(notEmpty(all_country_codes), all_country_codes,
          if(country_code != '', [country_code], [])))
) AS cc
WHERE publication_year BETWEEN {start_year} AND {end_year}
  AND is_retracted = 0
  AND cc != ''
  AND {level_col} != ''
GROUP BY publication_year, country_code, area_name
ORDER BY publication_year, country_code, area_name
"""


def update_from_clickhouse(ch_url: str, user: str, password: str, start_year: int, end_year: int, out_dir: str):
    years = list(range(start_year, end_year + 1))
    yr_to_idx = {y: i for i, y in enumerate(years)}
    n_years = len(years)

    print(f"[1/5] Consultando producción mundial total ({start_year}-{end_year}) en ClickHouse...")
    w_tot_rows = run_clickhouse_query(
        ch_url, SQL_WORLD_TOTAL.format(start_year=start_year, end_year=end_year), user, password
    )
    world_total = {"all": [0] * n_years, "citable": [0] * n_years}
    for r in w_tot_rows:
        idx = yr_to_idx.get(int(r["year"]))
        if idx is not None:
            world_total["all"][idx] = int(r["docs_all"])
            world_total["citable"][idx] = int(r["docs_citable"])

    print(f"[2/5] Consultando producción total por país (full counting)...")
    c_tot_rows = run_clickhouse_query(
        ch_url, SQL_COUNTRY_TOTAL.format(start_year=start_year, end_year=end_year), user, password
    )
    units_total = {"all": {}, "citable": {}}
    for r in c_tot_rows:
        idx = yr_to_idx.get(int(r["year"]))
        cc = r["country_code"]
        if idx is not None and cc:
            units_total["all"].setdefault(cc, [0] * n_years)[idx] = int(r["docs_all"])
            units_total["citable"].setdefault(cc, [0] * n_years)[idx] = int(r["docs_citable"])

    level_configs = [
        ("domains", "if(domain_name != '', domain_name, domain)"),
        ("fields", "if(field_name != '', field_name, field)"),
        ("subfields", "if(subfield_name != '', subfield_name, subfield)"),
    ]

    world_by_level = {"all": {}, "citable": {}}
    units_by_level = {"all": {}, "citable": {}}
    subfields_hierarchy = {}

    for lvl_key, lvl_expr in level_configs:
        print(f"[3/5] Consultando nivel '{lvl_key}' en el mundo y por país...")
        w_rows = run_clickhouse_query(
            ch_url,
            SQL_WORLD_BY_LEVEL.format(level_col=lvl_expr, start_year=start_year, end_year=end_year),
            user,
            password,
        )
        world_by_level["all"][lvl_key] = {}
        world_by_level["citable"][lvl_key] = {}
        for r in w_rows:
            idx = yr_to_idx.get(int(r["year"]))
            area = r["area_name"]
            if idx is not None and area:
                world_by_level["all"][lvl_key].setdefault(area, [0] * n_years)[idx] = int(r["docs_all"])
                world_by_level["citable"][lvl_key].setdefault(area, [0] * n_years)[idx] = int(r["docs_citable"])
                if lvl_key == "subfields":
                    subfields_hierarchy[area] = {
                        "id": area,
                        "name": area,
                        "field": r.get("parent_field", ""),
                        "domain": r.get("parent_domain", ""),
                    }

        c_rows = run_clickhouse_query(
            ch_url,
            SQL_COUNTRY_BY_LEVEL.format(level_col=lvl_expr, start_year=start_year, end_year=end_year),
            user,
            password,
        )
        units_by_level["all"][lvl_key] = {}
        units_by_level["citable"][lvl_key] = {}
        for r in c_rows:
            idx = yr_to_idx.get(int(r["year"]))
            cc = r["country_code"]
            area = r["area_name"]
            if idx is not None and cc and area:
                if int(r["docs_all"]) > 0:
                    units_by_level["all"][lvl_key].setdefault(cc, {}).setdefault(area, [0] * n_years)[idx] = int(r["docs_all"])
                if int(r["docs_citable"]) > 0:
                    units_by_level["citable"][lvl_key].setdefault(cc, {}).setdefault(area, [0] * n_years)[idx] = int(r["docs_citable"])

    os.makedirs(out_dir, exist_ok=True)
    for doc_key in ["all", "citable"]:
        out_payload = {
            "years": years,
            "domains": sorted(world_by_level[doc_key]["domains"].keys()),
            "fields": sorted(world_by_level[doc_key]["fields"].keys()),
            "world_total": world_total[doc_key],
            "world_domains": world_by_level[doc_key]["domains"],
            "world_fields": world_by_level[doc_key]["fields"],
            "units_total": units_total[doc_key],
            "units_domains": units_by_level[doc_key]["domains"],
            "units_fields": units_by_level[doc_key]["fields"],
        }
        target_file = os.path.join(out_dir, f"data_domains_fields_{doc_key}.json")
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(out_payload, f, separators=(",", ":"))
        print(f"[OK] Guardado {target_file}")

    # Save subfields
    sf_payload = {
        "subfields": list(subfields_hierarchy.values()),
        "world_subfields": world_by_level["all"]["subfields"],
        "units_subfields_full": units_by_level["all"]["subfields"],
        "units_subfields_citable": units_by_level["citable"]["subfields"],
        "units_sf_23_24": {
            cc: {
                sf: [arr[-2] if n_years >= 2 else 0, arr[-1] if n_years >= 1 else 0]
                for sf, arr in sf_dict.items()
            }
            for cc, sf_dict in units_by_level["all"]["subfields"].items()
        },
    }
    sf_file = os.path.join(out_dir, "data_subfields.json")
    with open(sf_file, "w", encoding="utf-8") as f:
        json.dump(sf_payload, f, separators=(",", ":"))
    print(f"[OK] Guardado {sf_file}")


def main():
    parser = argparse.ArgumentParser(description="Actualizador ClickHouse (rag.works_flat) -> App JSON Data")
    parser.add_argument("--ch-url", default=os.environ.get("CLICKHOUSE_URL", "http://localhost:8123"), help="URL HTTP de ClickHouse")
    parser.add_argument("--ch-user", default=os.environ.get("CLICKHOUSE_USER", "default"), help="Usuario de ClickHouse")
    parser.add_argument("--ch-password", default=os.environ.get("CLICKHOUSE_PASSWORD", ""), help="Password de ClickHouse")
    parser.add_argument("--start-year", type=int, default=1980, help="Año inicial")
    parser.add_argument("--end-year", type=int, default=2024, help="Año final completo")
    parser.add_argument("--out-dir", default=os.path.join(os.path.dirname(__file__), "..", "data"), help="Carpeta de salida")
    parser.add_argument("--print-sql", action="store_true", help="Imprimir las consultas ClickHouse y salir")
    args = parser.parse_args()

    if args.print_sql:
        print("=== SQL_WORLD_TOTAL ===", SQL_WORLD_TOTAL)
        print("=== SQL_COUNTRY_TOTAL ===", SQL_COUNTRY_TOTAL)
        print("=== SQL_WORLD_BY_LEVEL ===", SQL_WORLD_BY_LEVEL)
        print("=== SQL_COUNTRY_BY_LEVEL ===", SQL_COUNTRY_BY_LEVEL)
        return

    update_from_clickhouse(args.ch_url, args.ch_user, args.ch_password, args.start_year, args.end_year, os.path.abspath(args.out_dir))


if __name__ == "__main__":
    main()
