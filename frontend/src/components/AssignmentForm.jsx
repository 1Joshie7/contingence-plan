import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Settings, 
  TestTube,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  X,
  AlertCircle,
  Code2,
  Terminal
} from 'lucide-react';
import api from '../services/api';

export default function AssignmentForm({ initialData, submitLabel, assignmentId, mode = 'create' }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline ? initialData.deadline.slice(0, 16) : '',
  });

  // Course fields
  const [courseCode, setCourseCode] = useState(initialData?.course?.code || '');
  const [courseTitle, setCourseTitle] = useState(initialData?.course?.title || '');
  const [faculty, setFaculty] = useState(initialData?.course?.faculty || '');

  const [weights, setWeights] = useState({
    syntax: 10,
    function: 20,
    tests: 50,
    style: 10,
    docstring: 10,
  });
  const [functionRequirements, setFunctionRequirements] = useState({
    required: true,
    name: 'solve',
    param_count: 2,
  });
  const [requireReturn, setRequireReturn] = useState(true);
  const [requireDocstring, setRequireDocstring] = useState(true);
  const [usePylint, setUsePylint] = useState(true);

  const [localTestCases, setLocalTestCases] = useState([]);
  const [backendTestCases, setBackendTestCases] = useState([]);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [testCaseForm, setTestCaseForm] = useState({
    test_type: 'stdout',
    input_data: '',
    expected_output: '',
    is_hidden: false,
    function_name: '',
    arguments: '',
  });
  const [loadingTestCases, setLoadingTestCases] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If editing, load assignment data and override form
  useEffect(() => {
    if (mode === 'edit' && assignmentId) {
      fetchAssignmentData();
    }
  }, [mode, assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      const { data } = await api.get(`/assignments/${assignmentId}/`);
      setForm({
        title: data.title,
        description: data.description,
        deadline: data.deadline ? data.deadline.slice(0, 16) : '',
      });
      if (data.course) {
        setCourseCode(data.course.code);
        setCourseTitle(data.course.title);
        setFaculty(data.course.faculty || '');
      }
      if (data.grading_config) {
        const cfg = data.grading_config;
        if (cfg.weights) setWeights(cfg.weights);
        if (cfg.function_requirements) setFunctionRequirements(cfg.function_requirements);
        if (cfg.require_return !== undefined) setRequireReturn(cfg.require_return);
        if (cfg.require_docstring !== undefined) setRequireDocstring(cfg.require_docstring);
        if (cfg.use_pylint !== undefined) setUsePylint(cfg.use_pylint);
      }
      await fetchTestCases();
    } catch (err) {
      setError('Failed to load assignment');
      toast.error('Failed to load assignment');
    }
  };

  const fetchTestCases = async () => {
    setLoadingTestCases(true);
    try {
      const { data } = await api.get('/testcases/');
      const filtered = data.filter(tc => Number(tc.assignment) === Number(assignmentId));
      setBackendTestCases(filtered);
    } catch (err) {
      setError('Could not load test cases');
    } finally {
      setLoadingTestCases(false);
    }
  };

  // Helper: ensure course exists, returns course ID
  const ensureCourse = async () => {
    if (!courseCode || !courseTitle) {
      throw new Error('Course code and title are required');
    }

    let courses = [];
    try {
      const { data } = await api.get('/courses/');
      courses = data;
    } catch (err) {
      console.warn('Could not fetch courses, assuming none exist', err);
      courses = [];
    }

    const existing = courses.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
    if (existing) {
      return existing.id;
    } else {
      const payload = {
        code: courseCode,
        title: courseTitle,
        faculty: faculty || '',
      };
      const { data: newCourse } = await api.post('/courses/', payload);
      return newCourse.id;
    }
  };

  const handleAssignmentChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWeightChange = (e) => {
    setWeights({ ...weights, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleFuncReqChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFunctionRequirements({
      ...functionRequirements,
      [name]: type === 'checkbox' ? checked : (name === 'param_count' ? parseInt(value) : value),
    });
  };

  const handleTestCaseChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setTestCaseForm({ ...testCaseForm, [name]: checked });
    } else {
      setTestCaseForm({ ...testCaseForm, [name]: value });
    }
  };

  const resetTestCaseForm = () => {
    setTestCaseForm({
      test_type: 'stdout',
      input_data: '',
      expected_output: '',
      is_hidden: false,
      function_name: '',
      arguments: '',
    });
    setEditingTestCase(null);
    setError('');
  };

  // Improved argument parsing for function test cases
  const buildTestCasePayload = () => {
    const base = {
      is_hidden: testCaseForm.is_hidden,
      expected_output: testCaseForm.expected_output,
    };
    if (testCaseForm.test_type === 'stdout') {
      return {
        ...base,
        test_type: 'stdout',
        input_data: testCaseForm.input_data || '',
      };
    } else {
      let args = [];
      const raw = testCaseForm.arguments.trim();
      if (raw) {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            args = parsed;
          } else {
            // If it's a single value, wrap in array
            args = [parsed];
          }
        } catch {
          // Not JSON – treat as comma‑separated values
          args = raw.split(',').map(v => {
            v = v.trim();
            // Try to convert to number if possible
            const num = Number(v);
            return isNaN(num) ? v : num;
          });
        }
      }
      return {
        ...base,
        test_type: 'function',
        function_name: testCaseForm.function_name,
        arguments: args,
      };
    }
  };

  const addTestCaseCreate = () => {
    if (!testCaseForm.expected_output) {
      setError('Expected output is required');
      return;
    }
    setError('');
    const newTc = buildTestCasePayload();
    // assign a temporary id for the frontend list
    newTc.id = Date.now();
    if (editingTestCase) {
      const updated = localTestCases.map(tc =>
        tc.id === editingTestCase.id ? { ...newTc, id: editingTestCase.id } : tc
      );
      setLocalTestCases(updated);
    } else {
      setLocalTestCases([...localTestCases, newTc]);
    }
    resetTestCaseForm();
  };

  const addTestCaseEdit = async () => {
    if (!testCaseForm.expected_output) {
      setError('Expected output is required');
      return;
    }
    setError('');
    if (!assignmentId) return;
    try {
      let payload = buildTestCasePayload();
      // Add the assignment field (required by backend)
      payload = { ...payload, assignment: assignmentId };
      console.log('Sending test case payload:', payload);
      if (editingTestCase) {
        await api.put(`/testcases/${editingTestCase.id}/`, payload);
        toast.success('Test case updated');
      } else {
        await api.post('/testcases/', payload);
        toast.success('Test case added');
      }
      await fetchTestCases();
      resetTestCaseForm();
    } catch (err) {
      console.error('Backend error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to save test case');
      toast.error('Failed to save test case');
    }
  };

  const deleteTestCase = async (tc) => {
    if (!window.confirm('Delete this test case?')) return;
    if (mode === 'create') {
      setLocalTestCases(localTestCases.filter(t => t.id !== tc.id));
      toast.success('Test case removed');
    } else {
      try {
        await api.delete(`/testcases/${tc.id}/`);
        await fetchTestCases();
        toast.success('Test case deleted');
      } catch (err) {
        setError('Failed to delete test case');
        toast.error('Failed to delete test case');
      }
    }
  };

  const editTestCase = (tc) => {
    setTestCaseForm({
      test_type: tc.test_type || 'stdout',
      input_data: tc.input_data || '',
      expected_output: tc.expected_output,
      is_hidden: tc.is_hidden,
      function_name: tc.function_name || '',
      arguments: tc.arguments ? JSON.stringify(tc.arguments) : '',
    });
    setEditingTestCase(tc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let courseId;
      try {
        courseId = await ensureCourse();
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const assignmentData = {
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        course_id: courseId,   // backend expects course_id
        grading_config: {
          weights,
          function_requirements: functionRequirements,
          require_return: requireReturn,
          require_docstring: requireDocstring,
          use_pylint: usePylint,
        },
      };

      if (mode === 'create') {
        const { data: newAssignment } = await api.post('/assignments/', assignmentData);
        for (const tc of localTestCases) {
          const payload = {
            assignment: newAssignment.id,
            test_type: tc.test_type,
            is_hidden: tc.is_hidden,
            expected_output: tc.expected_output,
          };
          if (tc.test_type === 'stdout') {
            payload.input_data = tc.input_data || '';
          } else {
            payload.function_name = tc.function_name;
            payload.arguments = tc.arguments;
          }
          await api.post('/testcases/', payload);
        }
        toast.success('Assignment created successfully');
        navigate('/lecturer');
      } else {
        await api.put(`/assignments/${assignmentId}/`, assignmentData);
        toast.success('Assignment updated successfully');
        navigate('/lecturer');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save assignment');
      toast.error('Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const displayTestCases = mode === 'create' ? localTestCases : backendTestCases;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleAssignmentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleAssignmentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleAssignmentChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Course Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., HSE211"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Introduction to Programming"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Computing"
              />
            </div>
          </div>
        </div>

        {/* Grading Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Grading Configuration</h2>
          </div>

          {/* Weights */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Weights (total: {totalWeight}%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(weights).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-sm text-gray-600 capitalize">{key}</label>
                  <input
                    type="number"
                    name={key}
                    value={val}
                    onChange={handleWeightChange}
                    min="0"
                    max="100"
                    className="w-24 border rounded px-2 py-1 text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Function Requirements */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Function Requirements</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="required"
                  checked={functionRequirements.required}
                  onChange={handleFuncReqChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Require a specific function</span>
              </label>
              {functionRequirements.required && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm text-gray-600">Function Name</label>
                    <input
                      type="text"
                      name="name"
                      value={functionRequirements.name}
                      onChange={handleFuncReqChange}
                      className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Parameter Count</label>
                    <input
                      type="number"
                      name="param_count"
                      value={functionRequirements.param_count}
                      onChange={handleFuncReqChange}
                      min="0"
                      className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Checks */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={requireReturn}
                onChange={(e) => setRequireReturn(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Require return statement</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={requireDocstring}
                onChange={(e) => setRequireDocstring(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Require docstring</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={usePylint}
                onChange={(e) => setUsePylint(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Use pylint for style checking</span>
            </label>
          </div>
        </div>

        {/* Test Cases Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TestTube className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Test Cases</h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">{editingTestCase ? 'Edit Test Case' : 'Add New Test Case'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  name="test_type"
                  value={testCaseForm.test_type}
                  onChange={handleTestCaseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="stdout">Standard Output (run whole program)</option>
                  <option value="function">Function Call (test specific function)</option>
                </select>
              </div>

              {testCaseForm.test_type === 'stdout' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Input Data (stdin)</label>
                  <textarea
                    name="input_data"
                    value={testCaseForm.input_data}
                    onChange={handleTestCaseChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Multiple inputs? Put them on separate lines"
                  />
                </div>
              )}

              {testCaseForm.test_type === 'function' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Function Name</label>
                    <input
                      type="text"
                      name="function_name"
                      value={testCaseForm.function_name}
                      onChange={handleTestCaseChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., add"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arguments (JSON array or comma-separated)</label>
                    <input
                      type="text"
                      name="arguments"
                      value={testCaseForm.arguments}
                      onChange={handleTestCaseChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., [2,3] or 2,3"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output</label>
                <textarea
                  name="expected_output"
                  value={testCaseForm.expected_output}
                  onChange={handleTestCaseChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_hidden"
                  checked={testCaseForm.is_hidden}
                  onChange={handleTestCaseChange}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label className="text-sm text-gray-700">Hidden (not visible to students)</label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={mode === 'create' ? addTestCaseCreate : addTestCaseEdit}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  {editingTestCase ? 'Update Test Case' : 'Add Test Case'}
                </button>
                {editingTestCase && (
                  <button
                    type="button"
                    onClick={resetTestCaseForm}
                    className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {mode === 'edit' && loadingTestCases && <div className="text-center py-4">Loading test cases...</div>}
          {displayTestCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No test cases yet. Add one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Output</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hidden</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTestCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          {tc.test_type === 'function' ? (
                            <Code2 className="h-4 w-4 text-purple-500" />
                          ) : (
                            <Terminal className="h-4 w-4 text-green-500" />
                          )}
                          <span>{tc.test_type === 'function' ? 'Function' : 'Stdout'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {tc.test_type === 'function' ? (
                          <code className="bg-gray-100 px-1 py-0.5 rounded">{tc.function_name}({JSON.stringify(tc.arguments)})</code>
                        ) : (
                          <code className="bg-gray-100 px-1 py-0.5 rounded">{tc.input_data || '(empty)'}</code>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-pre-wrap">{tc.expected_output}</td>
                      <td className="px-4 py-3 text-sm">{tc.is_hidden ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => editTestCase(tc)} className="text-indigo-600 hover:text-indigo-800">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteTestCase(tc)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-4 justify-end">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : submitLabel}
          </motion.button>
          <button
            type="button"
            onClick={() => navigate('/lecturer')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}