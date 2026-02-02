from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SignupView, MyProfileView, UserProfileView, RateUserView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MyProfileView.as_view(), name='my-profile'),
    path('<int:pk>/', UserProfileView.as_view(), name='user-profile'),
    path('rate/', RateUserView.as_view(), name='rate-user'),
]
