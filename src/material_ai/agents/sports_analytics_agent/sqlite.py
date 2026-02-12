import sqlite3
import random

# 1. Connect to (or create) the database file
conn = sqlite3.connect("sports_data.db")
cursor = conn.cursor()

# 2. Create the table
cursor.execute("""
    CREATE TABLE IF NOT EXISTS sports_analytics (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        favourite_sport TEXT,
        country TEXT
    )
""")

# 3. Data pools for randomization
first_names = [
    "Liam",
    "Emma",
    "Noah",
    "Olivia",
    "Aarav",
    "Sofia",
    "Yuki",
    "Lucas",
    "Amara",
    "Mateo",
    "Chen",
    "Fatima",
    "Hans",
    "Chloe",
    "Arjun",
]
last_names = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Sharma",
    "Garcia",
    "Tanaka",
    "Müller",
    "Okonkwo",
    "Silva",
    "Patel",
    "Rossi",
    "Zhang",
    "Ivanov",
]
sports = [
    "Football",
    "Basketball",
    "Tennis",
    "Cricket",
    "Rugby",
    "Swimming",
    "Athletics",
    "Formula 1",
    "Volleyball",
    "Baseball",
    "E-Sports",
    "Ice Hockey",
]
countries = [
    "USA",
    "UK",
    "India",
    "Australia",
    "Brazil",
    "Canada",
    "Germany",
    "Japan",
    "France",
    "South Africa",
    "Mexico",
    "Italy",
    "China",
    "Kenya",
]
genders = ["Male", "Female", "Non-binary"]

# 4. Generate 100 rows
data_to_insert = []
for _ in range(100):
    record = (
        random.choice(first_names),
        random.choice(last_names),
        random.randint(18, 65),
        random.choice(genders),
        random.choice(sports),
        random.choice(countries),
    )
    data_to_insert.append(record)

# 5. Insert data using a bulk command
cursor.executemany(
    """
    INSERT INTO sports_analytics (first_name, last_name, age, gender, favourite_sport, country)
    VALUES (?, ?, ?, ?, ?, ?)
""",
    data_to_insert,
)

# 6. Save (commit) and close
conn.commit()
conn.close()

print("Successfully created 'sports_data.db' with 100 rows of data.")
