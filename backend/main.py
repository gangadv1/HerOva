from fastapi import FastAPI
from pydantic import BaseModel

from backend.clinical_rules import evaluate_rotterdam_criteria

app = FastAPI()


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