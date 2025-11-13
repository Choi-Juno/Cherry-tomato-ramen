import sys
import os
sys.path.insert(0, '/Users/junochoi/Documents/University/1학년_2학기/cherry_tomato_ramen')

from ml-service.pipeline.data_loader import DataLoader
from ml-service.pipeline.preprocessor import Preprocessor

# Test data loading
data_path = "ml-service/data/student_spending.csv"
print(f"Checking if file exists: {os.path.exists(data_path)}")

if os.path.exists(data_path):
    loader = DataLoader(data_path)
    df = loader.load_data()
    print(f"✅ Data loaded: {df.shape}")
else:
    print(f"❌ File not found: {data_path}")
