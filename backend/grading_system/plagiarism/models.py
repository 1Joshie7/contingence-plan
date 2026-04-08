from django.db import models
from django.conf import settings
from submissions.models import Submission
from assignments.models import Assignment

class PlagiarismReport(models.Model):
    submission1 = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='plagiarism_reports_as_first')
    submission2 = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='plagiarism_reports_as_second')
    similarity_score = models.FloatField(help_text="Similarity score between 0 and 100")
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='plagiarism_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('submission1', 'submission2')  # Prevent duplicate pairs
        ordering = ['-similarity_score']
    
    def __str__(self):
        return f"Report: {self.submission1.student.username} vs {self.submission2.student.username} ({self.similarity_score}%)"