import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function PlagiarismReports() {
  const { id } = useParams();
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
      const { data } = await api.get('/plagiarism/');
      const filtered = data.filter(r => Number(r.assignment) === Number(id));
      setReports(filtered);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Plagiarism endpoint not yet implemented. Your backend teammate will add it soon.');
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
      await api.post('/plagiarism/check/', { assignment: id });
      toast.success('Plagiarism check started');
      setTimeout(() => fetchReports(), 3000);
    } catch (err) {
      setError('Failed to start plagiarism check. Ensure backend endpoint is ready.');
      toast.error('Failed to start check');
    } finally {
      setChecking(false);
    }
  };

  const updateReport = async (reportId, reviewed, notes) => {
    try {
      await api.patch(`/plagiarism/${reportId}/`, { reviewed, notes });
      setReports(reports.map(r => r.id === reportId ? { ...r, reviewed, notes } : r));
      toast.success('Report updated');
    } catch (err) {
      toast.error('Failed to update report');
    }
  };

  if (loading) return <div className="text-center py-10">Loading reports...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/lecturer')} className="text-indigo-600 hover:text-indigo-800">← Back to Dashboard</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-gray-600 hover:text-gray-800">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Plagiarism Reports</h1>
            <button
              onClick={triggerCheck}
              disabled={checking}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Run Plagiarism Check'}
            </button>
          </div>

          {error && <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">{error}</div>}

          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No plagiarism reports found for this assignment.</p>
              <p className="text-sm text-gray-400 mt-2">Click the button above to start a check.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission 1</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission 2</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Similarity (%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{report.submission1_student || `Submission #${report.submission1}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{report.submission2_student || `Submission #${report.submission2}`}</td>
                      <td className="px-6 py-4 text-sm font-mono font-semibold">{report.similarity_score?.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm">
                        <input
                          type="checkbox"
                          checked={report.reviewed || false}
                          onChange={(e) => updateReport(report.id, e.target.checked, report.notes)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <input
                          type="text"
                          value={report.notes || ''}
                          onChange={(e) => updateReport(report.id, report.reviewed, e.target.value)}
                          placeholder="Add note..."
                          className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button onClick={() => navigate(`/lecturer/submissions/${report.submission1}`)} className="text-indigo-600 hover:text-indigo-900">View 1</button>
                        <button onClick={() => navigate(`/lecturer/submissions/${report.submission2}`)} className="text-indigo-600 hover:text-indigo-900">View 2</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}