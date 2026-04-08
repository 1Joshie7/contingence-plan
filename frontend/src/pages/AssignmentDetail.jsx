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
  Code2,
  Award,
  Clock,
  Users,
  Rocket,
  Sparkles,
  Target
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
      {/* Navigation - Premium Blue Navbar */}
      <nav className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/student')} 
            className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }} 
            className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >

          {/* Course Information Card - NOW WITH GRADIENT (matching Assignment Header) */}
          {course && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl text-white"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white/20 rounded-xl p-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Course Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70 uppercase tracking-wide">Course</p>
                      <p className="font-semibold text-white text-lg">{course.code} {course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70 uppercase tracking-wide">Lecturer</p>
                      <p className="font-semibold text-white text-lg">{course.lecturer?.first_name} {course.lecturer?.last_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Assignment Header - Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 rounded-xl p-2">
                  <FileCode className="h-6 w-6" />
                </div>
                <span className="text-white/80 text-sm">Assignment</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">{assignment.title}</h1>
              <p className="text-white/90 text-lg leading-relaxed">{assignment.description}</p>
            </div>
          </div>

          {/* Assignment Details & Grading Weights - Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignment Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Assignment Details</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 rounded-xl p-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-semibold text-gray-800">{new Date(assignment.deadline).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grading Weights Card */}
            {assignment.grading_config?.weights && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Grading Weights</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {Object.entries(assignment.grading_config.weights).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between group">
                        <span className="text-gray-600 capitalize">{key}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className="font-semibold text-indigo-600">{val}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Test Cases Card */}
          {testCases.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Sample Test Cases</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testCases.map((tc, idx) => (
                    <div key={tc.id} className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-indigo-100 rounded-lg px-2 py-1">
                          <span className="text-xs font-semibold text-indigo-600">Test {idx + 1}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Input</p>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded block font-mono">{tc.input_data || '(empty)'}</code>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expected Output</p>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded block font-mono">{tc.expected_output}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Submission Area Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">Submit Your Solution</h2>
              </div>
            </div>

            <div className="p-6">
              {loadingSubmission ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : existingSubmission ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <CheckCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-yellow-800 font-semibold text-lg">Already Submitted</p>
                      <p className="text-yellow-700 mt-2">
                        Your grade: <span className="font-bold">{existingSubmission.grade?.toFixed(2)}%</span>
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all duration-300 cursor-pointer group">
                    <input
                      type="file"
                      accept=".py"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="bg-indigo-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 group-hover:bg-indigo-200 transition-all duration-300">
                        <Upload className="h-12 w-12 text-indigo-600 mx-auto" />
                      </div>
                      <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">Python files only (.py)</p>
                    </label>
                    {file && (
                      <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-5 w-5" />
                        Submit Assignment
                      </>
                    )}
                  </button>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              )}

              {feedback && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg">Feedback & Grade</h3>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-2 shadow-md">
                      <span className="text-2xl font-bold text-white">{feedback.grade.toFixed(2)}%</span>
                    </div>
                  </div>
                  <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm bg-white p-5 rounded-xl border border-gray-100 leading-relaxed">
                    {feedback.feedback}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>

          {/* Submission History */}
          <SubmissionHistory assignmentId={id} />
        </motion.div>
      </main>
    </div>
  );
}