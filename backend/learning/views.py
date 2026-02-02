from rest_framework import generics, permissions, exceptions
from .models import LearningRequestPost
from .serializers import LearningRequestPostSerializer, PostStatusUpdateSerializer

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
        # Requirement: Completed posts are never retrievable again
        return LearningRequestPost.objects.filter(creator=self.request.user).exclude(status='Completed').order_by('-timestamp')

class PostUpdateView(generics.UpdateAPIView):
    queryset = LearningRequestPost.objects.all()
    serializer_class = PostStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearningRequestPost.objects.filter(creator=self.request.user)
    
    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status != 'Active':
             raise exceptions.ValidationError("Only Active posts can be updated.")
        serializer.save()
