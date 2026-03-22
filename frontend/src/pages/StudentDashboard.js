import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import AssignmentDetail from '../components/AssignmentDetail';
import SubmissionsList from '../components/SubmissionsList';

function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await api.get('/assignments/');
      setAssignments(res.data);
    };
    fetchAssignments();
  }, []);

  return (
    <div>
      <h1>Student Dashboard</h1>
      <ul>
        {assignments.map(ass => (
          <li key={ass.id}>
            <Link to={`/student/assignment/${ass.id}`}>{ass.title}</Link>
          </li>
        ))}
      </ul>
      <Link to="/student/submissions">My Submissions</Link>

      <Routes>
        <Route path="assignment/:id" element={<AssignmentDetail />} />
        <Route path="submissions" element={<SubmissionsList />} />
      </Routes>
    </div>
  );
}

export default StudentDashboard;