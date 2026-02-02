import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import Rating
from learning.models import LearningRequestPost

User = get_user_model()

@pytest.mark.django_db
class TestProfileAndReputation:
    def test_get_my_profile(self):
        user = User.objects.create_user(email='me@e.com', password='pw', name='Me')
        client = APIClient()
        client.force_authenticate(user=user)
        
        url = reverse('my-profile')
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'me@e.com'
        assert 'wallet' in response.data
        assert response.data['wallet']['balance'] == 15 # Initial default

    def test_get_other_profile_hides_wallet(self):
        me = User.objects.create_user(email='me2@e.com', password='pw')
        other = User.objects.create_user(email='other@e.com', password='pw', name='Other')
        
        client = APIClient()
        client.force_authenticate(user=me)
        
        url = reverse('user-profile', kwargs={'pk': other.pk})
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'other@e.com'
        assert 'wallet' not in response.data # Should be hidden

    def test_rating_system(self):
        reviewer = User.objects.create_user(email='r1@e.com', password='pw')
        reviewee = User.objects.create_user(email='r2@e.com', password='pw')
        
        client = APIClient()
        client.force_authenticate(user=reviewer)
        
        url = reverse('rate-user')
        data = {
            'reviewee': reviewee.pk,
            'score': 5,
            'comment': 'Great teacher!'
        }
        
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        
        # Check impact on profile
        profile_url = reverse('user-profile', kwargs={'pk': reviewee.pk})
        response = client.get(profile_url)
        assert response.data['avg_rating'] == 5.0
        assert len(response.data['reviews']) == 1
        assert response.data['reviews'][0]['comment'] == 'Great teacher!'

    def test_posts_in_profile(self):
        user = User.objects.create_user(email='poster@e.com', password='pw')
        LearningRequestPost.objects.create(creator=user, topic_to_learn='Python')
        
        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse('my-profile')
        response = client.get(url)
        
        assert len(response.data['posts']) == 1
        assert response.data['posts'][0]['topic_to_learn'] == 'Python'
