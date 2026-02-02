from django.urls import path
from .views import SupportEligibilityView, SupportClaimView, DonateView

urlpatterns = [
    path('support/eligibility/', SupportEligibilityView.as_view(), name='support-eligibility'),
    path('support/claim/', SupportClaimView.as_view(), name='support-claim'),
    path('donate/', DonateView.as_view(), name='donate'),
]
