import subprocess
import tempfile
import os
import ast
import re
from django.core.files.storage import default_storage

# ============================================================
# 1. Flexible test case evaluation (partial credit)
# ============================================================
def evaluate_test_case(actual_output, expected_output):
    actual = actual_output.strip()
    expected = expected_output.strip()
    if actual == expected:
        return 1.0
    try:
        actual_num = float(actual)
        expected_num = float(expected)
        if actual_num == expected_num:
            return 1.0
        return 0.0
    except ValueError:
        pass
    if expected in actual:
        return 0.5
    return 0.0


def run_code_tests(code_file, test_cases):
    total_score = 0.0
    results = []
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as f:
        code_content = default_storage.open(code_file.name).read().decode('utf-8')
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
                actual = proc.stdout
                score = evaluate_test_case(actual, test_case.expected_output)
                total_score += score
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': actual,
                    'score': score,
                    'error': None
                })
            except subprocess.TimeoutExpired:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': 'TIMEOUT',
                    'score': 0.0,
                    'error': 'Timeout'
                })
            except Exception as e:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': 'ERROR',
                    'score': 0.0,
                    'error': str(e)
                })
    finally:
        os.unlink(temp_path)
    return total_score, len(test_cases), results


# ============================================================
# 2. Static analysis helpers (AST)
# ============================================================
def get_source_code(code_file):
    with default_storage.open(code_file.name, 'r') as f:
        return f.read()


def get_ast_from_source(source):
    try:
        return ast.parse(source)
    except SyntaxError:
        return None


def analyze_syntax(code_file):
    source = get_source_code(code_file)
    return 1.0 if get_ast_from_source(source) is not None else 0.0


def analyze_function_structure(code_file, assignment):
    source = get_source_code(code_file)
    tree = get_ast_from_source(source)
    if tree is None:
        return 0.0, 0  # max points 0 if syntax error

    functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
    if not functions:
        return 0.0, 1  # didn't define any function, so max is 1 (if required)

    func = functions[0]
    # We'll compute score based on config. For now, assume we want points for existence,
    # name match, param count match. We'll return raw score and max possible.
    max_possible = 1  # at least existence
    score = 1.0

    # Get requirements from assignment (prefer grading_config if present)
    config = assignment.grading_config if hasattr(assignment, 'grading_config') else {}
    func_req = config.get('function_requirements', {})
    required = func_req.get('required', True)
    if not required:
        # If not required, we give no points for function structure.
        return 0.0, 0

    required_name = func_req.get('name') or assignment.required_function_name
    required_param = func_req.get('param_count') or assignment.required_param_count

    if required_name:
        max_possible += 1
        if func.name == required_name:
            score += 1.0
    if required_param is not None:
        max_possible += 1
        param_count = len(func.args.args)
        if param_count == required_param:
            score += 1.0

    return score, max_possible


def analyze_return_statement(code_file):
    source = get_source_code(code_file)
    tree = get_ast_from_source(source)
    if tree is None:
        return 0.0
    for node in ast.walk(tree):
        if isinstance(node, ast.Return):
            return 1.0
    return 0.0


def has_docstring(code_file):
    source = get_source_code(code_file)
    tree = get_ast_from_source(source)
    if tree is None:
        return 0.0
    if ast.get_docstring(tree):
        return 1.0
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            if ast.get_docstring(node):
                return 1.0
    return 0.0


def run_pylint(code_file):
    source = get_source_code(code_file)
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as f:
        f.write(source)
        temp_path = f.name
    try:
        result = subprocess.run(
            ['pylint', temp_path, '--exit-zero', '--output-format=text'],
            capture_output=True,
            text=True
        )
        output = result.stdout
        match = re.search(r'rated at ([\d\.]+)/10', output)
        if match:
            score = float(match.group(1))
            return min(score, 10.0)
        return 0.0
    finally:
        os.unlink(temp_path)


