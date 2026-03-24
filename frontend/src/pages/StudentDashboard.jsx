import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import SkeletonCard from '../components/SkeletonCard';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    if (!sub) return { text: 'Not started', color: 'bg-gray-200 text-gray-700' };
    if (sub.grade !== null && sub.grade !== undefined) return { text: 'Graded', color: 'bg-green-100 text-green-800' };
    return { text: 'Submitted', color: 'bg-yellow-100 text-yellow-800' };
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800 transition">Logout</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Assignments</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {assignments.length === 0 ? (
            <p className="text-gray-500">No assignments available.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => {
                const status = getStatus(assignment.id);
                const course = assignment.course || {};
                const lecturer = course.lecturer || {};
                return (
                  <Link
                    key={assignment.id}
                    to={`/assignment/${assignment.id}`}
                    className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {course.code} {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{assignment.title}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{assignment.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Lecturer: {lecturer.first_name} {lecturer.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(assignment.deadline).toLocaleString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}