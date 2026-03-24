import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  if (loading) return <div className="text-center py-4">Loading history...</div>;
  if (submissions.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Submissions</h3>
      <div className="space-y-3">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <p className="text-sm text-gray-500">Submitted: {formatDate(sub.submitted_at)}</p>
                <p className="text-xl font-bold text-indigo-600 mt-1">
                  {sub.grade?.toFixed(2) ?? 'N/A'}%
                </p>
              </div>
              <button
                onClick={() => setSelected(sub)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View Details
              </button>
            </div>
            {sub.feedback && (
              <div className="mt-2 text-gray-600 text-sm line-clamp-2">
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
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Submission Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Submitted: {formatDate(selected.submitted_at)}</p>
              <p className="text-2xl font-bold text-indigo-600 mb-4">Grade: {selected.grade?.toFixed(2) ?? 'N/A'}%</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Feedback</h4>
                <pre className="whitespace-pre-wrap text-gray-600 text-sm font-sans">{selected.feedback || 'No feedback provided.'}</pre>
              </div>
              {selected.code_file && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Code</h4>
                  <a href={selected.code_file} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">View submitted code</a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}