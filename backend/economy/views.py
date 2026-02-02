from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .services import check_support_eligibility, claim_support_credits

class SupportEligibilityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        eligible, amount, reason = check_support_eligibility(request.user)
        return Response({
            'eligible': eligible,
            'amount': amount,
            'reason': reason
        })

class SupportClaimView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            amount = claim_support_credits(request.user)
            return Response({'amount': amount, 'message': 'Credits claimed successfully.'})
        except ValidationError as e:
            return Response({'error': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