# ============================================================
# 3. Main grading orchestrator with config
# ============================================================
def get_grading_config(assignment):
    """Return full config with defaults merged."""
    default = {
        "weights": {
            "syntax": 10,
            "function": 15,
            "return": 5,
            "tests": 40,
            "style": 10,
            "docstring": 10
        },
        "function_requirements": {
            "required": True,
            "name": None,
            "param_count": None
        },
        "require_return": True,
        "require_docstring": False,
        "use_pylint": True,
        # additional checks can be added later
    }
    if assignment.grading_config:
        # Deep merge (simplistic: override top-level keys, but for nested we'd need more)
        for key, value in assignment.grading_config.items():
            if isinstance(value, dict) and key in default and isinstance(default[key], dict):
                default[key].update(value)
            else:
                default[key] = value
    # Also incorporate old fields for backward compatibility
    if assignment.required_function_name:
        default["function_requirements"]["name"] = assignment.required_function_name
    if assignment.required_param_count is not None:
        default["function_requirements"]["param_count"] = assignment.required_param_count
    return default


def grade_submission(code_file, assignment, test_cases):
    config = get_grading_config(assignment)
    weights = config.get("weights", {})
    func_req = config.get("function_requirements", {})
    require_return = config.get("require_return", True)
    require_docstring = config.get("require_docstring", False)
    use_pylint = config.get("use_pylint", True)

    # We'll compute raw points per category, then sum and normalize to total possible points.
    # The total possible points = sum of weights (if all checks are performed). But if some
    # checks are disabled by config (e.g., function not required), we should set their weight to 0.
    # For simplicity, we'll compute each score out of its weight, but if the check is disabled,
    # we set both actual and max to 0.

    # 1. Syntax (always performed)
    syntax_weight = weights.get("syntax", 0)
    syntax_score = analyze_syntax(code_file) * syntax_weight if syntax_weight > 0 else 0

    # 2. Function structure
    func_weight = weights.get("function", 0)
    if func_req.get("required", True) and func_weight > 0:
        raw_score, max_possible = analyze_function_structure(code_file, assignment)
        # raw_score is out of max_possible; we scale to weight
        func_score = (raw_score / max_possible) * func_weight if max_possible > 0 else 0
    else:
        func_score = 0

    # 3. Return statement
    return_weight = weights.get("return", 0)
    if require_return and return_weight > 0:
        return_score = analyze_return_statement(code_file) * return_weight
    else:
        return_score = 0

    # 4. Test cases
    test_weight = weights.get("tests", 0)
    if test_weight > 0:
        test_total_score, test_count, test_results = run_code_tests(code_file, test_cases)
        test_score = (test_total_score / test_count) * test_weight if test_count > 0 else 0
    else:
        test_score = 0
        test_results = []

    # 5. Style (pylint)
    style_weight = weights.get("style", 0)
    if use_pylint and style_weight > 0:
        style_raw = run_pylint(code_file)  # out of 10
        style_score = (style_raw / 10) * style_weight
    else:
        style_score = 0

    # 6. Docstring
    doc_weight = weights.get("docstring", 0)
    if require_docstring and doc_weight > 0:
        doc_score = has_docstring(code_file) * doc_weight
    else:
        doc_score = 0

    # Total possible points is sum of all weights that are enabled
    total_possible = (
        syntax_weight +
        (func_weight if func_req.get("required", True) else 0) +
        (return_weight if require_return else 0) +
        test_weight +
        (style_weight if use_pylint else 0) +
        (doc_weight if require_docstring else 0)
    )
    total_raw = syntax_score + func_score + return_score + test_score + style_score + doc_score

    # Normalize to 100
    total_grade = (total_raw / total_possible) * 100 if total_possible > 0 else 0

    breakdown = {
        'syntax': syntax_score,
        'function': func_score,
        'return': return_score,
        'tests': test_score,
        'style': style_score,
        'doc': doc_score,
        'total_raw': total_raw,
        'total_grade': total_grade,
        'test_details': test_results,
    }
    return total_grade, breakdown