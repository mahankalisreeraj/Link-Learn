from rest_framework import generics, permissions, exceptions, views
from rest_framework.response import Response
from django.db.models import Q, Avg
from django.utils import timezone
from datetime import timedelta
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

class DiscoveryView(generics.ListAPIView):
    # Discovery API: "Profile discovery logic"
    # Returns posts ranked by relevance, bounty, availability, rating.
    serializer_class = LearningRequestPostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        mode = self.request.query_params.get('mode', 'learn') # 'learn' or 'teach' logic?
        # Requirement says "Discovery logic". Usually means searching for something.
        # Default: search all active posts.
        
        qs = LearningRequestPost.objects.filter(status='Active')
        
        if query:
            qs = qs.filter(Q(topic_to_learn__icontains=query) | Q(topic_to_teach__icontains=query))
            
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # In-memory scoring (since Rating is in another app and specialized logic is complex for ORM)
        # Note: Ideally this is done via Annotation for pagination. For MVP, Python sort is fine for <1000 items.
        
        config = SystemConfig.load()
        bounty_active = config.bounty_mode_active
        now = timezone.now()
        
        scored_posts = []
        
        # Pre-fetch ratings to avoid N+1? 
        # Ideally user.avg_rating should be annotated. 
        # But let's iterate.
        
        for post in queryset:
            score = 0
            
            # 1. Topic Relevance (Already filtered, but could boost exact match)
            # Implied 10 pts for being in the list via filter.
            score += 10 
            
            # 2. Bounty Mode
            if bounty_active and post.learning_only_flag:
                score += 5
            
            # 3. Online Availability (Proxy: last_login within 10 mins)
            creator = post.creator
            if creator.last_login and (now - creator.last_login) < timedelta(minutes=10):
                score += 3
            
            # 4. Ratings
            # Calculate avg rating
            # We can use the related_name 'reviews_received' from User model
            ratings = creator.reviews_received.all()
            if ratings:
                avg = sum(r.score for r in ratings) / len(ratings)
                score += (avg * 2) # Max 10 pts
            
            scored_posts.append((score, post))
            
        # Sort descending
        scored_posts.sort(key=lambda x: x[0], reverse=True)
        
        posts = [x[1] for x in scored_posts]
        
        # Pagination
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

