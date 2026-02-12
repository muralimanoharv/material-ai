import random
from datetime import datetime, timedelta
from google.cloud import bigquery

# --- Configuration ---
PROJECT_ID = "healthcare-indsoln-arg-481412"
DATASET_ID = "sports_analytics_ds"
LOCATION = "US"

client = bigquery.Client(project=PROJECT_ID)

# --- Schema Definitions with Metadata ---
# Architect Note: We explicitly mention Primary/Foreign keys in descriptions
# so the AI Agent knows how to JOIN these tables.

SCHEMAS = {
    "users": {
        "description": "Master table containing user profile information and subscription tiers.",
        "fields": [
            bigquery.SchemaField(
                "id",
                "INTEGER",
                mode="REQUIRED",
                description="Primary Key: Unique identifier for the user.",
            ),
            bigquery.SchemaField(
                "first_name", "STRING", description="User's given name."
            ),
            bigquery.SchemaField(
                "last_name", "STRING", description="User's family name."
            ),
            bigquery.SchemaField("age", "INTEGER", description="User's age in years."),
            bigquery.SchemaField(
                "gender", "STRING", description="User's self-identified gender."
            ),
            bigquery.SchemaField("city", "STRING", description="City of residence."),
            bigquery.SchemaField(
                "fav_sport",
                "STRING",
                description="Primary sport of interest for the user.",
            ),
            bigquery.SchemaField(
                "subscription_tier",
                "STRING",
                description="Level of access: Free, Pro, or Elite.",
            ),
        ],
    },
    "user_stats": {
        "description": "Fitness performance metrics for users. 1:1 relationship with users table.",
        "fields": [
            bigquery.SchemaField(
                "user_id",
                "INTEGER",
                mode="REQUIRED",
                description="Primary Key & Foreign Key: Links to users.id.",
            ),
            bigquery.SchemaField(
                "stamina_score",
                "INTEGER",
                description="Score from 0-100 measuring cardiovascular endurance.",
            ),
            bigquery.SchemaField(
                "strength_score",
                "INTEGER",
                description="Score from 0-100 measuring physical power.",
            ),
            bigquery.SchemaField(
                "speed_score",
                "INTEGER",
                description="Score from 0-100 measuring movement velocity.",
            ),
            bigquery.SchemaField(
                "agility_score",
                "INTEGER",
                description="Score from 0-100 measuring change of direction efficiency.",
            ),
            bigquery.SchemaField(
                "flexibility_score",
                "INTEGER",
                description="Score from 0-100 measuring range of motion.",
            ),
        ],
    },
    "events": {
        "description": "Catalog of all sporting events and competitions.",
        "fields": [
            bigquery.SchemaField(
                "id",
                "INTEGER",
                mode="REQUIRED",
                description="Primary Key: Unique identifier for the event.",
            ),
            bigquery.SchemaField(
                "event_name", "STRING", description="The public name of the event."
            ),
            bigquery.SchemaField(
                "category",
                "STRING",
                description="The sport category (e.g., Running, Swimming).",
            ),
            bigquery.SchemaField(
                "event_date", "DATE", description="The scheduled date for the event."
            ),
        ],
    },
    "registrations": {
        "description": "Many-to-Many mapping of users to events including payment data.",
        "fields": [
            bigquery.SchemaField(
                "user_id",
                "INTEGER",
                mode="REQUIRED",
                description="Foreign Key: Links to users.id.",
            ),
            bigquery.SchemaField(
                "event_id",
                "INTEGER",
                mode="REQUIRED",
                description="Foreign Key: Links to events.id.",
            ),
            bigquery.SchemaField(
                "registration_date",
                "DATE",
                description="The date the user signed up for the event.",
            ),
            bigquery.SchemaField(
                "fee_paid",
                "FLOAT",
                description="The amount paid for registration (0 if free).",
            ),
        ],
    },
    "activity_logs": {
        "description": "Time-series daily activity data for users.",
        "fields": [
            bigquery.SchemaField(
                "user_id",
                "INTEGER",
                mode="REQUIRED",
                description="Foreign Key: Links to users.id.",
            ),
            bigquery.SchemaField(
                "log_date", "DATE", description="The date the activity was recorded."
            ),
            bigquery.SchemaField(
                "steps_count",
                "INTEGER",
                description="Total steps taken in a 24-hour period.",
            ),
            bigquery.SchemaField(
                "calories_burned",
                "INTEGER",
                description="Estimated calories burned based on activity.",
            ),
            bigquery.SchemaField(
                "active_minutes",
                "INTEGER",
                description="Total time spent in moderate-to-vigorous physical activity.",
            ),
        ],
    },
}


