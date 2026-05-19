# HerOva — Feasibility & Implementation

This document maps HerOva's design decisions, UI improvements, and known limitations to the **Feasibility & Implementation** judging criterion (weight: 20%).

---

## What judges are looking for

> Applicability across different clinical environments (primary care, specialist clinics, telehealth, community settings), accessibility, affordability, scalability, usability, practicality of required data inputs/devices/infrastructure/workflows, and adaptability to low-resource or data-limited settings.

---

## Clinical environment applicability

HerOva is designed to support a spectrum of deployment contexts, not only fully-equipped specialist clinics.

| Setting | How HerOva supports it |
|---|---|
| **Primary care / GP clinic** | Steps 1–3 (demographics, menstrual health, hormonal symptoms) require only information a GP can collect in a routine consultation. No specialist equipment needed. |
| **Specialist / endocrinology** | All 6 steps accept complete hormone panels, ultrasound measurements, and SHAP-level explainability for phenotype precision. |
| **Telehealth** | A URL parameter (`/analysis?mode=telehealth`) toggles remote-consultation mode. Patients can complete symptom and cycle sections ahead of the appointment. |
| **Community health camps** | The `/csv-upload` batch workflow allows a health worker to upload a patient spreadsheet, score the whole list, and extract a prioritised referral queue — without a specialist present. |
| **Low-resource / offline** | The full Rotterdam criteria engine, risk scoring, and phenotype classification run client-side in the browser. No internet connection or cloud backend is required for the single-patient workflow. |
| **Educational / training** | The molecular pathway module and explainability features help trainees understand how PCOS criteria interact. |

---

## Data input practicality

### Required inputs (Steps 1–3)

These are collectable in any clinical encounter, including primary care and community screenings:

- Age, weight, height (BMI auto-calculated)
- Cycle length, cycle regularity, period duration
- Clinical symptoms: acne, hirsutism, hair loss, skin darkening

### Optional inputs (Steps 4–6)

These improve accuracy but are not required. The system still produces a risk assessment if they are absent:

- **Step 4 — Metabolic:** Fasting glucose, insulin, HOMA-IR, waist circumference, blood pressure
- **Step 5 — Ultrasound:** Ovary volumes, follicle counts, polycystic appearance
- **Step 6 — Lab biomarkers:** LH, FSH, testosterone, DHEA-S, AMH, prolactin, TSH

### How the system handles missing data

- The confidence metrics (`dataQuality`) adjust automatically when optional steps are skipped.
- Risk scoring is heuristic-weighted, so partial data produces a lower-confidence but still actionable estimate.
- The results report clearly notes when a Rotterdam diagnosis is not fully supported.

---

## UI improvements made (this branch)

The following changes were implemented on the `feasibility-ui-improvements` branch to directly improve scores against this criterion.

### 1. Required/optional step labelling (`patient-analysis.tsx`)

- Steps 1–3 are labelled as required; steps 4–6 are labelled as "optional" directly below the step indicators.
- A progress subtitle reads: *"Steps 1–3 are required. Steps 4–6 are optional — skip any that are unavailable."*

**Why this helps:** Judges and healthcare workers immediately understand the tool is designed for settings where complete data is not available. It removes the perception that the tool only works with full specialist workups.

### 2. Contextual "skip" affordance (`patient-analysis.tsx`)

- When a user reaches an optional step, a `Skip` button appears next to `Next`.
- A cyan info banner appears on optional steps reading: *"Optional step. If this data is not available, you can skip. The system will still generate a risk assessment from the data provided so far."*

**Why this helps:** Reduces friction for community health workers, GPs, and telehealth operators who may not have ultrasound or lab access. Signals explicitly that the tool is designed for partial data.

### 3. Optional step banners on forms 4–6

- **Metabolic indicators form:** amber banner — *"Optional — enter values if available. If fasting glucose or insulin results are not at hand, leave the defaults and proceed."*
- **Ultrasound form:** amber banner — *"Optional — enter ultrasound measurements if a pelvic scan has been performed. If no ultrasound is available, skip this step."*
- **Lab biomarkers form:** amber banner — *"Optional — enter lab results if available. Hormone panels strengthen phenotype accuracy but are not required."*

**Why this helps:** Provides per-step guidance at the point of data entry. Eliminates confusion about whether the step must be completed.

