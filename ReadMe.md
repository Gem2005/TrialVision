# Clinical Trial Status Predictor

## Overview
Machine learning system that predicts clinical trial completion status and explains predictions using SHAP values. Processes multiple trial datasets, handles missing values, and provides API endpoints for predictions.

## Directory Structure
```bash
PS3_PROJECT/
├── app/                           # FastAPI Application
│   └── main.py                   # API endpoints and prediction logic
├── data/                            
│   ├── metadata/                     # Project Metadata
│   │   └── Hackathon Metadata.xlsx  
│   ├── processed/                    # Processed Data
│   │   ├── label_encoders_output.txt # Encoder information
│   │   ├── label_encoders.pkl        
│   │   ├── X_test.csv               # Test features
│   │   ├── X_train.csv              # Training features
│   │   ├── y_test.csv               # Test labels
│   │   └── y_train.csv              # Training labels
│   └── raw/                           # Raw Data Files
│       ├── drop_withdrawals.txt      # Withdrawal information
│       ├── eligibilities.txt         # Trial eligibility criteria
│       ├── facilities.txt            # Facility information
│       ├── reported_events.txt       # Adverse events data
│       └── usecase_3.csv      
├── models/                      
│   └── random_forest_model.pkl   # Trained model
├── notebooks/                 
│   ├── shap_dependence_plots/    # Contains features-vise SHAP Plots 
│   ├── model_explainability.ipynb    # Analysis Notebooks
│   └── shap_summary_plot.png
├── scripts/                     # Utility Scripts
│   ├── analyze_features.py      
│   ├── extract_label_encoder_info.py
│   └── extract_model_info.py
├── src/
│   ├── data_processing.py   # Data Pre-Processing Pipeline
│   └── model_training.py    # Script to train the model
│
├── venv/                 # Virtual Environment   
├── requirements.txt      # Project dependencies   
├── virtualenv.txt        # Environment configuration
└── README.md             # Project documentation

```

## Installation

1. Clone repository and navigate to project:
```bash
git clone https://github.com/Gem2005/Clinical-Trail-Status-Predicting-ML-Model.git
cd ps3_project
```

2. Create virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt 
pip install -r virtualenv.txt  # for installing specific verison of required modules and packages (exact version that we used)
```

## Data Processing

1. Ensure raw data files are in raw

2. Process data:
```bash
python src/data_processing.py
```

Key processing steps:
- Merges multiple data sources
- Handles missing values
- Encodes categorical variables
- Processes text features
- Saves processed data and encoders

## Model Training

Train the model:
```bash
python src/model_training.py
```

Features used:
- study_title
- criteria
- enrollment
- Allocation
- Intervention Model
- Masking
- Primary Purpose
- intervention
- condition

## API Usage

1. Start API server:
```bash
#run app/main.py
uvicorn app.main:app --reload
```

2. Access API documentation:
- Navigate to http://localhost:8000/docs

3. Make predictions:
```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
           "study_title": "Example Clinical Trial",
           "criteria": "Inclusion criteria...",
           "enrollment": 100,
           "Allocation": "Randomized",
           "Intervention_Model": "Parallel",
           "Masking": "Double",
           "Primary_Purpose": "Treatment",
           "intervention": "Drug therapy",
           "condition": "Cancer"
         }'
```

Example Response:
```json
{
  "prediction": "Completed",
  "explanation": {
    "top_contributing_features": {
      "enrollment": 0.245,
      "criteria": 0.189,
      "study_title": -0.156
    },
    "interpretation": "The model predicted Completed. enrollment increased likelihood by 0.245..."
  }
}
```

## Features

- Clinical trial completion prediction
- SHAP-based explanations
- Feature importance analysis
- REST API endpoints
- Preprocessing pipeline
- Jupyter notebooks for analysis

## Dependencies

- Python 3.7+
- FastAPI
- scikit-learn
- SHAP
- pandas
- numpy

## Development Guide

1. Code Structure:
- 

data_processing.py: Data pipeline
- 

model_training.py: Model training
- 

main.py: API endpoints

2. Adding Features:
- Update data processing in data_processing.py


- Retrain model using model_training.py


- Update API schema in main.py
