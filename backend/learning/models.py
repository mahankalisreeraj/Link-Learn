from django.db import models
from django.conf import settings

class LearningRequestPost(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    want_to_learn = models.CharField(max_length=255)
    can_teach = models.CharField(max_length=255, blank=True, null=True)
    is_just_learning = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} wants to learn {self.want_to_learn}"
