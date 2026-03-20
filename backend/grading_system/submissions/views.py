from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
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
        # Save submission with current user
        submission = serializer.save(student=self.request.user)
        # Now grade it
        self.grade_submission(submission)


    def grade_submission(self, submission):
        assignment = submission.assignment
        test_cases = TestCase.objects.filter(assignment=assignment, is_hidden=False)
        total_grade, breakdown = grade_submission(submission.code_file, test_cases)
        submission.grade = total_grade
        # Build detailed feedback
        feedback = f"Total grade: {total_grade:.1f}%\n"
        feedback += f"Test cases: {breakdown['test']:.1f} / 40\n"
        feedback += f"Structure: {breakdown['structure']:.1f} / 20\n"
        feedback += f"Logic: {breakdown['logic']:.1f} / 20\n"
        feedback += f"Code style: {breakdown['style']:.1f} / 10\n"
        feedback += f"Documentation: {breakdown['doc']:.1f} / 10\n"
        submission.feedback = feedback
        submission.save()
