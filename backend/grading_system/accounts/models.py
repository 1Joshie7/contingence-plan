from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    
    # Additional fields
    reg_number = models.CharField(max_length=20, blank=True, null=True, help_text="Student registration number")
    faculty = models.CharField(max_length=100, blank=True, null=True, help_text="Lecturer's faculty")
    
    def __str__(self):
        return self.username