import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  LogOut, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  FileCode, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  Eye,
  Code2
} from 'lucide-react';
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

  const course = assignment.course;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/student')} 
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Assignment Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignment.title}</h1>
                <p className="text-gray-600">{assignment.description}</p>
              </div>
              <div className="bg-indigo-50 rounded-full p-3">
                <FileCode className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Course Information */}
          {course && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Course Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-gray-800">{course.code} {course.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lecturer</p>
                  <p className="font-medium text-gray-800">{course.lecturer?.first_name} {course.lecturer?.last_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Assignment Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="font-medium text-gray-800">{new Date(assignment.deadline).toLocaleString()}</p>
              </div>
              {assignment.grading_config?.weights && (
                <div>
                  <p className="text-sm text-gray-500">Grading Weights</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {Object.entries(assignment.grading_config.weights).map(([key, val]) => (
                      <li key={key} className="text-gray-700"><span className="font-medium">{key}:</span> {val}%</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Test Cases */}
          {testCases.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Sample Test Cases</h2>
              </div>
              <div className="space-y-4">
                {testCases.map((tc, idx) => (
                  <div key={tc.id} className="border-l-4 border-indigo-400 bg-indigo-50/30 pl-4 py-2 rounded-r-md">
                    <p className="font-medium text-gray-800">Test Case {idx + 1}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Input:</span> {tc.input_data || '(empty)'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Expected Output:</span> {tc.expected_output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Area */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Submit Your Solution</h2>
            </div>

            {loadingSubmission ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : existingSubmission ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium">You have already submitted this assignment.</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your grade: {existingSubmission.grade?.toFixed(2)}%<br />
                      Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition">
                  <input
                    type="file"
                    accept=".py"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">Python files only (.py)</p>
                  </label>
                  {file && (
                    <div className="mt-3 text-sm text-indigo-600 font-medium">
                      Selected: {file.name}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Submit Assignment
                    </>
                  )}
                </button>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            )}

            {feedback && (
              <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800">Feedback & Grade</h3>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600">{feedback.grade.toFixed(2)}%</span>
                </div>
                <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm bg-white p-4 rounded-lg border border-gray-100">
                  {feedback.feedback}
                </pre>
              </div>
            )}
          </div>

          {/* Submission History */}
          <SubmissionHistory assignmentId={id} />
        </motion.div>
      </main>
    </div>
  );
}