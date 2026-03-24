import subprocess
import tempfile
import os
import ast
import re
import logging
from google import genai
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)

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
                    'passed': (score >= 0.9),
                    'score': score,
                    'is_hidden': test_case.is_hidden,
                    'error': None
                })
            except subprocess.TimeoutExpired:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': 'TIMEOUT',
                    'passed': False,
                    'score': 0.0,
                    'is_hidden': test_case.is_hidden,
                    'error': 'Timeout'
                })
            except Exception as e:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': 'ERROR',
                    'passed': False,
                    'score': 0.0,
                    'is_hidden': test_case.is_hidden,
                    'error': str(e)
                })
    finally:
        os.unlink(temp_path)

    return total_score, len(test_cases), results


# ============================================================
# 2. Static analysis (direct file reading)
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


def analyze_function_structure(code_file, config):
    source = get_source_code(code_file)
    tree = get_ast_from_source(source)
    if tree is None:
        return 0.0, 0

    functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
    if not functions:
        return 0.0, 1 if config.get('required', False) else 0

    func = functions[0]
    max_possible = 1
    score = 1.0

    if config.get('name'):
        max_possible += 1
        if func.name == config['name']:
            score += 1.0
    if config.get('param_count') is not None:
        max_possible += 1
        param_count = len(func.args.args)
        if param_count == config['param_count']:
            score += 1.0

    if not config.get('required', False):
        score -= 1.0
        max_possible -= 1

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
# 3. AI Feedback (Gemini)
# ============================================================
def get_ai_feedback(student_code, test_results, assignment_description):
    """Generate AI feedback with test results (for visible tests)."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        logger.warning("GEMINI_API_KEY not set, skipping AI feedback")
        return None

    client = genai.Client(api_key=api_key)

    test_summary = []
    for r in test_results:
        if r.get('error'):
            test_summary.append(f"Error: {r['error']}")
        else:
            hidden_note = " (hidden test)" if r.get('is_hidden') else ""
            test_summary.append(
                f"Test{hidden_note}: input={r['input']} expected={r['expected']} got={r['actual']} -> {'PASS' if r['passed'] else 'FAIL'}"
            )
    test_summary_str = "\n".join(test_summary)

    prompt = f"""
You are a programming instructor. The assignment description: {assignment_description}

Here is the student's code:
```
{student_code}
```

Test results (each test compares stdout with expected output):
{test_summary_str}

Give a very short, encouraging, and constructive feedback (max 3 sentences). Focus on what the student did well and one specific thing to improve.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None


def get_ai_feedback_generic(student_code, assignment_description):
    """Generate AI feedback when no visible test cases exist."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        logger.warning("GEMINI_API_KEY not set, skipping AI feedback")
        return None

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are a programming instructor. The assignment description: {assignment_description}

Here is the student's code:
```
{student_code}
```

The assignment uses hidden test cases, so I cannot show you the specific test results. 
However, please give a short, encouraging, and constructive feedback (max 3 sentences) based only on the code itself. 
Focus on code structure, style, and logic. Do not mention test cases since they are hidden.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None
    
    # generic feedback when no visible tests exist

def get_ai_feedback_generic(student_code, assignment_description):
    """Generate AI feedback when no visible test cases exist."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        logger.warning("GEMINI_API_KEY not set, skipping AI feedback")
        return None

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are a programming instructor. The assignment description: {assignment_description}

Here is the student's code:
```
{student_code}  
```

The assignment uses hidden test cases, so I cannot show you the specific test results. 
However, please give a short, encouraging, and constructive feedback (max 3 sentences) based only on the code itself. 
Focus on code structure, style, and logic. Do not mention test cases since they are hidden.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None

# ============================================================
# 4. Score Calculators
# ============================================================
def compute_syntax_score(code_file, weight):
    return analyze_syntax(code_file) * weight


def compute_function_score(code_file, config, weight):
    if weight <= 0:
        return 0
    f_score, f_max = analyze_function_structure(code_file, config)
    if f_max > 0:
        return (f_score / f_max) * weight
    return 0


def compute_return_score(code_file, require_return, weight):
    if not require_return or weight <= 0:
        return 0
    return analyze_return_statement(code_file) * weight


def compute_test_score(code_file, test_cases, weight):
    if weight <= 0 or not test_cases:
        return 0, []
    test_total, test_count, test_results = run_code_tests(code_file, test_cases)
    score = (test_total / test_count) * weight if test_count > 0 else 0
    return score, test_results


