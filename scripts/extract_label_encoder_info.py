# extract_features.py
import pickle

output_file_path = 'data/processed/label_encoders_output.txt'

# Load label encoders
with open('data/processed/label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)

# Save label encoders' classes to a text file
with open(output_file_path, 'w', encoding='utf-8') as output_file:
    for column, encoder in label_encoders.items():
        output_file.write(f"Label Encoder for '{column}':\n")
        output_file.write(", ".join(encoder.classes_))
        output_file.write("\n\n")

print(f"Label encoders' classes saved to {output_file_path}")

