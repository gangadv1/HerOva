from __future__ import annotations

import os
from typing import Any, Dict, List

from flask import Flask, jsonify, request
import joblib
import numpy as np

app = Flask(__name__)
MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "models", "pcos_xgboost_model.joblib"),
)

FEATURE_ORDER: List[str] = [
    "age",
    "weight",
    "height",
    "bmi",
    "cycleLength",
    "cycleLengthVariability",
    "periodDuration",
    "ageAtMenarche",
    "irregularPeriods",
    "acne",
    "acneSeverity",
    "hirsutism",
    "hirsutismScore",
    "hairLoss",
    "skinDarkening",
    "fastingGlucose",
    "insulinLevel",
    "homaIr",
    "waistCircumference",
    "bloodPressureSystolic",
    "bloodPressureDiastolic",
    "ovaryVolumeLeft",
    "ovaryVolumeRight",
    "follicleCountLeft",
    "follicleCountRight",
    "polycysticAppearance",
    "endometrialThickness",
    "lh",
    "fsh",
    "lhFshRatio",
    "totalTestosterone",
    "freeTestosterone",
    "dheas",
    "amh",
    "prolactin",
    "tsh",
]

MODEL: Any = None


def to_float(value: Any) -> float:
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if value is None:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def load_model() -> Any:
    global MODEL
    if MODEL is None:
        MODEL = joblib.load(MODEL_PATH)
    return MODEL


@app.route("/", methods=["GET"])
def health_check() -> Any:
    return jsonify({
        "service": "HerOva backend",
        "status": "ok",
        "modelPath": MODEL_PATH,
    })


@app.route("/predict", methods=["POST"])
def predict() -> Any:
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"success": False, "error": "Missing JSON payload."}), 400

    data = payload.get("data")
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "`data` object is required."}), 400

    values = [to_float(data.get(key)) for key in FEATURE_ORDER]
    features = dict(zip(FEATURE_ORDER, values))
    model = load_model()
    array = np.array([values], dtype=float)

    prediction = model.predict(array).tolist()[0]
    probability = None
    if hasattr(model, "predict_proba"):
        probability = model.predict_proba(array).tolist()[0]
        probability = probability[1] if len(probability) > 1 else probability[0]

    return jsonify({
        "success": True,
        "prediction": prediction,
        "probability": probability,
        "features": features,
    })


@app.route("/health", methods=["GET"])
def health() -> Any:
    return jsonify({"healthy": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
