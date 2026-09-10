# AI-Based Predictive Modelling for Early Forecasting of Bovine Mastitis

An end-to-end AI-based early-warning decision-support system designed to forecast the risk of mastitis in cows and buffaloes using **only practical observations that a normal farmer can provide WITHOUT laboratory equipment, milk analyzers, sensors, or veterinary testing equipment**.

---

## 📌 1. Farmer Input Schema (Strict Requirement)

The farmer-facing interface strictly collects non-laboratory observation metrics:

### A. Animal Information
- **Species**: Cow / Buffalo
- **Age**: Age in years
- **Breed**: Jersey, Holstein, Murrah, Gir, Sahiwal, Crossbred, etc.
- **Previous Mastitis History**: Yes / No / Don't Know
- **Lactation Stage/Number**: Current lactation cycle

### B. Milk Observations
- **Milk Production**: Normal / Decreased
- **Abnormal Milk**: Yes / No
- **Clots / Flakes**: Yes / No
- **Watery Milk**: Yes / No
- **Color Change**: Yes / No

### C. Udder Observations
- **Swelling**: Yes / No
- **Heat**: Yes / No / Don't Know
- **Pain**: Yes / No / Don't Know
- **Redness**: Yes / No
- **Hardness**: Yes / No

> [!IMPORTANT]
> Laboratory/sensor metrics (**Somatic Cell Count (SCC)**, **Milk Conductivity**, **Milk pH**, **Milk Temperature**, **Protein**, **Lactose**, **Fat**, **Bacterial Culture**) are strictly excluded from the farmer model.

---

## 🏗️ 2. System Architecture

```
FARMER
  ↓
React SPA Frontend (Port 3000)
  ↓
Node.js / Express Backend (Port 5000) → MongoDB (PredictionHistory Collection)
  ↓
Python FastAPI ML Service (Port 8000)
  ↓
Scikit-Learn ML Pipeline (.joblib)
  ↓
Risk Score (%) + Low / Medium / High Risk Level + Contributing Factors (XAI)
  ↓
Early Warning & Veterinary Examination Recommendation
```

---

## 📑 3. Dataset Sourcing & Feature Mapping

- **`DATASET_SOURCES.md`**: Records open research datasets evaluated (Mendeley Data DOI `10.17632/kbvcdw5b4m.1` & Kaggle Dairy Cattle Records).
- **`DATASET_FEATURE_MAPPING.md`**: Maps raw dataset columns to farmer-provided features, ensuring zero lab/sensor dependence.

---

## 🚀 4. How to Run

### Step 1: Train Machine Learning Pipeline
```bash
python -m ml.src.train
```
This command:
1. Loads real dataset (`ml/data/raw/bovine_mastitis_dataset.csv`)
2. Filters out lab/sensor attributes
3. Preprocesses data via Scikit-Learn `Pipeline` & `ColumnTransformer`
4. Trains & cross-validates 4 candidate algorithms (Logistic Regression, Decision Tree, Random Forest, Gradient Boosting)
5. Evaluates metrics (Accuracy, Precision, Recall, Specificity, F1, ROC-AUC, PR-AUC)
6. Exports `ml/models/mastitis_pipeline.joblib`, `ml/models/model_metadata.json`, and `ml/reports/model_comparison.csv`.

### Step 2: Run Unit Tests
```bash
pytest ml/tests
```

### Step 3: Launch Python FastAPI ML Service
```bash
uvicorn ml.api.main:app --host 0.0.0.0 --port 8000 --reload
```
Endpoints:
- `GET /health`
- `GET /model-info`
- `POST /predict`

### Step 4: Launch Node.js / Express Backend
```bash
cd backend
npm start
```
Runs on `http://localhost:5000`. Handles MongoDB logging (`PredictionHistory` schema) and proxying requests.

### Step 5: Launch React Frontend
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:3000`.

---

## 🛡️ 5. Veterinary Safety & Compliance

- **Non-Diagnostic Warning**: The system provides decision-support risk estimation, **not** definitive diagnosis.
- **High Risk Guidance**: *"Veterinary examination and appropriate diagnostic testing are recommended."*
- **No Treatment Advice**: Does **not** prescribe antibiotics, drugs, or treatment dosages.
