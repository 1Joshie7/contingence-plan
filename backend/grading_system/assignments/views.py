from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Course, Assignment, TestCase
from .serializers import CourseSerializer, AssignmentSerializer, TestCaseSerializer
from .permissions import IsLecturerOrReadOnly

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('code')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsLecturerOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(lecturer=self.request.user)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all().order_by('-created_at')
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsLecturerOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TestCaseViewSet(viewsets.ModelViewSet):
    serializer_class = TestCaseSerializer
    permission_classes = [IsAuthenticated, IsLecturerOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return TestCase.objects.filter(is_hidden=False)
        return TestCase.objects.all()