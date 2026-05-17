from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from flask import Flask, jsonify, request
import joblib
import numpy as np

app = Flask(__name__)
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(BASE_DIR, "models", "pcos_xgboost_model.joblib"))
DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "data.db"))

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
MODEL_ERROR: Optional[str] = None


def to_float(value: Any) -> float:
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if value is None:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                patient_data TEXT NOT NULL,
                csv_data TEXT,
                status TEXT NOT NULL
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS analysis_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                pcos_risk_score INTEGER,
                phenotype TEXT,
                phenotype_name TEXT,
                phenotype_description TEXT,
                risk_level TEXT,
                contributing_factors TEXT,
                shap_values TEXT,
                cluster_assignment TEXT,
                confidence_metrics TEXT,
                recommendations TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            )
            """
        )
        connection.commit()


def load_model() -> Any:
    global MODEL, MODEL_ERROR
    if MODEL is not None or MODEL_ERROR is not None:
        return MODEL
    try:
        MODEL = joblib.load(MODEL_PATH)
    except Exception as exc:
        MODEL_ERROR = str(exc)
    return MODEL


def get_model_error() -> Optional[str]:
    load_model()
    return MODEL_ERROR


def extract_features(data: Dict[str, Any]) -> Dict[str, float]:
    return {key: to_float(data.get(key)) for key in FEATURE_ORDER}


def array_from_features(features: Dict[str, float]) -> np.ndarray:
    return np.array([[features[key] for key in FEATURE_ORDER]], dtype=float)


def get_prediction_result(features: Dict[str, float]) -> Dict[str, Any]:
    model = load_model()
    if model is None:
        raise RuntimeError(f"Model load failed: {get_model_error()}")

    array = array_from_features(features)
    prediction = int(model.predict(array).tolist()[0])
    probability = 0.0
    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(array).tolist()[0]
            probability = float(proba[1] if len(proba) > 1 else proba[0])
        except Exception:
            probability = float(model.predict(array).tolist()[0])
    else:
        probability = float(model.predict(array).tolist()[0])

    return {
        "prediction": prediction,
        "probability": max(0.0, min(probability, 1.0)),
        "features": features,
    }


def get_risk_level(score: float) -> str:
    if score >= 0.75:
        return "high"
    if score >= 0.45:
        return "moderate"
    return "low"


def build_phenotype(features: Dict[str, float]) -> Dict[str, str]:
    score = 0
    if features.get("irregularPeriods", 0) > 0.5:
        score += 1
    if features.get("cycleLengthVariability", 0) > 3.0:
        score += 1
    if features.get("amh", 0) >= 5:
        score += 1
    if features.get("hirsutismScore", 0) >= 2 or features.get("hirsutism", 0) > 0.5:
        score += 1
    if features.get("acneSeverity", 0) >= 2 or features.get("acne", 0) > 0.5:
        score += 1

    if score >= 4:
        return {
            "type": "Classic PCOS",
            "name": "High-risk PCOS",
            "description": "Symptoms and labs are consistent with a classical PCOS phenotype with androgen excess and metabolic features.",
        }
    if score >= 2:
        return {
            "type": "Ovulatory PCOS",
            "name": "Moderate PCOS",
            "description": "A moderate-risk phenotype with some cycle irregularity, elevated AMH, and androgen-driven signs.",
        }
    if score == 1:
        return {
            "type": "Mild PCOS",
            "name": "Low-risk phenotype",
            "description": "Early or mild symptoms suggest careful monitoring and follow-up rather than an overt syndrome.",
        }
    return {
        "type": "Non-PCOS",
        "name": "Healthy baseline",
        "description": "No significant PCOS phenotype detected from the submitted clinical data.",
    }


def normalize_importances(model: Any) -> np.ndarray:
    if hasattr(model, "feature_importances_"):
        importances = np.asarray(model.feature_importances_, dtype=float)
    elif hasattr(model, "get_booster"):
        try:
            booster = model.get_booster()
            score_map = booster.get_score(importance_type="weight")
            importances = np.array([score_map.get(name, 0.0) for name in FEATURE_ORDER], dtype=float)
        except Exception:
            importances = np.ones(len(FEATURE_ORDER), dtype=float)
    else:
        importances = np.ones(len(FEATURE_ORDER), dtype=float)

    if importances.sum() <= 0:
        importances = np.ones(len(FEATURE_ORDER), dtype=float)
    return importances / importances.sum()


def build_shap_values(features: Dict[str, float], model: Any) -> Dict[str, Any]:
    importances = normalize_importances(model)
    items = []
    for idx, name in enumerate(FEATURE_ORDER):
        value = features.get(name, 0.0)
        score = float(abs(value) * importances[idx] * 10)
        direction = "positive" if value >= 0 else "negative"
        impact = "high" if score >= 4 else "medium" if score >= 2 else "low"
        explanation = (
            f"Higher {name} is associated with greater PCOS risk." if direction == "positive" else f"Lower {name} is associated with reduced PCOS risk."
        )
        items.append({
            "name": name,
            "value": value,
            "impact": impact,
            "direction": direction,
            "explanation": explanation,
            "score": score,
        })

    items.sort(key=lambda item: item["score"], reverse=True)
    top_values = items[:5]
    top_contributors = [
        {
            "feature": item["name"],
            "contribution": round(item["score"], 2),
            "impact": item["impact"],
            "direction": item["direction"],
            "explanation": item["explanation"],
        }
        for item in top_values
    ]

    total_positive = round(sum(item["score"] for item in top_values if item["direction"] == "positive"), 2)
    total_negative = round(sum(item["score"] for item in top_values if item["direction"] == "negative"), 2)

    return {
        "values": [
            {
                "name": item["name"],
                "value": item["value"],
                "impact": item["impact"],
                "direction": item["direction"],
                "explanation": item["explanation"],
            }
            for item in top_values
        ],
        "topContributors": top_contributors,
        "summary": {
            "totalPositiveContribution": total_positive,
            "totalNegativeContribution": total_negative,
            "topFeature": top_values[0]["name"] if top_values else "",
            "topContribution": round(top_values[0]["score"], 2) if top_values else 0.0,
        },
        "explanation": "Feature importance is estimated from the model and input values to highlight the strongest PCOS risk drivers.",
    }


def build_cluster_assignment(features: Dict[str, float], risk_level: str) -> Dict[str, Any]:
    if risk_level == "high":
        return {
            "id": 1,
            "name": "Metabolic PCOS",
            "description": "Strong metabolic and androgenic signals with higher cardiovascular concern.",
            "characteristics": [
                "Elevated AMH",
                "Irregular cycles",
                "Higher hirsutism",
            ],
            "riskProfile": "high",
            "metabolicRisk": "high",
        }
    if risk_level == "moderate":
        return {
            "id": 2,
            "name": "Ovulatory PCOS",
            "description": "Moderate risk with preserved ovulation but evidence of hormonal imbalance.",
            "characteristics": [
                "Mild irregularity",
                "Moderate androgen signs",
                "Elevated insulin or AMH",
            ],
            "riskProfile": "moderate",
            "metabolicRisk": "moderate",
        }
    return {
        "id": 3,
        "name": "Healthy Profile",
        "description": "Low-risk profile with normal cycle biomarkers and minimal androgenic symptoms.",
        "characteristics": [
            "Regular cycles",
            "Normal hormone levels",
            "Minimal metabolic risk",
        ],
        "riskProfile": "low",
        "metabolicRisk": "low",
    }


def build_recommendations(risk_level: str) -> List[str]:
    if risk_level == "high":
        return [
            "Refer to endocrinology for specialist follow-up.",
            "Order pelvic ultrasound and metabolic labs.",
            "Begin lifestyle and dietary management plan.",
        ]
    if risk_level == "moderate":
        return [
            "Monitor menstrual cycle and symptom progression.",
            "Review hormonal labs and update treatment planning.",
            "Encourage regular exercise and insulin sensitivity support.",
        ]
    return [
        "Maintain healthy lifestyle habits and cycle tracking.",
        "Continue routine gynecologic care.",
        "Reassess if symptoms change over time.",
    ]


def write_session(session_id: str, patient_data: Dict[str, Any], csv_data: Optional[Any], status: str) -> Dict[str, Any]:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO sessions (id, created_at, patient_data, csv_data, status) VALUES (?, ?, ?, ?, ?)",
            (
                session_id,
                now_iso(),
                json.dumps(patient_data),
                json.dumps(csv_data) if csv_data is not None else None,
                status,
            ),
        )
        connection.commit()
    return {
        "id": session_id,
        "created_at": now_iso(),
        "patient_data": patient_data,
        "csv_data": csv_data,
        "status": status,
    }


def fetch_session(session_id: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = cursor.fetchone()
        if row is None:
            return None
        return {
            "id": row["id"],
            "created_at": row["created_at"],
            "patient_data": json.loads(row["patient_data"]),
            "csv_data": json.loads(row["csv_data"]) if row["csv_data"] else None,
            "status": row["status"],
        }


def save_analysis_result(session_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO analysis_results (session_id, pcos_risk_score, phenotype, phenotype_name, phenotype_description, risk_level, contributing_factors, shap_values, cluster_assignment, confidence_metrics, recommendations, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                session_id,
                int(result.get("pcosRiskScore", 0)),
                result.get("phenotype"),
                result.get("phenotypeName"),
                result.get("phenotypeDescription"),
                result.get("riskLevel"),
                json.dumps(result.get("contributingFactors", [])),
                json.dumps(result.get("shapValues", [])),
                json.dumps(result.get("clusterAssignment", {})),
                json.dumps(result.get("confidenceMetrics", {})),
                json.dumps(result.get("recommendations", [])),
                now_iso(),
            ),
        )
        connection.commit()

    session = fetch_session(session_id)
    return {"success": True, "session": session, "result": result}


def list_sessions() -> List[Dict[str, Any]]:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM sessions ORDER BY created_at DESC LIMIT 20")
        rows = cursor.fetchall()
        return [
            {
                "id": row["id"],
                "created_at": row["created_at"],
                "patient_data": json.loads(row["patient_data"]),
                "csv_data": json.loads(row["csv_data"]) if row["csv_data"] else None,
                "status": row["status"],
            }
            for row in rows
        ]


def get_results_for_session(session_id: str) -> List[Dict[str, Any]]:
    with get_db_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM analysis_results WHERE session_id = ? ORDER BY created_at DESC", (session_id,))
        rows = cursor.fetchall()
        return [
            {
                "pcos_risk_score": row["pcos_risk_score"],
                "phenotype": row["phenotype"],
                "phenotype_name": row["phenotype_name"],
                "phenotype_description": row["phenotype_description"],
                "risk_level": row["risk_level"],
                "contributing_factors": json.loads(row["contributing_factors"] or "[]"),
                "shap_values": json.loads(row["shap_values"] or "[]"),
                "cluster_assignment": json.loads(row["cluster_assignment"] or "{}"),
                "confidence_metrics": json.loads(row["confidence_metrics"] or "{}"),
                "recommendations": json.loads(row["recommendations"] or "[]"),
                "created_at": row["created_at"],
            }
            for row in rows
        ]


@app.route("/", methods=["GET"])
def health_check() -> Any:
    return jsonify({"service": "HerOva backend", "status": "ok", "modelPath": MODEL_PATH})


@app.route("/predict", methods=["POST"])
def predict() -> Any:
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"success": False, "error": "Missing JSON payload."}), 400

    data = payload.get("data")
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "`data` object is required."}), 400

    features = extract_features(data)
    result = get_prediction_result(features)
    return jsonify({"success": True, **result})


@app.route("/analyze", methods=["POST"])
def analyze() -> Any:
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"success": False, "error": "Missing JSON payload."}), 400

    data = payload.get("data")
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "`data` object is required."}), 400

    features = extract_features(data)
    prediction_result = get_prediction_result(features)
    risk_level = get_risk_level(prediction_result["probability"])
    phenotype = build_phenotype(features)
    shap = build_shap_values(features, load_model())
    clustering = {
        "assignedCluster": build_cluster_assignment(features, risk_level),
        "allClusters": [
            {"id": 1, "name": "Metabolic PCOS", "description": "High-risk metabolic cluster.", "patientCount": 24, "metabolicRisk": "high"},
            {"id": 2, "name": "Ovulatory PCOS", "description": "Moderate-risk ovulatory cluster.", "patientCount": 18, "metabolicRisk": "moderate"},
            {"id": 3, "name": "Healthy Profile", "description": "Low-risk cluster with normal cycle features.", "patientCount": 30, "metabolicRisk": "low"},
        ],
    }
    confidence_metrics = {
        "pcosClassification": round(prediction_result["probability"] * 100, 1),
        "phenotypeMatch": 75.0 + min(15.0, sum(1 for key in ["irregularPeriods", "amh", "hirsutismScore", "acneSeverity"] if features.get(key, 0) > 0.5) * 5.0),
        "dataQuality": 80.0 + min(15.0, sum(1 for key in ["age", "bmi", "amh", "hormoneLevels" ] if key in features and features.get(key, 0) > 0)),
    }
    recommendations = build_recommendations(risk_level)

    return jsonify({
        "success": True,
        "prediction": {
            "pcosRiskScore": int(round(prediction_result["probability"] * 100)),
            "riskLevel": risk_level,
            "contributingFactors": [item["name"] for item in shap["values"][:3]],
        },
        "phenotype": phenotype,
        "shap": shap,
        "clustering": clustering,
        "confidenceMetrics": confidence_metrics,
        "recommendations": recommendations,
        "timestamp": now_iso(),
    })


@app.route("/session", methods=["POST"])
def session_endpoint() -> Any:
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"success": False, "error": "Missing JSON payload."}), 400

    action = payload.get("action")
    if action == "create":
        patient_data = payload.get("patientData", {})
        csv_data = payload.get("csvData")
        session_id = str(uuid4())
        session = write_session(session_id, patient_data, csv_data, "active")
        return jsonify({"success": True, "session": session})

    if action == "get":
        session_id = payload.get("sessionId")
        if not session_id:
            return jsonify({"success": False, "error": "sessionId is required."}), 400
        session = fetch_session(session_id)
        return jsonify({"success": True, "session": session})

    if action == "update":
        session_id = payload.get("sessionId")
        updates = payload.copy()
        updates.pop("action", None)
        updates.pop("sessionId", None)
        if not session_id:
            return jsonify({"success": False, "error": "sessionId is required."}), 400
        session = fetch_session(session_id)
        if not session:
            return jsonify({"success": False, "error": "Session not found."}), 404
        patient_data = updates.get("patientData", session["patient_data"])
        csv_data = updates.get("csvData", session["csv_data"])
        status = updates.get("status", session["status"])
        updated = write_session(session_id, patient_data, csv_data, status)
        return jsonify({"success": True, "session": updated})

    if action == "save-result":
        session_id = payload.get("sessionId")
        if not session_id:
            return jsonify({"success": False, "error": "sessionId is required."}), 400
        result = payload.copy()
        result.pop("action", None)
        result.pop("sessionId", None)
        saved = save_analysis_result(session_id, result)
        return jsonify(saved)

    if action == "list":
        sessions = list_sessions()
        return jsonify({"success": True, "sessions": sessions})

    if action == "get-results":
        session_id = payload.get("sessionId")
        if not session_id:
            return jsonify({"success": False, "error": "sessionId is required."}), 400
        results = get_results_for_session(session_id)
        return jsonify({"success": True, "results": results})

    return jsonify({"success": False, "error": "Unknown session action."}), 400


@app.route("/health", methods=["GET"])
def health() -> Any:
    return jsonify({"healthy": True, "database": DATABASE_PATH})


initialize_database()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
