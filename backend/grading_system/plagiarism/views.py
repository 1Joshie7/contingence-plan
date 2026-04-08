import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from assignments.models import Assignment
from .models import PlagiarismReport
from .serializers import PlagiarismReportSerializer, PlagiarismCheckSerializer
from .services import check_assignment_plagiarism

logger = logging.getLogger(__name__)

class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'lecturer'


class PlagiarismViewSet(viewsets.ModelViewSet):
    serializer_class = PlagiarismReportSerializer
    permission_classes = [IsLecturer]
    
    def get_queryset(self):
        queryset = PlagiarismReport.objects.all()
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        return queryset
    
    @action(detail=False, methods=['post'], url_path='check')
    def check_plagiarism(self, request):
        """Trigger plagiarism detection for an assignment"""
        serializer = PlagiarismCheckSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        assignment_id = serializer.validated_data['assignment']
        
        # Verify assignment exists
        assignment = get_object_or_404(Assignment, id=assignment_id)
        
        try:
            # Run plagiarism detection
            reports_created = check_assignment_plagiarism(assignment_id)
            
            return Response({
                'status': 'completed',
                'assignment': assignment_id,
                'reports_created': reports_created,
                'message': f'Plagiarism check completed. {reports_created} reports created.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Plagiarism check failed for assignment {assignment_id}: {e}")
            return Response({
                'status': 'failed',
                'assignment': assignment_id,
                'error': str(e),
                'message': 'Plagiarism check failed. Check server logs for details.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['patch'], url_path='review')
    def mark_reviewed(self, request, pk=None):
        """Mark a report as reviewed and optionally add notes"""
        report = self.get_object()
        
        # Update fields
        if 'reviewed' in request.data:
            report.reviewed = request.data['reviewed']
        if 'notes' in request.data:
            report.notes = request.data['notes']
        
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)