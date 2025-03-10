import pandas as pd
import numpy as np
import warnings
import gc
import os
import pickle
from tqdm import tqdm
warnings.filterwarnings('ignore')
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def unify_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Unify column names and values across datasets.
    1) Converts variations of 'nct_id' to 'nct_id'.
    2) Converts variations of 'study_status' to 'study_status'.
    3) Normalizes study status values, mapping unknown => 'not completed'.
    """
    column_map = {
        'study status': 'study_status',
        'study_status': 'study_status',
        'studystatus': 'study_status',
        'study design': 'study_design',
        'nct_id': 'nct_id',
        'criteria': 'criteria',
        'study title': 'study_title',
        'enrollment': 'enrollment',
        'conditions' : 'condition',
        'interventions' : 'intervention',
        'nct number': 'nct_id',
        'nctnumber': 'nct_id',
        'nct id': 'nct_id',
    }

    # Renaming columns if they appear in the map (case-insensitive)
    df.rename(columns={
        col: column_map[col.lower()]
        for col in df.columns if col.lower() in column_map
    }, inplace=True)

    # Map known study_status variants to 'completed' or 'not completed'
    if 'study_status' in df.columns:
        df['study_status'] = df['study_status'].astype(str).str.lower()
        status_map = {
            'complete': 'completed',
            'completed': 'completed',
            'terminated': 'not completed',
            'withdrawn': 'not completed',
            'suspended': 'not completed'
        }
        df['study_status'] = df['study_status'].map(status_map)
        df = df.dropna(subset=['study_status'])  

    return df

def read_file_in_chunks(filepath,
                        chunksize=10000,
                        delimiter=',',
                        usecols=None,
                        dtype=None,
                        low_memory=False):
    """
    Read large files in smaller chunks and unify columns. 
    For XLSX files, read directly. 
    Avoid specifying usecols if columns aren't present in the file.
    """
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return None

    try:
        chunks = []
        if filepath.endswith('.xlsx'):
            # Read Excel
            temp_df = pd.read_excel(filepath, dtype=dtype)
            temp_df.columns = [c.lower() for c in temp_df.columns]
            temp_df = unify_columns(temp_df)
            chunks.append(temp_df)
        else:
            # Count total lines for progress
            with open(filepath, 'r', encoding='utf-8') as f:
                total_rows = sum(1 for _ in f)

            # Read CSV/text in chunks
            chunk_iter = pd.read_csv(
                filepath,
                chunksize=chunksize,
                delimiter=delimiter,
                encoding='utf-8',
                usecols=None,
                dtype=dtype,
                low_memory=low_memory
            )

            with tqdm(total=max(1, total_rows // chunksize),
                      desc=f"Processing {filepath}") as pbar:
                for chunk in chunk_iter:
                    chunk.columns = [c.lower() for c in chunk.columns]
                    chunk = unify_columns(chunk)
                    if not chunk.empty:
                        chunks.append(chunk)
                    gc.collect()
                    pbar.update(1)

        if chunks:
            result = pd.concat(chunks, ignore_index=True)
            print(f"Loaded {len(result)} rows from {os.path.basename(filepath)}")
            return result
        else:
            print(f"No valid data found in {filepath}")
            return None

    except Exception as e:
        print(f"Error reading {filepath}: {str(e)}")
        return None

def load_data():
    """ Load raw files,and return a list of DataFrames. """
    files = [
        # Force 'criteria' from eligibilities.txt
        ("eligibilities.txt", "|"),
        ("drop_withdrawals.txt", "|"),
        ("facilities.txt", "|"),
        ("reported_events.txt", "|"),
        ("usecase_3_.csv", ","),
    ]

    dtypes = {
        "nct_id": "object"
    }

    datasets = []
    for fname, delim in files:
        filepath = os.path.join("data", "raw", fname)
        if delim:
            kwargs = {
                "delimiter": delim,
                "usecols": None,
                "dtype": dtypes,
                "low_memory": False,
            }
        else:
            # XLSX or no delimiter
            kwargs = {
                "usecols": None,
                "dtype": dtypes,
            }
        df = read_file_in_chunks(filepath, **kwargs)
        if df is not None and not df.empty:
            datasets.append(df)
    return datasets

def merge_datasets(datasets):
    """
    Merge all datasets on 'nct_id', ensuring uniqueness and correct 'study_status'.
    This way, 'criteria' from eligibilities.txt will be combined properly.
    """
    if not datasets:
        return None

    datasets_with_status = []
    datasets_without_status = []

    for idx, df in enumerate(datasets):
        # Drop unnamed columns
        df.drop(columns=[col for col in df.columns if col.startswith('unnamed')], errors='ignore', inplace=True)

        if "nct_id" not in df.columns:
            print(f"Dataset {idx + 1} is missing 'nct_id' column.")
            continue

        initial_count = len(df)
        df = df.drop_duplicates(subset="nct_id")
        final_count = len(df)
        duplicates_dropped = initial_count - final_count
        if duplicates_dropped > 0:
            print(f"Dropped {duplicates_dropped} duplicates in dataset {idx + 1}")

        if "study_status" in df.columns:
            df["study_status"] = df["study_status"].astype(str).str.lower()
            datasets_with_status.append(df)
        else:
            df["study_status"] = "not completed"
            datasets_without_status.append(df)

    merged = pd.concat(datasets_with_status + datasets_without_status, ignore_index=True)
    merged = merged.drop_duplicates(subset="nct_id")
    print(f"Initialized merged dataset with {len(merged)} records.")

    return merged

def split_and_expand(df: pd.DataFrame, column: str, delimiter: str = '|') -> pd.DataFrame:
    """
    Splits the values in a column using a delimiter and expands them into multiple rows.
    """
    if column in df.columns:
        expanded = df[column].str.split(delimiter).explode().reset_index(drop=True)
        df = df.drop(columns=[column]).join(expanded.to_frame(column))
    return df

def preprocess_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess columns like `intervention`, `study_design`, and `condition`
    by splitting and encoding them as subfeatures.
    """
    # Split and expand the specified columns
    # --- Process study_design ---
    if 'study_design' in df.columns:
        design_subfeatures = ['Allocation', 'Intervention Model', 'Masking', 'Primary Purpose']
        for feature in design_subfeatures:
            df[feature] = df['study_design'].str.extract(f"{feature}: ([^|]*)")
        df[design_subfeatures] = df[design_subfeatures].fillna('Unknown')
        # Drop the original 'study_design' column
        df.drop(columns=['study_design'], inplace=True)
        # Rename columns
        df.rename(columns={'Intervention Model': 'Intervention_Model', 'Primary Purpose': 'Primary_Purpose'}, inplace=True)

    df = split_and_expand(df, 'intervention', '|')
    df = split_and_expand(df, 'condition', '|')

    # Normalize the text (remove leading/trailing spaces)
    for col in ['intervention', 'condition']:
        if col in df.columns:
            df[col] = df[col].str.strip()

    if 'criteria' in df.columns:
        df['criteria'] = df['criteria'].str.replace(r'[~\-#^*`]', '', regex=True).str.strip()
    return df

