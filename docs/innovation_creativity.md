# HerOva — Innovation & Creativity

This document maps HerOva's design decisions, creative problem reframing, and UI improvements to the **Innovation & Creativity** judging criterion (weight: 12%).

---

## What judges are looking for

> Novelty of perspective, workflow, methodology, or application compared to existing approaches; creativity in reframing the problem; whether the solution challenges assumptions; and how meaningfully it differs from existing solutions.

---

## The creative insight

Most PCOS screening tools ask: *"Does this patient have PCOS?"* — and answer with a binary result after a specialist visit, a complete hormone panel, and a pelvic ultrasound.

HerOva reframes the question as: *"What does the pattern of available data tell us about this patient's risk — and which specific phenotype does it point toward?"*

This reframing has three concrete consequences:

1. **Earlier pattern recognition** — the tool can surface a meaningful risk signal from menstrual history, BMI, and symptoms alone, without waiting for lab panels or ultrasound access.
2. **Phenotype-level specificity** — instead of "PCOS / not PCOS", the output classifies patients into four Rotterdam phenotypes (A–D), each with distinct metabolic and reproductive risk implications.
3. **Explainable synthesis** — the system shows which signals drove the result, in plain language, rather than producing a black-box score.

---

## How HerOva differs from existing approaches

| Dimension | Typical symptom checker / EHR form | HerOva |
|---|---|---|
| **Data model** | Single-axis input (one form or one lab) | Six-domain synthesis (demographics, menstrual, symptoms, metabolic, ultrasound, labs) |
| **Output type** | Binary flag or referral suggestion | Phenotype A/B/C/D + risk score + ranked explainability |
| **Data completeness** | Usually requires full dataset to produce result | Optional-step model — scores whatever is available, adjusts confidence |
| **Explainability** | Score or threshold trigger, no reasoning shown | SHAP-style ranked features with plain-language sentences |
| **Deployment model** | Clinic-bound, EHR-dependent | Browser-based, offline-capable, batch CSV screening |
| **Clinical context** | Designed for single encounter | Supports single-patient, telehealth, and population-level workflows |

---

## What assumptions are challenged

**Assumption 1: PCOS screening requires specialist access.**
HerOva challenges this by designing a scoring model that produces a meaningful signal from basic clinical information a GP or community health worker can collect — no endocrinologist required for first-pass screening.

**Assumption 2: Risk tools need complete data to be useful.**
The optional-step intake (Steps 4–6) means the system produces a risk estimate even when ultrasound and lab data are unavailable. Confidence metrics adjust rather than blocking the result.

**Assumption 3: A diagnostic tool can only output a diagnosis.**
HerOva outputs a risk score, a phenotype classification, a ranked list of contributing signals, a differential diagnosis, pathway-level biological context, and a referral priority. It is designed as a decision-support interface, not a binary diagnostic gate.

**Assumption 4: Explainability is optional or secondary.**
SHAP-style feature contributions are first-class outputs. The plain-language summary is designed to be readable by a community health worker, not just a clinical informatics specialist.

---

## UI improvements made (this branch)

### 1. Innovation section on the landing page (`innovation-section.tsx`)

A new full section appears between the Problem and Features sections on the landing page. It contains:

- A two-column **"Traditional Pathway vs HerOva Approach"** comparison, using check/cross iconography to make the contrast immediately legible.
- Four **innovation dimension cards** (Multi-Signal, Phenotype-Aware, Explainable by Design, Flexible Data Model), each with a category tag (Methodology, Problem reframing, Transparency, Adaptability).
- An honest framing note at the bottom: *"HerOva is a prototype-level decision-support interface, not a regulated diagnostic device."*

**Why this helps judges:** The comparison table makes novelty immediately visible without requiring judges to read the README. The innovation card grid gives each dimension a concrete name that maps directly to the criterion language.

### 2. "Multi-Signal Synthesis" panel in the results dashboard (`results-dashboard.tsx`)

A compact banner is inserted between the 3-card grid (PCOS Probability / Phenotype / AI Confidence) and the Body Visualization section. It:

- States in one line: *"This risk view is formed by synthesising up to six clinical domains — not a single test or symptom checklist."*
- Renders six signal badges (Demographics, Menstrual, Symptoms, Metabolic, Ultrasound, Lab Biomarkers), with active/inactive state based on whether the user provided non-default data for those domains.

**Why this helps judges:** When judges run a demo analysis, they immediately see which signals contributed before they see the detailed results. This communicates the multi-signal synthesis idea at the point where it is most relevant — inside the product itself.

### 3. `docs/innovation_creativity.md` (this file)

Provides the judging-alignment narrative, problem reframing explanation, assumption challenge list, and evidence from the codebase.

---

## Judging alignment table

| Criterion element | HerOva evidence | UI/doc improvement |
|---|---|---|
| **Novelty of workflow** | Six-domain intake + phenotype output rather than single-test flag | Innovation section comparison table |
| **Novelty of methodology** | Optional-step scoring with confidence adjustment | Flexible Data Model card; optional banners in intake form |
| **Creative problem reframing** | Shifts from "does this patient have PCOS?" to "what pattern is visible from available data?" | Innovation section header copy |
| **Challenges assumptions** | Scores without specialist access, without complete data, without binary output | Traditional vs HerOva comparison |
| **Differs from existing solutions** | SHAP explainability, phenotype specificity, batch population screening in same interface | Innovation dimension cards |
| **Overall creativity** | Multi-signal + phenotype + explainability + offline capability in one coherent workflow | Full innovation section + signals panel in results |

---

## Remaining limitations (be honest)

| Limitation | Context |
|---|---|
| SHAP values are heuristic-weighted, not computed from a trained model | Real SHAP from a validated XGBoost model would strengthen the "explainable AI" claim |
| The "multi-signal synthesis" is primarily heuristic rule-based, not deep multi-modal ML | A properly trained multi-modal model would be a stronger innovation claim |
| The comparison with existing solutions is asserted, not benchmarked | A head-to-head study against a named existing tool would be a stronger evidence base |
| The molecular pathway module is educational/static, not patient-derived from genomics | Real single-cell data integration would make the biological layer genuinely novel |

---

## Future improvements that would strengthen Innovation & Creativity

1. Train and validate a multi-modal ML model on a larger, diverse clinical dataset — replacing the heuristic scoring with genuine learned signal integration.
2. Compute real SHAP values from the XGBoost model rather than heuristic weights.
3. Add longitudinal tracking — compare a patient's phenotype and risk score across visits to detect progression or treatment response.
4. Integrate real single-cell transcriptomic data into the molecular pathway module.
5. Publish a head-to-head comparison against an existing named screening tool (e.g., a standard PCOS symptom checklist) to quantify workflow improvement.
6. Add active differential diagnosis — not just PCOS vs endometriosis vs healthy, but a broader differential including CAH, thyroid disorders, and hyperprolactinemia.