def create_and_load(table_name, data):
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
    schema_info = SCHEMAS[table_name]

    # 1. Create/Update Table metadata first
    table = bigquery.Table(table_id, schema=schema_info["fields"])
    table.description = schema_info["description"]

    # Ensure dataset exists
    client.create_dataset(
        bigquery.Dataset(f"{PROJECT_ID}.{DATASET_ID}"), exists_ok=True
    )

    # Create or update the table structure and description
    try:
        client.create_table(table, exists_ok=True)
        # If table existed, update the description specifically
        table = client.get_table(table_id)
        table.description = schema_info["description"]
        table.schema = schema_info["fields"]
        client.update_table(table, ["description", "schema"])
    except Exception as e:
        print(f"Metadata update failed for {table_name}: {e}")

    # 2. Load Data
    job_config = bigquery.LoadJobConfig(
        schema=schema_info["fields"],
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )

    job = client.load_table_from_json(data, table_id, job_config=job_config)
    job.result()
    print(f"Successfully loaded {len(data)} rows into {table_name} with metadata.")


def generate_and_migrate():
    # --- Synthetic Data Generation ---
    first_names = [
        "Arjun",
        "Aditi",
        "Rohan",
        "Sana",
        "Vikram",
        "Priya",
        "Kabir",
        "Ananya",
        "Ishaan",
        "Meera",
    ]
    last_names = [
        "Sharma",
        "Verma",
        "Goel",
        "Nair",
        "Patel",
        "Gupta",
        "Das",
        "Reddy",
        "Singh",
        "Iyer",
    ]

    users, stats, logs, regs = [], [], [], []
    events = [
        {
            "id": 1,
            "event_name": "Summer Marathon",
            "category": "Running",
            "event_date": "2026-01-14",
        },
        {
            "id": 2,
            "event_name": "Monsoon Cup",
            "category": "Football",
            "event_date": "2026-01-14",
        },
        {
            "id": 3,
            "event_name": "Indo-Open",
            "category": "Badminton",
            "event_date": "2026-01-14",
        },
        {
            "id": 4,
            "event_name": "Pro-League Draft",
            "category": "Basketball",
            "event_date": "2026-01-14",
        },
        {
            "id": 5,
            "event_name": "Aquatic Meet",
            "category": "Swimming",
            "event_date": "2026-01-14",
        },
    ]

    for i in range(1, 101):
        users.append(
            {
                "id": i,
                "first_name": random.choice(first_names),
                "last_name": random.choice(last_names),
                "age": random.randint(18, 45),
                "gender": random.choice(["Male", "Female", "Non-binary"]),
                "city": random.choice(["Mumbai", "Delhi", "Pune"]),
                "fav_sport": "Cricket",
                "subscription_tier": "Pro",
            }
        )
        stats.append(
            {
                "user_id": i,
                "stamina_score": random.randint(50, 95),
                "strength_score": 70,
                "speed_score": 80,
                "agility_score": 60,
                "flexibility_score": 50,
            }
        )
        for d in range(5):
            logs.append(
                {
                    "user_id": i,
                    "log_date": (datetime(2026, 1, 1) + timedelta(days=d)).strftime(
                        "%Y-%m-%d"
                    ),
                    "steps_count": random.randint(5000, 10000),
                    "calories_burned": 300,
                    "active_minutes": 45,
                }
            )
        regs.append(
            {
                "user_id": i,
                "event_id": random.randint(1, 5),
                "registration_date": "2026-01-10",
                "fee_paid": 499.0,
            }
        )

    # --- Load Everything ---
    create_and_load("users", users)
    create_and_load("user_stats", stats)
    create_and_load("events", events)
    create_and_load("registrations", regs)
    create_and_load("activity_logs", logs)


if __name__ == "__main__":
    generate_and_migrate()
