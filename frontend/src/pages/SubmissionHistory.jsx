import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, FileText, Eye, X, Download, Award, Calendar, CheckCircle } from 'lucide-react';
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (submissions.length === 0) return null;

  return (
    <div className="mt-10 pt-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-indigo-100 rounded-lg p-2">
          <History className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Previous Submissions</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {submissions.length}
        </span>
      </div>
      <div className="space-y-4">
        {submissions.map((sub, idx) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
          >
            <div className="p-5">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(sub.submitted_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg px-3 py-1.5 shadow-sm">
                      <span className="text-xl font-bold text-white">{sub.grade?.toFixed(2) ?? 'N/A'}%</span>
                    </div>
                    {sub.grade && sub.grade >= 70 && (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Good job!
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(sub)}
                  className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>
              {sub.feedback && (
                <div className="mt-3 text-gray-600 text-sm line-clamp-2 pt-3 border-t border-gray-100">
                  <FileText className="h-4 w-4 inline mr-1.5 text-gray-400" />
                  {sub.feedback.split('\n')[0]}...
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 rounded-lg p-1.5">
                    <Award className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Submission Details</h3>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted: {formatDate(selected.submitted_at)}</span>
                </div>
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                  <span className="text-gray-700 font-medium">Final Grade:</span>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg px-4 py-2 shadow-md">
                    <span className="text-2xl font-bold text-white">{selected.grade?.toFixed(2) ?? 'N/A'}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Feedback
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">
                      {selected.feedback || 'No feedback provided.'}
                    </pre>
                  </div>
                </div>
                {selected.code_file && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Download className="h-4 w-4 text-indigo-600" />
                      Submitted Code
                    </h4>
                    <a
                      href={selected.code_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <Download className="h-4 w-4" />
                      Download / View Code
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