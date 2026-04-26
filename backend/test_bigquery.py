"""Test script to check BigQuery data structure"""
from services.bigquery_service import BigQueryService

service = BigQueryService()

# Test 1: Get schema info
print("Testing BigQuery connection...")
print()

# Test 2: Get a sample record
query = "SELECT * FROM `los-ticones-u-hack.u_scout.v_master_stats` LIMIT 1"
df = service.client.query(query).to_dataframe()

print(f"✅ Successfully connected! Found {len(df.columns)} columns")
print()
print("Sample columns:")
for col in list(df.columns)[:20]:
    print(f"  - {col}")

print()
print("Testing get_all_matches...")
matches = service.get_all_matches(limit=5)
print(f"Found {len(matches)} matches:")
for match in matches:
    print(f"  - {match['name']}")
