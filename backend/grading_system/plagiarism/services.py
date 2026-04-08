import difflib
import ast
import os
import logging
from django.core.files.storage import default_storage
from django.conf import settings
from submissions.models import Submission
from .models import PlagiarismReport

logger = logging.getLogger(__name__)

def get_code_content(submission):
    """
    Read code content from submission file.
    Returns None if file doesn't exist.
    """
    try:
        # Check if file exists
        if not default_storage.exists(submission.code_file.name):
            logger.warning(f"File not found: {submission.code_file.name} for submission {submission.id}")
            return None
        
        with default_storage.open(submission.code_file.name, 'r') as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading file for submission {submission.id}: {e}")
        return None


def normalize_code(code):
    """Normalize code for better comparison (remove comments, normalize whitespace)"""
    if not code:
        return ""
    
    try:
        # Parse AST to get normalized representation
        tree = ast.parse(code)
        
        # Try to use astor if available for better normalization
        try:
            import astor
            return astor.to_source(tree)
        except ImportError:
            # Fallback: simple normalization
            lines = [line.strip() for line in code.split('\n')]
            # Remove empty lines and comments
            lines = [l for l in lines if l and not l.startswith('#')]
            return '\n'.join(lines)
    except SyntaxError:
        # If code has syntax errors, use simple string normalization
        lines = [line.strip() for line in code.split('\n')]
        lines = [l for l in lines if l and not l.startswith('#')]
        return '\n'.join(lines)


def calculate_similarity(code1, code2):
    """Calculate similarity score between two code strings (0-100)"""
    if not code1 or not code2:
        return 0.0
    
    norm1 = normalize_code(code1)
    norm2 = normalize_code(code2)
    
    # Use SequenceMatcher for token-based similarity
    matcher = difflib.SequenceMatcher(None, norm1, norm2)
    ratio = matcher.ratio() * 100
    
    return round(ratio, 2)


def check_assignment_plagiarism(assignment_id):
    """
    Run plagiarism detection for all submissions of an assignment.
    Returns the number of reports created.
    """
    # Get all submissions for this assignment
    submissions = Submission.objects.filter(assignment_id=assignment_id)
    
    if submissions.count() < 2:
        logger.info(f"Assignment {assignment_id} has less than 2 submissions. Skipping.")
        return 0
    
    # Clear existing reports for this assignment
    PlagiarismReport.objects.filter(assignment_id=assignment_id).delete()
    
    reports_created = 0
    skipped_submissions = 0
    
    # First, pre-load all valid submissions (with existing files)
    valid_submissions = []
    for sub in submissions:
        code = get_code_content(sub)
        if code is not None:
            valid_submissions.append((sub, code))
        else:
            skipped_submissions += 1
            logger.warning(f"Skipping submission {sub.id} - file missing")
    
    if len(valid_submissions) < 2:
        logger.info(f"Only {len(valid_submissions)} valid submissions found. Need at least 2.")
        return 0
    
    # Compare each pair of valid submissions
    for i, (sub1, code1) in enumerate(valid_submissions):
        for sub2, code2 in valid_submissions[i+1:]:
            # Calculate similarity
            similarity = calculate_similarity(code1, code2)
            
            # Only create report if similarity exceeds threshold (e.g., 50%)
            if similarity >= 50:
                PlagiarismReport.objects.create(
                    submission1=sub1,
                    submission2=sub2,
                    similarity_score=similarity,
                    assignment_id=assignment_id
                )
                reports_created += 1
    
    logger.info(f"Plagiarism check completed. Reports: {reports_created}, Skipped: {skipped_submissions}")
    return reports_created