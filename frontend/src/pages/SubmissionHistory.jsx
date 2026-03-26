import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, FileText, Eye, X, Download } from 'lucide-react';
import api from '../services/api';

export default function SubmissionHistory({ assignmentId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get('/submissions/');
      const filtered = data
        .filter(sub => Number(sub.assignment) === Number(assignmentId))
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      setSubmissions(filtered);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (submissions.length === 0) return null;

  return (
    <div className="mt-10 border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Previous Submissions</h3>
      </div>
      <div className="space-y-3">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Submitted: {formatDate(sub.submitted_at)}</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {sub.grade?.toFixed(2) ?? 'N/A'}%
                </p>
              </div>
              <button
                onClick={() => setSelected(sub)}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
            {sub.feedback && (
              <div className="mt-2 text-gray-600 text-sm line-clamp-2 border-t border-gray-100 pt-2">
                <FileText className="h-4 w-4 inline mr-1 text-gray-400" />
                {sub.feedback.split('\n')[0]}...
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-800">Submission Details</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Submitted: {formatDate(selected.submitted_at)}</span>
                </div>
                <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-3">
                  <span className="text-gray-700 font-medium">Grade:</span>
                  <span className="text-2xl font-bold text-indigo-600">{selected.grade?.toFixed(2) ?? 'N/A'}%</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Feedback</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-gray-600 text-sm font-sans">{selected.feedback || 'No feedback provided.'}</pre>
                  </div>
                </div>
                {selected.code_file && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Submitted Code</h4>
                    <a
                      href={selected.code_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition"
                    >
                      <Download className="h-4 w-4" />
                      View submitted code
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}