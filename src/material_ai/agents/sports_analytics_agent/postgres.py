import psycopg2
import random
from datetime import datetime, timedelta

# Database Connection Configuration
DB_CONFIG = {
    "dbname": "my_database",
    "user": "admin",
    "password": "password123",
    "host": "localhost",
    "port": "5432",
}


def create_db():
    try:
        # Connect to Postgres
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1. Create Tables
        # PostgreSQL uses SERIAL for auto-incrementing primary keys
        cursor.execute("""
            DROP TABLE IF EXISTS activity_logs;
            DROP TABLE IF EXISTS registrations;
            DROP TABLE IF EXISTS user_stats;
            DROP TABLE IF EXISTS events;
            DROP TABLE IF EXISTS users;

            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                age INTEGER,
                gender TEXT,
                city TEXT,
                fav_sport TEXT,
                subscription_tier TEXT
            );

            CREATE TABLE user_stats (
                user_id INTEGER PRIMARY KEY REFERENCES users(id),
                stamina_score INTEGER,
                strength_score INTEGER,
                speed_score INTEGER,
                agility_score INTEGER,
                flexibility_score INTEGER
            );

            CREATE TABLE events (
                id SERIAL PRIMARY KEY,
                event_name TEXT,
                category TEXT,
                event_date DATE
            );

            CREATE TABLE registrations (
                user_id INTEGER REFERENCES users(id),
                event_id INTEGER REFERENCES events(id),
                registration_date DATE,
                fee_paid DECIMAL(10, 2),
                PRIMARY KEY (user_id, event_id)
            );

            CREATE TABLE activity_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                log_date DATE,
                steps_count INTEGER,
                calories_burned INTEGER,
                active_minutes INTEGER
            );
        """)

        # 2. Synthetic Data Components
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
        cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune"]
        sports = [
            "Cricket",
            "Football",
            "Badminton",
            "Tennis",
            "Basketball",
            "Swimming",
        ]
        tiers = ["Free", "Pro", "Elite"]
        event_list = [
            ("Summer Marathon", "Running"),
            ("Monsoon Cup", "Football"),
            ("Indo-Open", "Badminton"),
            ("Pro-League Draft", "Basketball"),
            ("Aquatic Meet", "Swimming"),
        ]

        # 3. Populate Events
        for name, cat in event_list:
            cursor.execute(
                "INSERT INTO events (event_name, category, event_date) VALUES (%s, %s, %s)",
                (name, cat, "2026-01-14"),
            )

        # 4. Populate 100 Users & Related Data
        for _ in range(100):
            # User Table
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            age = random.randint(18, 45)
            gender = random.choice(["Male", "Female", "Non-binary"])
            city = random.choice(cities)
            sport = random.choice(sports)
            tier = random.choice(tiers)

            cursor.execute(
                """INSERT INTO users (first_name, last_name, age, gender, city, fav_sport, subscription_tier) 
                              VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (fname, lname, age, gender, city, sport, tier),
            )

            user_id = cursor.fetchone()[0]

            # UserStats
            cursor.execute(
                """INSERT INTO user_stats VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    user_id,
                    random.randint(50, 95),
                    random.randint(40, 90),
                    random.randint(60, 98),
                    random.randint(55, 85),
                    random.randint(30, 90),
                ),
            )

            # Activity Logs
            start_date = datetime(2026, 1, 1)
            for d in range(10):
                log_date = (start_date + timedelta(days=d)).strftime("%Y-%m-%d")
                steps = random.randint(3000, 15000)
                cursor.execute(
                    """INSERT INTO activity_logs (user_id, log_date, steps_count, calories_burned, active_minutes) 
                                  VALUES (%s, %s, %s, %s, %s)""",
                    (
                        user_id,
                        log_date,
                        steps,
                        int(steps / 20),
                        random.randint(20, 120),
                    ),
                )

            # Registrations
            num_events = random.randint(1, 3)
            enrolled_events = random.sample(range(1, 6), num_events)
            for e_id in enrolled_events:
                cursor.execute(
                    """INSERT INTO registrations (user_id, event_id, registration_date, fee_paid) 
                                  VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING""",
                    (user_id, e_id, "2026-01-10", random.choice([0, 499, 999])),
                )

        conn.commit()
        print("PostgreSQL database populated successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()


if __name__ == "__main__":
    create_db()
