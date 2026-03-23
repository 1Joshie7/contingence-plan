from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Assignment
from .serializers import AssignmentSerializer
from .permissions import IsLecturerOrReadOnly

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all().order_by('-created_at')
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsLecturerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        # Optionally, you could also handle creation of test cases here if included in the request data


from rest_framework import viewsets, permissions
from .models import TestCase
from .serializers import TestCaseSerializer
from .permissions import IsLecturerOrReadOnly

class TestCaseViewSet(viewsets.ModelViewSet):
    serializer_class = TestCaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsLecturerOrReadOnly]

    def get_queryset(self):
        # If student, only show non‑hidden test cases
        if self.request.user.role == 'student':
            return TestCase.objects.filter(is_hidden=False)
        return TestCase.objects.all()