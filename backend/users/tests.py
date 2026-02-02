import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
# Use get_user_model to avoid import issues
from django.contrib.auth import get_user_model
from .models import Wallet

User = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    def test_signup_creates_user_and_wallet_with_credits(self):
        client = APIClient()
        url = reverse('signup')
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.count() == 1
        assert Wallet.objects.count() == 1
        user = User.objects.get(email='test@example.com')
        assert user.wallet.balance == 15
        assert user.name == 'Test User'

    def test_duplicate_email_prevented(self):
        client = APIClient()
        url = reverse('signup')
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }
        client.post(url, data)
        response = client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_returns_token(self):
        # Create user
        User.objects.create_user(email='test@example.com', password='password123', name='Test User')
        
        client = APIClient()
        url = reverse('token_obtain_pair')
        data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
