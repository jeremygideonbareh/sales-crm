from pydantic import BaseModel
from typing import Optional
from ..schemas.auth import UserResponse


class CreateUserRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "rep"


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AdminDashboardResponse(BaseModel):
    total_users: int
    active_users: int
    total_leads: int
    total_deals: int
    total_commission: float
    recent_users: list[UserResponse]
