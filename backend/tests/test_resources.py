def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_resource_requires_auth(client):
    response = client.post(
        "/api/resources",
        json={"name": "Sneaky", "category": "hospital", "latitude": 6.5, "longitude": 3.4},
    )
    assert response.status_code in (401, 403)


def test_create_and_get_resource(client, admin_token):
    response = client.post(
        "/api/resources",
        json={
            "name": "General Hospital",
            "category": "hospital",
            "address": "Example Location",
            "phone": "08000000000",
            "latitude": 6.5244,
            "longitude": 3.3792,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "General Hospital"
    assert body["verification_status"] == "unverified"

    get_response = client.get(f"/api/resources/{body['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "General Hospital"


def test_get_nonexistent_resource_returns_404(client):
    response = client.get("/api/resources/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_update_resource(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    created = client.post(
        "/api/resources",
        json={"name": "Old Name", "category": "police", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    ).json()

    updated = client.put(
        f"/api/resources/{created['id']}",
        json={"name": "New Name", "verification_status": "verified"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "New Name"
    assert updated.json()["verification_status"] == "verified"
    # untouched fields should be unchanged
    assert updated.json()["category"] == "police"


def test_update_resource_requires_auth(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    created = client.post(
        "/api/resources",
        json={"name": "X", "category": "police", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    ).json()

    response = client.put(f"/api/resources/{created['id']}", json={"name": "Y"})
    assert response.status_code in (401, 403)


def test_delete_resource(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    created = client.post(
        "/api/resources",
        json={"name": "To Delete", "category": "shelter", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    ).json()

    delete_response = client.delete(f"/api/resources/{created['id']}", headers=headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/resources/{created['id']}")
    assert get_response.status_code == 404


def test_search_filters_by_name_and_address(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.post(
        "/api/resources",
        json={"name": "General Hospital", "category": "hospital", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    )
    client.post(
        "/api/resources",
        json={"name": "Central Police Station", "category": "police", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    )

    response = client.get("/api/resources?search=General")
    results = response.json()
    assert len(results) == 1
    assert results[0]["name"] == "General Hospital"


def test_filter_by_category(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.post(
        "/api/resources",
        json={"name": "Hospital A", "category": "hospital", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    )
    client.post(
        "/api/resources",
        json={"name": "Police A", "category": "police", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    )

    response = client.get("/api/resources?category=police")
    results = response.json()
    assert len(results) == 1
    assert results[0]["category"] == "police"


def test_nearby_orders_by_distance_and_respects_radius(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    # ~0 km from the query point
    client.post(
        "/api/resources",
        json={"name": "Close One", "category": "hospital", "latitude": 6.5000, "longitude": 3.4000},
        headers=headers,
    )
    # a bit further away, still within 20km
    client.post(
        "/api/resources",
        json={"name": "Mid One", "category": "hospital", "latitude": 6.55, "longitude": 3.45},
        headers=headers,
    )
    # far away — outside the radius entirely
    client.post(
        "/api/resources",
        json={"name": "Far One", "category": "hospital", "latitude": 10.0, "longitude": 10.0},
        headers=headers,
    )

    response = client.get("/api/resources/nearby?latitude=6.5&longitude=3.4&radius_km=20")
    results = response.json()
    names = [r["name"] for r in results]

    assert "Far One" not in names
    assert names[0] == "Close One"  # nearest first
    assert results[0]["distance_km"] < results[1]["distance_km"]


def test_invalid_category_rejected(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post(
        "/api/resources",
        json={"name": "X", "category": "not_a_real_category", "latitude": 6.5, "longitude": 3.4},
        headers=headers,
    )
    assert response.status_code == 422


def test_invalid_latitude_rejected(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post(
        "/api/resources",
        json={"name": "X", "category": "hospital", "latitude": 999, "longitude": 3.4},
        headers=headers,
    )
    assert response.status_code == 422