def compute_style_score(code_file, use_pylint, weight):
    if not use_pylint or weight <= 0:
        return 0
    style_raw = run_pylint(code_file)
    return (style_raw / 10) * weight


def compute_doc_score(code_file, require_docstring, weight):
    if not require_docstring or weight <= 0:
        return 0
    return has_docstring(code_file) * weight


# ============================================================
# 5. Main grading orchestrator
# ============================================================
def grade_submission(code_file, assignment, test_cases):
    config = assignment.grading_config if assignment.grading_config else {}
    
    # Default weights
    default_weights = {
        'syntax': 10,
        'function': 15,
        'return': 5,
        'tests': 40,
        'style': 10,
        'doc': 10,
    }
    
    # Merge user weights
    user_weights = config.get('weights', {})
    weights = default_weights.copy()
    for key, value in user_weights.items():
        if key in weights:
            weights[key] = value
        elif key == 'docstring':
            weights['doc'] = value
        else:
            logger.warning(f"Unknown weight key: {key}")
    
    # Get flags from config
    func_req = config.get('function_requirements', {'required': False})
    require_return = config.get('require_return', False)
    require_docstring = config.get('require_docstring', False)
    use_pylint = config.get('use_pylint', True)
    
    total_possible = sum(weights.values())
    
    if total_possible == 0:
        return 0.0, {}, "No grading rubric configured."
    
    # Separate test cases
    visible_test_cases = [tc for tc in test_cases if not tc.is_hidden]
    hidden_test_cases = [tc for tc in test_cases if tc.is_hidden]
    
    # Determine which test cases to use for grading
    # If visible tests exist, use them; otherwise use hidden tests
    grading_test_cases = visible_test_cases if visible_test_cases else hidden_test_cases
    
    # Compute scores
    syntax_score = compute_syntax_score(code_file, weights['syntax'])
    func_score = compute_function_score(code_file, func_req, weights['function'])
    return_score = compute_return_score(code_file, require_return, weights['return'])
    
    # Run tests for grading
    test_score, all_test_results = compute_test_score(code_file, grading_test_cases, weights['tests'])
    
    # Run tests for student feedback (only visible tests, weight 0 so they don't affect grade)
    if visible_test_cases:
        _, visible_test_results = compute_test_score(code_file, visible_test_cases, 0)
    else:
        visible_test_results = []
    
    style_score = compute_style_score(code_file, use_pylint, weights['style'])
    doc_score = compute_doc_score(code_file, require_docstring, weights['doc'])
    
    total_raw = syntax_score + func_score + return_score + test_score + style_score + doc_score
    total_grade = (total_raw / total_possible) * 100 if total_possible > 0 else 0
    
    # Build human-readable feedback (only show categories with weight > 0)
    feedback = f"Total grade: {total_grade:.1f}%\n"
    
    if weights['syntax'] > 0:
        feedback += f"Syntax: {syntax_score:.1f} / {weights['syntax']}\n"
    if weights['function'] > 0:
        feedback += f"Function structure: {func_score:.1f} / {weights['function']}\n"
    if weights['return'] > 0:
        feedback += f"Return statement: {return_score:.1f} / {weights['return']}\n"
    if weights['tests'] > 0:
        feedback += f"Test cases: {test_score:.1f} / {weights['tests']}\n"
        if not visible_test_cases and hidden_test_cases:
            feedback += "   (All tests are hidden – only final grade is shown)\n"
    if weights['style'] > 0:
        feedback += f"Code style: {style_score:.1f} / {weights['style']}\n"
    if weights['doc'] > 0:
        feedback += f"Documentation: {doc_score:.1f} / {weights['doc']}\n"
    
    # AI feedback uses ONLY visible test results (if any)
    source = get_source_code(code_file)
    if visible_test_results:
        ai_feedback = get_ai_feedback(source, visible_test_results, assignment.description)
    elif hidden_test_cases:
        # No visible tests – provide generic feedback without test details
        ai_feedback = get_ai_feedback_generic(source, assignment.description)
    else:
        ai_feedback = None
    
    if ai_feedback:
        feedback += f"\n\n🤖 AI Suggestion: {ai_feedback}"
    
    breakdown = {
        'syntax': syntax_score,
        'function': func_score,
        'return': return_score,
        'tests': test_score,
        'style': style_score,
        'doc': doc_score,
        'total_raw': total_raw,
        'total_grade': total_grade,
        'test_details': visible_test_results,  # Only visible tests shown
    }
    return total_grade, breakdown, feedback