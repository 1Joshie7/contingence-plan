from django.contrib import admin
from .models import Assignment, TestCase

class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1
    fields = ('input_data', 'expected_output', 'is_hidden')
    show_change_link = True

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'deadline', 'created_at')
    list_filter = ('created_by', 'deadline')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)
    inlines = [TestCaseInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'deadline')
        }),
        ('Grading Configuration', {
            'fields': ('grading_config',),
            'classes': ('collapse',),
            'description': 'JSON configuration for grading weights and requirements'
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'assignment', 'input_data_preview', 'expected_output_preview', 'is_hidden')
    list_filter = ('assignment', 'is_hidden')
    search_fields = ('assignment__title', 'input_data', 'expected_output')
    
    def input_data_preview(self, obj):
        return obj.input_data[:50] + '...' if len(obj.input_data) > 50 else obj.input_data
    input_data_preview.short_description = 'Input Data'
    
    def expected_output_preview(self, obj):
        return obj.expected_output[:50] + '...' if len(obj.expected_output) > 50 else obj.expected_output
    expected_output_preview.short_description = 'Expected Output'