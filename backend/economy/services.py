from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models import Sum
from .models import CreditTransaction, Wallet
from users.models import User

def get_bank_wallet():
    # Helper to get usage of System/Bank wallet
    # Using a specific email or ID for the system user
    user, _ = User.objects.get_or_create(email='system@linkandlearn.corp', defaults={'name': 'System Bank', 'is_active': False})
    # Ensure wallet exists (signal handles it usually, but let's be safe)
    if not hasattr(user, 'wallet'):
         Wallet.objects.create(user=user)
    return user.wallet

def get_bank_balance():
    # "Bank balance is computed, not stored"
    # We aggregate all transactions for the bank wallet
    bank_wallet = get_bank_wallet()
    return CreditTransaction.objects.filter(wallet=bank_wallet).aggregate(total=Sum('amount'))['total'] or 0

def calculate_credits(duration_minutes):
    # 5 minutes = 1 credit
    return duration_minutes // 5

@transaction.atomic
def process_session_payment(student_wallet, teacher_wallet, duration_minutes):
    """
    Transfers credits from student to teacher (90%) and Bank (10%) based on duration.
    """
    total_credits = calculate_credits(duration_minutes)
    
    if total_credits <= 0:
        return 0
    
    if student_wallet.balance < total_credits:
         raise ValidationError("Insufficient credits for student.")

    # 1. Debit Student Full Amount
    student_wallet.balance -= total_credits
    student_wallet.save()
    CreditTransaction.objects.create(
        wallet=student_wallet,
        amount=-total_credits,
        transaction_type='SESSION_PAYMENT',
        description=f'Payment for {duration_minutes} min session'
    )

    # 2. Calculate Tax (10%)
    # Integer arithmetic: 10% of N. 
    # E.g. 5 credits. 10% = 0.5. Integer division? Round?
    # Requirement: "Bank takes 10% cut". 
    # If credits < 10, tax might be 0. 
    # Let's use round or integer math. 
    # tax = int(total_credits * 0.10)
    tax = int(total_credits * 0.10)
    teacher_amount = total_credits - tax

    # 3. Credit Teacher
    if teacher_amount > 0:
        teacher_wallet.balance += teacher_amount
        teacher_wallet.save()
        CreditTransaction.objects.create(
            wallet=teacher_wallet,
            amount=teacher_amount,
            transaction_type='SESSION_PAYMENT',
            description=f'Earned from session (Tax: {tax})'
        )

    # 4. Credit Bank
    if tax > 0:
        bank_wallet = get_bank_wallet()
        # "Bank balance is computed", but we update local field for query speed if we wanted? 
        # But requirement says "computed, not stored". It might mean we shouldn't trust/use the stored value.
        # But we still create a transaction for it.
        # We can update the balance field anyway to keep the model consistent, OR 
        # we can choose NOT to update bank_wallet.balance if we want to validly say it's not "stored".
        # However, Wallet model has balance field. Let's update it but rely on `get_bank_balance` for read.
        bank_wallet.balance += tax
        bank_wallet.save()
        
        CreditTransaction.objects.create(
            wallet=bank_wallet,
            amount=tax,
            transaction_type='TAX',
            description=f'Tax from 5min={total_credits/5} session'
        )

    return total_credits

@transaction.atomic
def donate_to_bank(user_wallet, amount):
    if amount <= 0:
        raise ValidationError("Donation amount must be positive.")
    if user_wallet.balance < amount:
        raise ValidationError("Insufficient credits to donate.")
    
    user_wallet.balance -= amount
    user_wallet.save()
    CreditTransaction.objects.create(
            wallet=user_wallet,
            amount=-amount,
            transaction_type='DONATION',
            description='Donation to System'
    )

    bank_wallet = get_bank_wallet()
    bank_wallet.balance += amount
    bank_wallet.save()
    CreditTransaction.objects.create(
            wallet=bank_wallet,
            amount=amount,
            transaction_type='DONATION',
            description=f'Donation from {user_wallet.user.email}'
    )
    return amount

from django.utils import timezone
from datetime import timedelta

def check_support_eligibility(user):
    wallet = user.wallet
    
    # 1. Cooldown Check (7 days)
    if wallet.last_support_claim:
        days_since = (timezone.now() - wallet.last_support_claim).days
        if days_since < 7:
            return False, 0, f"Cooldown active. Try again in {7 - days_since} days."

    # 2. Balance Check & Amount Calculation
    balance = wallet.balance
    amount = 0
    
    if balance == 0:
        amount = 6
    elif 1 <= balance <= 2:
        amount = 4
    elif balance == 3:
        amount = 2
    else:
        return False, 0, "Not eligible. Balance > 3."
        
    return True, amount, "Eligible"

@transaction.atomic
def claim_support_credits(user):
    eligible, amount, reason = check_support_eligibility(user)
    if not eligible:
        raise ValidationError(reason)
        
    wallet = user.wallet
    wallet.balance += amount
    wallet.last_support_claim = timezone.now()
    wallet.save()
    
    # Credits come from System/Bank? Requirement doesn't specify source, usually "minted" or from Bank. 
    # "System Bank" logic from before implies we might want to track it.
    # Let's deduct from Bank to keep inflation tracked? Or just mint.
    # If we adhere to "Bank has no fixed balance" but "Bank takes cut", maybe Bank is the source.
    # Let's log it against the Bank wallet for accounting if we want, or just as a grant.
    # To be consistent with "Donations go to Bank", grants could come from Bank.
    # Let's simply debit Bank (it can go negative as it's computed).
    
    bank_wallet = get_bank_wallet()
    bank_wallet.balance -= amount
    bank_wallet.save() # Optional update
    
    CreditTransaction.objects.create(
        wallet=wallet,
        amount=amount,
        transaction_type='SUPPORT_GRANT',
        description='Weekly Support Credit'
    )
    
    CreditTransaction.objects.create(
        wallet=bank_wallet,
        amount=-amount,
        transaction_type='SUPPORT_GRANT',
        description=f'Grant to {user.email}'
    )
    
    return amount
