from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np
import shap
from typing import Dict, List

# Initialize the FastAPI app
app = FastAPI(
    title="Clinical Trial Completion Prediction API",
    description="An API to predict the completion status of clinical trials based on study design, criteria, and other features.",
    version="1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", ],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and preprocessors
MODEL_PATH = 'models/random_forest_model.pkl'
LABEL_ENCODERS_PATH = 'data/label_encoders.pkl'

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(LABEL_ENCODERS_PATH, 'rb') as le_file:
        label_encoders = pickle.load(le_file)
    
    # Initialize SHAP explainer
    explainer = shap.TreeExplainer(model)
    print("Model, encoders and explainer loaded successfully.")
except Exception as e:
    raise RuntimeError(f"Failed to load model or explainer: {str(e)}")

def get_prediction_explanation(data: pd.DataFrame) -> Dict[str, float]:
    """Calculate SHAP values and return feature contributions"""
    # Calculate SHAP values
    shap_values = explainer.shap_values(data)
    
    # Get feature importance
    feature_importance = dict(zip(data.columns, shap_values[0]))
    
    # Sort by absolute importance
    sorted_importance = {k: v for k, v in sorted(
        feature_importance.items(), 
        key=lambda x: abs(x[1]), 
        reverse=True
    )}
    
    return sorted_importance

# Define the input schema
class TrialData(BaseModel):
    study_title: str | None = None
    criteria: str | None = None
    enrollment: int | None = None
    Allocation: str | None = None
    Intervention_Model: str | None = None
    Masking: str | None = None
    Primary_Purpose: str | None = None
    intervention: str | None = None
    condition: str | None = None

@app.post("/predict")
async def predict(trial_data: TrialData):
    try:
        # Prepare the data as a DataFrame
        data = pd.DataFrame([trial_data.model_dump()])

        # Apply label encoding to categorical features
        categorical_cols = [
            'study_title', 'criteria', 'Allocation', 
            'Intervention_Model', 'Masking', 'Primary_Purpose',
            'intervention', 'condition'
        ]
        
        for col in categorical_cols:
            if col in data.columns:
                data[col] = data[col].fillna('Missing').apply(
                    lambda x: x if x in label_encoders[col].classes_ else 'Unknown'
                )
                if 'Unknown' not in label_encoders[col].classes_:
                    label_encoders[col].classes_ = np.append(label_encoders[col].classes_, 'Unknown')
                data[col] = label_encoders[col].transform(data[col])

        # Ensure feature order matches training data
        feature_order = [
            'study_title', 'criteria', 'enrollment',
            'Allocation', 'Intervention_Model', 'Masking', 'Primary_Purpose',
            'intervention', 'condition'
        ]
        data = data[feature_order]

        # Predict
        prediction = model.predict(data)

        # Get SHAP values as numpy array
        shap_values = explainer.shap_values(data)
        if isinstance(shap_values, list):
            shap_array = shap_values[1][0]  # Index 1 for positive class, then [0] for single row
        else:
            shap_array = shap_values[0][0]  # For binary classification, pick [0] for single row

        # Convert to dictionary with scalar values
        feature_importance = {
            col: float(val) 
            for col, val in zip(data.columns, shap_array)
        }

        # Get top 5 features or all if fewer than 5
        top_features = dict(sorted(
            feature_importance.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )[:5])

        # Create interpretation
        interpretation = []
        for feature, impact in top_features.items():
            direction = "increased" if impact > 0 else "decreased"
            impact_str = f"{abs(impact):.3f}"
            interpretation.append(f"{feature} {direction} likelihood of completion by {impact_str}")

        return {
            "study_title": trial_data.study_title,
            "criteria": trial_data.criteria,
            "enrollment": trial_data.enrollment,
            "Allocation": trial_data.Allocation,
            "Intervention_Model": trial_data.Intervention_Model,
            "Masking": trial_data.Masking,
            "Primary_Purpose": trial_data.Primary_Purpose,
            "intervention": trial_data.intervention,
            "condition": trial_data.condition,
            "prediction": prediction[0],
            "explanation": {
                "top_contributing_features": top_features,
                "interpretation": f"The model predicted {prediction[0]}. " + " ".join(interpretation)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
