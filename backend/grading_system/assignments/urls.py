from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignmentViewSet, TestCaseViewSet

router = DefaultRouter()
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'testcases', TestCaseViewSet, basename='testcase')

urlpatterns = [
    path('', include(router.urls)),
]