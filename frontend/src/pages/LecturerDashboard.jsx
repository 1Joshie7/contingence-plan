import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function LecturerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const { data } = await api.get('/assignments/');
    setAssignments(data);
    setLoading(false);
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment? All submissions and test cases will be lost.')) return;
    try {
      await api.delete(`/assignments/${id}/`);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to delete assignment');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Lecturer Dashboard</h1>
          <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Manage Assignments</h2>
            <Link
              to="/lecturer/assignments/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              + New Assignment
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : assignments.length === 0 ? (
            <p className="text-gray-500">No assignments yet. Create one above.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assignment.deadline).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <Link to={`/lecturer/assignments/${assignment.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                        <Link to={`/lecturer/assignments/${assignment.id}/submissions`} className="text-blue-600 hover:text-blue-900">Submissions</Link>
                        <Link to={`/lecturer/assignments/${assignment.id}/plagiarism`} className="text-purple-600 hover:text-purple-900">Plagiarism</Link>
                        <button onClick={() => deleteAssignment(assignment.id)} className="text-red-600 hover:text-red-900">Delete</button>
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