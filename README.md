# HerOva: Women's Health Diagnostic Platform

A comprehensive web-based diagnostic platform for PCOS (Polycystic Ovary Syndrome) detection and phenotyping. HerOva combines clinical data collection, machine learning-driven analysis, and explainable AI to provide personalized diagnostic insights for women's endocrine health.

## 🎯 Table of Contents

- [Features Overview](#features-overview)
- [Getting Started](#getting-started)
- [Dashboard & Routes](#dashboard--routes)
- [Feature Descriptions](#feature-descriptions)
  - [Landing Page](#landing-page)
  - [Start Analysis (Patient Analysis Form)](#start-analysis-patient-analysis-form)
  - [Body Visualization](#body-visualization)
  - [Results Dashboard](#results-dashboard)
  - [Batch CSV Upload](#batch-csv-upload)
  - [Sessions Management](#sessions-management)
  - [Molecular Insights](#molecular-insights)
- [Technical Architecture](#technical-architecture)
- [Data Model](#data-model)

---

## 🚀 Features Overview

| Feature | Description | Route | Key Capability |
|---------|-------------|-------|-----------------|
| **Landing Page** | Homepage with platform intro, features showcase, and educational content | `/` | Hero section with CTA, problem/solution overview |
| **Start Analysis** | Multi-step patient data collection form | `/analysis` | Capture 30+ clinical parameters across 6 form steps |
| **Body Visualization** | Interactive PCOS symptom mapping with anatomical hotspots | `/body-visualization` | Click-to-explore regions, download JSON reports |
| **Results Dashboard** | Comprehensive analysis results with PCOS risk scoring and phenotyping | `/analysis` (after submit) | Risk score, phenotype classification, feature importance, recommendations |
| **Batch CSV Upload** | Analyze multiple patients from a CSV file in one operation | `/csv-upload` | Drag-and-drop upload, flexible column mapping, batch results aggregation |
| **Sessions History** | View and manage all past analysis sessions with local/cloud storage | `/sessions` | Browse session history, retrieve past results, persistent data storage |
| **Molecular Insights** | Deep dive into molecular pathways driving PCOS | `/molecular` | 4 key PCOS pathways, cell type distributions, pathway activity levels |

---

## 🛠 Getting Started

### Installation

```bash
# Navigate to frontend directory
cd /path/to/BioHackathon2026/frontend

# Install Python dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Install Node.js dependencies
cd women-s-health-diagnostic-platform
npm install
```

### Running Locally

**Terminal 1: Start the backend (FastAPI + uvicorn on port 8001)**
```bash
cd /path/to/BioHackathon2026/frontend
source .venv/bin/activate
PYTHONPATH=$(pwd) python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

**Terminal 2: Start the frontend (Next.js dev server on port 3000)**
```bash
cd women-s-health-diagnostic-platform
npm run dev
```

Then open **http://localhost:3000** in your browser.

### Building for Production

```bash
cd women-s-health-diagnostic-platform
npm run build
```

---

## 📍 Dashboard & Routes

The platform is organized into distinct routes, each providing a specific workflow:

### Main Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | **Landing Page** | Introduction, features showcase, educational content |
| `/analysis` | **Patient Analysis** | Multi-step form for single-patient diagnosis |
| `/body-visualization` | **Body Visualization** | Interactive PCOS symptom explorer |
| `/csv-upload` | **Batch Upload** | Multi-patient CSV analysis |
| `/molecular` | **Molecular Insights** | PCOS molecular pathways and biology |
| `/sessions` | **Sessions History** | View and manage past analyses |
| `/dashboard` | **Dashboard** | (Placeholder for future analytics) |

---

## 🎨 Feature Descriptions

### Landing Page (`/`)

**Purpose:** Introduce the platform and guide users to start their analysis.

**Components:**
- **Hero Section** — Eye-catching header with main CTA ("Start Analysis")
- **Navigation Bar** — Logo, links to sections, and branding
- **Problem Section** — Describes the global PCOS burden (10-20% of women affected)
- **Feature Section** — Highlights key platform capabilities
- **Dataset Section** — Information about the clinical datasets used for training
- **Technology Section** — Overview of ML/AI techniques (XGBoost, SHAP, clustering)
- **Public Health Section** — Clinical significance and research context
- **Educational Content** — Phenotype cards explaining 4 PCOS types (A, B, C, D)
- **Animated Elements** — Particle background and flying butterfly decorations
- **CTA Section** — Final call-to-action to begin analysis

**Design:** Modern, accessible UI with Tailwind CSS, glassmorphism effects, responsive layout.

---

### Start Analysis (Patient Analysis Form) (`/analysis`)

**Purpose:** Collect comprehensive clinical data for PCOS diagnosis through an intuitive multi-step form.

**Key Features:**
- **6-Step Form Wizard** with progress tracking
- **Step Navigation** — Previous/Next buttons, skip-ahead option
- **Progress Bar** — Visual indication of form completion
- **Automatic Calculations** — BMI, HOMA-IR, LH:FSH ratio computed on input
- **Input Validation** — Real-time feedback for out-of-range values
- **Results Display** — Automatic transition to results dashboard after submission

#### Form Steps (6 Total)

##### **Step 1: Demographics**
Input fields:
- **Age** — Slider (18–50 years)
- **Weight** — Slider (40–150 kg)
- **Height** — Slider (140–200 cm)
- **BMI** — Auto-calculated, color-coded (Green: <25 normal, Yellow: 25-30 overweight, Orange: >30 obese)
- **Ethnicity** — Dropdown (7 options: Asian, Caucasian, African, Hispanic, Middle Eastern, South Asian, Other)

##### **Step 2: Menstrual Health**
Input fields:
- **Cycle Length** — Numeric input (21–90 days, default 28)
- **Cycle Regularity** — Toggle (Regular / Irregular)
- **Cycle Variability** — Numeric input for variation (0–20 days)
- **Period Duration** — Numeric input (1–7 days)
- **Age at Menarche** — Numeric input (8–18 years)

*Clinical Note:* Oligomenorrhea (>35 days) or high variability suggests ovulatory dysfunction, a key PCOS criterion.

##### **Step 3: Hormonal Symptoms**
Input fields:
- **Acne** — Toggle with severity selector (None / Mild / Moderate / Severe)
- **Hirsutism Score** — Slider (0–36, based on Ferriman-Gallwey scale)
- **Hair Loss** — Toggle (Yes / No)
- **Skin Darkening (Acanthosis Nigricans)** — Toggle (Yes / No)

*Clinical Note:* These signs indicate clinical hyperandrogenism, a core PCOS criterion.

##### **Step 4: Metabolic Indicators**
Input fields:
- **Fasting Glucose** — Numeric input (70–200 mg/dL)
- **Fasting Insulin** — Numeric input (0–30 µIU/mL)
- **HOMA-IR** — Auto-calculated [(Glucose × Insulin) / 405]
- **Waist Circumference** — Numeric input (60–120 cm)
- **Blood Pressure (Systolic)** — Numeric input (80–180 mmHg)
- **Blood Pressure (Diastolic)** — Numeric input (50–120 mmHg)

*Clinical Note:* Insulin resistance (HOMA-IR >2.5) is common in PCOS and affects metabolic phenotype.

##### **Step 5: Ultrasound Findings**
Input fields:
- **Left Ovary Volume** — Numeric input (0–50 mL)
- **Right Ovary Volume** — Numeric input (0–50 mL)
- **Left Follicle Count** — Numeric input (0–30)
- **Right Follicle Count** — Numeric input (0–30)
- **Polycystic Appearance** — Toggle (Yes / No)
- **Endometrial Thickness** — Numeric input (5–20 mm)

*Clinical Note:* Polycystic ovarian morphology (≥12 follicles or volume >10 mL) is one of 3 Rotterdam criteria.

##### **Step 6: Lab Biomarkers**
Input fields:
- **LH (Luteinizing Hormone)** — Numeric input (0–50 mIU/mL)
- **FSH (Follicle Stimulating Hormone)** — Numeric input (0–30 mIU/mL)
- **LH:FSH Ratio** — Auto-calculated
- **Total Testosterone** — Numeric input (0–100 ng/dL)
- **Free Testosterone** — Numeric input (0–10 pg/mL)
- **DHEAS (Dehydroepiandrosterone)** — Numeric input (0–500 µg/dL)
- **AMH (Anti-Müllerian Hormone)** — Numeric input (0–15 ng/mL)
- **Prolactin** — Numeric input (0–30 ng/mL)
- **TSH (Thyroid Stimulating Hormone)** — Numeric input (0–10 mIU/L)

*Clinical Note:* Biochemical hyperandrogenism (elevated testosterone, DHEAS) and elevated LH:FSH ratio are key diagnostic markers.

**Form Behavior:**
- Submit triggers analysis request to backend `/analyze` endpoint
- Patient data is sent as PatientData JSON object
- Loading spinner shown during analysis (typically 2–5 seconds)
- Results dashboard automatically loads with PCOS diagnosis

---

### Body Visualization (`/body-visualization`)

**Purpose:** Provide an interactive, educational exploration of PCOS symptoms mapped to anatomy.

**Key Features:**
- **Interactive SVG Silhouette** — Click to highlight body regions
- **7 Anatomical Regions** — Each mapped to specific PCOS manifestations
- **Selected Region Tracking** — Visual feedback shows which region is active
- **Patient Data Display** — Age and BMI shown if available
- **Download Report Button** — Export session data as JSON file

#### Interactive Regions

1. **Scalp & Hair**
   - Manifestation: Androgenic alopecia, diffuse hair thinning
   - Clinical Indicator: DHT-sensitive follicle miniaturization
   - Display Color: Yellow highlight when selected

2. **Face / Acne**
   - Manifestation: Hormonal acne (jawline, chin, perioral)
   - Clinical Indicator: Sebaceous gland hyperactivity from androgens
   - Display Color: Orange highlight when selected

3. **Hirsutism Areas** (upper lip, chin, sideburns)
   - Manifestation: Excess terminal hair growth (Ferriman-Gallwey score)
   - Clinical Indicator: Clinical hyperandrogenism
   - Display Color: Purple highlight when selected

4. **Thyroid**
   - Manifestation: Hypothyroidism/thyroid autoimmunity
   - Clinical Indicator: TSH >2.5 mIU/L or positive TPO antibodies
   - Display Color: Cyan highlight when selected

5. **Abdomen / Central Adiposity**
   - Manifestation: Visceral fat accumulation, abdominal obesity
   - Clinical Indicator: Waist-to-hip ratio >0.85, elevated waist circumference
   - Display Color: Blue highlight when selected

6. **Left Ovary**
   - Manifestation: Polycystic morphology, follicle accumulation
   - Clinical Indicator: ≥12 follicles (2–9 mm), volume >10 mL
   - Display Color: Yellow highlight when selected

7. **Right Ovary**
   - Manifestation: Polycystic morphology, follicle accumulation
   - Clinical Indicator: ≥12 follicles (2–9 mm), volume >10 mL
   - Display Color: Yellow highlight when selected

**Download Report Feature:**
- Clicking "Download Report" exports a JSON file containing:
  - Session timestamp
  - Selected anatomical region (if any)
  - Patient demographic data (age, BMI)
  - Full PatientData object
- File named `herova-report-YYYY-MM-DDTHH-MM-SS.json`
- Useful for medical record integration or clinical reference

**UI Components:**
- Lightweight SVG (no heavy graphics libraries, Turbopack-safe)
- Responsive scaling
- Accessible (role="img", aria-labels)
- Tailwind CSS styling with glass effect

---

### Results Dashboard (`/analysis` → Results View)

**Purpose:** Display comprehensive analysis results with PCOS diagnosis, risk scoring, and personalized recommendations.

**Key Display Sections:**

#### 1. **PCOS Risk Score & Summary**
- **Score Range:** 0–100 (higher = greater PCOS likelihood)
- **Risk Level Classification:**
  - 0–35: Low risk
  - 36–70: Moderate risk
  - 71–100: High risk
- **Phenotype Classification:** One of 4 types (A, B, C, D)
- **Phenotype Description:** Clinical summary of the diagnosed phenotype

#### 2. **Phenotype Breakdown (4 Rotterdam Types)**

**Type A: Classic PCOS (Hyperandrogenism + Ovulatory Dysfunction + PCOM)**
- Most common (40–50% of PCOS cases)
- Clinical features: High androgens, irregular periods, polycystic ovaries
- Metabolic risk: Highest IR prevalence
- Fertility: Anovulation common

**Type B: Non-PCO PCOS (Hyperandrogenism + Ovulatory Dysfunction)**
- 20–30% of PCOS cases
- Clinical features: High androgens, irregular periods, normal ovaries
- Metabolic risk: Moderate IR
- Fertility: Anovulation common

**Type C: Non-Hyperandrogenic PCOS (Polycystic Ovaries + Ovulatory Dysfunction)**
- 10–15% of PCOS cases
- Clinical features: Normal androgens, irregular periods, polycystic ovaries
- Metabolic risk: Lower IR than Type A
- Fertility: Anovulation common

**Type D: Lean/Normo-Androgenic PCOS (PCOM + Ovulatory Dysfunction)**
- 5–15% of PCOS cases
- Clinical features: Normal androgens, normal cycles, polycystic ovaries
- Metabolic risk: Lowest IR
- Fertility: Often preserved

#### 3. **Rotterdam Criteria Evaluation**
Display of which diagnostic criteria were met:
- ✓ **Hyperandrogenism** (Clinical or Biochemical)
- ✓ **Ovulatory Dysfunction** (Oligomenorrhea or anovulation)
- ✓ **Polycystic Ovarian Morphology** (Ultrasound findings)

Diagnosis: ≥2 of 3 criteria met = PCOS positive

#### 4. **Contributing Factors (SHAP-based Feature Importance)**
Top 10 factors ranked by impact:
1. **Cycle Length** (>35 days) — Impact: 0.85
2. **Follicle Count** (≥12 per ovary) — Impact: 0.75
3. **LH:FSH Ratio** (>2) — Impact: 0.70
4. **Total Testosterone** (>50 ng/dL) — Impact: 0.65
5. **HOMA-IR** (>2.5) — Impact: 0.60
6. **Ovarian Volume** (>10 mL) — Impact: 0.60
7. **AMH Level** (>6 ng/mL) — Impact: 0.55
8. **Hirsutism Score** (>8) — Impact: 0.50
9. **BMI** (>25) — Impact: 0.40
10. **Skin Darkening** (Present) — Impact: 0.35

Each factor shows:
- Direction: Increases / Neutral risk
- Relative importance score
- Patient-specific value
- Clinical threshold

#### 5. **Confidence Metrics**
Overall prediction confidence scores:
- **PCOS Classification Confidence:** 85–95%
- **Phenotype Classification Confidence:** 80–90%
- **Diagnostic Certainty:** High / Moderate / Low

#### 6. **Personalized Recommendations**
Tailored clinical recommendations based on phenotype:
- **Lifestyle Modifications** — Diet, exercise, weight management
- **Diagnostic Follow-ups** — Additional tests to confirm diagnosis
- **Treatment Options** — Pharmacological and non-pharmacological approaches
- **Monitoring Plan** — Frequency of follow-ups and metrics to track
- **Specialist Referral** — Recommended specialists (Endocrinologist, Reproductive, etc.)

#### 7. **Save to Session**
- "Save Results" button persists analysis to local storage or Supabase
- Generates unique session ID
- Enables retrieval from Sessions page

**UI Features:**
- Loading spinner during analysis
- Error handling with user-friendly messages
- Responsive layout for desktop and mobile
- Export/Download options for report sharing
- Color-coded risk indicators

---

### Batch CSV Upload (`/csv-upload`)

**Purpose:** Analyze multiple patients from a CSV file in a single batch operation.

**Key Features:**
- **Drag-and-Drop Upload** — Click or drag CSV file into zone
- **Flexible Column Mapping** — Auto-detects common column name variations
- **Batch Processing** — Analyze 10s to 1000s of patients efficiently
- **Results Aggregation** — Summary statistics and detailed per-patient results
- **Export Functionality** — Download results as CSV or JSON

#### Upload Interface
- Large drop zone with upload icon
- Visual feedback (hover effects, drag-over state)
- File validation (CSV format check)
- Click-to-browse file picker

#### CSV Column Mapping
The system auto-detects these column variations (case-insensitive):

| Data Field | Accepted Column Names |
|------------|----------------------|
| Age | "Age", "age", "Patient Age", "pt_age" |
| Weight | "Weight (Kg)", "Weight(kg)", "weight_kg", "Weight" |
| Height | "Height (cm)", "Height(cm)", "height_cm", "Height" |
| Ethnicity | "Ethnicity", "Race", "Ethn" |
| Cycle Length | "Cycle length(days)", "Cycle_length", "cycle" |
| Irregular Periods | "Irregular periods", "Irregular_cycles", "Irregularity" |
| Acne | "Acne", "acne_present", "has_acne" |
| Hirsutism Score | "Hirsutism", "Hirsutism_score", "ferriman" |
| Hair Loss | "Hair loss", "alopecia", "hair_loss" |
| Fasting Glucose | "Fasting glucose", "FG", "RBS(mg/dl)" |
| Fasting Insulin | "Fasting insulin", "insulin", "FI" |
| Testosterone | "Testosterone", "Total testosterone", "T" |
| LH | "LH", "lh_level" |
| FSH | "FSH", "fsh_level" |
| Left Ovary Volume | "Left ovary volume", "L_ovary_vol" |
| Right Ovary Volume | "Right ovary volume", "R_ovary_vol" |
| Left Follicle Count | "Left follicle count", "L_follicles" |
| Right Follicle Count | "Right follicle count", "R_follicles" |

Boolean fields accept: `Y`, `yes`, `true`, `I`, `irregular` (case-insensitive)

#### Processing Pipeline
1. **File Parse** — Automatic delimiter detection (comma, semicolon, tab)
2. **Header Detection** — Identifies column headers
3. **Field Extraction** — Maps columns to PatientData fields
4. **Validation** — Type checking, range validation
5. **Analysis** — Runs predict logic for each row
6. **Triggered Markers Identification** — Flags which clinical thresholds were exceeded
7. **Aggregation** — Summarizes results by phenotype, risk level, etc.

#### Results Display
- **Summary Statistics**
  - Total patients processed
  - PCOS-positive cases
  - Breakdown by risk level (low/moderate/high)
  - Breakdown by phenotype (Type A/B/C/D)

- **Results Table**
  - One row per patient
  - Columns: Patient ID / Name, Age, PCOS Risk Score, Phenotype, Risk Level
  - Expandable rows showing:
    - Full PatientData
    - Triggered clinical markers
    - Contributing factors
    - Recommendations

- **Export Options**
  - Download as CSV
  - Download as JSON
  - Email results (if configured)

#### Error Handling
- **Invalid CSV Format** — User-friendly error message with suggestions
- **Missing Required Fields** — Allows continuation with warnings
- **Out-of-Range Values** — Auto-clamps to valid ranges with notification
- **Empty File** — Clear error feedback

---

### Sessions Management (`/sessions`)

**Purpose:** Provide persistent storage and history of all patient analyses.

**Key Features:**
- **Session List** — Chronological view of all analyses
- **Session Details** — Retrieve full patient data and results
- **Local & Cloud Storage** — Browser localStorage by default, optional Supabase sync
- **Session Metadata** — Timestamps, status, patient identifiers
- **Bulk Operations** — Export, archive, delete sessions

#### Session Storage

**Local Storage (Default)**
- Storage Key: `herova.local.sessions.v1`
- Format: JSON array of SessionResult objects
- Persists across browser sessions
- No server required
- Limited to ~5MB per domain

**Cloud Storage (Supabase)**
- Requires Supabase configuration (`.env.local`)
- Tables: `patient_sessions`, `analysis_results`
- Syncs automatically when configured
- Enables cross-device access
- Scales to unlimited sessions

#### Session Structure

```json
{
  "id": "uuid-here",
  "created_at": "2026-05-19T10:30:00Z",
  "status": "completed",
  "patientData": { /* 30+ clinical fields */ },
  "result": {
    "prediction": { /* Full analysis result */ },
    "phenotype": "Type A",
    "pcosRiskScore": 85,
    "riskLevel": "high",
    "Rotterdam": { /* Criteria evaluation */ },
    "confidenceMetrics": { /* Scores */ },
    "recommendations": [ /* Clinical advice */ ]
  }
}
```

#### Sessions Page Interface
- **List View** — Table with columns: Date, Patient Name/ID, PCOS Risk, Phenotype, Status
- **Search & Filter** — By date range, risk level, phenotype
- **Action Buttons:**
  - **View** — Opens session details
  - **Export** — Downloads session as JSON/PDF
  - **Archive** — Moves to archived sessions
  - **Delete** — Permanently removes session (with confirmation)
- **Bulk Select** — Multi-select for batch operations

#### Session Details View
- Full patient demographics
- Complete analysis results
- Risk score visualization
- Phenotype information
- Contributing factors breakdown
- Recommendations
- Download/Print options

#### Session Operations
- **Create** — Automatically created when analysis is saved
- **Retrieve** — Load session from history
- **Update** — Modify session data or results
- **Archive** — Move to inactive sessions
- **Delete** — Remove from storage

---

### Molecular Insights (`/molecular`)

**Purpose:** Deep dive into the molecular biology of PCOS for research and education.

**Key Features:**
- **4 Key Molecular Pathways** — Visual representation with activity levels
- **5 Cell Type Distribution** — Breakdown of cell populations
- **Pathway Activity Metrics** — Percentage activation for each pathway
- **Gene-Level Details** — Key genes involved in each pathway
- **Educational Content** — Explanations for clinicians and researchers

#### PCOS Molecular Pathways

**Pathway 1: Chronic Low-Grade Inflammation**
- **Activity Level:** 75% (high)
- **Key Genes/Markers:**
  - IL-6 (Interleukin-6) — Pro-inflammatory cytokine
  - TNF-α (Tumor Necrosis Factor-alpha) — Pro-inflammatory cytokine
  - CRP (C-Reactive Protein) — Systemic inflammation marker
  - NF-κB (Nuclear Factor Kappa B) — Transcription factor, inflammatory signaling
- **Clinical Relevance:** Elevated systemic inflammation, linked to insulin resistance and atherosclerosis risk
- **Therapeutic Target:** Anti-inflammatory interventions (inositol, metformin, lifestyle)

**Pathway 2: Insulin Signaling Pathway**
- **Activity Level:** 82% (very high)
- **Key Genes/Proteins:**
  - INSR (Insulin Receptor) — Cell surface receptor
  - IRS-1 (Insulin Receptor Substrate-1) — Signal transduction
  - PI3K (Phosphoinositide 3-Kinase) — Key signaling enzyme
  - AKT (Protein Kinase B) — Downstream effector
- **Clinical Relevance:** Insulin resistance (IR) in 50–70% of PCOS, impairs glucose uptake
- **Therapeutic Target:** Insulin-sensitizing agents (metformin, thiazolidinediones, GLP-1 agonists)

**Pathway 3: Hyperandrogenism Pathway (Androgen Synthesis)**
- **Activity Level:** 68% (moderate-high)
- **Key Genes/Enzymes:**
  - CYP17A1 (17-alpha hydroxylase) — Upstream of androgens
  - CYP11A1 (P450scc) — Initial steroid synthesis step
  - StAR (Steroid Acute Regulatory protein) — Mitochondrial cholesterol transport
  - 3β-HSD (3-beta-hydroxysteroid dehydrogenase) — Androgen synthesis
- **Clinical Relevance:** Excessive ovarian/adrenal androgen production (hirsutism, acne, alopecia)
- **Therapeutic Target:** Anti-androgens (spironolactone), oral contraceptives, CYP17 inhibitors

**Pathway 4: Ovarian Dysfunction & Follicle Development**
- **Activity Level:** 71% (high)
- **Key Genes/Hormones:**
  - AMH (Anti-Müllerian Hormone) — Follicle-depleting hormone
  - FSHR (FSH Receptor) — Follicle Stimulating Hormone receptor
  - LHCGR (LH/CG Receptor) — Luteinizing Hormone receptor
  - BMP15 (Bone Morphogenetic Protein 15) — Follicle growth factor
- **Clinical Relevance:** Arrested follicle development, anovulation, polycystic ovaries
- **Therapeutic Target:** Gonadotropins, ovulation induction, surgical drilling

#### Cell Type Distributions

Breakdown of key ovarian/endocrine cell populations in PCOS:

| Cell Type | Count | % of Total | Function |
|-----------|-------|-----------|----------|
| **Granulosa Cells** | 2,847 | 34% | Estrogen production, follicle support |
| **Stromal Cells** | 3,241 | 39% | Androgen synthesis, structural support |
| **Theca Cells** | 1,523 | 18% | Androgen & progesterone synthesis |
| **Immune Cells** | 892 | 11% | Inflammation, immune regulation |
| **Endothelial Cells** | 1,156 | 14% | Angiogenesis, vascular function |

*Note:* PCOS shows increased stromal cell volume and inflammatory infiltrate compared to healthy ovaries.

#### Pathway Visualization
- **Interactive Diagrams** — Shows genes, proteins, and regulatory relationships
- **Activity Heatmap** — Color intensity represents pathway activation (green: low, red: high)
- **Legend** — Explains symbols, colors, and abbreviations
- **Hover Details** — Click genes to see descriptions, references

#### Educational Content
- **Pathway Summaries** — One-paragraph clinical overview per pathway
- **Gene Descriptions** — Function, expression level, associations
- **Research References** — Links to key PCOS literature
- **Patient Impact** — How each pathway affects symptoms and fertility

---

## 🏗 Technical Architecture

### Technology Stack

**Frontend**
- **Framework:** Next.js 16.2.6 (App Router)
- **Runtime:** Node.js with TypeScript
- **Styling:** Tailwind CSS, Shadcn/UI components
- **State Management:** React hooks (useState, useEffect, useContext)
- **API Communication:** Fetch API with custom `healthApi` client

**Backend**
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn (ASGI)
- **ML/Prediction:** XGBoost for risk scoring, scikit-learn for clustering
- **Explainability:** SHAP (SHapley Additive exPlanations) for feature importance
- **Database:** Supabase (PostgreSQL) optional, localStorage default
- **Data Processing:** Pandas for CSV parsing and manipulation

**DevOps & Hosting**
- **Version Control:** Git
- **Environment:** Docker-ready (backend containerizable)
- **API Gateway:** CORS-enabled for localhost:3000 ↔ localhost:8001

### Directory Structure

```
frontend/
├── backend/                          # FastAPI backend
│   ├── main.py                      # API entry point, endpoints
│   ├── clinical_rules.py            # Rotterdam criteria logic
│   ├── requirements.txt             # Python dependencies
│   ├── models/
│   │   ├── pcos_xgboost_model.joblib     # Trained XGBoost model
│   │   └── differential_diagnosis_model.joblib
│   └── data/
│       └── pcos_phenotype_results.csv    # Training dataset
│
├── women-s-health-diagnostic-platform/  # Next.js frontend
│   ├── app/                         # Next.js app router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── analysis/               # Patient analysis (/analysis)
│   │   ├── body-visualization/     # Body viewer (/body-visualization)
│   │   ├── csv-upload/             # Batch upload (/csv-upload)
│   │   ├── molecular/              # Molecular insights (/molecular)
│   │   ├── sessions/               # Session history (/sessions)
│   │   └── globals.css             # Global styles
│   │
│   ├── components/                 # React components
│   │   ├── analysis/               # Analysis form & results
│   │   │   ├── patient-analysis.tsx      # Multi-step form
│   │   │   ├── body-visualization.tsx    # Body viewer
│   │   │   ├── results-dashboard.tsx     # Results display
│   │   │   └── forms/                    # 6 form step components
│   │   ├── landing/                # Landing page sections
│   │   ├── body-viewer/            # Body visualization
│   │   ├── molecular/              # Molecular insights
│   │   ├── ui/                     # Shadcn UI components
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── api.ts                 # API client & utilities
│   │   └── utils.ts               # Helper functions
│   │
│   ├── hooks/                      # React hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   │
│   ├── public/                     # Static assets
│   ├── package.json               # Node dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── next.config.mjs            # Next.js config
│   └── tailwind.config.ts         # Tailwind CSS config
│
├── supabase/                       # Backend functions (optional)
│   ├── functions/                 # Serverless edge functions
│   │   ├── analyze/              # PCOS analysis endpoint
│   │   ├── predict/              # Risk prediction
│   │   ├── shap/                 # Feature importance
│   │   ├── cluster/              # Phenotype clustering
│   │   ├── session/              # Session management
│   │   └── csv-upload/           # Batch CSV processing
│   │
│   └── migrations/
│       └── 20260516055037_create_patient_sessions_and_results.sql
│
├── notebooks/                      # Jupyter notebooks
│   └── Biological_Validation.ipynb
│
├── .env.local                      # Environment variables (local)
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

### API Endpoints

**Backend Endpoints (`http://localhost:8001`)**

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/analyze` | Full PCOS analysis | PatientData JSON | FullAnalysisResult |
| POST | `/predict` | Risk score prediction | PatientData JSON | RiskScore, phenotype |
| POST | `/session` | Create/update session | SessionData JSON | SessionResult |
| GET | `/session/{id}` | Retrieve session | — | SessionResult |
| POST | `/csv-upload` | Batch CSV analysis | CSV file | CSVUploadResult |
| POST | `/shap` | Feature importance | PatientData JSON | SHAPResult |
| POST | `/cluster` | Phenotype clustering | PatientData JSON | ClusterResult |

**Frontend API Client (`lib/api.ts`)**

```typescript
healthApi.analyze(patientData)           // Single-patient analysis
healthApi.predict(patientData)           // Risk prediction only
healthApi.csvUpload(csvFile)             // Batch upload
healthApi.session.create(patientData)    // Create session
healthApi.session.saveResult(...)        // Save results
healthApi.session.list()                 // List all sessions
healthApi.session.get(sessionId)         // Retrieve session
```

---

## 📊 Data Model

### PatientData Object (30+ Fields)

**Demographics:**
- `age: number` — Age in years (18–50)
- `weight: number` — Weight in kg
- `height: number` — Height in cm
- `bmi: number` — Body Mass Index (auto-calculated)
- `ethnicity: string` — Ethnicity category

**Menstrual Health:**
- `cycleLength: number` — Cycle length in days
- `cycleRegularity: string` — "regular" | "irregular"
- `cycleVariability: number` — Variability in days
- `periodDuration: number` — Duration in days
- `ageAtMenarche: number` — Age at first period

**Hormonal Symptoms:**
- `acne: boolean` — Presence of acne
- `acneSeverity: string` — "mild" | "moderate" | "severe"
- `hirsutismScore: number` — Ferriman-Gallwey score (0–36)
- `hairLoss: boolean` — Presence of androgenic alopecia
- `skinDarkening: boolean` — Acanthosis nigricans

**Metabolic Indicators:**
- `fastingGlucose: number` — mg/dL
- `fastingInsulin: number` — µIU/mL
- `homaIR: number` — Auto-calculated insulin resistance
- `waistCircumference: number` — cm
- `systolicBP: number` — mmHg
- `diastolicBP: number` — mmHg

**Ultrasound Findings:**
- `leftOvaryVolume: number` — mL
- `rightOvaryVolume: number` — mL
- `leftFollicleCount: number` — Number of 2–9mm follicles
- `rightFollicleCount: number` — Number of 2–9mm follicles
- `polycysticAppearance: boolean` — Sonographic confirmation
- `endometrialThickness: number` — mm

**Lab Biomarkers:**
- `lh: number` — mIU/mL
- `fsh: number` — mIU/mL
- `lhFshRatio: number` — Auto-calculated
- `totalTestosterone: number` — ng/dL
- `freeTestosterone: number` — pg/mL
- `dheas: number` — µg/dL
- `amh: number` — ng/mL (Anti-Müllerian Hormone)
- `prolactin: number` — ng/mL
- `tsh: number` — mIU/L

### Analysis Result Object

```typescript
{
  success: boolean,
  prediction: {
    pcosRiskScore: number,              // 0–100
    riskLevel: "low" | "moderate" | "high",
    phenotype: {
      type: "A" | "B" | "C" | "D",
      name: string,
      description: string
    },
    confidence: number                  // 0–100
  },
  Rotterdam: {
    criteria_met: string[],             // Which of 3 criteria met
    hyperandrogenism: boolean,
    ovulatoryDysfunction: boolean,
    polycysticOvaries: boolean
  },
  shap: {
    values: Array<{
      feature: string,
      value: number,
      impact: "high" | "moderate" | "low",
      direction: "increase" | "neutral"
    }>
  },
  clustering: {
    cluster: number,
    cluster_name: string,
    confidence: number
  },
  confidenceMetrics: {
    pcosClassification: number,
    phenotypeClassification: number,
    diagnosticCertainty: "high" | "moderate" | "low"
  },
  recommendations: string[]
}
```

### SessionResult Object

```typescript
{
  id: string,                          // UUID
  created_at: string,                  // ISO 8601 timestamp
  status: "active" | "archived" | "completed",
  patientData: PatientData,
  result: AnalysisResult,
  csvMetadata?: {
    fileName: string,
    rowCount: number,
    uploadedAt: string
  }
}
```

---

## 🔑 Key Clinical Concepts

### Rotterdam Criteria (Diagnosis)
PCOS diagnosis requires ≥2 of 3 criteria:
1. **Hyperandrogenism** — Clinical (hirsutism, acne, alopecia) OR biochemical (elevated androgens)
2. **Ovulatory Dysfunction** — Oligomenorrhea (>35 days) or anovulation
3. **Polycystic Ovarian Morphology** — Ultrasound finding (≥12 follicles or volume >10 mL per ovary)

### PCOS Phenotypes (4 Types)
- **Type A (Classic):** HA + OD + PCOM (40–50% of PCOS)
- **Type B (Non-PCO):** HA + OD (20–30%)
- **Type C (Non-HA):** OD + PCOM (10–15%)
- **Type D (Lean/Normo-androgenic):** PCOM + OD (5–15%)

### Insulin Resistance
- **HOMA-IR > 2.5** indicates insulin resistance
- Formula: (Fasting Glucose × Fasting Insulin) / 405
- Present in 50–70% of PCOS, higher metabolic risk

### Feature Importance (SHAP)
Features ranked by impact on PCOS diagnosis:
1. Cycle length (oligomenorrhea)
2. Follicle count (polycystic pattern)
3. LH:FSH ratio (endocrine dysfunction)
4. Testosterone (hyperandrogenism)
5. HOMA-IR (insulin resistance)

---

## 🚀 Deployment Guide

### Local Development
```bash
# Start backend (port 8001)
source .venv/bin/activate
PYTHONPATH=$(pwd) python3 -m uvicorn backend.main:app --port 8001

# Start frontend (port 3000)
cd women-s-health-diagnostic-platform
npm run dev
```

### Production Build
```bash
# Frontend
cd women-s-health-diagnostic-platform
npm run build
npm start

# Backend (Gunicorn/production ASGI server)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app
```

### Environment Variables
Create `.env.local` in frontend root:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 📚 Additional Resources

- **PCOS Diagnosis:** Rotterdam Criteria (2012)
- **SHAP Documentation:** https://shap.readthedocs.io/
- **XGBoost:** https://xgboost.readthedocs.io/
- **Next.js Docs:** https://nextjs.org/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com/

---

## 📝 License & Attribution

HerOva is a hackathon project for BioHackathon 2026. All clinical algorithms follow evidence-based PCOS diagnostic criteria (Rotterdam Consensus 2012).

---

**Questions or Issues?** Contact the development team or open an issue in the repository.

Last Updated: **May 19, 2026**
