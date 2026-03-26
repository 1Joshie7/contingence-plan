import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Assignment</h1>
        <AssignmentForm
          mode="edit"
          initialData={assignment}
          assignmentId={id}
          submitLabel="Update Assignment"
        />
      </div>
    </div>
  );
}



