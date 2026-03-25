import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  PlusCircle, 
  Edit, 
  Eye, 
  AlertTriangle, 
  Trash2,
  LogOut,
  ClipboardList,
  GraduationCap,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { getUserId } from '../utils/role';

export default function LecturerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = getUserId();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/assignments/');
      console.log('All assignments:', data);
      console.log('Current user ID from token:', currentUserId);
      console.log('Current user ID type:', typeof currentUserId);

      if (data.length > 0) {
        console.log('Sample assignment structure:', data[0]);
      }

      const myAssignments = data.filter(assignment => {
        let creatorId = null;

        if (assignment.created_by?.id) {
          creatorId = assignment.created_by.id;
        } else if (typeof assignment.created_by === 'number' || typeof assignment.created_by === 'string') {
          creatorId = assignment.created_by;
        } else if (assignment.course?.lecturer?.id) {
          creatorId = assignment.course.lecturer.id;
        } else if (assignment.lecturer?.id) {
          creatorId = assignment.lecturer.id;
        }

        console.log(`Assignment ${assignment.id} creator ID:`, creatorId, 'type:', typeof creatorId);
        return Number(creatorId) === Number(currentUserId);
      });

      console.log('Filtered assignments:', myAssignments);
      setAssignments(myAssignments);
    } catch (err) {
      toast.error('Failed to load assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Lecturer Dashboard</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Welcome & Stats Card */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 rounded-full p-3">
                    <BookOpen className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Your Assignments</h2>
                    <p className="text-gray-500 mt-1">Create, edit, and track student submissions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-800">Your Assignments</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {assignments.length}
              </span>
            </div>
            <Link
              to="/lecturer/assignments/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New Assignment</span>
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assignments yet. Click "New Assignment" to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assignment.course?.code} {assignment.course?.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assignment.deadline).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-3">
                            <Link 
                              to={`/lecturer/assignments/${assignment.id}/edit`} 
                              className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                            <Link 
                              to={`/lecturer/assignments/${assignment.id}/submissions`} 
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              title="Submissions"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Submissions</span>
                            </Link>
                            <Link 
                              to={`/lecturer/assignments/${assignment.id}/plagiarism`} 
                              className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                              title="Plagiarism"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              <span>Plagiarism</span>
                            </Link>
                            <button 
                              onClick={() => deleteAssignment(assignment.id)} 
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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