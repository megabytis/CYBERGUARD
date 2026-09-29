import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.database import engine, Base, SessionLocal
from app.models import User, Profile, UserPreferences, ScanRecord, ScanFinding
from app.security import hash_password
from app.config import settings
from app.core.analyzer import ThreatAnalyzer

async def seed_database():
    """Initializes tables, provisions the controlled demo account, and seeds baseline scans if empty."""
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if demo admin already exists
        stmt = select(User).where(User.email == settings.demo_admin_email)
        user = db.execute(stmt).scalar_one_or_none()

        if not user:
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
            print(f"[CYBERGUARD] Seed initialized successfully for authorized identity: {settings.demo_admin_email}")
        else:
            print("[CYBERGUARD] Database verified: Authorized demo account exists.")

        # Check if database has baseline defensive records
        scan_stmt = select(func.count(ScanRecord.id)).where(ScanRecord.user_id == user.id)
        existing_scans_count = db.execute(scan_stmt).scalar() or 0

        if existing_scans_count == 0:
            print("[CYBERGUARD] Initializing realistic baseline defensive scans...")
            baseline_payloads = [
                ("url", "http://secure-login.paypal.account-verify.xyz/login?session=8842"),
                ("email", "From: CEO Executive Office <tim.cook@apple-operations-internal.cc>\nReply-To: wire-processing@secure-banking-portal.net\nSubject: URGENT: Immediate Wire Transfer Required for Acquisition Closing\n\nPlease execute the attached international wire transfer of $840,000 before 4 PM UTC.\nDo not discuss with other staff until public disclosure. Immediate verification needed."),
                ("auth_log", "Sep 27 11:04:12 auth-server sshd[1401]: Failed password for invalid user admin from 198.51.100.44 port 41232 ssh2\nSep 27 11:04:14 auth-server sshd[1402]: Failed password for invalid user root from 198.51.100.44 port 41234 ssh2\nSep 27 11:04:16 auth-server sshd[1403]: Failed password for invalid user oracle from 198.51.100.44 port 41236 ssh2\nSep 27 11:04:18 auth-server sshd[1404]: Failed password for invalid user deploy from 198.51.100.44 port 41238 ssh2\nSep 27 11:04:20 auth-server sshd[1405]: Accepted password for root from 198.51.100.44 port 41240 ssh2"),
                ("message", "USPS Notice: Your package delivery is blocked due to an unpaid $1.99 customs fee. Confirm your address and card at bit.ly/usps-redelivery-tax to avoid return."),
                ("network", "2026-09-27T11:00:01Z 10.0.4.15:49182 -> 203.0.113.88:4444 PROTO=TCP BYTES_OUT=1420 BYTES_IN=310\n2026-09-27T11:00:31Z 10.0.4.15:49184 -> 203.0.113.88:4444 PROTO=TCP BYTES_OUT=1420 BYTES_IN=310"),
                ("url", "https://intranet.cyberguard.internal/security/defense-policy"),
            ]

            for input_type, payload in baseline_payloads:
                try:
                    res = await ThreatAnalyzer.analyze(input_type=input_type, payload=payload, enable_ai=False)
                    scan_rec = ScanRecord(
                        user_id=user.id,
                        input_type=res["input_type"],
                        input_summary=res["input_summary"],
                        input_payload=res["input_payload"],
                        risk_score=res["risk_score"],
                        risk_level=res["risk_level"],
                        heuristic_score=res["heuristic_score"],
                        ml_score=res["ml_score"],
                        detection_mode=res["detection_mode"],
                        executive_summary=res["executive_summary"],
                        ai_explanation=res["ai_explanation"],
                        recommendations=res["recommendations"],
                        metadata_payload=res["metadata_payload"],
                        processing_time_ms=res["processing_time_ms"],
                    )
                    db.add(scan_rec)
                    db.flush()

                    for f in res["findings"]:
                        db.add(
                            ScanFinding(
                                scan_id=scan_rec.id,
                                category=f.category,
                                title=f.title,
                                description=f.description,
                                severity=f.severity,
                                confidence=f.confidence,
                                rule_id=f.rule_id,
                            )
                        )
                except Exception as ex:
                    print(f"[CYBERGUARD] Seed baseline item failed: {ex}")

            db.commit()
            print("[CYBERGUARD] Baseline telemetry ready: 6 real computed scans provisioned.")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
