from rest_framework import generics, permissions, exceptions, views
from rest_framework.response import Response
from .models import LearningRequestPost, SystemConfig
from .serializers import LearningRequestPostSerializer, PostStatusUpdateSerializer

class PostCreateView(generics.CreateAPIView):
    queryset = LearningRequestPost.objects.all()
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class PublicPostListView(generics.ListAPIView):
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        config = SystemConfig.load()
        queryset = LearningRequestPost.objects.filter(status='Active')
        
        if config.bounty_mode_active:
             # Prioritize learning_only_flag (True first), then timestamp
             return queryset.order_by('-learning_only_flag', '-timestamp')
        return queryset.order_by('-timestamp')

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
    
        if instance.status != 'Active':
             raise exceptions.ValidationError("Only Active posts can be updated.")
        serializer.save()

class BountyModeView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        config = SystemConfig.load()
        return Response({'bounty_mode_active': config.bounty_mode_active})

    def post(self, request):
        config = SystemConfig.load()
        # Toggle or set based on input? Requirement says "toggle". Let's assume toggle or set.
        # Let's support explicit set for robustness
        active = request.data.get('active', None)
        if active is None:
             # Just toggle if not provided
             config.bounty_mode_active = not config.bounty_mode_active
        else:
             config.bounty_mode_active = bool(active)
        config.save()
        return Response({'bounty_mode_active': config.bounty_mode_active})
