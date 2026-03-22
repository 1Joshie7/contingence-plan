import { useEffect, useState } from 'react';
import api from '../services/api';

function SubmissionsList() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const res = await api.get('/submissions/');
      setSubmissions(res.data);
    };
    fetchSubmissions();
  }, []);

  return (
    <div>
      <h2>My Submissions</h2>
      <ul>
        {submissions.map(sub => (
          <li key={sub.id}>
            {sub.assignment_title} – Grade: {sub.grade}%<br />
            <pre>{sub.feedback}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubmissionsList;