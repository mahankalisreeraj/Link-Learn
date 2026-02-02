import pytest
from django.core.exceptions import ValidationError
from users.models import User, Wallet
from .services import process_session_payment, donate_to_bank, get_bank_balance

@pytest.mark.django_db
class TestBankLogic:
    def test_tax_deduction(self):
        student = User.objects.create_user(email='s@e.com', password='pw')
        teacher = User.objects.create_user(email='t@e.com', password='pw')
        
        # Give student 100 credits for clarity
        student.wallet.balance = 100
        student.wallet.save()
        
        # 50 mins = 10 credits
        # Tax = 10% of 10 = 1 credit
        # Teacher gets 9
        # Bank gets 1
        
        process_session_payment(student.wallet, teacher.wallet, 50)
        
        student.wallet.refresh_from_db()
        teacher.wallet.refresh_from_db()
        
        assert student.wallet.balance == 90 # 100 - 10
        assert teacher.wallet.balance == 24 # 15 + 9
        assert get_bank_balance() == 1

    def test_donation(self):
        user = User.objects.create_user(email='donor@e.com', password='pw')
        
        initial_bank = get_bank_balance()
        
        donate_to_bank(user.wallet, 5)
        
        user.wallet.refresh_from_db()
        assert user.wallet.balance == 10 # 15 - 5
        assert get_bank_balance() == initial_bank + 5

    def test_tax_rounding_int(self):
        # If total credits = 5
        # Tax = 0.5 -> 0 (int)
        student = User.objects.create_user(email='s2@e.com', password='pw')
        teacher = User.objects.create_user(email='t2@e.com', password='pw')
        
        process_session_payment(student.wallet, teacher.wallet, 25) # 5 credits
        
        # Tax = int(0.5) = 0?
        # teacher + 5
        teacher.wallet.refresh_from_db()
        assert teacher.wallet.balance == 20 # 15+5
        
        # Note: If we want strict "Bank takes cut", maybe ceiling? 
        # But usually int() floors. So small sessions might be tax free.
        
    def test_insufficient_donation(self):
        user = User.objects.create_user(email='broke@e.com', password='pw')
        with pytest.raises(ValidationError):
            donate_to_bank(user.wallet, 100)
