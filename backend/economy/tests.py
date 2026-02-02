import pytest
from django.core.exceptions import ValidationError
from users.models import User, Wallet
from .services import process_session_payment

@pytest.mark.django_db
class TestCreditSystem:
    def test_payment_calculation_and_transfer(self):
        student = User.objects.create_user(email='student@e.com', password='pw')
        teacher = User.objects.create_user(email='teacher@e.com', password='pw')
        
        # Student starts with 15 credits (signal)
        assert student.wallet.balance == 15
        assert teacher.wallet.balance == 15

        # 25 minutes = 5 credits
        transferred = process_session_payment(student.wallet, teacher.wallet, 25)
        
        assert transferred == 5
        student.wallet.refresh_from_db()
        teacher.wallet.refresh_from_db()
        
        assert student.wallet.balance == 10
        assert teacher.wallet.balance == 20
        
        # Check Transactions
        assert student.wallet.transactions.filter(amount=-5).exists()
        assert teacher.wallet.transactions.filter(amount=5).exists()

    def test_insufficient_funds(self):
        student = User.objects.create_user(email='poor@e.com', password='pw')
        teacher = User.objects.create_user(email='rich@e.com', password='pw')
        
        student.wallet.balance = 2 # Manually reduce
        student.wallet.save()
        
        # Try to spend 5 credits (25 mins)
        with pytest.raises(ValidationError, match="Insufficient credits"):
            process_session_payment(student.wallet, teacher.wallet, 25)
            
        # Verify no change
        student.wallet.refresh_from_db()
        assert student.wallet.balance == 2

    def test_rounding(self):
        student = User.objects.create_user(email='s@e.com', password='pw')
        teacher = User.objects.create_user(email='t@e.com', password='pw')
        
        # 4 minutes = 0 credits
        transferred = process_session_payment(student.wallet, teacher.wallet, 4)
        assert transferred == 0
        
        # 9 minutes = 1 credit
        transferred = process_session_payment(student.wallet, teacher.wallet, 9)
        assert transferred == 1
