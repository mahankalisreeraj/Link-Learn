from django.urls import path
from .views import PostCreateView, PublicPostListView, UserPostListView

urlpatterns = [
    path('posts/create/', PostCreateView.as_view(), name='post-create'),
    path('posts/public/', PublicPostListView.as_view(), name='post-list-public'),
    path('posts/me/', UserPostListView.as_view(), name='post-list-me'),
]
