"""Check actual BigQuery schema"""
from services.bigquery_service import BigQueryService
import json

service = BigQueryService()

# Get one record and print its structure
query = "SELECT * FROM `los-ticones-u-hack.u_scout.v_master_stats` LIMIT 1"
df = service.client.query(query).to_dataframe()

record = df.iloc[0]

print("Record structure:")
print(f"shortName: {record['shortName']}")
print(f"position: {record['position']}")
print(f"match_name: {record['match_name']}")
print()

# Check if 'total' is a column
if 'total' in record:
    print("TOTAL field type:", type(record['total']))
    print("TOTAL field value:", record['total'])
    print()

# Print all columns
print("All available columns:")
for col in df.columns:
    print(f"  - {col}")
