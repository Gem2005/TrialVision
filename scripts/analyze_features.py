import joblib
import pandas as pd
import numpy as np

def get_feature_importance():
    model = joblib.load('models/random_forest_model.pkl')
    feature_names = model.feature_names_in_
    importances = model.feature_importances_
    
    feature_imp = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values('importance', ascending=False)
    
    return feature_imp.head(10)  # Top 10 important features

if __name__ == "__main__":
    print(get_feature_importance())