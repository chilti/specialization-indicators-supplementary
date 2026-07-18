# Supplementary Material: Specialization indicators in scientometrics: Understanding the Activity Index and the F-measure through their underlying components

This repository contains the supplementary materials—including data retrieval scripts, statistical analysis notebooks, and structured documentation—for the manuscript:

**"Insert Article Title Here"**

---

## Overview

This repository provides code and instructions to replicate our study on specialization indicators. Specifically, it explores the relationships, functional dependencies, rank distortions, and dominance effects between:
*   **Activity Index (AI)**
*   **F-measure**
*   **DShareC** (Domain Share in the Country)
*   **CShareD** (Country Share in the Domain)

The statistical analysis focuses on two distinct comparison settings:
1.  **Countries Comparison :** Compares the specialization levels of multiple countries within a fixed research domain.
2.  **Domains Comparison :** Compares the specialization levels of a single country across multiple research domains.

Within each setting, we assess both linear and nonlinear dependencies by computing **Pearson** and **Spearman** rank correlation coefficients.

---

## Data Sources & Acquisition

The analysis is based on data spanning **1980 to 2024** retrieved from two key databases:

### 1. InCites (Web of Science)
*   **Source:** Clarivate Analytics InCites.
*   **Retrieval Date:** September 25, 2025.
*   **Classification Schema:** Essential Science Indicators (ESI) schema (22 research fields).
*   **Retrieval Steps:**
    *   **Global Outputs:** Downloaded using the `Analyze -> Research Areas` option, selecting the **Trend** checkbox.
    *   **Country-Level Outputs:** Obtained via the `Analyze -> Locations` menu, filtering data by area under the ESI scheme, and downloading **22 separate files** containing country-specific information.
*   *Note: Access to InCites is subscription-based. The raw data files are not redistributed in this repository, but users with access to InCites can replicate the study using the provided notebooks.*

### 2. OpenAlex
*   **Source:** OpenAlex API (Priem et al., 2022).
*   **Retrieval Date:** November 13, 2025.
*   **Classification Schema:** OpenAlex Topics framework. This is a four-level hierarchical scheme comprising:
    *   Domains (4)
    *   Fields (26) - *equivalent to Scopus ASJC major areas*
    *   Subfields (254)
    *   Topics (~4,500)
*   **Retrieval Method:** Extracted and stored locally using a custom Python script utilizing the `PyAlex` library (Lombaers, P., 2025).
*   **Aggregation:** For comparability with the 22 ESI fields, global and country-level outputs were aggregated across the **26 OpenAlex fields**.
*   *Note: OpenAlex is completely open-access. The provided download scripts enable full reproducibility without paywall restrictions.*

---

## Methods and Calculation Specifications

For both InCites and OpenAlex datasets:
*   **Counting Method:** We applied the **full counting method** (each participating country receives full credit in cases of international co-authorship).
*   **Zero Values:** Zero values (representing the absence of publication outputs for specific country-field combinations) were **retained** in the datasets during all calculations.
*   **Document Types:** Analysis was conducted on both:
    1.  **Total volume of publications** (located in the `All_Documents/` folder).
    2.  **Citable documents** (located in the `Citable_Documents/` folder).
    *   *Both setups yielded qualitatively equivalent results (see Appendix C of the manuscript).*

---

## Interactive & Pre-rendered Results (HTML Reports)

For readers who wish to explore our findings without running the Python notebooks, we have provided pre-rendered HTML reports under each analysis context. You can access the interactive visualizations directly through the links below:

### 1. Total Publications (All Documents)
*   **InCites (ESI Schema)**:
    *   **Global Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/InCites/Global%20Context/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/InCites/Global%20Context/scatterplots.html)
    *   **Local Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/InCites/Local%20Context/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/InCites/Local%20Context/scatterplots.html)
*   **OpenAlex (ASJC Schema)**:
    *   **Global Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/OpenAlex/GlobalContext/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/OpenAlex/GlobalContext/scatterplots.html)
    *   **Local Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/OpenAlex/LocalContext/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/All_Documents/OpenAlex/LocalContext/scatterplots.html)

