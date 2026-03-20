from rest_framework import serializers
from .models import Submission

class SubmissionSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'student', 'assignment', 'assignment_title', 'code_file', 'submitted_at', 'grade', 'feedback']
        read_only_fields = ['student', 'submitted_at', 'grade', 'feedback']