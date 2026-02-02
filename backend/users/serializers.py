from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Wallet, Rating
from learning.models import LearningRequestPost
from learning.serializers import LearningRequestPostSerializer

User = get_user_model()

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ('balance', 'last_support_claim')

class RatingSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True)
    
    class Meta:
        model = Rating
        fields = ('id', 'reviewer', 'reviewer_name', 'reviewee', 'score', 'comment', 'timestamp')
        read_only_fields = ('id', 'reviewer', 'timestamp')

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    wallet = WalletSerializer(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    reviews = RatingSerializer(source='reviews_received', many=True, read_only=True)
    posts = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'wallet', 'avg_rating', 'reviews', 'posts')

    def get_avg_rating(self, obj):
        ratings = obj.reviews_received.all()
        if not ratings:
            return 0
        return sum(r.score for r in ratings) / len(ratings)

    def get_posts(self, obj):
        # "All learning request posts"
        # We can reuse LearningRequestPostSerializer
        posts = LearningRequestPost.objects.filter(creator=obj).order_by('-timestamp')
        return LearningRequestPostSerializer(posts, many=True).data

    def to_representation(self, instance):
        # Custom logic to hide wallet if not self
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user != instance:
            ret.pop('wallet', None)
        return ret
