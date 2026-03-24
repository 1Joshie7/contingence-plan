import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!submission) return <div className="text-center py-10">Submission not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800">← Back</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-gray-600 hover:text-gray-800">Logout</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
<h1 className="text-2xl font-bold text-gray-800 mb-2">
  Submission by {submission.student?.first_name} {submission.student?.last_name}
</h1>
<p className="text-sm text-gray-500 mb-1">Registration: {submission.student?.reg_number}</p>
<p className="text-sm text-gray-500 mb-6">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mb-6">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Grade & Feedback</h2>
            <p className="text-3xl font-bold text-indigo-600 mb-4">{submission.grade?.toFixed(2)}%</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm">{submission.feedback || 'No feedback provided.'}</pre>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Submitted Code</h2>
            {submission.code_file ? (
              <a href={submission.code_file} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Python file</a>
            ) : (
              <p className="text-gray-500">No code file available.</p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}