### 2. Citable Documents
*   **InCites (ESI Schema)**:
    *   **Global Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/InCites/Global%20Context/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/InCites/Global%20Context/scatterplots.html) | [Comparison Report (All vs. Citable)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/InCites/Global%20Context/All_vs_Citable%20Documents.html)
    *   **Local Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/InCites/Local%20Context/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/InCites/Local%20Context/scatterplots.html) | [Comparison Report (All vs. Citable)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/InCites/Local%20Context/All_vs_Citable%20Documents.html)
*   **OpenAlex (ASJC Schema)**:
    *   **Global Context (All Countries)**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext/scatterplots.html) | [Comparison Report (All vs. Citable)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext/All_vs_Citable%20Documents.html)
    *   **Global Context (Top 100 Countries)**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%20100/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%20100/scatterplots.html) | [Comparison Report (All vs. 100)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%20100/All_vs_100%20Units.html)
    *   **Global Context (Top 50 Countries)**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%2050/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%2050/scatterplots.html) | [Comparison Report (All vs. 50)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%2050/All_vs_50%20Units.html) | [Comparison Report (50 vs. 100)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/GlobalContext%20-%2050/50_vs_100%20Units.html)
    *   **Local Context**: [Figures & Tables Heatmaps](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/LocalContext/manuscriptFiguresAndTables.html) | [Interactive Scatter Plots](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/LocalContext/scatterplots.html) | [Comparison Report (All vs. Citable)](https://chilti.github.io/specialization-indicators-supplementary/Citable_Documents/OpenAlex/LocalContext/All_vs_Citable%20Documents.html)



---

*   **`manuscriptFiguresAndTables.html`** files contain styled correlation matrix heatmaps (Pearson and Spearman) across ESI/ASJC fields.
*   **`All_vs_Citable Documents.html`** files contain comparative correlation tables and visualization plots comparing the results obtained using the total volume of publications versus citable documents (All Documents vs. Citable Documents) across all countries.
*   **`All_vs_100 Units.html`**, **`All_vs_50 Units.html`**, and **`50_vs_100 Units.html`** files (found in the Top 100 and Top 50 Global Context subdirectories) compare different country-size thresholds (all countries, top 100, and top 50) specifically *within* the set of citable documents, rather than comparing citable documents to total publications.
*   **`scatterplots.html`** pages act as indexes linking to dynamic plots where readers can hover over data points to identify countries/fields, display exact values, zoom, and visually examine rank distortions or dominance effects.


---

## Repository Structure

```
├── All_Documents/                     # Analysis conducted on "Total Publications"
│   ├── InCites/
│   │   ├── Global Context/            # Global context figures, tables, and scatter plots
│   │   │   ├── manuscriptFiguresAndTables.html
│   │   │   └── scatterplots.html
│   │   ├── Local Context/             # Local context figures, tables, and scatter plots
│   │   │   ├── manuscriptFiguresAndTables.html
│   │   │   └── scatterplots.html
│   │   ├── ManuscriptActivityIndexFmeasure_ESI_GlobalContext.ipynb
│   │   └── ManuscriptActivityIndexFmeasure_ESI_LocalContext.ipynb
│   └── OpenAlex/
│       ├── GlobalContext/             # Global context figures, tables, and scatter plots
│       │   ├── manuscriptFiguresAndTables.html
│       │   └── scatterplots.html
│       ├── LocalContext/              # Local context figures, tables, and scatter plots
│       │   ├── manuscriptFiguresAndTables.html
│       │   └── scatterplots.html
│       └── DownloadDomainsData_OpenAlex.ipynb
├── Citable_Documents/                 # Analysis conducted on "Citable Documents" (mirrors All_Documents)
├── OpenAlex_Data_Retrieval.py         # Python script to download data via OpenAlex API & PyAlex
├── LICENSE                            # License for code and data reuse
└── README.md                          # This file
```

*Note: All notebooks in this repository have had their outputs cleared before submission to ensure a clean codebase and a lightweight repository. Readers can inspect the pre-rendered HTML files to see the results immediately.*

---

## Replicating the Study

To facilitate replication, the analytical Jupyter Notebooks are structured by data source (InCites vs. OpenAlex) and document type (All Documents vs. Citable Documents). Below is the map of all notebooks available in this repository:

### Jupyter Notebooks Map

```
├── All_Documents/
│   ├── InCites/
│   │   ├── ManuscriptActivityIndexFmeasure_ESI_GlobalContext.ipynb    # Primary global context analysis
│   │   └── ManuscriptActivityIndexFmeasure_ESI_LocalContext.ipynb     # Primary local context analysis
│   └── OpenAlex/
│       ├── DownloadDomainsData_OpenAlex.ipynb                          # Query OpenAlex API (All Documents)
│       ├── GlobalContext/
│       │   └── ManuscriptActivityIndexFmeasure_ESI_GlobalContext.ipynb   # Global context analysis
│       └── LocalContext/
│           └── ManuscriptActivityIndexFmeasure_ESI_LocalContext.ipynb    # Local context analysis
│
└── Citable_Documents/
    ├── InCites/
    │   ├── ManuscriptActivityIndexFmeasure_ESI_GlobalContext.ipynb    # Global context analysis (Citable Documents)
    │   ├── ManuscriptActivityIndexFmeasure_ESI_LocalContext.ipynb     # Local context analysis (Citable Documents)
    │   ├── Comparison_GlobalContext.ipynb                             # Comparison of indicators (Global)
    │   └── Comparison_LocalContext.ipynb                              # Comparison of indicators (Local)
    └── OpenAlex/
        ├── DownloadDomainsData_OpenAlex_FilterArtReviewLetter.ipynb    # Query OpenAlex API with Citable Documents filters
        ├── Comparison_GlobalContext.ipynb                             # Comparison of indicators (Global)
        ├── Comparison_LocalContext.ipynb                              # Comparison of indicators (Local)
        ├── GlobalContext/
        │   └── ManuscriptActivityIndexFmeasure_ESI_GlobalContext.ipynb   # Global context analysis (Citable Documents)
        └── LocalContext/
            └── ManuscriptActivityIndexFmeasure_ESI_LocalContext.ipynb    # Local context analysis (Citable Documents)
```

### Prerequisites
Make sure you have Python 3.8+ installed. You can install the required packages using pip:

```bash
pip install pyalex pandas numpy scipy jupyter
```

### Running the OpenAlex Pipeline (Fully Open)
1.  **Download the data:** Run the extraction scripts to download the datasets from the OpenAlex API (e.g., using `DownloadDomainsData_OpenAlex.ipynb` or `DownloadDomainsData_OpenAlex_FilterArtReviewLetter.ipynb` depending on the document type).
2.  **Run the analysis:** Open Jupyter Notebook and run the correlation notebooks (e.g. `ManuscriptActivityIndexFmeasure_ESI_GlobalContext.ipynb` or `ManuscriptActivityIndexFmeasure_ESI_LocalContext.ipynb` in the respective directories):
    ```bash
    jupyter notebook
    ```

### Running the InCites Pipeline
1.  **Obtain the raw data:** Download the 22 ESI location files and the global trend files from InCites as detailed in the Data section.
2.  **Configure and run:** Place the downloaded files in the directory path expected by the InCites notebooks and execute the cells in the respective notebooks (under `All_Documents/InCites/` or `Citable_Documents/InCites/`).

---

## License

This project is licensed under the [MIT License](LICENSE) (or specify your preferred license).

## Citation

If you use this material or replicate the methodology, please cite the main paper:

```bibtex
@article{yourcitation2026,
  author    = {Author, A. and Author, B.},
  title     = {Insert Article Title},
  journal   = {Insert Journal Name},
  year      = {2026},
  volume    = {XX},
  number    = {X},
  pages     = {XXX-XXX},
  doi       = {XX.XXXX/XXXXXXX}
}
```
