from rest_framework import serializers
from .models import Submission
from accounts.serializers import UserDetailSerializer
from assignments.serializers import AssignmentSerializer   # optional, for assignment details

class SubmissionSerializer(serializers.ModelSerializer):
    student = UserDetailSerializer(read_only=True)           # nested student object
    assignment_details = AssignmentSerializer(source='assignment', read_only=True)   # optional

    class Meta:
        model = Submission
        fields = ['id', 'student', 'assignment', 'assignment_details', 'code_file', 'submitted_at', 'grade', 'feedback']
        read_only_fields = ['student', 'submitted_at', 'grade', 'feedback']