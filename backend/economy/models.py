from django.db import models
from users.models import Wallet

class CreditTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('INITIAL_GRANT', 'Initial Grant'),
        ('SESSION_PAYMENT', 'Session Payment'),
        ('BOUNTY_REWARD', 'Bounty Reward'),
        ('PENALTY', 'Penalty'),
        ('TAX', 'Tax'),
        ('DONATION', 'Donation'),
        ('SUPPORT_GRANT', 'Support Grant'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.IntegerField(help_text="Positive for credit, Negative for debit")
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.wallet.user.email} - {self.amount} ({self.transaction_type})"
