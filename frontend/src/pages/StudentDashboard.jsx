import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  GraduationCap, 
  LogOut, 
  Trophy,
  Calendar,
  User,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import { getUserRole, getUserId } from '../utils/role';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get user info from token (optional, for display)
  const role = getUserRole();
  const userId = getUserId();
  // You may want to fetch user details from API, but we'll keep it simple
  const [userName, setUserName] = useState('Student');
  
  // In a real scenario, you might fetch the user profile. For now, we'll try to extract from token if available.
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (decoded.first_name && decoded.last_name) {
          setUserName(`${decoded.first_name} ${decoded.last_name}`);
        } else if (decoded.username) {
          setUserName(decoded.username);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get('/assignments/'),
          api.get('/submissions/'),
        ]);
        setAssignments(assignmentsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatus = (assignmentId) => {
    const sub = submissions.find(s => Number(s.assignment) === Number(assignmentId));
    if (!sub) return { text: 'Not started', color: 'bg-gray-100 text-gray-600', icon: Clock };
    if (sub.grade !== null && sub.grade !== undefined) return { text: 'Graded', color: 'bg-green-100 text-green-700', icon: Trophy };
    return { text: 'Submitted', color: 'bg-yellow-100 text-yellow-700', icon: CheckCircle };
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const submittedCount = submissions.filter(s => s.grade === null || s.grade === undefined).length;
  const gradedCount = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
  const notStartedCount = totalAssignments - submissions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
            <button className="text-gray-600 hover:text-gray-800">Logout</button>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 rounded-full p-3">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h2>
                  <p className="text-gray-500 mt-1">Track your programming assignments and progress</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalAssignments}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <ClipboardList className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Not Started</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{notStartedCount}</p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Submitted</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{submittedCount}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Graded</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{gradedCount}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Your Assignments</h2>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{gradedCount} assignments graded</span>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {assignments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assignments available yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => {
                const status = getStatus(assignment.id);
                const StatusIcon = status.icon;
                const course = assignment.course || {};
                const lecturer = course.lecturer || {};
                return (
                  <Link
                    key={assignment.id}
                    to={`/assignment/${assignment.id}`}
                    className="group block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          {course.code && (
                            <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded-md">
                              {course.code}
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-800 mt-2 group-hover:text-indigo-600 transition">
                            {course.title || assignment.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{status.text}</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-500">
                        {lecturer.first_name && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span>{lecturer.first_name} {lecturer.last_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.deadline).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-end">
                          <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Tips */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Pro Tips</h3>
                <p className="text-sm text-gray-600">Complete assignments early to get AI feedback and improve your code.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Your last submission was automatically graded</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}