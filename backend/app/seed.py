from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import engine, Base, SessionLocal
from app.models import User, Profile, UserPreferences
from app.security import hash_password
from app.config import settings

def seed_database():
    """Initializes tables and provisions the controlled demo account."""
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if demo admin already exists
        stmt = select(User).where(User.email == settings.demo_admin_email)
        existing_user = db.execute(stmt).scalar_one_or_none()

        if not existing_user:
            hashed_pwd = hash_password(settings.demo_admin_password)
            user = User(
                email=settings.demo_admin_email,
                password_hash=hashed_pwd,
                role="admin",
                is_active=True,
            )
            db.add(user)
            db.flush()

            # Create default profile
            profile = Profile(
                user_id=user.id,
                full_name=settings.demo_admin_name,
                organization=settings.demo_admin_org,
                department="Tier-3 Incident Response",
            )
            db.add(profile)

            # Create default preferences
            preferences = UserPreferences(
                user_id=user.id,
                enable_groq_ai=True,
                groq_model=settings.groq_model,
                heuristic_weight=settings.heuristic_weight,
                ml_weight=settings.ml_weight,
                reduced_motion=False,
            )
            db.add(preferences)

            db.commit()
            # Do NOT print the password!
            print(f"[CYBERGUARD] Seed initialized successfully for authorized identity: {settings.demo_admin_email}")
        else:
            print("[CYBERGUARD] Database verified: Authorized demo account exists.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
