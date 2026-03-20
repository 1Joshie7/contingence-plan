from django.contrib import admin
from .models import Assignment, TestCase

class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 1  # number of empty test case forms to display

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'deadline', 'created_at')
    list_filter = ('created_by', 'deadline')
    search_fields = ('title', 'description')
    inlines = [TestCaseInline]

@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'assignment', 'input_data', 'expected_output', 'is_hidden')
    list_filter = ('assignment', 'is_hidden')