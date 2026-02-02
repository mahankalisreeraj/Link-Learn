from rest_framework import serializers
from .models import LearningRequestPost

class LearningRequestPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningRequestPost
        fields = ('id', 'user', 'want_to_learn', 'can_teach', 'is_just_learning', 'status', 'created_at')
        read_only_fields = ('id', 'user', 'status', 'created_at')

    def create(self, validated_data):
        # Assign current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
