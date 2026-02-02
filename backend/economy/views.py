from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .services import check_support_eligibility, claim_support_credits, donate_to_bank

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

class DonateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = int(amount)
            donate_to_bank(request.user, amount)
            return Response({'message': f'Donated {amount} credits successfully.'})
        except ValueError:
            return Response({'error': 'Invalid amount format'}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
