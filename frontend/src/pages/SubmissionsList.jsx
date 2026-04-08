import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  LogOut, 
  Users, 
  FileCode, 
  MessageSquare,
  GraduationCap,
  Calendar,
  Award
} from 'lucide-react';
import api from '../services/api';

export default function SubmissionsList() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get('/submissions/');
      const filtered = data.filter(sub => Number(sub.assignment) === Number(id));
      setSubmissions(filtered);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-white">Submissions</h1>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
      {/* Premium Blue Navbar */}
      <nav className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/lecturer')} 
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Submissions</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 rounded-lg p-2">
                <Users className="h-6 w-6 text-indigo-300" />
              </div>
              <h2 className="text-xl font-semibold text-white">Student Submissions</h2>
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-medium px-2 py-0.5 rounded-full">
                {submissions.length} total
              </span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
              <FileCode className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No submissions yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission, idx) => {
                      const student = submission.student || {};
                      const fullName = student.first_name || student.last_name
                        ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
                        : student.username || 'Unknown Student';
                      return (
                        <motion.tr 
                          key={submission.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{fullName}</div>
                            {student.reg_number && (
                              <div className="text-xs text-gray-500 mt-0.5">Reg: {student.reg_number}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(submission.submitted_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              submission.grade >= 70 ? 'bg-green-100 text-green-700' :
                              submission.grade >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <Award className="h-3 w-3 mr-1" />
                              {submission.grade?.toFixed(2) || 'N/A'}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-4">
                              <a
                                href={submission.code_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                              >
                                <FileCode className="h-4 w-4" />
                                <span>Code</span>
                              </a>
                              <button
                                onClick={() => navigate(`/lecturer/submissions/${submission.id}`)}
                                className="flex items-center gap-1.5 text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>Feedback</span>
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}