import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import LearningRequestPost, SystemConfig
from users.models import Rating

User = get_user_model()

@pytest.mark.django_db
class TestDiscovery:
    def test_discovery_ranking(self):
        # Create Users
        u1 = User.objects.create_user(email='u1@e.com', password='pw') # High Rating
        u2 = User.objects.create_user(email='u2@e.com', password='pw') # Online
        u3 = User.objects.create_user(email='u3@e.com', password='pw') # Bounty/Basic
        
        # Setup:
        # u1: Rating 5.0 -> Score += 10. Total 20 base.
        Rating.objects.create(reviewer=u2, reviewee=u1, score=5)
        
        # u2: Online (last_login now). -> Score += 3. Total 13 base.
        u2.last_login = timezone.now()
        u2.save()
        
        # u3: Nothing special yet. Total 10 base.
        
        # Posts: Subject "Python"
        p1 = LearningRequestPost.objects.create(creator=u1, topic_to_learn='Python Basics', status='Active')
        p2 = LearningRequestPost.objects.create(creator=u2, topic_to_learn='Python Adv', status='Active')
        p3 = LearningRequestPost.objects.create(creator=u3, topic_to_learn='Python Web', status='Active', learning_only_flag=True)
        
        client = APIClient()
        url = reverse('discovery')
        
        # 1. Basic Search "Python"
        # Scores:
        # p1 (u1): 10 + (5*2)=10 = 20
        # p2 (u2): 10 + 3 = 13
        # p3 (u3): 10 + 0 = 10
        # Order: p1, p2, p3
        response = client.get(url, {'q': 'Python'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        assert response.data[0]['id'] == p1.id
        assert response.data[1]['id'] == p2.id
        assert response.data[2]['id'] == p3.id
        
        # 2. Activate Bounty Mode
        config = SystemConfig.load()
        config.bounty_mode_active = True
        config.save()
        
        # Scores Update:
        # p1 (u1): 20
        # p2 (u2): 13
        # p3 (u3): 10 + 5 (Bounty) = 15
        # Order: p1, p3, p2
        response = client.get(url, {'q': 'Python'})
        assert response.data[0]['id'] == p1.id
        assert response.data[1]['id'] == p3.id # Jumped over p2
        assert response.data[2]['id'] == p2.id
