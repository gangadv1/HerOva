# HerOva Frontend

This folder contains the Next.js frontend for HerOva, a women's health diagnostic decision-support demo focused on PCOS screening, phenotype interpretation, explainable results, body symptom visualization, population CSV screening, molecular education, and session management.

For full-stack backend, Supabase, model, and database details, see the root [README](../README.md).

## Feature Map

| Route/Area | Feature | Detail |
| --- | --- | --- |
| `/` | Landing page | Brand hero, navigation, problem section, feature cards, dataset context, technology overview, public health section, phenotype education, and CTA. |
| `/analysis` | Six-step intake | Demographics, menstrual health, hormonal symptoms, metabolic indicators, ultrasound findings, and lab biomarkers. |
| `/analysis` | Telehealth mode | Toggleable remote-consultation mode, also enabled by `/analysis?mode=telehealth`. |
| `/analysis` | Form UX | Progress bar, numbered step indicators, previous/next controls, clickable step navigation, typed patient state, and animated transitions. |
| `/analysis` | Auto-calculations | BMI, HOMA-IR, and LH:FSH ratio are computed/normalized from user-entered values. |
| `/analysis` results | PCOS probability | Displays 0-100 risk score and low/moderate/high risk band. |
| `/analysis` results | Phenotype prediction | Shows Type A/B/C/D/N/A phenotype, name, description, and reasoning. |
| `/analysis` results | Rotterdam criteria | Breaks down hyperandrogenism, ovulatory dysfunction, and polycystic ovarian morphology with subcriteria. |
| `/analysis` results | Explainability | Shows SHAP-style ranked feature contributions, impact levels, direction, and human-readable reasoning. |
| `/analysis` results | Differential diagnosis | Compares PCOS, endometriosis, and healthy ovarian function. |
| `/analysis` results | Biology | Builds patient-specific pathway activity and cell-composition summaries. |
| `/analysis` results | Clustering | Assigns a patient cluster and metabolic risk profile. |
| `/analysis` results | Save results | Stores score, phenotype, factors, SHAP values, cluster assignment, confidence, and recommendations into a session. |
| `/body-visualization` | Standalone body viewer | Interactive anatomical symptom map with selectable regions, severity, related symptoms, zoom/reset controls, and report export. |
| `/csv-upload` | Population screening | Drag-and-drop CSV upload, sample CSV download, local parsing, row-level risk scoring, phenotype distribution, risk heatmap, referral queue, and batch save. |
| `/csv-upload` | Per-row analysis | Opens patient details and can generate a full single-patient analysis for a selected CSV row. |
| `/sessions` | Session history | Lists saved single-patient and batch sessions with status, timestamp, age/BMI metadata, batch summaries, and saved analysis details. |
| `/sessions` | Storage modes | Uses browser localStorage by default and Supabase when configured. |
| `/molecular` | Molecular insights | UMAP-style single-cell visualization, cell type legend, pathway selection, gene lists, activity percentages, and pathway relevance. |
| Shared UI | Design system | Tailwind CSS, shadcn/Radix UI primitives, lucide icons, Framer Motion, cards, badges, progress bars, toasts, and responsive layouts. |
| API client | Backend switching | Calls local FastAPI when Supabase is absent; calls Supabase Edge Functions when configured. |
| API client | CSV/session helpers | Parses CSV, maps clinical columns, normalizes values, computes batch scores, and manages local sessions. |

## Single-Patient Intake Details

The patient analysis form stores data in a typed `PatientData` object.

### Demographics

- Age.
- Weight.
- Height.
- BMI.
- Ethnicity.

### Menstrual Health

- Cycle length.
- Cycle length variability.
- Period duration.
- Age at menarche.
- Irregular periods.

### Hormonal Symptoms

- Acne.
- Acne severity.
- Hirsutism.
- Hirsutism score.
- Hair loss.
- Skin darkening/acanthosis nigricans.

### Metabolic Indicators

- Fasting glucose.
- Insulin level.
- HOMA-IR.
- Waist circumference.
- Systolic blood pressure.
- Diastolic blood pressure.

### Ultrasound Findings

- Left ovary volume.
- Right ovary volume.
- Left follicle count.
- Right follicle count.
- Polycystic appearance.
- Endometrial thickness.

### Lab Biomarkers

- LH.
- FSH.
- LH:FSH ratio.
- Total testosterone.
- Free testosterone.
- DHEAS.
- AMH.
- Prolactin.
- TSH.

