import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import SubmissionHistory from './SubmissionHistory';
import SkeletonAssignmentDetail from '../components/SkeletonAssignmentDetail';

export default function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment();
    fetchTestCases();
    checkExistingSubmission();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const { data } = await api.get(`/assignments/${id}/`);
      setAssignment(data);
    } catch (err) {
      setError('Failed to load assignment');
    }
  };

  const fetchTestCases = async () => {
    try {
      const { data } = await api.get('/testcases/');
      const relevant = data.filter(tc => Number(tc.assignment) === Number(id) && !tc.is_hidden);
      setTestCases(relevant);
    } catch (err) {
      console.error('Failed to load test cases', err);
    }
  };

  const checkExistingSubmission = async () => {
    try {
      const { data } = await api.get('/submissions/');
      const submitted = data.find(sub => Number(sub.assignment) === Number(id));
      setExistingSubmission(submitted);
    } catch (err) {
      console.error('Failed to check existing submission', err);
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError('');
    setFeedback(null);
    const formData = new FormData();
    formData.append('assignment', id);
    formData.append('code_file', file);
    try {
      const { data } = await api.post('/submissions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFeedback(data);
      toast.success('Assignment submitted!');
      setExistingSubmission(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed');
      toast.error(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) return <SkeletonAssignmentDetail />;

  const course = assignment.course; // <-- extract course object

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/student')} className="text-indigo-600 hover:text-indigo-800">
            ← Back to Dashboard
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-gray-600 hover:text-gray-800">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignment.title}</h1>
          <p className="text-gray-600 mb-6">{assignment.description}</p>

          {/* Course Information Block */}
          {course && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Course Information</h2>
              <p><strong>Course:</strong> {course.code} {course.title}</p>
              <p><strong>Lecturer:</strong> {course.lecturer?.first_name} {course.lecturer?.last_name}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Assignment Details</h2>
            <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}</p>
            {assignment.grading_config?.weights && (
              <div className="mt-4">
                <strong>Grading Weights:</strong>
                <ul className="list-disc list-inside mt-1">
                  {Object.entries(assignment.grading_config.weights).map(([key, val]) => (
                    <li key={key}>{key}: {val}%</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {testCases.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Sample Test Cases</h2>
              <div className="space-y-4">
                {testCases.map((tc, idx) => (
                  <div key={tc.id} className="border-l-4 border-indigo-400 pl-4">
                    <p className="font-medium">Test Case {idx + 1}</p>
                    <p><strong>Input:</strong> {tc.input_data || '(empty)'}</p>
                    <p><strong>Expected Output:</strong> {tc.expected_output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Submit Your Solution</h2>
            {loadingSubmission ? (
              <p>Checking...</p>
            ) : existingSubmission ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">You have already submitted this assignment.</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your grade: {existingSubmission.grade?.toFixed(2)}%<br />
                  Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Python File (.py)</label>
                  <input
                    type="file"
                    accept=".py"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </motion.button>
                {error && <p className="text-red-500">{error}</p>}
              </form>
            )}

            {feedback && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Feedback</h3>
                <pre className="text-gray-700 whitespace-pre-wrap font-sans">{feedback.feedback}</pre>
                <p className="mt-2 text-indigo-600 font-semibold">Grade: {feedback.grade.toFixed(2)}%</p>
              </div>
            )}
          </div>

          <SubmissionHistory assignmentId={id} />
        </motion.div>
      </main>
    </div>
  );
}