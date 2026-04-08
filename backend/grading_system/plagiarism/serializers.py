from rest_framework import serializers
from .models import PlagiarismReport
from accounts.serializers import UserDetailSerializer

class PlagiarismReportSerializer(serializers.ModelSerializer):
    submission1_student = serializers.SerializerMethodField()
    submission2_student = serializers.SerializerMethodField()
    
    class Meta:
        model = PlagiarismReport
        fields = [
            'id', 'submission1', 'submission1_student',
            'submission2', 'submission2_student',
            'similarity_score', 'assignment', 'created_at',
            'reviewed', 'notes'
        ]
        read_only_fields = ['created_at']
    
    def get_submission1_student(self, obj):
        return f"{obj.submission1.student.first_name} {obj.submission1.student.last_name}".strip() or obj.submission1.student.username
    
    def get_submission2_student(self, obj):
        return f"{obj.submission2.student.first_name} {obj.submission2.student.last_name}".strip() or obj.submission2.student.username


class PlagiarismCheckSerializer(serializers.Serializer):
    assignment = serializers.IntegerField()