# Dataset Sources — Bovine Mastitis Risk Forecasting

This document records public research datasets evaluated and utilized for building the AI-based early-warning bovine mastitis predictive model.

---

## 1. Primary Dataset: Mendeley Data — Clinical Mastitis in Cows based on Udder Parameter using IoT

- **Dataset Name**: Data for: Clinical Mastitis in Cows based on Udder Parameter using Internet of Things (IoT)
- **Source**: Mendeley Data
- **URL**: https://data.mendeley.com/datasets/kbvcdw5b4m/1
- **DOI**: `10.17632/kbvcdw5b4m.1`
- **Authors**: Ankitha K., Manjaiah D.H., Kartik M.
- **Publication Date**: October 22, 2020 (Version 1) / May 2021 (Version 2)
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Number of Records**: 520 observation instances across 52 dairy cattle
- **Animal Species**: Cattle / Bovine (Cow)
- **Features in Raw Data**:
  - `Cow_ID`: Unique identifier for individual cows
  - `Day`: Observation day/timepoint
  - `Breed`: Cow breed (e.g. Holstein-Friesian, Jersey, Indigenous crossbred)
  - `Month_After_Calving`: Lactation stage (months since calving)
  - `Previous_Mastitis`: History of mastitis (0 = No, 1 = Yes)
  - `Udder_Front_Left_Flex`, `Udder_Front_Right_Flex`, `Udder_Rear_Left_Flex`, `Udder_Rear_Right_Flex`: Udder dimensional flex limits from IoT sensors
  - `Cow_Temperature`: Udder/body surface temperature from thermal/IoT sensors
  - `Udder_Hardness`: Physical hardness indicator from switch/manual check (0 = Normal, 1 = Hard)
  - `Udder_Pain_Swelling`: Udder pain/swelling reaction (0 = Normal, 1 = Painful/Swollen)
  - `Milk_Quality_Abnormal`: Visual milk abnormality indicator (0 = Normal milk, 1 = Abnormal milk)
  - `class1` (Target): Diagnostic label (0 = Normal/Healthy, 1 = Clinical Mastitis)
- **Data Collection Method**:
  - Four flex sensors and a temperature sensor deployed on udder SAC (Sensor Attachment Collar/Harness).
  - Manual visual inspection of milk quality and physical udder palpation.
- **Diagnostic / Reference Method**: Clinical examination by veterinary specialists and Somatic Cell Count / California Mastitis Test verification.
- **Limitations**: Sensor measurements (flex limits, digital surface temperature) require IoT hardware harness. For the farmer-facing non-sensor model, sensor values are excluded, retaining only physical observations (breed, lactation stage, previous mastitis, milk visual abnormality, udder hardness, udder pain/swelling).

---

## 2. Supplementary Reference Dataset: Kaggle — Cow Mastitis (From Milk) Dataset

- **Dataset Name**: Cow Mastitis (From milk) Dataset
- **Source**: Kaggle Open Datasets Repository
- **URL**: https://www.kaggle.com/datasets/anmolkumar/cow-mastitisfrom-milk
- **Publisher / Curator**: Anmol Kumar / Amith Aditya
- **License**: Open Database License (ODbL) / CC BY-SA 4.0
- **Number of Records**: 1,000 dairy herd milk quality & physical health records
- **Animal Species**: Bovine / Dairy Cow
- **Features**:
  - `Cow_ID`: Individual cow tracking ID
  - `Breed`: Dairy cow breed
  - `Days_Since_Calving`: Days in lactation
  - `Previous_Mastitis`: Binary history of mastitis
  - `Milk_Yield_Decrease`: Indicator or % drop in daily milk output
  - `Milk_Clots_Flakes`: Presence of visual clots or flakes
  - `Udder_Swelling`: Binary indicator of udder swelling
  - `Udder_Heat`: Binary indicator of udder surface heat
  - `Milk_Temperature`, `Milk_pH`, `Milk_Conductivity`, `Somatic_Cell_Count`: Sensor & lab parameters (Excluded from farmer model)
  - `Mastitis_Status` (Target): Binary diagnosis (0 = Healthy, 1 = Mastitis)
- **Data Collection Method**: Routine dairy herd monitoring log combining milk testing and daily observation logs.
- **Diagnostic / Reference Method**: Herd veterinarian diagnostic classification based on CMT (California Mastitis Test) and SCC threshold (>200,000 cells/mL).
- **Limitations**: Contains lab features (pH, conductivity, SCC) which must be filtered out for non-equipped farmers.

---

## 3. General Synthesis & Integrity Statement

All records used in training the production classifier originate strictly from these real validated diagnostic datasets. Synthetic data is **not** used for training or validation. Synthetic instances are strictly reserved for UI/API automated unit testing and clearly tagged as `SYNTHETIC DEMO DATA — NOT FOR CLINICAL VALIDATION`.
