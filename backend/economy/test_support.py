import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from users.models import User
from .services import claim_support_credits, check_support_eligibility

@pytest.mark.django_db
class TestSupportCredits:
    def test_eligibility_tiers(self):
        user = User.objects.create_user(email='tier@e.com', password='pw')
        
        # Cas 1: 0 credits -> 6
        user.wallet.balance = 0
        user.wallet.save()
        eligible, amount, _ = check_support_eligibility(user)
        assert eligible is True
        assert amount == 6

        # Case 2: 2 credits -> 4
        user.wallet.balance = 2
        user.wallet.save()
        eligible, amount, _ = check_support_eligibility(user)
        assert eligible is True
        assert amount == 4
        
        # Case 3: 3 credits -> 2
        user.wallet.balance = 3
        user.wallet.save()
        eligible, amount, _ = check_support_eligibility(user)
        assert eligible is True
        assert amount == 2
        
        # Case 4: 4 credits -> 0 (Not eligible)
        user.wallet.balance = 4
        user.wallet.save()
        eligible, amount, _ = check_support_eligibility(user)
        assert eligible is False
        assert amount == 0

    def test_claim_flow_and_cooldown(self):
        user = User.objects.create_user(email='claim@e.com', password='pw')
        user.wallet.balance = 0
        user.wallet.save()
        
        # Claim
        amount = claim_support_credits(user)
        assert amount == 6
        user.wallet.refresh_from_db()
        assert user.wallet.balance == 6
        assert user.wallet.last_support_claim is not None
        
        # Try finding Immediate Claim (Should fail due to Balance > 3 AND Cooldown)
        # Force balance back to 0 to test Cooldown specifically
        user.wallet.balance = 0
        user.wallet.save()
        
        with pytest.raises(ValidationError, match="Cooldown active"):
            claim_support_credits(user)
            
        # Fast forward 8 days
        user.wallet.last_support_claim -= timedelta(days=8)
        user.wallet.save()
        
        # Should be eligible again
        amount = claim_support_credits(user)
        assert amount == 6
