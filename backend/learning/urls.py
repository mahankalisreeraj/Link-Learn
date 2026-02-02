from django.urls import path
from .views import PostCreateView, PublicPostListView, UserPostListView, PostUpdateView, BountyModeView, DiscoveryView

urlpatterns = [
    path('posts/create/', PostCreateView.as_view(), name='post-create'),
    path('posts/public/', PublicPostListView.as_view(), name='post-list-public'),
    path('discovery/', DiscoveryView.as_view(), name='discovery'),
    path('posts/me/', UserPostListView.as_view(), name='post-list-me'),
    path('posts/<int:pk>/status/', PostUpdateView.as_view(), name='post-update-status'),
    path('admin/bounty-mode/', BountyModeView.as_view(), name='bounty-mode-toggle'),
]
