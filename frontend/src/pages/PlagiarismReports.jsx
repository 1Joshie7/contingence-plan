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
  BarChart3
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </nav>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/lecturer')} 
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Plagiarism Reports</h1>
                    <p className="text-gray-500 mt-1">Detect and review similar code submissions</p>
                  </div>
                </div>
                <button
                  onClick={triggerCheck}
                  disabled={checking}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition ${
                    checking 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                  }`}
                >
                  <PlayCircle className="h-5 w-5" />
                  {checking ? 'Checking...' : 'Run Plagiarism Check'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-full p-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No plagiarism reports found</h3>
              <p className="text-gray-500">Click the button above to run a plagiarism check for this assignment.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student A
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student B
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Similarity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => {
                      const similarity = report.similarity_score;
                      const bgColor = similarity >= 80 ? 'bg-red-100 text-red-800' :
                                      similarity >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800';
                      return (
                        <tr key={report.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.submission1_student || `Submission #${report.submission1}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.submission2_student || `Submission #${report.submission2}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
                              {similarity.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-3">
                              <button
                                onClick={() => navigate(`/lecturer/submissions/${report.submission1}`)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                title="View Student A submission"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View A</span>
                              </button>
                              <button
                                onClick={() => navigate(`/lecturer/submissions/${report.submission2}`)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                title="View Student B submission"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View B</span>
                              </button>
                            </div>
                          </td>
                        </tr>
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