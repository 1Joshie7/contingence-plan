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
  TrendingUp,
  ArrowRight,
  Award,
  Sparkles,
  Target
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

  const role = getUserRole();
  const userId = getUserId();
  const [userName, setUserName] = useState('Student');
  
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

  const totalAssignments = assignments.length;
  const submittedCount = submissions.filter(s => s.grade === null || s.grade === undefined).length;
  const gradedCount = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
  const notStartedCount = totalAssignments - submissions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="bg-indigo-700 shadow-sm border-b border-indigo-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
            </div>
            <button className="text-white/80 hover:text-white">Logout</button>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
      {/* Blue Navbar */}
      <div className="bg-indigo-700 shadow-sm border-b border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
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
        {/* Welcome Section - Premium Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Welcome back, {userName}!</h2>
                    <p className="text-white/80 mt-1">Track your programming assignments and progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assignments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium group-hover:text-white/80 transition-colors duration-300">Total Assignments</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-white transition-colors duration-300">{totalAssignments}</p>
                </div>
                <div className="bg-indigo-100 rounded-xl p-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <ClipboardList className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Not Started Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium group-hover:text-white/80 transition-colors duration-300">Not Started</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-white transition-colors duration-300">{notStartedCount}</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: totalAssignments ? `${(notStartedCount/totalAssignments)*100}%` : '0%' }}></div>
              </div>
            </div>
          </motion.div>

          {/* Submitted Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium group-hover:text-white/80 transition-colors duration-300">Submitted</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-white transition-colors duration-300">{submittedCount}</p>
                </div>
                <div className="bg-yellow-100 rounded-xl p-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-yellow-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: totalAssignments ? `${(submittedCount/totalAssignments)*100}%` : '0%' }}></div>
              </div>
            </div>
          </motion.div>

          {/* Graded Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium group-hover:text-white/80 transition-colors duration-300">Graded</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1 group-hover:text-white transition-colors duration-300">{gradedCount}</p>
                </div>
                <div className="bg-green-100 rounded-xl p-3 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                  <Trophy className="h-6 w-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: totalAssignments ? `${(gradedCount/totalAssignments)*100}%` : '0%' }}></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Assignments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <h2 className="text-2xl font-semibold text-white">Your Assignments</h2>
            </div>
            <div className="text-sm text-white/70 flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
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
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assignments available yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment, idx) => {
                const status = getStatus(assignment.id);
                const StatusIcon = status.icon;
                const course = assignment.course || {};
                const lecturer = course.lecturer || {};
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={`/assignment/${assignment.id}`}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    >
                      <div className="relative">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              {course.code && (
                                <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                  <Target className="h-3 w-3" />
                                  {course.code}
                                </div>
                              )}
                              <h3 className="text-lg font-bold text-gray-800 mt-2 group-hover:text-indigo-600 transition line-clamp-1">
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
                              <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-end">
                              <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition flex items-center gap-1">
                                View Details <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Upcoming Deadlines Section - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800 text-lg">Upcoming Deadlines</h3>
            </div>
          </div>
          
          <div className="p-6">
            {assignments.filter(a => !submissions.find(s => Number(s.assignment) === Number(a.id))).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">All caught up! No pending assignments.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments
                  .filter(a => !submissions.find(s => Number(s.assignment) === Number(a.id)))
                  .slice(0, 5)
                  .map((assignment) => {
                    const daysLeft = Math.ceil((new Date(assignment.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">{assignment.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">{assignment.course?.code}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            daysLeft <= 2 ? 'bg-red-100 text-red-700' : 
                            daysLeft <= 5 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {daysLeft <= 0 ? 'Past due' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}