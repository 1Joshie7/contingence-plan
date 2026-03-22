import subprocess
import tempfile
import os
import ast
import re
from google import genai
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
                    'passed': (score >= 0.9),
                    'score': score,
                    'error': None
                })
            except subprocess.TimeoutExpired:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': 'TIMEOUT',
                    'passed': False,
                    'score': 0.0,
                    'error': 'Timeout'
                })
            except Exception as e:
                results.append({
                    'input': test_case.input_data,
                    'expected': test_case.expected_output,
                    'actual': 'ERROR',
                    'passed': False,
                    'score': 0.0,
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
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return None

    client = genai.Client(api_key=api_key)

    test_summary = []
    for r in test_results:
        if 'error' in r and r['error']:
            test_summary.append(f"Error: {r['error']}")
        else:
            test_summary.append(
                f"Test input: {r['input']} expected: {r['expected']} got: {r['actual']} -> {'PASS' if r.get('passed', False) else 'FAIL'}"
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
        print(f"Gemini API error: {e}")
        return None

# ============================================================
# 4. Main grading orchestrator
# ============================================================
def grade_submission(code_file, assignment, test_cases):
    config = assignment.grading_config if assignment.grading_config else {}
    
    default_weights = {
        'syntax': 10,
        'function': 15,
        'return': 5,
        'tests': 40,
        'style': 10,
        'doc': 10,
    }
    user_weights = config.get('weights', {})
    weights = {**default_weights, **user_weights}
    
    func_req = config.get('function_requirements', {'required': False})
    require_return = config.get('require_return', False)
    require_docstring = config.get('require_docstring', False)
    use_pylint = config.get('use_pylint', True)

    total_possible = sum(weights.values())

    # 1. Syntax
    syntax_score = analyze_syntax(code_file) * weights['syntax']

    # 2. Function structure
    if weights['function'] > 0:
        f_score, f_max = analyze_function_structure(code_file, func_req)
        if f_max > 0:
            func_score = (f_score / f_max) * weights['function']
        else:
            func_score = 0
    else:
        func_score = 0

    # 3. Return statement
    if require_return and weights['return'] > 0:
        return_score = analyze_return_statement(code_file) * weights['return']
    else:
        return_score = 0

    # 4. Test cases
    test_total, test_count, test_results = run_code_tests(code_file, test_cases)
    test_score = (test_total / test_count) * weights['tests'] if test_count > 0 else 0

    # 5. Style
    if use_pylint and weights['style'] > 0:
        style_raw = run_pylint(code_file)
        style_score = (style_raw / 10) * weights['style']
    else:
        style_score = 0

    # 6. Documentation
    if require_docstring and weights['doc'] > 0:
        doc_score = has_docstring(code_file) * weights['doc']
    else:
        doc_score = 0

    total_raw = syntax_score + func_score + return_score + test_score + style_score + doc_score
    total_grade = (total_raw / total_possible) * 100 if total_possible > 0 else 0

    # Build feedback (non‑AI part)
    feedback = f"Total grade: {total_grade:.1f}%\n"
    feedback += f"Syntax: {syntax_score:.1f} / {weights['syntax']}\n"
    feedback += f"Function structure: {func_score:.1f} / {weights['function']}\n"
    feedback += f"Return statement: {return_score:.1f} / {weights['return']}\n"
    feedback += f"Test cases: {test_score:.1f} / {weights['tests']}\n"
    feedback += f"Code style: {style_score:.1f} / {weights['style']}\n"
    feedback += f"Documentation: {doc_score:.1f} / {weights['doc']}\n"

    # AI feedback
    source = get_source_code(code_file)
    ai_feedback = get_ai_feedback(source, test_results, assignment.description)
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
        'test_details': test_results,
    }
    return total_grade, breakdown, feedback
    config = assignment.grading_config if assignment.grading_config else {}
    weights = config.get('weights', {
        'syntax': 10,
        'function': 15,
        'return': 5,
        'tests': 40,
        'style': 10,
        'doc': 10,
    })
    func_req = config.get('function_requirements', {'required': False})
    require_return = config.get('require_return', False)
    require_docstring = config.get('require_docstring', False)
    use_pylint = config.get('use_pylint', True)

    total_possible = sum(weights.values())

    # 1. Syntax
    syntax_score = analyze_syntax(code_file) * weights['syntax']

    # 2. Function structure
    if weights['function'] > 0:
        f_score, f_max = analyze_function_structure(code_file, func_req)
        if f_max > 0:
            func_score = (f_score / f_max) * weights['function']
        else:
            func_score = 0
    else:
        func_score = 0

    # 3. Return statement
    if require_return and weights['return'] > 0:
        return_score = analyze_return_statement(code_file) * weights['return']
    else:
        return_score = 0

    # 4. Test cases
    test_total, test_count, test_results = run_code_tests(code_file, test_cases)
    test_score = (test_total / test_count) * weights['tests'] if test_count > 0 else 0

    # 5. Style
    if use_pylint and weights['style'] > 0:
        style_raw = run_pylint(code_file)
        style_score = (style_raw / 10) * weights['style']
    else:
        style_score = 0

    # 6. Documentation
    if require_docstring and weights['doc'] > 0:
        doc_score = has_docstring(code_file) * weights['doc']
    else:
        doc_score = 0

    total_raw = syntax_score + func_score + return_score + test_score + style_score + doc_score
    total_grade = (total_raw / total_possible) * 100 if total_possible > 0 else 0

    # Build feedback (non‑AI part)
    feedback = f"Total grade: {total_grade:.1f}%\n"
    feedback += f"Syntax: {syntax_score:.1f} / {weights['syntax']}\n"
    feedback += f"Function structure: {func_score:.1f} / {weights['function']}\n"
    feedback += f"Return statement: {return_score:.1f} / {weights['return']}\n"
    feedback += f"Test cases: {test_score:.1f} / {weights['tests']}\n"
    feedback += f"Code style: {style_score:.1f} / {weights['style']}\n"
    feedback += f"Documentation: {doc_score:.1f} / {weights['doc']}\n"

    # AI feedback
    source = get_source_code(code_file)
    ai_feedback = get_ai_feedback(source, test_results, assignment.description)
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
        'test_details': test_results,
    }
    return total_grade, breakdown, feedback