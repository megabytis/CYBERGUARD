from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import User, UserPreferences, Profile
from app.schemas import PreferencesSchema, PreferencesUpdateRequest, ProfileSchema
from app.security import get_current_user

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=PreferencesSchema)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves current user's security engine preferences."""
    if not current_user.preferences:
        pref = UserPreferences(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
        return pref
    return current_user.preferences

@router.put("", response_model=PreferencesSchema)
async def update_preferences(
    payload: PreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates scoring weights, Groq model, or motion preferences."""
    pref = current_user.preferences
    if not pref:
        pref = UserPreferences(user_id=current_user.id)
        db.add(pref)

    if payload.enable_groq_ai is not None:
        pref.enable_groq_ai = payload.enable_groq_ai
    if payload.groq_model is not None:
        pref.groq_model = payload.groq_model
    if payload.heuristic_weight is not None:
        pref.heuristic_weight = payload.heuristic_weight
    if payload.ml_weight is not None:
        pref.ml_weight = payload.ml_weight
    if payload.reduced_motion is not None:
        pref.reduced_motion = payload.reduced_motion

    db.commit()
    db.refresh(pref)
    return pref

@router.get("/profile", response_model=ProfileSchema)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieves analyst profile."""
    return current_user.profile
