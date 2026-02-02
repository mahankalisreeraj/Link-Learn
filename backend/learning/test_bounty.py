import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from .models import LearningRequestPost, SystemConfig

User = get_user_model()

@pytest.mark.django_db
class TestBountyMode:
    def test_bounty_mode_toggle_admin_only(self):
        admin = User.objects.create_superuser(email='admin@example.com', password='pw')
        user = User.objects.create_user(email='user@example.com', password='pw')
        
        client = APIClient()
        url = reverse('bounty-mode-toggle')

        # Unauthenticated
        response = client.post(url, {})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Normal User
        client.force_authenticate(user=user)
        response = client.post(url, {})
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Admin
        client.force_authenticate(user=admin)
        response = client.post(url, {}) # Toggle
        assert response.status_code == status.HTTP_200_OK
        assert response.data['bounty_mode_active'] is True
        
        config = SystemConfig.load()
        assert config.bounty_mode_active is True

    def test_bounty_mode_ranking(self):
        user = User.objects.create_user(email='user@example.com', password='pw')
        
        # Create posts
        # Post A: Standard (learning_only=False), Newest
        p1 = LearningRequestPost.objects.create(creator=user, topic_to_learn='Standard New', learning_only_flag=False, status='Active')
        
        # Post B: Learning Only, Older
        p2 = LearningRequestPost.objects.create(creator=user, topic_to_learn='Learning Only Old', learning_only_flag=True, status='Active')
        # Manually set older timestamp if needed, but here p2 is newer than p1 actually by creation order. 
        # Wait, auto_now_add=True means p2 is newer.
        # Let's verify standard order first (Newest first).
        
        client = APIClient()
        url = reverse('post-list-public')
        
        # DEFAULT: Newest first
        response = client.get(url)
        assert response.data[0]['id'] == p2.id # p2 is newer
        assert response.data[1]['id'] == p1.id

        # ACTIVATE BOUNTY MODE
        config = SystemConfig.load()
        config.bounty_mode_active = True
        config.save()
        
        # Expectation: Learning Only (p2) is prioritized. 
        # Since p2 is ALSO newer, this doesn't prove priority.
        # Let's make p1 Newer but Standard.
        p1.delete()
        p2.delete()
        
        # Old Learning Only
        p_old_learning = LearningRequestPost.objects.create(creator=user, topic_to_learn='Old Learning', learning_only_flag=True, status='Active')
        import time
        time.sleep(0.01) # Ensure timestamp diff
        # New Standard
        p_new_standard = LearningRequestPost.objects.create(creator=user, topic_to_learn='New Standard', learning_only_flag=False, status='Active')
        
        # With Bounty Mode ON: Learning Only (True) > Standard (False). So Old Learning should come before New Standard?
        # Logic: order_by('-learning_only_flag', '-timestamp')
        # True=1, False=0. -1 < 0? No, -True (-1) vs -False (0). -1 comes first. Correct.
        
        response = client.get(url)
        assert response.data[0]['topic_to_learn'] == 'Old Learning'
        assert response.data[1]['topic_to_learn'] == 'New Standard'
        
        # DEACTIVATE BOUNTY MODE
        config.bounty_mode_active = False
        config.save()
        
        response = client.get(url)
        # Should be purely by timestamp (Newest first)
        assert response.data[0]['topic_to_learn'] == 'New Standard'
        assert response.data[1]['topic_to_learn'] == 'Old Learning'
