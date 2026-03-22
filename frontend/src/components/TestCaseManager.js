// src/components/TestCaseManager.js
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import TestCaseForm from './TestCaseForm';

function TestCaseManager() {
  const { id } = useParams(); // assignment id
  const [testCases, setTestCases] = useState([]);
  const [editing, setEditing] = useState(null); // test case id being edited, or null for new
  const [assignment, setAssignment] = useState(null);

  const fetchTestCases = async () => {
    const res = await api.get('/testcases/', { params: { assignment: id } });
    setTestCases(res.data);
  };

  const fetchAssignment = async () => {
    const res = await api.get(`/assignments/${id}/`);
    setAssignment(res.data);
  };

  useEffect(() => {
    fetchAssignment();
    fetchTestCases();
  }, [id]);

  const handleDelete = async (tcId) => {
    if (window.confirm('Delete this test case?')) {
      await api.delete(`/testcases/${tcId}/`);
      fetchTestCases();
    }
  };

  const handleCreate = () => {
    setEditing({ assignment: parseInt(id), input_data: '', expected_output: '', is_hidden: false });
  };

  const handleEdit = (tc) => {
    setEditing(tc);
  };

  const handleSave = async (tcData) => {
    if (tcData.id) {
      // update
      await api.put(`/testcases/${tcData.id}/`, tcData);
    } else {
      // create
      await api.post('/testcases/', tcData);
    }
    setEditing(null);
    fetchTestCases();
  };

  const handleCancel = () => {
    setEditing(null);
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <div>
      <h2>Test Cases for: {assignment.title}</h2>
      <button onClick={handleCreate}>Add Test Case</button>

      {editing && (
        <TestCaseForm
          initialData={editing}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <ul>
        {testCases.map(tc => (
          <li key={tc.id}>
            <strong>Input:</strong> {tc.input_data}<br />
            <strong>Expected:</strong> {tc.expected_output}<br />
            <strong>Hidden:</strong> {tc.is_hidden ? 'Yes' : 'No'}<br />
            <button onClick={() => handleEdit(tc)}>Edit</button>
            <button onClick={() => handleDelete(tc.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <Link to="/lecturer">Back to assignments</Link>
    </div>
  );
}

export default TestCaseManager;