import os
import json

folder_path = "."
output_file = "combined.json"
combined_data = []

for filename in os.listdir(folder_path):
    if filename.endswith(".json"):
        file_path = os.path.join(folder_path, filename)
        with open(file_path, "r") as file:
            data = json.load(file)
            combined_data.append(data)  # Append each loaded JSON data to the combined_data list

with open(output_file, "w") as output:
    json.dump(combined_data, output)
