# HerOva: Women's Health Diagnostic Platform

HerOva is a BioHackathon 2026 diagnostic decision-support platform for PCOS-focused women's health workflows. It combines structured patient intake, Rotterdam criteria evaluation, PCOS risk scoring, phenotype classification, explainable AI-style reasoning, body symptom visualization, population CSV screening, session history, and molecular pathway education.

The repository contains a Next.js frontend, a FastAPI local analysis backend, optional Supabase Edge Functions, Supabase database migrations, trained model artifacts, and biological validation notebooks.

> Clinical note: HerOva is a hackathon research/demo platform. It is not a replacement for clinician judgment, diagnostic exclusion workups, or regulated medical software.

## Table of Contents

- [Complete Feature Inventory](#complete-feature-inventory)
- [Application Routes](#application-routes)
- [Single-Patient Analysis](#single-patient-analysis)
- [Results Report](#results-report)
- [Interactive Body Visualization](#interactive-body-visualization)
- [Population CSV Screening](#population-csv-screening)
- [Sessions and Persistence](#sessions-and-persistence)
- [Molecular Insights](#molecular-insights)
- [Landing and Education](#landing-and-education)
- [Backend and API Features](#backend-and-api-features)
- [Supabase Features](#supabase-features)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Clinical Logic](#clinical-logic)

## Complete Feature Inventory

| Area | Feature | Detail |
| --- | --- | --- |
| Landing | Hero experience | Brand-forward home page with HerOva identity, clear calls to action, animated visual styling, and route navigation. |
| Landing | Platform education | Explains the problem space, diagnostic gaps, public health relevance, dataset/training context, technology approach, and phenotype concepts. |
| Landing | Feature showcase | Highlights clinical AI diagnostics, phenotype discovery, molecular validation, explainable AI, real-world deployability, and diagnostic equity. |
| Intake | Six-step patient form | Collects demographics, menstrual health, hormonal symptoms, metabolic indicators, ultrasound findings, and lab biomarkers. |
| Intake | Stepper navigation | Includes progress bar, numbered step indicators, previous/next controls, and clickable step jumps. |
| Intake | Telehealth mode | Toggleable remote-consultation mode exposed through the `/analysis?mode=telehealth` URL path and header control. |
| Intake | Auto-calculated measurements | BMI, HOMA-IR, and LH:FSH ratio are calculated from entered values in the form flow and normalized by the API client. |
| Intake | Typed patient state | Uses a structured `PatientData` object covering more than 30 clinical fields. |
| Analysis | Local analysis backend | Uses FastAPI at `http://localhost:8001` when Supabase is not configured. |
| Analysis | Supabase Edge Function mode | Uses deployed Supabase functions when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured. |
| Analysis | Rotterdam criteria engine | Evaluates hyperandrogenism, ovulatory dysfunction, and polycystic ovarian morphology. |
| Analysis | Risk scoring | Produces a 0-100 PCOS probability/risk score and low/moderate/high risk band. |
| Analysis | Phenotype classification | Assigns Type A, B, C, D, unclassified PCOS, or non-PCOS pattern based on criteria combinations. |
| Analysis | Contributing factors | Lists clinical drivers such as ovulatory dysfunction, hyperandrogenism, PCOM, AMH, LH:FSH ratio, BMI, insulin resistance, and hormonal imbalance. |
| Analysis | SHAP-style explainability | Returns ranked feature contributions with impact level, direction, and plain-language explanation. |
| Analysis | Human-readable reasoning | Converts top contributors into readable diagnostic reasoning sentences. |
| Analysis | Confidence metrics | Reports PCOS classification confidence, phenotype match, and data quality. |
| Analysis | Suggested investigations | Recommends follow-up investigations such as fasting insulin, pelvic ultrasound, testosterone panel, and reproductive endocrinology referral. |
| Results | Report summary | Shows PCOS probability, phenotype prediction, AI confidence, clinical interpretation, and diagnostic status. |
| Results | Rotterdam breakdown | Displays criteria-level evidence and subcriteria for hyperandrogenism, ovulatory dysfunction, and polycystic ovaries. |
| Results | Differential diagnosis | Compares PCOS with endometriosis and healthy ovarian function probabilities. |
| Results | Biological pathways | Builds patient-specific pathway activity for insulin signaling, androgen synthesis, ovarian follicle regulation, and inflammatory signaling. |
| Results | Cellular composition | Estimates granulosa, stromal, theca, immune, and endothelial cell composition in the report view. |
| Results | Cluster snapshot | Assigns the patient to clusters such as classic metabolic PCOS, reproductive PCOS, hyperandrogenic-PCO, normo-androgenic PCOS, or non-PCOS control. |
| Results | Body symptom mapping | Embeds the interactive body viewer inside the report using the current patient data and model output. |
| Results | Save results | Saves the analysis result into the active session for later retrieval. |
| Body viewer | Standalone route | `/body-visualization` provides a dedicated PCOS symptom explorer. |
| Body viewer | Interactive hotspots | Clickable hotspots include scalp, face/acne, hirsutism, thyroid, chest, skin folds/arms, abdomen, ovaries, uterus, pelvis, and legs. |
| Body viewer | Zoom controls | Includes zoom in, zoom out, reset, selected-region focus, and animated detail panel behavior. |
| Body viewer | Severity states | Each hotspot carries mild/moderate/severe status and related symptoms. |
| Body viewer | Patient tailoring | `buildSymptomsForPatient` adjusts severity and descriptions from patient data and analysis output. |
| Body viewer | Report export | The standalone visualization can export a JSON report with timestamp, selected region, patient values, and session data. |
| Batch screening | CSV upload | `/csv-upload` supports drag-and-drop or file picker upload for `.csv` files. |
| Batch screening | Sample CSV | Provides an in-app downloadable sample file and supported column list. |
| Batch screening | Local parser | Parses CSV in-browser, detects comma/semicolon/tab delimiters, handles quoted values, and maps common column variants. |
| Batch screening | Flexible field mapping | Supports clinical column names for age, height, weight, BMI, cycles, symptoms, AMH, LH, FSH, follicles, blood pressure, waist/hip, lifestyle, pregnancy, vitamin D, and more. |
| Batch screening | Batch risk scoring | Calculates per-row risk score, risk level, phenotype, factors, and triggered source columns. |
| Batch screening | Summary cards | Shows total rows, processed patients, PCOS-positive count, high-risk count, moderate-risk count, and low-risk count. |
| Batch screening | Phenotype distribution | Summarizes Type A, B, C, D, and non-PCOS counts. |
| Batch screening | Risk heatmap | Displays up to 200 patients as color-coded risk squares. |
| Batch screening | Referral priority queue | Lists highest-risk patients and supports marking rows as referred. |
| Batch screening | Per-patient details | Opens row-level detail, generates a full single-patient analysis on demand, and shows clinical/biological summaries. |
| Batch screening | Batch save | Saves uploaded batch summary, patients, file metadata, and referral state into sessions. |
| Sessions | Session list | `/sessions` lists saved sessions with timestamps, status badges, age/BMI metadata, and refresh control. |
| Sessions | Local fallback | Stores sessions in browser `localStorage` under `herova.local.sessions.v1` when Supabase is not configured. |
| Sessions | Supabase-backed storage | Uses Supabase tables/functions for cloud persistence when environment variables are present. |
| Sessions | Expandable details | Expands sessions to show batch summaries, phenotype counts, saved risk score, phenotype, risk level, metabolic risk, and contributing factors. |
| Sessions | Empty and error states | Includes no-session CTA, loading spinner, retry action, setup notice, and graceful failure messaging. |
| Molecular | UMAP visualization | `/molecular` shows a synthetic UMAP-style single-cell cluster visualization. |
| Molecular | Cell type legend | Displays granulosa cells, theca cells, stromal cells, immune cells, and endothelial cells with counts and descriptions. |
| Molecular | Pathway explorer | Clickable pathway cards reveal genes, activity percentage, biological relevance, and clinical meaning. |
| Molecular | Pathways covered | Chronic low-grade inflammation, insulin signaling, hyperandrogenism/androgen synthesis, and ovarian dysfunction. |
| UI | Design system | Uses Tailwind CSS, shadcn/Radix primitives, lucide icons, cards, badges, progress bars, dialogs, toasts, and responsive layouts. |
| UI | Animations | Uses Framer Motion for step transitions, result reveals, upload states, and page section motion. |
| UI | Branding | Central logo component plus dark/glass visual styling and route-level headers. |
| Developer | TypeScript API client | `lib/api.ts` normalizes payloads, chooses local vs Supabase backend, parses CSV, stores sessions, and exposes `healthApi`. |
| Developer | Python API | `backend/main.py` exposes `/analyze` and `/predict` with CORS for the Next.js dev server. |
| Developer | Clinical rules module | `backend/clinical_rules.py` centralizes Rotterdam criteria evaluation and phenotype mapping. |
| Developer | Supabase functions | Edge functions exist for analyze, predict, shap, cluster, session, csv-upload, explain, and patient-summary flows. |
| Developer | Database migration | Creates `patient_sessions` and `analysis_results` tables with RLS policies for authenticated and anonymous demo sessions. |
| Developer | Model artifacts | Includes `pcos_xgboost_model.joblib`, `differential_diagnosis_model.joblib`, and phenotype result data. |
| Developer | Validation notebook | Includes `notebooks/Biological_Validation.ipynb` for biological validation work. |

## Application Routes

| Route | Name | Main Features |
| --- | --- | --- |
| `/` | Landing page | Hero, navigation, problem/solution narrative, feature cards, dataset context, technology overview, public health context, phenotype education, CTA. |
| `/analysis` | Patient analysis | Six-step intake form, telehealth toggle, progress tracking, patient state, analysis submission, results transition. |
| `/analysis?mode=telehealth` | Telehealth analysis | Same intake/report surface with remote-consultation mode enabled from URL. |
| `/body-visualization` | Body visualization | Standalone interactive body symptom map, region details, zoom controls, JSON report export. |
| `/csv-upload` | Population screening | CSV upload, sample download, batch processing, summary cards, phenotype distribution, risk heatmap, referral queue, per-row analysis, save batch. |
| `/sessions` | Patient sessions | Session history, local/Supabase storage notice, saved result details, batch summaries, refresh, new analysis actions. |
| `/molecular` | Molecular insights | UMAP cell clustering, cell type counts, dysregulated pathway explorer, gene lists, activity levels. |

## Single-Patient Analysis

The `/analysis` workflow collects a complete patient profile through six form steps.

### Step 1: Demographics

- Age.
- Weight.
- Height.
- Auto-calculated BMI.
- Ethnicity.

### Step 2: Menstrual Health

- Cycle length.
- Cycle length variability.
- Period duration.
- Age at menarche.
- Irregular periods flag.
- Ovulatory dysfunction signal when cycles are irregular or prolonged.

### Step 3: Hormonal Symptoms

- Acne presence.
- Acne severity.
- Hirsutism flag.
- Ferriman-Gallwey-style hirsutism score.
- Hair loss.
- Skin darkening/acanthosis nigricans.
- Clinical hyperandrogenism signal from symptoms.

### Step 4: Metabolic Indicators

- Fasting glucose.
- Insulin level.
- Auto-calculated HOMA-IR.
- Waist circumference.
- Systolic blood pressure.
- Diastolic blood pressure.
- Insulin resistance and cardiometabolic risk signals.

### Step 5: Ultrasound Findings

- Left ovary volume.
- Right ovary volume.
- Left follicle count.
- Right follicle count.
- Polycystic appearance.
- Endometrial thickness.
- PCOM signal from follicle count, ovary volume, or sonographic appearance.

### Step 6: Lab Biomarkers

- LH.
- FSH.
- Auto-calculated LH:FSH ratio.
- Total testosterone.
- Free testosterone.
- DHEAS.
- AMH.
- Prolactin.
- TSH.
- Biochemical hyperandrogenism, ovarian reserve/follicle pool, and exclusionary mimic signals.

### Form Behavior

- Uses a persistent typed `PatientData` object while users move between steps.
- Shows a progress bar and current step count.
- Allows previous/next movement and clickable step navigation.
- Switches into the results dashboard after the final step.
- Runs both full analysis and prediction calls through `healthApi`.
- Creates a session automatically when possible.

## Results Report

The results dashboard is the main clinical interpretation surface after single-patient intake.

### Summary Cards

- PCOS probability from 0-100%.
- Risk level: low, moderate, or high.
- Phenotype prediction with type and explanation.
- AI confidence metrics for PCOS classification, phenotype match, and data quality.

### Rotterdam Evaluation

The report evaluates:

- Hyperandrogenism from acne, hirsutism, hair loss, testosterone, free testosterone, and hirsutism score.
- Ovulatory dysfunction from cycle irregularity and cycle length.
- Polycystic ovaries from follicle counts, ovary volumes, and polycystic appearance.
- Criteria count and whether the diagnostic threshold of at least 2 of 3 criteria is met.
- Exclusion notes for thyroid and prolactin patterns.

### Explainability

- Ranked SHAP-style feature bars.
- Impact labels: high, moderate, and low.
- Direction labels such as increases/neutral.
- Feature explanations for cycle length, follicle count, LH:FSH ratio, testosterone, HOMA-IR, AMH, hirsutism, BMI, ovary volume, and skin darkening.
- Human-readable reasoning sentences from backend contributors when available.

### Differential Diagnosis

- Compares PCOS, endometriosis, and healthy ovarian function.
- Normalizes probabilities to a 100% differential distribution.
- Describes why each competing diagnosis is being considered.

### Biological Interpretation

- Patient-specific pathway activity for insulin signaling, androgen synthesis, ovarian follicle regulation, and inflammatory signaling.
- Patient-specific cell architecture across granulosa, stromal, theca, immune, and endothelial cells.
- A combined clinical interpretation sentence summarizing criteria, phenotype, pathway, cell signal, differential result, and risk score.

### Clustering

- Assigns a cluster snapshot based on current patient signals.
- Cluster options include classic metabolic PCOS, reproductive PCOS, hyperandrogenic-PCO, normo-androgenic PCOS, and non-PCOS control.
- Shows characteristics, risk profile, and metabolic risk.

### Recommendations and Next Investigations

- Provides tailored recommendations based on criteria met.
- Suggests follow-up investigations such as fasting insulin, pelvic ultrasound, testosterone panel, or reproductive endocrinology referral.

### Save Results

- Stores risk score, phenotype, risk level, contributing factors, SHAP values, cluster assignment, confidence metrics, and recommendations into the active session.
- Works with local browser storage by default and Supabase when configured.

## Interactive Body Visualization

HerOva includes both a standalone body visualization route and an embedded viewer in the results report.

### Standalone Body Viewer

- Route: `/body-visualization`.
- Interactive anatomical silhouette.
- Clickable regions with clinical descriptions.
- Selected-region tracking.
- Patient age/BMI display when available.
- JSON report download with timestamp, selected region, patient demographics, and patient data.

### Embedded Results Body Viewer

- Uses `InteractiveBodyViewer`.
- Builds patient-specific symptoms with `buildSymptomsForPatient`.
- Adjusts descriptions with patient values such as age, BMI, cycle length, AMH, TSH, testosterone, and follicle counts.
- Adds analysis-aware notes when Rotterdam ovarian morphology or human reasoning is present.

### Hotspots and Regions

- Scalp and hair loss.
- Face acne.
- Hirsutism.
- Thyroid region.
- Chest/breast symptoms.
- Skin folds and acanthosis nigricans.
- Abdomen and central adiposity.
- Left ovary.
- Right ovary.
- Uterus and menstrual irregularity.
- Pelvic region.
- Legs/lower-body hirsutism.

### Viewer Controls

- Click hotspot to zoom to the relevant anatomical area.
- Zoom in.
- Zoom out.
- Reset view.
- Hover and selection states.
- Severity badges.
- Related symptom lists.

## Population CSV Screening

The `/csv-upload` route is designed for clinic, camp, or population-level screening.

### Upload Features

- Drag-and-drop CSV upload.
- Click-to-browse file input.
- CSV-only validation.
- File size display.
- Remove/reset selected file.
- Processing spinner and user-friendly errors.
- Downloadable sample CSV.

### Supported CSV Data

The parser accepts common columns and variants, including:

- Age, weight, height, and BMI.
- Cycle regularity and cycle length.
- Acne, hirsutism/hair growth, skin darkening, hair loss, weight gain.
- AMH, LH, FSH, FSH/LH ratio.
- Follicle counts left/right.
- Average follicle sizes left/right.
- Endometrial thickness.
- Blood pressure systolic/diastolic.
- Waist, hip, and waist:hip ratio.
- Fasting/random blood glucose.
- Prolactin, TSH, vitamin D3, progesterone.
- Pulse rate, respiratory rate, blood group, pregnancy status, abortions, beta-HCG values.
- Fast food intake and regular exercise.

### Batch Processing

- Parses CSV text locally.
- Detects delimiter from comma, semicolon, or tab.
- Handles quoted values.
- Normalizes numeric and boolean values.
- Builds patient objects for every row.
- Scores each patient locally.
- Assigns low/moderate/high risk.
- Determines Type A/B/C/D/NA phenotype.
- Tracks triggered source columns so clinicians can see why a row was flagged.

### Batch Results

- Summary cards for total rows, PCOS-positive count, high-risk count, moderate-risk count, and low-risk count.
- Phenotype distribution cards for Type A, B, C, D, and non-PCOS.
- Risk heatmap showing up to 200 patients as color-coded squares.
- Patient results table with row, score, level, phenotype, triggers, and actions.
- High-risk referral priority queue sorted by risk score.
- Referred badge state after review.
- On-demand full single-patient analysis for a selected row.
- Batch-specific pathway insights and differential diagnosis in row details.

### Batch Persistence

- Saves source metadata, file name, total rows, processed rows, PCOS-positive count, batch summary, patient rows, referral row IDs, and referral patient objects.
- Saved batch sessions appear on `/sessions`.

## Sessions and Persistence

HerOva supports browser-local sessions and optional Supabase-backed persistence.

### Local Sessions

- Used automatically when Supabase variables are not configured.
- Stored in browser localStorage.
- Storage key: `herova.local.sessions.v1`.
- Supports session create, list, retrieve, and result save behavior.
- Useful for demo and local development with no database setup.

### Supabase Sessions

- Enabled by setting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Uses Supabase functions under `/functions/v1`.
- Database tables are created by `supabase/migrations/20260516055037_create_patient_sessions_and_results.sql`.
- Row-level security policies support authenticated users and anonymous demo sessions.

### Sessions Page

- Lists session ID prefix, status, date/time, age, and BMI.
- Shows active/completed/archived badges.
- Provides refresh control.
- Shows setup notice when using local browser sessions.
- Empty state links to new analysis.
- Quick actions link to new analysis and CSV upload.
- Expands single-patient sessions to show saved analysis results.
- Expands batch sessions to show totals and phenotype distribution.

## Molecular Insights

The `/molecular` page is an education and research interpretation view.

### Single-Cell UMAP

- Synthetic UMAP-style visualization of ovarian single-cell transcriptomes.
- Clustered points for major cell populations.
- Axis labels for UMAP 1 and UMAP 2.

### Cell Types

- Granulosa cells: estrogen-producing follicular support cells.
- Theca cells: androgen-producing ovarian stromal cells.
- Stromal cells: structural/supportive ovarian architecture.
- Immune cells: inflammatory mediators in ovarian tissue.
- Endothelial cells: blood vessel lining and perfusion support.

### Molecular Pathways

- Chronic low-grade inflammation: IL-6, TNF-alpha, CRP, NF-kB; 75% activity.
- Insulin signaling: INSR, IRS-1, PI3K, AKT; 82% activity.
- Hyperandrogenism pathway: CYP17A1, CYP11A1, StAR, 3 beta-HSD; 68% activity.
- Ovarian dysfunction: AMH, FSHR, LHCGR, BMP15; 71% activity.

### Pathway Interaction

- Users select pathway cards.
- The selected pathway shows activity, genes, description, and relevance.
- Visual styling differentiates pathway families with color.

## Developer Quick Start

Follow these steps to get the full frontend + local backend experience for development and testing.

1. Frontend (Next.js)

```bash
cd women-s-health-diagnostic-platform
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

2. Optional backend model server (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

The local model server listens on port `8001` by default and is used automatically by the frontend when Supabase is not configured.

3. Environment variables

- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to use Supabase-backed persistence and edge functions.
- If not set, the app uses local fallbacks and `localStorage` under `herova.local.sessions.v1`.

## Batch Upload — "Review & Refer" Behavior

- The `/csv-upload` route exposes a batch workflow with per-row details and a referral queue.
- Clicking a row opens the same `ResultsDashboard` component used by the single-patient analysis page, ensuring feature parity for:
  - PCOS Probability, Phenotype Prediction, AI Confidence
  - Interactive Body Visualization
  - Rotterdam Criteria Evaluation
  - Differential Diagnosis
  - Metabolic Subtype
  - SHAP Feature Contribution
  - Clinical Recommendations
  - Molecular Pathway Activity
  - Ovarian Cellular Architecture
- Use the "Send to Referral Queue" button to mark a patient as referred. Referral state is persisted to Supabase when configured, otherwise saved to `localStorage`.

Troubleshooting:

- If the refer action fails, open DevTools → Console and Network. Look for failed requests to `/functions/v1/session` or the local model at `http://localhost:8001`.
- Common causes: missing env vars, CORS rules, or a backend process not running.

## Committing & Pushing Changes

Basic git workflow used by this project:

```bash
git checkout -b feat/update-readme
git add -A
git commit -m "docs: update README with detailed features and dev quick-start"
git push origin HEAD
```

If `git push` fails due to authentication, verify your local Git remote and credentials (SSH key or credential manager).

## Recent Changes

- Embedded `ResultsDashboard` into the batch upload per-row modal to ensure the batch single-patient view matches the single-patient analysis layout exactly.
- Fixed UI rendering issues and improved safety checks in the batch modal.

## Contact & Support

If you need help reproducing a bug or running the app locally, open an issue or reach out to the maintainers with console logs and network traces for the failing action.

---
Updated README: adds quick-start steps, batch refer troubleshooting, and commit/push guidance.

## Landing and Education

The landing page is a guided introduction to the product and problem space.

### Included Sections

- Navigation and HerOva brand/logo.
- Hero section with primary route CTA.
- Problem section covering the women's health diagnostic gap.
- Feature section for clinical AI diagnostics, phenotype discovery, molecular validation, explainable AI, implementation practicality, and equity.
- Dataset section describing the data and model context.
- Technology section describing XGBoost-style prediction, SHAP-style explainability, clustering, and molecular analysis.
- Public health section explaining impact.
- Phenotype education cards.
- CTA section.
- Particle background and animated visual elements.

## Backend and API Features

### FastAPI Backend

The local backend lives in `backend/`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/analyze` | Full analysis response with score, phenotype, Rotterdam output, SHAP-style values, reasoning, body highlights, investigations, clustering, confidence, recommendations, and timestamp. |
| `POST` | `/predict` | Lightweight prediction using the Rotterdam criteria engine. |

### `/analyze` Response Features

- `success`.
- `prediction.pcosRiskScore`.
- `prediction.riskLevel`.
- `prediction.contributingFactors`.
- `phenotype.type`, `phenotype.name`, and `phenotype.description`.
- `phenotypeDisplay`.
- `rotterdamEvaluation`.
- `shap.values` and `shap.topContributors`.
- `humanReasoning`.
- `bodyHighlights`.
- `suggestedInvestigations`.
- `clustering`.
- `confidenceMetrics`.
- `recommendations`.
- `timestamp`.

### API Client

The frontend API client in `women-s-health-diagnostic-platform/lib/api.ts` provides:

- Environment detection for Supabase and local backend mode.
- `healthApi.analyze`.
- `healthApi.predict`.
- CSV upload parsing and local batch result generation.
- Session create/list/get/save behavior.
- Payload normalization into backend-compatible clinical column names.
- Local session read/write/upsert.

## Supabase Features

Supabase support is optional but included.

### Edge Function Areas

- `analyze`.
- `predict`.
- `shap`.
- `cluster`.
- `session`.
- `csv-upload`.
- `explain`.
- `patient-summary`.

### Database Tables

`patient_sessions`:

- `id`.
- `created_at`.
- `patient_data`.
- `csv_data`.
- `status`.
- `user_id`.

`analysis_results`:

- `id`.
- `session_id`.
- `created_at`.
- `pcos_risk_score`.
- `phenotype`.
- `phenotype_name`.
- `phenotype_description`.
- `risk_level`.
- `contributing_factors`.
- `shap_values`.
- `cluster_assignment`.
- `confidence_metrics`.
- `recommendations`.

### Security

- RLS enabled for both tables.
- Authenticated users can access their own sessions/results.
- Anonymous demo sessions are allowed when `user_id` is null.
- Result access is scoped through the parent session.

## Data Model

### PatientData

```ts
type PatientData = {
  age: number
  weight: number
  height: number
  bmi: number
  ethnicity: string
  cycleLength: number
  cycleLengthVariability: string
  periodDuration: number
  ageAtMenarche: number
  irregularPeriods: boolean
  acne: boolean
  acneSeverity: string
  hirsutism: boolean
  hirsutismScore: number
  hairLoss: boolean
  skinDarkening: boolean
  fastingGlucose: number
  insulinLevel: number
  homaIr: number
  waistCircumference: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  ovaryVolumeLeft: number
  ovaryVolumeRight: number
  follicleCountLeft: number
  follicleCountRight: number
  polycysticAppearance: boolean
  endometrialThickness: number
  lh: number
  fsh: number
  lhFshRatio: number
  totalTestosterone: number
  freeTestosterone: number
  dheas: number
  amh: number
  prolactin: number
  tsh: number
}
```

### Full Analysis Result

```ts
type FullAnalysisResult = {
  success: boolean
  prediction: {
    pcosRiskScore: number
    riskLevel: "low" | "moderate" | "high"
    contributingFactors: string[]
  }
  phenotype: {
    type: string
    name: string
    description: string
  }
  phenotypeDisplay?: {
    displayName: string
    type: string
    characteristics: string[]
  }
  rotterdamEvaluation: unknown
  shap: {
    values: Array<Record<string, unknown>>
    topContributors: Array<Record<string, unknown>>
  }
  humanReasoning?: string[]
  bodyHighlights?: Record<string, boolean>
  suggestedInvestigations?: string[]
  clustering?: Record<string, unknown>
  confidenceMetrics: {
    pcosClassification: number
    phenotypeMatch: number
    dataQuality: number
  }
  recommendations: string[]
  timestamp: string
}
```

### CSV Upload Result

```ts
type CSVUploadResult = {
  success: boolean
  summary: {
    totalRows: number
    processedPatients: number
    pcosPositive: number
    highRisk: number
    moderateRisk: number
    lowRisk: number
    phenotypeDistribution: Record<string, number>
  }
  patients: Array<{
    rowId: number
    patientData: Record<string, unknown>
    riskScore: number
    riskLevel: "low" | "moderate" | "high"
    phenotype: string
    phenotypeName: string
    factors: string[]
    triggeredColumns: string[]
  }>
  timestamp: string
}
```

## Getting Started

### Prerequisites

- Node.js compatible with Next.js 16.
- Python 3.13 or compatible Python 3.x environment for the FastAPI backend.
- Optional Supabase project for cloud persistence and Edge Functions.

### Install Backend Dependencies

```bash
cd /path/to/BioHackathon2026/frontend
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### Install Frontend Dependencies

```bash
cd /path/to/BioHackathon2026/frontend/women-s-health-diagnostic-platform
npm install
```

### Run Local Backend

```bash
cd /path/to/BioHackathon2026/frontend
source .venv/bin/activate
PYTHONPATH=$(pwd) python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

### Run Frontend

```bash
cd /path/to/BioHackathon2026/frontend/women-s-health-diagnostic-platform
npm run dev
```

Open `http://localhost:3000`.

### Build Frontend

```bash
cd /path/to/BioHackathon2026/frontend/women-s-health-diagnostic-platform
npm run build
npm start
```

### Environment Variables

For local FastAPI-only mode, no Supabase variables are required.

For Supabase-backed mode, create `.env.local` in `women-s-health-diagnostic-platform/`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
LOCAL_MODEL_URL=http://localhost:8001
```

## Project Structure

```text
frontend/
├── backend/
│   ├── main.py
│   ├── clinical_rules.py
│   ├── requirements.txt
│   ├── data/
│   │   └── pcos_phenotype_results.csv
│   └── models/
│       ├── app.py
│       ├── differential_diagnosis_model.joblib
│       └── pcos_xgboost_model.joblib
├── notebooks/
│   └── Biological_Validation.ipynb
├── supabase/
│   ├── functions/
│   │   ├── analyze/
│   │   ├── cluster/
│   │   ├── csv-upload/
│   │   ├── explain/
│   │   ├── patient-summary/
│   │   ├── predict/
│   │   ├── session/
│   │   └── shap/
│   └── migrations/
│       └── 20260516055037_create_patient_sessions_and_results.sql
└── women-s-health-diagnostic-platform/
    ├── app/
    │   ├── analysis/
    │   ├── body-visualization/
    │   ├── csv-upload/
    │   ├── molecular/
    │   ├── sessions/
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── analysis/
    │   ├── body-viewer/
    │   ├── branding/
    │   ├── education/
    │   ├── landing/
    │   ├── molecular/
    │   └── ui/
    ├── hooks/
    ├── lib/
    │   ├── api.ts
    │   └── utils.ts
    ├── public/
    ├── package.json
    └── README.md
```

## Clinical Logic

### Rotterdam Criteria

PCOS diagnosis is supported when at least 2 of 3 criteria are met:

1. Hyperandrogenism.
2. Ovulatory dysfunction.
3. Polycystic ovarian morphology.

### Phenotypes

- Type A: hyperandrogenism + ovulatory dysfunction + polycystic ovaries.
- Type B: hyperandrogenism + ovulatory dysfunction, without clear PCOM.
- Type C: hyperandrogenism + polycystic ovaries, with relatively preserved ovulation.
- Type D: ovulatory dysfunction + polycystic ovaries, without clear hyperandrogenism.
- Non-PCOS: fewer than 2 Rotterdam criteria.
- PCOS unclassified: meets Rotterdam threshold but does not map cleanly to a standard phenotype.

### Risk Contributors

The local analysis backend scores signals from:

- Ovulatory dysfunction.
- Hyperandrogenism.
- Polycystic ovarian morphology.
- Irregular or prolonged cycles.
- Clinical hyperandrogenism.
- Elevated AMH.
- Elevated LH:FSH ratio.
- Elevated BMI.
- Insulin resistance signal.
- Hormonal imbalance signal from prolactin or TSH.

## Scripts

Frontend scripts in `women-s-health-diagnostic-platform/package.json`:

```bash
npm run dev      # Start Next.js dev server
npm run build    # Build production app
npm start        # Start production server
npm run lint     # Run ESLint
```

## Last Updated

May 19, 2026
