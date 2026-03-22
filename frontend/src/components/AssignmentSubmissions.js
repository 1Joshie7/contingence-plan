import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

function AssignmentSubmissions() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/submissions/', { params: { assignment: id } });
        setSubmissions(res.data);
      } catch (err) {
        setError('Failed to load submissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  if (loading) return <div>Loading submissions...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Submissions for Assignment {id}</h2>
      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <ul className="list-group">
          {submissions.map(sub => (
            <li key={sub.id} className="list-group-item mb-3">
              <strong>{sub.student}</strong> – Grade: {sub.grade}%<br />
              <pre className="mt-2 p-2 bg-light">{sub.feedback}</pre>
              <a href={sub.code_file} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary mt-2">
                Download Code
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AssignmentSubmissions;