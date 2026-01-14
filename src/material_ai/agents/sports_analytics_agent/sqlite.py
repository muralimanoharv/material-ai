import sqlite3
import random
from datetime import datetime, timedelta


def create_db():
    conn = sqlite3.connect("sports_analytics.db")
    cursor = conn.cursor()

    # 1. Create Tables
    cursor.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            age INTEGER,
            gender TEXT,
            city TEXT,
            fav_sport TEXT,
            subscription_tier TEXT
        );

        CREATE TABLE IF NOT EXISTS user_stats (
            user_id INTEGER PRIMARY KEY,
            stamina_score INTEGER,  -- 0-100
            strength_score INTEGER,
            speed_score INTEGER,
            agility_score INTEGER,
            flexibility_score INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT,
            category TEXT,
            event_date DATE
        );

        CREATE TABLE IF NOT EXISTS registrations (
            user_id INTEGER,
            event_id INTEGER,
            registration_date DATE,
            fee_paid FLOAT,
            PRIMARY KEY (user_id, event_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (event_id) REFERENCES events (id)
        );

        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            log_date DATE,
            steps_count INTEGER,
            calories_burned INTEGER,
            active_minutes INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    """
    )

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
    sports = ["Cricket", "Football", "Badminton", "Tennis", "Basketball", "Swimming"]
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
            "INSERT INTO events (event_name, category, event_date) VALUES (?, ?, ?)",
            (name, cat, "2026-01-14"),
        )

    # 4. Populate 100 Users & Related Data
    for i in range(1, 101):
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
                          VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (fname, lname, age, gender, city, sport, tier),
        )

        user_id = cursor.lastrowid

        # UserStats (1:1) - Perfect for Radar Charts
        cursor.execute(
            """INSERT INTO user_stats VALUES (?, ?, ?, ?, ?, ?)""",
            (
                user_id,
                random.randint(50, 95),
                random.randint(40, 90),
                random.randint(60, 98),
                random.randint(55, 85),
                random.randint(30, 90),
            ),
        )

        # Activity Logs (Many:1) - Perfect for Line, Area, Multi-axis Charts
        start_date = datetime(2026, 1, 1)
        for d in range(10):
            log_date = (start_date + timedelta(days=d)).strftime("%Y-%m-%d")
            steps = random.randint(3000, 15000)
            cursor.execute(
                """INSERT INTO activity_logs (user_id, log_date, steps_count, calories_burned, active_minutes) 
                              VALUES (?, ?, ?, ?, ?)""",
                (user_id, log_date, steps, int(steps / 20), random.randint(20, 120)),
            )

        # Registrations (Many:Many) - Perfect for Bubble/Scatter Charts
        num_events = random.randint(1, 3)
        enrolled_events = random.sample(range(1, 6), num_events)
        for e_id in enrolled_events:
            cursor.execute(
                """INSERT INTO registrations VALUES (?, ?, ?, ?)""",
                (user_id, e_id, "2026-01-10", random.choice([0, 499, 999])),
            )

    conn.commit()
    conn.close()
    print("sports_analytics.db created successfully with 100 users.")


if __name__ == "__main__":
    create_db()
