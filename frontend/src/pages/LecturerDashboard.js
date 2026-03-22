import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import AssignmentList from '../components/AssignmentList';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentSubmissions from '../components/AssignmentSubmissions';
import TestCaseManager from '../components/TestCaseManager'; 

function LecturerDashboard() {
  const [assignments, setAssignments] = useState([]);

  const fetchAssignments = async () => {
    const res = await api.get('/assignments/');
    setAssignments(res.data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div>
      <h1>Lecturer Dashboard</h1>
      <Link to="/lecturer/new">Create Assignment</Link>
      <AssignmentList assignments={assignments} refresh={fetchAssignments} />
      <Routes>
        <Route path="new" element={<AssignmentForm refresh={fetchAssignments} />} />
        <Route path="edit/:id" element={<AssignmentForm refresh={fetchAssignments} />} />
        <Route path="submissions/:id" element={<AssignmentSubmissions />} />
        <Route path="testcases/:id/*" element={<TestCaseManager />} /> 
      </Routes>
    </div>
  );
}

export default LecturerDashboard;