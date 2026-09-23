def test_login_success(client, admin_token):
    # admin_token fixture already proves login works and returns a token;
    # this test checks the response shape explicitly.
    assert isinstance(admin_token, str)
    assert len(admin_token) > 20


def test_login_wrong_password(client, db_session):
    from app.auth import hash_password
    from app.models import Admin

    admin = Admin(username="someone", hashed_password=hash_password("correct-password"))
    db_session.add(admin)
    db_session.commit()

    response = client.post(
        "/api/auth/login", json={"username": "someone", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login", json={"username": "ghost", "password": "whatever123"}
    )
    assert response.status_code == 401
