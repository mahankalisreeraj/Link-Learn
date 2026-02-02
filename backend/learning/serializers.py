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
        read_only_fields = ('id', 'creator', 'status', 'timestamp')

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)
