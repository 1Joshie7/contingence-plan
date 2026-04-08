import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  LogOut, 
  GraduationCap, 
  FileCode, 
  Award, 
  Calendar,
  User,
  CheckCircle,
  Code2
} from 'lucide-react';
import api from '../services/api';

export default function SubmissionDetail() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const { data } = await api.get(`/submissions/${id}/`);
        setSubmission(data);
      } catch (err) {
        setError('Failed to load submission');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Submission Details</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-gray-800">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-800">Submission not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const student = submission.student || {};
  const fullName = student.first_name || student.last_name
    ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
    : student.username || 'Unknown Student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
      {/* Premium Blue Navbar */}
      <nav className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Submission Details</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Student Info Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 rounded-xl p-2">
                  <User className="h-6 w-6" />
                </div>
                <span className="text-white/80 text-sm">Student Information</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
              {student.reg_number && (
                <p className="text-white/80">Registration: {student.reg_number}</p>
              )}
              <div className="flex items-center gap-2 mt-3 text-white/70 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Grade & Feedback Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">Grade & Feedback</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Final Grade</span>
                </div>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-2 shadow-md">
                  <span className="text-2xl font-bold text-white">{submission.grade?.toFixed(2)}%</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed">
                  {submission.feedback || 'No feedback provided.'}
                </pre>
              </div>
            </div>
          </div>

          {/* Submitted Code Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">Submitted Code</h2>
              </div>
            </div>
            <div className="p-6">
              {submission.code_file ? (
                <a 
                  href={submission.code_file} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <FileCode className="h-5 w-5" />
                  View Python File
                </a>
              ) : (
                <p className="text-gray-500">No code file available.</p>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}