def impute_enrollment(df):
    """Helper function to impute enrollment values using nearby known values"""
    # Convert enrollment to numeric, marking 'Unknown' as NaN
    df['enrollment'] = pd.to_numeric(df['enrollment'].replace('Unknown', np.nan))
    
    # Create a copy of the original index for reference
    df['original_index'] = df.index
    
    # Sort by original index to maintain order
    df = df.sort_values('original_index')
    
    # For each NaN value
    for idx in df[df['enrollment'].isna()].index:
        # Get 3 values before and 3 after
        start_idx = max(0, idx - 3)
        end_idx = min(len(df), idx + 4)
        
        # Get nearby known values
        nearby_values = df.loc[start_idx:end_idx, 'enrollment'].dropna()
        
        if len(nearby_values) > 0:
            # Impute with median of nearby values
            df.loc[idx, 'enrollment'] = nearby_values.median()
    
    # Fill any remaining NaN with overall median
    overall_median = df['enrollment'].median()
    df['enrollment'] = df['enrollment'].fillna(overall_median)
    
    # Remove helper column
    df = df.drop('original_index', axis=1)
    
    return df

def preprocess_data(merged: pd.DataFrame) -> pd.DataFrame:
    """
    Keep only relevant columns, handle missing values, encode categorical features.
    """
    # 1) Keep only relevant columns
    relevant_cols = [
        "study_title",
        "study_status",
        "criteria",
        "study_design",
        "condition",
        "intervention",
        "enrollment"
    ]
    merged = merged.reindex(columns=relevant_cols, fill_value="Unknown")
    
    # 2) Impute enrollment values
    merged = impute_enrollment(merged)

    # 3) Fill missing values for other columns
    for col in merged.columns:
        if col != 'enrollment':  # Skip enrollment as it's already handled
            merged[col] = merged[col].fillna("Unknown")

    merged = preprocess_columns(merged)

    # 4) Encode categorical features except 'study_status' and 'enrollment'
    label_encoders = {}
    categorical_cols = [c for c in merged.select_dtypes(include=["object", "category"]).columns if c not in ["study_status", "enrollment"]]
    for col in categorical_cols:
        le = LabelEncoder()
        merged[col] = le.fit_transform(merged[col].astype(str))
        label_encoders[col] = le

    # 5) Save label encoders
    os.makedirs("data/processed", exist_ok=True)
    with open("data/processed/label_encoders.pkl", "wb") as f:
        pickle.dump(label_encoders, f)

    return merged

def split_data(merged: pd.DataFrame):
    """
    Split data into train/test sets without applying SMOTE.
    Returns: (X_train, X_test, y_train, y_test)
    """
    if 'study_status' not in merged.columns:
        raise ValueError("'study_status' column not found in data")

    X = merged.drop('study_status', axis=1)
    y = merged['study_status']

    print("\nInitial class distribution:")
    print(y.value_counts())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # No SMOTE applied here
    return X_train, X_test, y_train, y_test

def save_processed_data(X_train, X_test, y_train, y_test):
    """Save all processed datasets."""
    os.makedirs('data/processed', exist_ok=True)
    X_train.to_csv('data/processed/X_train.csv', index=False)
    X_test.to_csv('data/processed/X_test.csv', index=False)
    y_train.to_csv('data/processed/y_train.csv', index=False)
    y_test.to_csv('data/processed/y_test.csv', index=False)
    print("\nSuccessfully saved all processed datasets:")
    print("- data/processed/X_train.csv")
    print("- data/processed/X_test.csv")
    print("- data/processed/y_train.csv")
    print("- data/processed/y_test.csv")

def main():
    """Main data processing entry point."""
    try:
        # 1) Load data
        datasets = load_data()
        if not datasets:
            raise ValueError("No data loaded from any file.")

        # 2) Merge
        merged = merge_datasets(datasets)
        if merged is None or merged.empty:
            raise ValueError("Merging resulted in no data.")

        # 3) Preprocess
        merged = preprocess_data(merged)

        # 4) Split
        X_train, X_test, y_train, y_test = split_data(merged)

        # 5) Save
        save_processed_data(X_train, X_test, y_train, y_test)

    except Exception as e:
        print(f"Error: {str(e)}")
        raise

if __name__ == "__main__":
    main()