### 4. Plain-language summary card in results (`results-dashboard.tsx`)

A new "Plain-Language Summary" card appears at the top of the results page, before the detailed analysis grid. It contains:
- Risk level with plain-English interpretation (e.g., *"High — clinical follow-up is recommended"*)
- Rotterdam criteria count in plain text
- Phenotype type and name
- First recommended next step

**Why this helps:** Busy clinicians and community health workers can read the key finding in 10 seconds. Judges can immediately see the output is actionable, not just technical.

### 5. Prominent clinical disclaimer at top of results (`results-dashboard.tsx`)

The disclaimer was moved from a small footnote at the bottom to a prominent yellow banner at the top of the results page, reading: *"Clinical decision-support only. This report is designed to assist — not replace — clinician judgment."*

**Why this helps:** Demonstrates appropriate clinical framing. Shows judges the team understands the tool is decision-support, not a replacement for clinical assessment.

### 6. Print / Export PDF button (`results-dashboard.tsx`)

A "Print / Export PDF" button was added to the action row at the bottom of the results page.

**Why this helps:** In real clinical settings, reports need to be saved or attached to patient notes. This makes the output sharable in paper-based or low-connectivity environments.

### 7. Deployment context section on landing page (`home-sections.tsx`)

A new landing page section replaces the previous placeholder. It shows six deployment cards (primary care, specialist, telehealth, community health camp, offline/low-resource, educational) with plain descriptions of how the tool works in each setting.

**Why this helps:** Judges can immediately see the platform was designed for real-world clinical diversity, not just a lab demo.

### 8. Public health impact section (`public-health-section.tsx`)

A new landing page section shows key statistics (PCOS prevalence, diagnostic delay, undiagnosed rate), four specific impact areas, and an honest "Prototype-Level" framing.

**Why this helps:** Connects the tool directly to the public health problem it addresses, and is honest about what further validation is needed.

---

## Remaining limitations (be honest with judges)

| Limitation | What it means |
|---|---|
| **No prospective clinical validation** | The risk score and phenotype outputs have not been tested in a live clinical setting. The platform is demonstration-quality. |
| **No PWA / true offline packaging** | The offline fallback requires the app to be pre-loaded in the browser. A proper Progressive Web App or installable mobile app would improve low-resource deployability. |
| **No formal accessibility audit** | The UI has not been tested against WCAG 2.1 AA. Screen-reader support, keyboard navigation, and colour contrast have not been formally verified. |
| **Default values on optional steps** | When a user skips steps 4–6, the system uses default values rather than explicitly zeroing out those fields. A future improvement would use explicit null handling with confidence adjustment. |
| **Single language** | The interface is English-only. Translation into target deployment languages (Hindi, Spanish, Swahili) would be required for true low-resource reach. |
| **No EHR integration** | There is no FHIR or HL7 API. Data entry is manual or CSV-based. EHR integration would be needed for production workflow adoption. |

---

## Future roadmap for this criterion

1. Package as a Progressive Web App (PWA) for offline installation on mobile devices.
2. Export the ML model to ONNX for fully client-side inference.
3. Add a "minimal mode" intake path — 8 fields covering cycle, symptoms, and BMI only — for ultra-low-resource deployments.
4. Formal WCAG accessibility audit and remediation.
5. Translate the interface into at least two additional languages.
6. Build a FHIR-compatible data import adapter to reduce manual entry burden.
7. Prospective pilot study with a community clinic to measure screening time reduction and referral accuracy.

---

## Files changed in this branch

| File | Change |
|---|---|
| `components/analysis/patient-analysis.tsx` | Required/optional step labels, skip button, optional step info banners |
| `components/analysis/forms/metabolic-indicators-form.tsx` | Optional step amber banner |
| `components/analysis/forms/ultrasound-form.tsx` | Optional step amber banner |
| `components/analysis/forms/lab-biomarkers-form.tsx` | Optional step amber banner |
| `components/analysis/results-dashboard.tsx` | Plain-language summary card, prominent disclaimer, print/export button |
| `components/landing/home-sections.tsx` | Full deployment context section (replaced placeholder) |
| `components/landing/public-health-section.tsx` | Public health impact section (replaced placeholder) |
| `app/page.tsx` | Wired both new landing sections into the page |
| `docs/feasibility_implementation.md` | This file — full audit, rationale, and gap analysis |
