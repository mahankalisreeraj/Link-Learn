from rest_framework import generics, permissions
from .models import LearningRequestPost
from .serializers import LearningRequestPostSerializer

class PostCreateView(generics.CreateAPIView):
    queryset = LearningRequestPost.objects.all()
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class PublicPostListView(generics.ListAPIView):
    queryset = LearningRequestPost.objects.filter(status='Active').order_by('-timestamp')
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.AllowAny]

class UserPostListView(generics.ListAPIView):
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningRequestPost.objects.filter(creator=self.request.user).order_by('-timestamp')
