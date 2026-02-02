from rest_framework import generics, permissions
from .models import LearningRequestPost
from .serializers import LearningRequestPostSerializer

class PostCreateView(generics.CreateAPIView):
    queryset = LearningRequestPost.objects.all()
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
