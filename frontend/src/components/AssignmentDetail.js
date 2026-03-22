import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const assignmentRes = await api.get(`/assignments/${id}/`);
      setAssignment(assignmentRes.data);
      const testsRes = await api.get('/testcases/', { params: { assignment: id } });
      setTestCases(testsRes.data);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('assignment', id);
    formData.append('code_file', file);
    try {
      // Do NOT set Content-Type header – browser will add correct boundary
      const res = await api.post('/submissions/', formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <div>
      <h2>{assignment.title}</h2>
      <p>{assignment.description}</p>
      <h3>Test Cases</h3>
      <ul>
        {testCases.map(tc => (
          <li key={tc.id}>
            <strong>Input:</strong> {tc.input_data}<br />
            <strong>Expected output:</strong> {tc.expected_output}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".py" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {result && (
        <div>
          <h3>Grade: {result.grade}%</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{result.feedback}</pre>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetail;