from django.contrib import admin
from .models import Submission

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'assignment', 'grade', 'submitted_at')
    list_filter = ('assignment', 'student', 'submitted_at')
    search_fields = ('student__username', 'assignment__title')
    readonly_fields = ('submitted_at', 'grade', 'feedback')
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('student', 'assignment', 'code_file', 'submitted_at')
        }),
        ('Grading Results', {
            'fields': ('grade', 'feedback'),
            'classes': ('collapse',)
        })
    )