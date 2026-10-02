from pydantic import BaseModel
from typing import List


class OptimizationRequest(BaseModel):
    organization: str
    budget: int
    objective: str


class SelectedControl(BaseModel):
    name: str
    cost: int
    risk_reduction: float


class OptimizationResponse(BaseModel):
    selected_controls: List[SelectedControl]
    total_investment: int
    remaining_budget: int
    risk_before: float
    risk_after: float
    risk_reduction_percent: float
