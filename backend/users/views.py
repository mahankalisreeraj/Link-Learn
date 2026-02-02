from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

class SignupView(generics.CreateAPIView):
    queryset = UserSerializer.Meta.model.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
