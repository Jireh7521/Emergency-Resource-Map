from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = (
        db.query(models.Admin)
        .filter(models.Admin.username == credentials.username)
        .first()
    )
    if admin is None or not auth.verify_password(credentials.password, admin.hashed_password):
        # Same error for "no such user" and "wrong password" — don't leak
        # which one it was, that just helps someone brute-force usernames.
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = auth.create_access_token(admin.id, admin.username)
    return schemas.Token(access_token=token)
