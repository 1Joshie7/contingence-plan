from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlagiarismViewSet

router = DefaultRouter()
router.register(r'plagiarism', PlagiarismViewSet, basename='plagiarism')

urlpatterns = [
    path('', include(router.urls)),
]