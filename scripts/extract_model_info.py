import joblib

def get_model_features():
    model = joblib.load('models/random_forest_model.pkl')
    print("Model feature order:", model.feature_names_in_)

if __name__ == "__main__":
    get_model_features()