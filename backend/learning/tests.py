import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import LearningRequestPost

User = get_user_model()

@pytest.mark.django_db
class TestLearningRequests:
    def test_create_post_authenticated(self):
        user = User.objects.create_user(email='test@example.com', password='password')
        client = APIClient()
        client.force_authenticate(user=user)
        
        url = reverse('post-create')
        data = {
            'want_to_learn': 'Django Connect',
            'can_teach': 'Basic Math',
            'is_just_learning': False
        }
        
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert LearningRequestPost.objects.count() == 1
        post = LearningRequestPost.objects.first()
        assert post.user == user
        assert post.want_to_learn == 'Django Connect'
        assert post.status == 'active'

    def test_create_post_unauthenticated(self):
        client = APIClient()
        url = reverse('post-create')
        data = {'want_to_learn': 'Something'}
        response = client.post(url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
