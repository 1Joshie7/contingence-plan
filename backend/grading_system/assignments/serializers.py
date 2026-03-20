from rest_framework import serializers
from .models import Assignment, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'assignment', 'input_data', 'expected_output', 'is_hidden']

class AssignmentSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, read_only=True)
    # For creation, we'll handle test cases separately or use write-only field
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'created_by', 'created_at', 'deadline', 'test_cases']
        read_only_fields = ['created_by', 'created_at']