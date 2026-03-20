import subprocess
import tempfile
import os
import ast
import re
from django.core.files.storage import default_storage

# ------------------------------------------------------------
# Helper to get code content from uploaded file
# ------------------------------------------------------------
def get_code_content(code_file):
    """Return the code content as a string."""
    return default_storage.open(code_file.name).read().decode('utf-8')

# ------------------------------------------------------------
# 1. Run code against test cases (exact output matching)
# ------------------------------------------------------------
def run_code_tests(code_file, test_cases):
    """
    Run student's code against given test cases.
    Returns (passed, total, detailed_results)
    """
    passed = 0
    total = len(test_cases)
    results = []

    # Create a temporary file with the code
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as f:
        code_content = get_code_content(code_file)
        f.write(code_content)
        temp_path = f.name

    try:
        for test_case in test_cases:
            try:
                proc = subprocess.run(
                    ['python', temp_path],
                    input=test_case.input_data,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                actual = proc.stdout.strip()
                expected = test_case.expected_output.strip()
                test_passed = (actual == expected)
                if test_passed:
                    passed += 1
                results.append({
                    'input': test_case.input_data,
                    'expected': expected,
                    'actual': actual,
                    'passed': test_passed,
                    'error': None
                })
            except subprocess.TimeoutExpired:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output.strip(),
                    'actual': 'TIMEOUT',
                    'passed': False,
                    'error': 'Timeout (code took too long)'
                })
            except Exception as e:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output.strip(),
                    'actual': 'ERROR',
                    'passed': False,
                    'error': str(e)
                })
    finally:
        os.unlink(temp_path)

    return passed, total, results


# ------------------------------------------------------------
# 2. Structural analysis (AST) – check if a function is defined
# ------------------------------------------------------------
def analyze_structure(code_file):
    """
    Check if the code contains at least one function definition.
    Returns 0 or 20 (max 20 points).
    """
    code_content = get_code_content(code_file)
    try:
        tree = ast.parse(code_content)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                return 20
        return 0
    except SyntaxError:
        return 0


# ------------------------------------------------------------
# 3. Logic analysis (simple: check for presence of key operations)
# ------------------------------------------------------------
def analyze_logic(code_file, test_cases):
    """
    Award points if the code seems to implement the intended logic.
    For a sum assignment, check if it contains addition of two variables.
    Returns 0 or 20 (max 20 points).
    """
    code_content = get_code_content(code_file)
    # Simple heuristics: does the code contain a plus sign?
    if '+' in code_content:
        return 20
    return 0


# ------------------------------------------------------------
# 4. Linter score (pylint)
# ------------------------------------------------------------
def run_pylint(code_file):
    """
    Run pylint and return a score out of 10.
    """
    code_content = get_code_content(code_file)
    # Write code to a temporary file for pylint
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as f:
        f.write(code_content)
        temp_path = f.name
    try:
        result = subprocess.run(
            ['pylint', temp_path, '--exit-zero', '--output-format=text'],
            capture_output=True,
            text=True
        )
        output = result.stdout
        # Look for a line like "Your code has been rated at 8.33/10"
        match = re.search(r'rated at ([\d\.]+)/10', output)
        if match:
            score = float(match.group(1))
            return min(score, 10)  # clamp to 10
        return 0
    finally:
        os.unlink(temp_path)


# ------------------------------------------------------------
# 5. Documentation check (docstring in module or function)
# ------------------------------------------------------------
def has_docstring(code_file):
    """
    Returns 10 if a docstring is found, else 0.
    """
    code_content = get_code_content(code_file)
    try:
        tree = ast.parse(code_content)
        for node in ast.walk(tree):
            if isinstance(node, (ast.Module, ast.FunctionDef, ast.ClassDef)):
                if ast.get_docstring(node):
                    return 10
        return 0
    except SyntaxError:
        return 0


# ------------------------------------------------------------
# 6. Main grading orchestrator
# ------------------------------------------------------------
def grade_submission(code_file, test_cases):
    """
    Returns (total_grade, breakdown) where total_grade is a percentage (0-100)
    and breakdown is a dict with individual scores.
    """
    # Weighted scores
    test_weight = 40
    structure_weight = 20
    logic_weight = 20
    style_weight = 10
    doc_weight = 10

    # 1. Run test cases
    passed, total, test_results = run_code_tests(code_file, test_cases)
    test_score = (passed / total) * test_weight if total > 0 else 0

    # 2. Structure
    structure_raw = analyze_structure(code_file)  # returns 0 or 20
    structure_score = (structure_raw / 20) * structure_weight

    # 3. Logic (simple heuristic)
    logic_raw = analyze_logic(code_file, test_cases)  # returns 0 or 20
    logic_score = (logic_raw / 20) * logic_weight

    # 4. Linter (score out of 10)
    style_raw = run_pylint(code_file)  # out of 10
    style_score = (style_raw / 10) * style_weight

    # 5. Documentation
    doc_raw = has_docstring(code_file)  # returns 0 or 10
    doc_score = (doc_raw / 10) * doc_weight

    total_grade = test_score + structure_score + logic_score + style_score + doc_score

    breakdown = {
        'test': test_score,
        'structure': structure_score,
        'logic': logic_score,
        'style': style_score,
        'doc': doc_score
    }

    return total_grade, breakdown