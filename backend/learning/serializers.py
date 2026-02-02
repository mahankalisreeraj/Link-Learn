from rest_framework import serializers
from .models import LearningRequestPost

class LearningRequestPostSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.name', read_only=True)

    class Meta:
        model = LearningRequestPost
        fields = (
            'id', 'creator', 'creator_name', 'topic_to_learn', 'topic_to_teach', 
            'learning_only_flag', 'bounty_mode', 'status', 'timestamp'
        )
        read_only_fields = ('id', 'creator', 'timestamp') # Status is now writable, but we should be careful

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

class PostStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningRequestPost
        fields = ('status',)

    def validate_status(self, value):
        if value not in ['Completed', 'Cancelled']:
             raise serializers.ValidationError("Can only mark as Completed or Cancelled.")
        return value
