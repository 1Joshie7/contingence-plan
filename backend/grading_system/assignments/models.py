from django.db import models
from django.conf import settings

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
    
    def __str__(self):
        return self.title

class TestCase(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField(blank=True, help_text="Input for the student's code (stdin)")
    expected_output = models.TextField(help_text="Expected output (stdout)")
    is_hidden = models.BooleanField(default=False, help_text="If hidden, not shown to student")
    
    def __str__(self):
        return f"Test case for {self.assignment.title}"