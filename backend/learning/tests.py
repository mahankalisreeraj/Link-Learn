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
        user = User.objects.create_user(email='test@example.com', password='password', name='Tester')
        client = APIClient()
        client.force_authenticate(user=user)
        
        url = reverse('post-create')
        data = {
            'topic_to_learn': 'Django Connect',
            'topic_to_teach': 'Basic Math',
            'learning_only_flag': False,
            'bounty_mode': True
        }
        
        response = client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert LearningRequestPost.objects.count() == 1
        post = LearningRequestPost.objects.first()
        assert post.creator == user
        assert post.topic_to_learn == 'Django Connect'
        assert post.status == 'Active'
        assert post.bounty_mode is True

    def test_list_public_posts(self):
        user = User.objects.create_user(email='u1@example.com', password='pw')
        LearningRequestPost.objects.create(creator=user, topic_to_learn='A', status='Active')
        LearningRequestPost.objects.create(creator=user, topic_to_learn='B', status='Completed') # Should not show
        
        client = APIClient()
        url = reverse('post-list-public')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['topic_to_learn'] == 'A'

    def test_list_my_posts_hides_completed(self):
        user1 = User.objects.create_user(email='u1@example.com', password='pw')
        LearningRequestPost.objects.create(creator=user1, topic_to_learn='Active Post', status='Active')
        LearningRequestPost.objects.create(creator=user1, topic_to_learn='Completed Post', status='Completed')
        
        client = APIClient()
        client.force_authenticate(user=user1)
        url = reverse('post-list-me')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['topic_to_learn'] == 'Active Post'

    def test_complete_post(self):
        user = User.objects.create_user(email='u1@example.com', password='pw')
        post = LearningRequestPost.objects.create(creator=user, topic_to_learn='To Complete', status='Active')
        
        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse('post-update-status', kwargs={'pk': post.pk})
        data = {'status': 'Completed'}
        
        response = client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        
        post.refresh_from_db()
        assert post.status == 'Completed'
        
    def test_cannot_update_completed_post(self):
        user = User.objects.create_user(email='u1@example.com', password='pw')
        post = LearningRequestPost.objects.create(creator=user, topic_to_learn='Already Done', status='Completed')
        
        client = APIClient()
        client.force_authenticate(user=user)
        url = reverse('post-update-status', kwargs={'pk': post.pk})
        data = {'status': 'Active'} # Trying to reactivate or change
        
        response = client.patch(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
