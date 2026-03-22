from rest_framework import serializers
from .models import Assignment, TestCase

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = [
            'id', 'assignment', 'test_type', 'input_data', 'expected_output',
            'is_hidden', 'function_name', 'arguments'
        ]
        extra_kwargs = {
            'input_data': {'required': False},
            'expected_output': {'required': False},
            'function_name': {'required': False},
            'arguments': {'required': False},
        }

class AssignmentSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'created_by', 'created_at',
            'deadline', 'test_cases', 'grading_config'
        ]
        read_only_fields = ['created_by', 'created_at']