from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data import get_all_organizations, get_organization
from models import OptimizationRequest, OptimizationResponse, SelectedControl
from optimizer import optimize


app = FastAPI(
    title="RiskOpt API",
    description="AI-Based Cyber Risk & Investment Optimization API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "RiskOpt Backend is running 🚀",
        "status": "healthy",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/organizations")
def organizations():
    return get_all_organizations()


@app.get("/organizations/{organization}")
def organization(organization: str):
    data = get_organization(organization)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )

    return data


@app.post("/optimize", response_model=OptimizationResponse)
def run_optimization(request: OptimizationRequest):

    org = get_organization(request.organization)

    if not org:
        raise HTTPException(
            status_code=404,
            detail="Organization not found",
        )

    if request.budget <= 0:
        raise HTTPException(
            status_code=400,
            detail="Budget must be greater than zero",
        )

    selected = optimize(
        controls=org["controls"],
        budget=request.budget,
        objective=request.objective,
    )

    total_investment = sum(
        control["cost"]
        for control in selected
    )

    remaining_budget = request.budget - total_investment

    total_risk_reduction = sum(
        control["risk_reduction"]
        for control in selected
    )

    risk_before = org["risk"]

    # Apply diminishing returns so multiple controls
    # don't unrealistically eliminate almost all risk.
    effective_reduction = total_risk_reduction * 0.65

    risk_after = max(
        10,
        round(risk_before - effective_reduction, 1),
    )

    risk_reduction_percent = (
        ((risk_before - risk_after) / risk_before) * 100
        if risk_before > 0
        else 0
    )

    selected_controls = [
        SelectedControl(
            name=control["name"],
            cost=control["cost"],
            risk_reduction=control["risk_reduction"],
        )
        for control in selected
    ]

    return OptimizationResponse(
        selected_controls=selected_controls,
        total_investment=total_investment,
        remaining_budget=remaining_budget,
        risk_before=risk_before,
        risk_after=risk_after,
        risk_reduction_percent=round(
            risk_reduction_percent,
            1,
        ),
    )
