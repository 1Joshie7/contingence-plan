from rest_framework import permissions

class IsLecturerOrReadOnly(permissions.BasePermission):
    """
    Only lecturers can create, update, delete assignments.
    Students can only view (list/retrieve).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'lecturer'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'lecturer'