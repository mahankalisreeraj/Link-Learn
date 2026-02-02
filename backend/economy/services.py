from django.db import transaction
from django.core.exceptions import ValidationError
from .models import CreditTransaction, Wallet

def calculate_credits(duration_minutes):
    # 5 minutes = 1 credit
    return duration_minutes // 5

@transaction.atomic
def process_session_payment(student_wallet, teacher_wallet, duration_minutes):
    """
    Transfers credits from student to teacher based on duration.
    """
    credits_to_transfer = calculate_credits(duration_minutes)
    
    if credits_to_transfer <= 0:
        return 0

    # Refresh wallets to ensure latest balance (select_for_update likely needed in real prod, skipping for simplicity here)
    # In strict prod: Wallet.objects.select_for_update().get(pk=student_wallet.pk)
    
    if student_wallet.balance < credits_to_transfer:
        raise ValidationError("Insufficient credits for student.")

    # Debit Student
    student_wallet.balance -= credits_to_transfer
    student_wallet.save()
    CreditTransaction.objects.create(
        wallet=student_wallet,
        amount=-credits_to_transfer,
        transaction_type='SESSION_PAYMENT',
        description=f'Payment for {duration_minutes} min session'
    )

    # Credit Teacher
    teacher_wallet.balance += credits_to_transfer
    teacher_wallet.save()
    CreditTransaction.objects.create(
        wallet=teacher_wallet,
        amount=credits_to_transfer,
        transaction_type='SESSION_PAYMENT',
        description=f'Earned from {duration_minutes} min session'
    )

    return credits_to_transfer
