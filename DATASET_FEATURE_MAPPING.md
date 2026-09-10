# Dataset Feature Mapping — Bovine Mastitis Early Warning

This document maps features present in public bovine mastitis datasets to farmer-observable indicators. 

> [!IMPORTANT]
> The final machine learning model **strictly uses only features that a farmer can provide without laboratory or sensor equipment** AND that are genuinely supported by real validated datasets.

---

## 1. Feature Mapping Table

| Dataset Feature | Farmer Can Provide? | Used in ML Model? | Category | Description & Justification |
| :--- | :---: | :---: | :--- | :--- |
| **`species`** | **YES** | **YES** | Animal Info | Species of animal (`Cow` / `Buffalo`). |
| **`age`** | **YES** | **YES** | Animal Info | Age of animal in years. |
| **`breed`** | **YES** | **YES** | Animal Info | Breed of cow/buffalo (e.g., `Holstein`, `Jersey`, `Murrah`, `Gir`, `Sahiwal`, `Crossbred`). |
| **`previous_mastitis`** | **YES** | **YES** | Animal Info | Past history of mastitis infection (`Yes` / `No` / `Don't Know`). |
| **`lactation_stage`** | **YES** | **YES** | Animal Info | Current lactation cycle number or month since calving. |
| **`milk_production`** | **YES** | **YES** | Milk Obs | Observation of milk yield status (`Normal` / `Decreased`). |
| **`abnormal_milk`** | **YES** | **YES** | Milk Obs | Visible abnormality in milk consistency or appearance (`Yes` / `No`). |
| **`clots_flakes`** | **YES** | **YES** | Milk Obs | Presence of visible clots, flakes, or pus in milk (`Yes` / `No`). |
| **`watery_milk`** | **YES** | **YES** | Milk Obs | Thin or watery appearance of milk (`Yes` / `No`). |
| **`color_change`** | **YES** | **YES** | Milk Obs | Discolored milk (yellowish, brownish, reddish) (`Yes` / `No`). |
| **`udder_swelling`** | **YES** | **YES** | Udder Obs | Noticeable enlargement or swelling in one or more quarters (`Yes` / `No`). |
| **`udder_heat`** | **YES** | **YES** | Udder Obs | Udder unusually warm or hot to touch (`Yes` / `No` / `Don't Know`). |
| **`udder_pain`** | **YES** | **YES** | Udder Obs | Reaction of pain or sensitivity during touching or milking (`Yes` / `No` / `Don't Know`). |
| **`udder_redness`** | **YES** | **YES** | Udder Obs | Visible redness or inflammation skin tone (`Yes` / `No`). |
| **`udder_hardness`** | **YES** | **YES** | Udder Obs | Hard, firm, or indurated udder quarter tissue (`Yes` / `No`). |
| `Somatic_Cell_Count` (SCC) | **NO** | **NO** | Lab Test | Cell count requiring lab microscopy or automated cell counters. |
| `Milk_Conductivity` | **NO** | **NO** | IoT Sensor | Electrical conductivity requiring digital mastitis detector probes. |
| `Milk_pH` | **NO** | **NO** | Lab Test | pH level requiring chemical test strips or digital pH meter. |
| `Milk_Temperature` | **NO** | **NO** | IoT Sensor | In-line thermal sensor reading. |
| `Milk_Protein` | **NO** | **NO** | Lab Analyzer | Infrared spectroscopic analysis. |
| `Milk_Lactose` | **NO** | **NO** | Lab Analyzer | Spectroscopic or enzymatic laboratory assay. |
| `Milk_Fat` | **NO** | **NO** | Lab Analyzer | Gerber method or electronic milk fat analyzer metric. |
| `Bacterial_Culture` | **NO** | **NO** | Lab Test | Microbiological plating and pathogen identification. |

---

## 2. Model Feature Selection Rules

1. **Zero Lab/Sensor Dependency**: All 8 laboratory and IoT sensor metrics (`SCC`, `Conductivity`, `pH`, `Temperature`, `Protein`, `Lactose`, `Fat`, `Culture`) are excluded from the farmer prediction model pipeline.
2. **Standardized Encodings**: Categorical variables (`species`, `breed`, `milk_production`, boolean flags) are encoded via Scikit-Learn `OneHotEncoder(handle_unknown='ignore')`.
3. **Imputation Safety**: Missing boolean/categorical fields default to `'unknown'` or mode, and missing numerical fields (age, lactation stage) default to median values derived strictly from the training split.
