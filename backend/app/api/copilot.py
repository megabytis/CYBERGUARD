from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database import get_db
from app.models import User, ScanRecord, CopilotConversation, CopilotMessage
from app.schemas import CopilotChatRequest, CopilotChatResponse, CopilotMessageResponse
from app.security import get_current_user
from app.core.ai import GroqAIClient

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(
    payload: CopilotChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Interacts with the AI Security Copilot with optional contextual scan linkage."""
    # Find or create conversation
    conv_id = payload.conversation_id
    conversation = None
    if conv_id:
        stmt = select(CopilotConversation).where(
            CopilotConversation.id == conv_id,
            CopilotConversation.user_id == current_user.id,
        )
        conversation = db.execute(stmt).scalar_one_or_none()

    if not conversation:
        title = payload.message[:40] + ("..." if len(payload.message) > 40 else "")
        conversation = CopilotConversation(
            user_id=current_user.id,
            scan_id=payload.scan_id,
            title=title,
        )
        db.add(conversation)
        db.flush()

    # Load scan context if provided
    scan_context = None
    target_scan_id = payload.scan_id or conversation.scan_id
    if target_scan_id:
        stmt_scan = select(ScanRecord).where(
            ScanRecord.id == target_scan_id,
            ScanRecord.user_id == current_user.id,
        )
        scan = db.execute(stmt_scan).scalar_one_or_none()
        if scan:
            scan_context = {
                "input_type": scan.input_type,
                "input_summary": scan.input_summary,
                "risk_score": scan.risk_score,
                "risk_level": scan.risk_level,
                "findings": [
                    {
                        "severity": f.severity,
                        "title": f.title,
                        "description": f.description,
                        "category": f.category,
                    }
                    for f in (scan.findings or [])
                ],
                "executive_summary": scan.executive_summary,
                "recommendations": scan.recommendations or [],
            }

    # Save user message
    user_msg = CopilotMessage(
        conversation_id=conversation.id,
        sender="user",
        content=payload.message,
    )
    db.add(user_msg)

    # Generate response
    assistant_text, source = await GroqAIClient.generate_copilot_response(
        user_message=payload.message,
        scan_context=scan_context,
    )

    # Save assistant message
    asst_msg = CopilotMessage(
        conversation_id=conversation.id,
        sender="assistant",
        content=assistant_text,
    )
    db.add(asst_msg)
    db.commit()

    return CopilotChatResponse(
        conversation_id=conversation.id,
        response=assistant_text,
        source=source,
    )

@router.get("/messages/{conversation_id}", response_model=List[CopilotMessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves chronological messages for an analyst's conversation."""
    stmt = select(CopilotConversation).where(
        CopilotConversation.id == conversation_id,
        CopilotConversation.user_id == current_user.id,
    )
    conv = db.execute(stmt).scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    return conv.messages

@router.delete("/clear/{conversation_id}")
async def clear_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clears a copilot conversation."""
    stmt = select(CopilotConversation).where(
        CopilotConversation.id == conversation_id,
        CopilotConversation.user_id == current_user.id,
    )
    conv = db.execute(stmt).scalar_one_or_none()
    if conv:
        db.delete(conv)
        db.commit()
    return {"success": True}
