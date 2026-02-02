from django.db import models
from django.conf import settings

class LearningRequestPost(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    topic_to_learn = models.CharField(max_length=255)
    topic_to_teach = models.CharField(max_length=255, blank=True, null=True)
    learning_only_flag = models.BooleanField(default=False)
    bounty_mode = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.creator.email} wants to learn {self.topic_to_learn}"
