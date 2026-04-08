from rest_framework import serializers
from .models import Course, Assignment, TestCase
from accounts.serializers import UserDetailSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


# ============================================================
# Course Serializer
# ============================================================
class CourseSerializer(serializers.ModelSerializer):
    lecturer = UserDetailSerializer(read_only=True)
    lecturer_id = serializers.PrimaryKeyRelatedField(
        source='lecturer', 
        queryset=User.objects.all(), 
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Course
        fields = ('id', 'code', 'title', 'lecturer', 'lecturer_id', 'faculty', 'created_at')
        read_only_fields = ('created_at',)


# ============================================================
# TestCase Serializer
# ============================================================
class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = [
            'id', 'assignment', 'test_type', 'input_data', 'expected_output',
            'is_hidden', 'function_name', 'arguments'
        ]
        extra_kwargs = {
            'input_data': {'required': False, 'allow_blank': True},
            'expected_output': {'required': False, 'allow_blank': True},
            'function_name': {'required': False, 'allow_blank': True},
            'arguments': {'required': False},
        }


# ============================================================
# Assignment Serializer
# ============================================================
class AssignmentSerializer(serializers.ModelSerializer):
    test_cases = TestCaseSerializer(many=True, read_only=True)
    created_by = UserDetailSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        source='course',
        queryset=Course.objects.all(),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'course', 'course_id', 'created_by', 
            'created_at', 'deadline', 'test_cases', 'grading_config'
        ]
        read_only_fields = ['created_by', 'created_at']