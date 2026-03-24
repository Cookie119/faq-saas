import stripe
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.config import settings
from core.database import get_db
from core.auth import get_current_company
from models.db_models import Company

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = settings.stripe_secret_key

PLAN_PRICE_MAP = {
    "pro":        settings.stripe_pro_price_id,
    "enterprise": settings.stripe_enterprise_price_id,
}

PRICE_PLAN_MAP = {
    settings.stripe_pro_price_id:        "pro",
    settings.stripe_enterprise_price_id: "enterprise",
}


# ── Request schemas ───────────────────────────────────────────────
class CheckoutRequest(BaseModel):
    plan: str          # "pro" | "enterprise"
    success_url: str
    cancel_url: str


# ── Create Stripe checkout session ───────────────────────────────
@router.post("/create-checkout-session")
def create_checkout_session(
    body: CheckoutRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    plan = body.plan.lower()
    if plan not in PLAN_PRICE_MAP:
        raise HTTPException(status_code=400, detail="Invalid plan")
    if company.plan == plan:
        raise HTTPException(status_code=400, detail="Already on this plan")

    price_id = PLAN_PRICE_MAP[plan]

    # Create or reuse Stripe customer
    if not company.stripe_customer_id:
        customer = stripe.Customer.create(
            email=company.email,
            name=company.name,
            metadata={"company_id": str(company.id)},
        )
        company.stripe_customer_id = customer.id
        db.commit()
    
    # If they already have a subscription, send to portal instead
    if company.stripe_subscription_id:
        portal = stripe.billing_portal.Session.create(
            customer=company.stripe_customer_id,
            return_url=body.cancel_url,
        )
        return {"url": portal.url, "type": "portal"}

    session = stripe.checkout.Session.create(
        customer=company.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=body.success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=body.cancel_url,
        metadata={"company_id": str(company.id), "plan": plan},
        subscription_data={"metadata": {"company_id": str(company.id), "plan": plan}},
    )
    return {"url": session.url, "type": "checkout"}


# ── Customer portal (manage / cancel / downgrade) ────────────────
@router.post("/portal")
def create_portal_session(
    body: dict,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    if not company.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")
    portal = stripe.billing_portal.Session.create(
        customer=company.stripe_customer_id,
        return_url=body.get("return_url", settings.frontend_url + "/billing"),
    )
    return {"url": portal.url}


# ── Billing status ────────────────────────────────────────────────
@router.get("/status")
def billing_status(
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    sub = None
    if company.stripe_subscription_id:
        try:
            sub = stripe.Subscription.retrieve(company.stripe_subscription_id)
        except Exception:
            pass

    return {
        "plan":                    company.plan,
        "stripe_customer_id":      company.stripe_customer_id,
        "stripe_subscription_id":  company.stripe_subscription_id,
        "subscription_status":     sub.status if sub else None,
        "current_period_end":      sub.current_period_end if sub else None,
        "cancel_at_period_end":    sub.cancel_at_period_end if sub else False,
    }


# ── Stripe webhook ────────────────────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload    = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── checkout.session.completed ────────────────────────────────
    if event["type"] == "checkout.session.completed":
        session    = event["data"]["object"]
        company_id = session.get("metadata", {}).get("company_id")
        plan       = session.get("metadata", {}).get("plan")
        sub_id     = session.get("subscription")

        if company_id and plan and sub_id:
            company = db.query(Company).filter(Company.id == company_id).first()
            if company:
                company.plan                    = plan
                company.stripe_subscription_id  = sub_id
                db.commit()

    # ── customer.subscription.updated ────────────────────────────
    elif event["type"] == "customer.subscription.updated":
        sub        = event["data"]["object"]
        company_id = sub.get("metadata", {}).get("company_id")

        if company_id:
            company = db.query(Company).filter(Company.id == company_id).first()
            if company:
                # Get plan from the price ID on the subscription
                items     = sub.get("items", {}).get("data", [])
                price_id  = items[0]["price"]["id"] if items else None
                new_plan  = PRICE_PLAN_MAP.get(price_id)

                # Only downgrade when period actually ends (cancel_at_period_end)
                # Upgrades apply immediately
                if new_plan and not sub.get("cancel_at_period_end"):
                    company.plan = new_plan

                company.stripe_subscription_id = sub["id"]
                db.commit()

    # ── customer.subscription.deleted ────────────────────────────
    elif event["type"] == "customer.subscription.deleted":
        sub        = event["data"]["object"]
        company_id = sub.get("metadata", {}).get("company_id")

        if company_id:
            company = db.query(Company).filter(Company.id == company_id).first()
            if company:
                company.plan                   = "free"
                company.stripe_subscription_id = None
                db.commit()

    return JSONResponse(content={"received": True})
