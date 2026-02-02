from django.urls import path
from .views import PostCreateView

urlpatterns = [
    path('posts/create/', PostCreateView.as_view(), name='post-create'),
]
