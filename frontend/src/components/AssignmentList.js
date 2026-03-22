// src/components/AssignmentList.js
import { Link } from 'react-router-dom';
import api from '../services/api';

function AssignmentList({ assignments, refresh }) {
  const handleDelete = async (id) => {
    if (window.confirm('Delete assignment?')) {
      await api.delete(`/assignments/${id}/`);
      refresh();
    }
  };

  return (
    <ul>
      {assignments.map(ass => (
        <li key={ass.id}>
          <Link to={`/lecturer/submissions/${ass.id}`}>{ass.title}</Link> | 
          <Link to={`/lecturer/testcases/${ass.id}`}>Test Cases</Link> |
          <Link to={`/lecturer/edit/${ass.id}`}>Edit</Link> |
          <button onClick={() => handleDelete(ass.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default AssignmentList;