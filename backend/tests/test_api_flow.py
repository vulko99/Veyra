"""End-to-end API flow: create -> submit -> match -> route."""
import pytest
from django.urls import reverse

from apps.applications.models import ApplicationStatus

pytestmark = pytest.mark.django_db


def test_full_public_flow(api_client, product):
    # 1. Create
    create = api_client.post(
        reverse("application-list"),
        {
            "requested_amount": "1000",
            "requested_term_months": 12,
            "monthly_income": "2500",
            "employment_type": "FULL_TIME",
            "consents": [
                {"consent_type": "PLATFORM_PROCESSING", "accepted": True},
                {"consent_type": "PARTNER_DATA_TRANSFER", "accepted": True},
            ],
        },
        format="json",
    )
    assert create.status_code == 201
    app_id = create.json()["id"]

    # 2. Submit
    submit = api_client.post(reverse("application-submit", args=[app_id]), {}, format="json")
    assert submit.status_code == 200

    # 3. Match
    match = api_client.post(reverse("match-run", args=[app_id]), {}, format="json")
    assert match.status_code == 200
    matches = match.json()["matches"]
    assert len(matches) == 1
    assert matches[0]["rank"] == 1
    assert matches[0]["eligible"] is True
    product_id = matches[0]["product_id"]

    # 4. Fetch matches (GET)
    get_matches = api_client.get(reverse("match-list", args=[app_id]))
    assert get_matches.status_code == 200
    assert len(get_matches.json()["matches"]) == 1

    # 5. Route (public click-through)
    route = api_client.post(
        reverse("application-route", args=[app_id]),
        {"product_id": product_id},
        format="json",
    )
    assert route.status_code == 200
    assert route.json()["outbound_url"]
    assert route.json()["tracking_id"]


def test_match_advances_status(api_client, consented_application, product):
    consented_application.status = ApplicationStatus.SUBMITTED
    consented_application.save()
    api_client.post(reverse("match-run", args=[consented_application.id]), {}, format="json")
    consented_application.refresh_from_db()
    assert consented_application.status == ApplicationStatus.MATCHED
