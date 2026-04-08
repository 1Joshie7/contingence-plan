import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  LogOut, 
  AlertTriangle, 
  PlayCircle, 
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  BarChart3,
  GraduationCap,
  Shield
} from 'lucide-react';
import api from '../services/api';

export default function PlagiarismReports() {
  const { id } = useParams(); // assignment ID
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [id]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/plagiarism/?assignment=${id}`);
      setReports(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Plagiarism endpoint not yet implemented. Please ask backend to add it.');
      } else {
        setError('Failed to load plagiarism reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerCheck = async () => {
    setChecking(true);
    setError('');
    try {
      const { data } = await api.post('/plagiarism/check/', { assignment: id });
      toast.success(`Plagiarism check started: ${data.message || 'completed'}`);
      setTimeout(() => fetchReports(), 2000);
    } catch (err) {
      setError('Failed to start plagiarism check. Ensure backend endpoint is ready.');
      toast.error('Failed to start check');
    } finally {
      setChecking(false);
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
              <h1 className="text-2xl font-bold text-white">Plagiarism Reports</h1>
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
            <Shield className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Plagiarism Reports</h1>
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

          {/* Header Card */}
          <div className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-xl p-3">
                      <BarChart3 className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">Plagiarism Reports</h1>
                      <p className="text-white/80 mt-1">Detect and review similar code submissions</p>
                    </div>
                  </div>
                  <button
                    onClick={triggerCheck}
                    disabled={checking}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      checking 
                        ? 'bg-white/20 text-white/60 cursor-not-allowed' 
                        : 'bg-white text-purple-600 hover:bg-white/90 shadow-lg'
                    }`}
                  >
                    <PlayCircle className="h-5 w-5" />
                    {checking ? 'Checking...' : 'Run Plagiarism Check'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl flex items-start gap-2 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {reports.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 rounded-full p-4">
                  <Users className="h-12 w-12 text-white/60" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No plagiarism reports found</h3>
              <p className="text-white/60">Click the button above to run a plagiarism check for this assignment.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student A
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student B
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Similarity
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report, idx) => {
                      const similarity = report.similarity_score;
                      const bgColor = similarity >= 80 ? 'bg-red-100 text-red-800' :
                                      similarity >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800';
                      return (
                        <motion.tr 
                          key={report.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.submission1_student || `Submission #${report.submission1}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.submission2_student || `Submission #${report.submission2}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}>
                              {similarity.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-3">
                              <button
                                onClick={() => navigate(`/lecturer/submissions/${report.submission1}`)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-medium transition-colors duration-200"
                                title="View Student A submission"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View A</span>
                              </button>
                              <button
                                onClick={() => navigate(`/lecturer/submissions/${report.submission2}`)}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-medium transition-colors duration-200"
                                title="View Student B submission"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View B</span>
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