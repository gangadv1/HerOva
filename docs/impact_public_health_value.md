# HerOva — Impact & Public Health Value

This document maps HerOva's design decisions, population targeting, and UI additions to the **Impact & Public Health Value** judging criterion (weight: 10%).

---

## What judges are looking for

> Breadth and depth of the public health problem addressed; evidence that the solution can reach underserved or high-burden populations; clarity of the pathway from tool output to meaningful clinical or population-level action.

---

## The public health problem

PCOS is the most common endocrine disorder in women of reproductive age, affecting an estimated **8–13% globally** — roughly 200 million people. Despite its prevalence:

- The average diagnosis delay is **2 or more years** from symptom onset.
- Estimates suggest **up to 70% of affected women remain undiagnosed**.
- Undiagnosed PCOS is associated with downstream insulin resistance, type 2 diabetes, cardiovascular risk, infertility, and mental health burden.
- The populations with the highest unmet need — rural, low-income, adolescent, and resource-limited settings — are precisely those with the least access to the specialist-dependent diagnostic pathway.

HerOva is designed to address the **access gap**, not just the clinical question.

---

## Where HerOva can add public health value

### 1. Earlier pattern recognition (before specialist access)

The 6-domain intake model can surface a meaningful risk signal from menstrual history, BMI, and symptom data alone. A GP or community health worker can generate a risk-ranked output before any hormone panel or ultrasound is ordered. For high-prevalence settings with low specialist density, this compresses the pathway from symptom onset to first clinical signal.

### 2. Population-level batch screening

The CSV upload module allows a single clinician to screen hundreds of patients from an exported patient list, generating a risk-ranked referral queue in minutes. This enables triage at a population level, not just an individual consultation level. A nurse or community health worker at a health camp can screen 200 patients in the time it would previously take to see 5 in a specialist clinic.

### 3. Underserved population targeting

Six specific barrier/value pairs are surfaced in the Early Awareness section of the landing page:

| Population | Barrier addressed |
|---|---|
| Rural & remote communities | No specialist present — first-pass screening by community health worker with tablet |
| Adolescents & young adults | Symptoms normalised at first presentation — structured intake surfaces pattern earlier |
| Women with limited lab access | No lab results required for first-pass signal (optional steps 4–6) |
| Low- and middle-income settings | Browser-based, offline-capable, no cloud subscription required |
| Women with high metabolic risk | HOMA-IR, fasting glucose, waist circumference included in scoring model |
| Primary care & general practice | Reproducible 6-step intake structure for GP consultations |

### 4. Results that prompt action

Every analysis generates:
- A **referral priority indicator** (low / moderate / high / urgent) with a plain-language rationale
- A **ranked clinical recommendation list** with the most time-sensitive action at the top
- A **differential diagnosis** (PCOS vs endometriosis vs healthy) so the next specialist appointment starts with context rather than from scratch

---

## UI additions supporting this criterion

### 1. `EarlyAwarenessSection` on the landing page

A full landing page section titled "Earlier Awareness, Broader Reach" was added after the Public Health Section. It contains:

- **4 prevention value cards** (Earlier, Clearer, Broader, Wider) explaining how the tool extends value beyond individual diagnosis
- **6 population-specific cards** with explicit barrier/value framing for the most underserved groups
- **An honest prototype scope note** clarifying that population-level impact claims describe design intent, not measured outcomes

**Why this helps judges:** The criterion asks for breadth of public health impact. The population grid makes that breadth immediately visible, while the barrier/value framing answers the implicit question: "Why would this be harder to access today, and how does HerOva address that specifically?"

### 2. `PublicHealthSection` on the landing page

A dedicated section surfaces the four headline statistics:

- 8–13% estimated prevalence globally
- 2+ years average diagnosis delay
- ~70% of cases estimated undiagnosed
- 400+ training profiles in the model dataset

These anchor the public health case in numbers before judges read the detailed feature descriptions.

### 3. "Why Early Awareness Matters" callout in the results dashboard

A contextual callout was inserted between the SHAP + Recommendations grid and the Molecular Pathway section of the results page. It:

- Adapts its messaging to the patient's risk level (high vs moderate vs low)
- States the population-level significance of the result type the user is viewing
- Links the individual result to broader health context without overstating clinical certainty

**Why this helps judges:** When a judge runs a live demo analysis, they see the public health framing embedded in the product itself — not just described on a landing page. This demonstrates that impact thinking is woven into the product experience.

---

## Judging alignment table

| Criterion element | HerOva evidence | UI/doc improvement |
|---|---|---|
| **Breadth of problem** | PCOS affects 200M+ globally; 70% undiagnosed | Stats section on landing page + EarlyAwarenessSection header |
| **Underserved populations** | Rural, adolescent, low-income, limited-lab, primary-care | 6 population cards with explicit barrier/value pairs |
| **Pathway to clinical action** | Referral priority, ranked recommendations, differential | Results dashboard disclaimer + plain-language summary |
| **Population-level reach** | CSV batch screening — hundreds of patients per session | Deployment context cards in HomeSections |
| **Offline/low-resource capability** | Browser-based, no cloud dependency, client-side scoring fallback | Flexible Data Model card + population card for LMIC |
| **Educational value** | Rotterdam criteria explainer, molecular pathway module, SHAP rationale | Innovation section + results dashboard |

---

## Remaining limitations (honest assessment)

| Limitation | Context |
|---|---|
| No prospective clinical validation data | Population-level impact claims are design-intent, not measured outcomes |
| Batch screening tested with synthetic data only | Real-world validation against a clinical cohort is required |
| Offline capability is partial — some features require the FastAPI backend | Full offline mode would require a bundled model + local inference |
| The "70% undiagnosed" statistic is an oft-cited estimate, not from a single authoritative source | Exact figure varies across studies and geographies |
| No patient-reported outcome integration | Impact on downstream health behaviours is unquantified |

---

## Future improvements that would strengthen Impact & Public Health Value

1. **Conduct a pilot study** in a rural primary care or community health setting to quantify diagnostic yield and time-to-referral changes.
2. **Partner with a clinical data source** to replace synthetic training data with real patient records, enabling external validation.
3. **Add longitudinal tracking** so a community health worker can monitor a patient's risk trajectory across visits without requiring specialist follow-up at each step.
4. **Internationalise the interface** — translate to local languages for highest-burden regions (South Asia, Sub-Saharan Africa, Latin America).
5. **Integrate the CSV batch workflow into the results dashboard** so a clinician can click from a high-risk row in the batch output directly to a full individual analysis.
6. **Add referral letter generation** — a one-click output that summarises the intake data and risk result in a format a specialist can act on immediately.
