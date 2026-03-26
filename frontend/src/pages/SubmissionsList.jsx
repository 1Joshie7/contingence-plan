import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  LogOut, 
  Users, 
  FileCode, 
  MessageSquare,
  ExternalLink
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-8">Loading...</div>
        </main>
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-600" />
              Submissions
            </h1>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <FileCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No submissions yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade (%)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => {
                      const student = submission.student || {};
                      const fullName = student.first_name || student.last_name
                        ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
                        : student.username || 'Unknown Student';
                      return (
                        <tr key={submission.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{fullName}</div>
                            {student.reg_number && (
                              <div className="text-xs text-gray-500">Reg: {student.reg_number}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.submitted_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.grade >= 70 ? 'bg-green-100 text-green-800' :
                              submission.grade >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {submission.grade?.toFixed(2) || 'N/A'}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <a
                                href={submission.code_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                              >
                                <FileCode className="h-4 w-4" />
                                <span>Code</span>
                              </a>
                              <button
                                onClick={() => navigate(`/lecturer/submissions/${submission.id}`)}
                                className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>Feedback</span>
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