"""
Create an admin account.

Usage:
    python -m scripts.create_admin <username> <password>

There is no public "register as admin" API endpoint on purpose — anyone
on the internet could hit it otherwise. Admin accounts are created this
way, run by someone with access to the server/database.
"""

import sys

from app.auth import hash_password
from app.database import SessionLocal
from app.models import Admin


def main():
    if len(sys.argv) != 3:
        print("Usage: python -m scripts.create_admin <username> <password>")
        sys.exit(1)

    username, password = sys.argv[1], sys.argv[2]
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    db = SessionLocal()
    try:
        if db.query(Admin).filter(Admin.username == username).first():
            print(f"An admin named '{username}' already exists.")
            sys.exit(1)

        admin = Admin(username=username, hashed_password=hash_password(password))
        db.add(admin)
        db.commit()
        print(f"Created admin '{username}'.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
