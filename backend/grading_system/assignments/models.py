from django.db import models
from django.conf import settings

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
    
    # Optional fields for static analysis (can be stored in grading_config)
    required_function_name = models.CharField(max_length=100, blank=True, null=True)
    required_param_count = models.IntegerField(blank=True, null=True)
    # New field: JSON config for grading
    grading_config = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.title

class TestCase(models.Model):
    TEST_TYPE_CHOICES = [
        ('stdout', 'Stdout (run script, compare output)'),
        ('function', 'Function (call function, compare return)'),
    ]

    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE, related_name='test_cases')
    test_type = models.CharField(max_length=10, choices=TEST_TYPE_CHOICES, default='stdout')
    input_data = models.TextField(blank=True, help_text="Input for stdin (only for stdout mode)")
    expected_output = models.TextField(blank=True, help_text="Expected output (stdout mode) or return value (function mode)")
    is_hidden = models.BooleanField(default=False)

    # Function mode fields
    function_name = models.CharField(max_length=100, blank=True, help_text="Name of function to call")
    arguments = models.JSONField(default=list, blank=True, help_text="List of arguments to pass")

    def __str__(self):
        return f"Test case for {self.assignment.title}"