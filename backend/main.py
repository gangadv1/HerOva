from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.clinical_rules import evaluate_rotterdam_criteria

app = FastAPI()

# Allow the frontend dev server to call the API (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INPUT MODEL
# ============================================================

class PatientData(BaseModel):
    acne: int
    hair_growth: int
    cycle_regular: int
    follicles_left: int
    follicles_right: int


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(data: PatientData):

    patient_data = data.dict()

    # Rotterdam clinical analysis
    rotterdam_results = evaluate_rotterdam_criteria(patient_data)

    # Final AI prediction
    prediction = (
        "PCOS"
        if rotterdam_results["rotterdam_positive"]
        else "Non-PCOS"
    )

    # Clinical interpretation
    interpretation = (
        f"The patient meets "
        f"{rotterdam_results['criteria_count']} Rotterdam criteria "
        f"and is classified as "
        f"{rotterdam_results['phenotype']}."
    )

    return {
        "prediction": prediction,
        "rotterdam_analysis": rotterdam_results,
        "clinical_interpretation": interpretation
    }


@app.post("/analyze")
def analyze(data: dict):
    # Reuse the Rotterdam evaluation for a simple analysis response
    rotterdam_results = evaluate_rotterdam_criteria(data or {})
    prediction = "PCOS" if rotterdam_results.get("rotterdam_positive") else "Non-PCOS"

    return {
        "success": True,
        "prediction": {"pcosRiskScore": 50, "riskLevel": "moderate", "contributingFactors": rotterdam_results.get("criteria_met", [])},
        "phenotype": {"type": "NA", "name": rotterdam_results.get("phenotype", "Unknown"), "description": "Clinical phenotype"},
        "rotterdamEvaluation": rotterdam_results,
        "confidenceMetrics": {"pcosClassification": 0.85, "phenotypeMatch": 0.7, "dataQuality": 0.9},
        "recommendations": [],
        "timestamp": "",
    }