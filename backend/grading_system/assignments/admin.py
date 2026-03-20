from django.contrib import admin
from .models import Assignment, TestCase

class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'deadline', 'created_at')
    list_filter = ('created_by', 'deadline')
    search_fields = ('title', 'description')
    inlines = [TestCaseInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'created_by', 'deadline')
        }),
        ('Grading Configuration', {
            'fields': ('grading_config', 'required_function_name', 'required_param_count'),
            'classes': ('collapse',),
            'description': 'You can provide a JSON object for advanced grading options. Use the fields below for simple function requirements.'
        })
    )