## Results Dashboard Details

The results view combines backend responses with frontend fallbacks so the UI remains usable during demos.

- Calls `healthApi.analyze(patientData)` for full analysis.
- Calls `healthApi.predict(patientData)` for prediction and Rotterdam details.
- Creates a session automatically when persistence is available.
- Falls back to local prediction, SHAP-style values, phenotype assignment, cluster assignment, and recommendations if a backend call fails.
- Embeds the body viewer with patient-specific symptom descriptions.
- Shows affected region count and severe finding count.
- Provides save behavior for later viewing in `/sessions`.

## Body Viewer Details

The interactive viewer is implemented in `components/body-viewer/interactive-body-viewer.tsx`.

- Hotspots include scalp, face, thyroid, chest, skin folds, abdomen, ovaries, uterus, pelvis, and lower body.
- Each hotspot has coordinates, region, severity, description, related symptoms, and zoom area.
- Users can select a hotspot, zoom to it, zoom manually, or reset the view.
- `components/body-viewer/pcos-body-viewer-data.ts` tailors hotspot severity and descriptions from patient data and analysis output.

## CSV Screening Details

The CSV workflow supports practical population screening.

- Accepts `.csv` files only.
- Supports drag-and-drop and file picker.
- Parses comma, semicolon, and tab-delimited files.
- Handles quoted CSV values.
- Maps common healthcare dataset columns into HerOva patient fields.
- Scores every row locally.
- Tracks source columns that triggered clinical flags.
- Shows summary cards, phenotype distribution, heatmap, patient table, and referral queue.
- Allows selected high-risk patients to be reviewed and marked for referral.
- Saves batch results and referral state into sessions.

Supported column families include age, weight, height, BMI, cycle fields, acne, hirsutism, hair loss, skin darkening, AMH, FSH, LH, follicles, follicle size, endometrium, blood pressure, waist, hip, glucose, prolactin, TSH, vitamin D3, progesterone, pregnancy fields, and lifestyle fields.

## Sessions Details

Sessions are available from `/sessions`.

- Local browser sessions use `herova.local.sessions.v1`.
- Supabase sessions are used when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist.
- The page shows a setup notice when running in local-only mode.
- Single-patient results expand to show risk score, risk level, phenotype, metabolic risk, and contributing factors.
- Batch sessions expand to show total rows, processed rows, PCOS-positive count, risk counts, and phenotype distribution.

## Molecular Details

The molecular page uses static educational data to explain biological interpretation.

- Cell types: granulosa cells, theca cells, stromal cells, immune cells, endothelial cells.
- Pathways: chronic low-grade inflammation, insulin signaling, hyperandrogenism pathway, ovarian dysfunction.
- Genes/markers: IL-6, TNF-alpha, CRP, NF-kB, INSR, IRS-1, PI3K, AKT, CYP17A1, CYP11A1, StAR, 3 beta-HSD, AMH, FSHR, LHCGR, BMP15.
- Includes activity percentages and clinical relevance for each pathway.

## API Behavior

The frontend uses `lib/api.ts`.

- If Supabase is not configured, calls `LOCAL_MODEL_URL` or `http://localhost:8001`.
- If Supabase is configured, calls `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/...`.
- Adds Supabase `Authorization` and `apikey` headers when needed.
- Normalizes form fields into backend-compatible fields.
- Builds local CSV results without requiring a server.
- Provides local session create/list/get/save behavior.

## Development

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

Build production:

```bash
npm run build
npm start
```

Run lint:

```bash
npm run lint
```

## Optional Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
LOCAL_MODEL_URL=http://localhost:8001
```

Without Supabase variables, the app uses local browser storage for sessions and the local FastAPI backend URL for analysis calls.

## Main Files

```text
app/page.tsx                                  # Landing page
app/analysis/page.tsx                         # Patient analysis route
app/body-visualization/page.tsx               # Standalone body visualization route
app/csv-upload/page.tsx                       # Population screening route
app/molecular/page.tsx                        # Molecular insights route
app/sessions/page.tsx                         # Session history route
components/analysis/patient-analysis.tsx      # Six-step intake shell
components/analysis/results-dashboard.tsx     # Results report
components/analysis/forms/                    # Form step components
components/body-viewer/interactive-body-viewer.tsx
components/body-viewer/pcos-body-viewer-data.ts
components/landing/                           # Landing sections
components/molecular/molecular-insights.tsx
lib/api.ts                                    # API, CSV, and session client
```
