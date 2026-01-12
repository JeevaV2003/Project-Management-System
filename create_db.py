import pymysql

try:
    print("Connecting to MySQL...")
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='1979',
        port=3306
    )
    cursor = conn.cursor()
    print("Creating database if not exists...")
    cursor.execute("CREATE DATABASE IF NOT EXISTS project_manager_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    print("Database project_manager_db created or already exists.")
    conn.close()
except Exception as e:
    print(f"Error creating database: {e}")
