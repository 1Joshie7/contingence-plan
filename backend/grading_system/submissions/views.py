from rest_framework import viewsets, permissions
from .models import Submission
from .serializers import SubmissionSerializer
from assignments.models import TestCase
from .grading import grade_submission

class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lecturer':
            return Submission.objects.all()
        return Submission.objects.filter(student=user)

    def perform_create(self, serializer):
        submission = serializer.save(student=self.request.user)
        self.grade_submission(submission)

    def grade_submission(self, submission):
        assignment = submission.assignment
        test_cases = TestCase.objects.filter(assignment=assignment)  # include hidden
        total_grade, breakdown, feedback = grade_submission(
        submission.code_file, assignment, test_cases
        )
        submission.grade = total_grade
        submission.feedback = feedback
        submission.save()
        assignment = submission.assignment
        test_cases = TestCase.objects.filter(assignment=assignment, is_hidden=False)
        total_grade, breakdown, feedback = grade_submission(
            submission.code_file, assignment, test_cases
        )
        submission.grade = total_grade
        submission.feedback = feedback
        submission.save()