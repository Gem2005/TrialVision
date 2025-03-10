import pandas as pd
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score
from sklearn.model_selection import GridSearchCV

# Define paths for processed data
X_TRAIN_PATH = 'data/processed/X_train.csv'
X_TEST_PATH = 'data/processed/X_test.csv'
Y_TRAIN_PATH = 'data/processed/y_train.csv'
Y_TEST_PATH = 'data/processed/y_test.csv'

MODEL_SAVE_PATH = 'models/random_forest_model.pkl'

# Load processed data
def load_data():
    X_train = pd.read_csv(X_TRAIN_PATH)
    X_test = pd.read_csv(X_TEST_PATH)
    y_train = pd.read_csv(Y_TRAIN_PATH).values.ravel()  # Flatten the target column
    y_test = pd.read_csv(Y_TEST_PATH).values.ravel()  # Flatten the target column

    print("Data loaded successfully.")
    print(f"Training set: {X_train.shape[0]} samples, {X_train.shape[1]} features.")
    print(f"Test set: {X_test.shape[0]} samples, {X_test.shape[1]} features.")

    return X_train, X_test, y_train, y_test

# Train the model
def train_model(X_train, y_train):
    print("Training Random Forest model...")

    # Initial model setup
    rf = RandomForestClassifier(random_state=42)

    # Parameter tuning (Grid Search)
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    }

    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
    grid_search.fit(X_train, y_train)

    print("Best parameters found:", grid_search.best_params_)
    best_rf_model = grid_search.best_estimator_

    # Save the trained model
    os.makedirs('models', exist_ok=True)
    with open(MODEL_SAVE_PATH, 'wb') as f:
        pickle.dump(best_rf_model, f)

    print(f"Model saved to {MODEL_SAVE_PATH}")

    return best_rf_model

# Evaluate the model
def evaluate_model(model, X_test, y_test):
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    accuracy = accuracy_score(y_test, y_pred)
    auc_roc = roc_auc_score(y_test, y_pred_proba)

    print(f"Accuracy: {accuracy:.4f}")
    print(f"AUC-ROC: {auc_roc:.4f}")

# Main function
def main():
    try:
        X_train, X_test, y_train, y_test = load_data()
        model = train_model(X_train, y_train)
        evaluate_model(model, X_test, y_test)
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
