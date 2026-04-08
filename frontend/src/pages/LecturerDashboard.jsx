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
  Calendar,
  Award,
  Sparkles,
  TrendingUp
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

  // Calculate stats
  const totalAssignments = assignments.length;
  const upcomingDeadlines = assignments.filter(a => new Date(a.deadline) > new Date()).length;
  const pastDeadlines = assignments.filter(a => new Date(a.deadline) < new Date()).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Lecturer Dashboard</h1>
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
      <div className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Lecturer Dashboard</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Manage Your Assignments</h2>
                    <p className="text-white/80 mt-1">Create, edit, and track student submissions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 font-medium">Total Assignments</p>
                  <p className="text-3xl font-bold text-white mt-1">{totalAssignments}</p>
                </div>
                <div className="bg-indigo-500/20 rounded-xl p-3">
                  <ClipboardList className="h-6 w-6 text-indigo-300" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 font-medium">Upcoming Deadlines</p>
                  <p className="text-3xl font-bold text-white mt-1">{upcomingDeadlines}</p>
                </div>
                <div className="bg-green-500/20 rounded-xl p-3">
                  <TrendingUp className="h-6 w-6 text-green-300" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 font-medium">Past Deadlines</p>
                  <p className="text-3xl font-bold text-white mt-1">{pastDeadlines}</p>
                </div>
                <div className="bg-yellow-500/20 rounded-xl p-3">
                  <Award className="h-6 w-6 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 rounded-lg p-2">
                <ClipboardList className="h-5 w-5 text-indigo-300" />
              </div>
              <h2 className="text-xl font-semibold text-white">Your Assignments</h2>
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-medium px-2 py-0.5 rounded-full">
                {assignments.length} total
              </span>
            </div>
            <Link
              to="/lecturer/assignments/new"
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New Assignment</span>
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
              <BookOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">No assignments yet. Click "New Assignment" to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment, idx) => (
                      <motion.tr 
                        key={assignment.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{assignment.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{assignment.course?.code} {assignment.course?.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(assignment.deadline).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/lecturer/assignments/${assignment.id}/edit`} 
                              className="flex items-center gap-1 px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="text-sm">Edit</span>
                            </Link>
                            <Link 
                              to={`/lecturer/assignments/${assignment.id}/submissions`} 
                              className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Submissions"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-sm">Submissions</span>
                            </Link>
                            <Link 
                              to={`/lecturer/assignments/${assignment.id}/plagiarism`} 
                              className="flex items-center gap-1 px-2 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                              title="Plagiarism"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Plagiarism</span>
                            </Link>
                            <button 
                              onClick={() => deleteAssignment(assignment.id)} 
                              className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
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