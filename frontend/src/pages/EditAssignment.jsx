import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, LogOut, ArrowLeft } from 'lucide-react';
import AssignmentForm from '../components/AssignmentForm';
import api from '../services/api';

export default function EditAssignment() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignment = async () => {
      const { data } = await api.get(`/assignments/${id}/`);
      setAssignment(data);
      setLoading(false);
    };
    fetchAssignment();
  }, [id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
        <div className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Edit Assignment</h1>
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
      <nav className="bg-indigo-700/90 backdrop-blur-sm shadow-lg border-b border-indigo-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/lecturer')} 
              className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-white/20 mx-1"></div>
            <GraduationCap className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Edit Assignment</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AssignmentForm
            mode="edit"
            initialData={assignment}
            assignmentId={id}
            submitLabel="Update Assignment"
          />
        </motion.div>
      </main>
    </div>
  );
}