// src/components/AssignmentForm.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import GradingConfigForm from './GradingConfigForm';

function AssignmentForm({ refresh }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
  });
  const [gradingConfig, setGradingConfig] = useState(null);

  // Load assignment data when editing
  useEffect(() => {
    if (id) {
      api.get(`/assignments/${id}/`).then(res => {
        setForm({
          title: res.data.title,
          description: res.data.description,
          deadline: res.data.deadline.slice(0, 16), // datetime-local format
        });
        if (res.data.grading_config) {
          setGradingConfig(res.data.grading_config);
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      deadline: new Date(form.deadline).toISOString(),
      grading_config: gradingConfig || {},
    };
    if (id) {
      await api.put(`/assignments/${id}/`, payload);
    } else {
      await api.post('/assignments/', payload);
    }
    if (refresh) refresh();
    navigate('/lecturer');
  };

  return (
    <div className="container mt-4">
      <h2>{id ? 'Edit Assignment' : 'Create Assignment'}</h2>
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            placeholder="Assignment title"
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            placeholder="Describe the assignment"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="deadline" className="form-label">Deadline</label>
          <input
            type="datetime-local"
            className="form-control"
            id="deadline"
            value={form.deadline}
            onChange={e => setForm({...form, deadline: e.target.value})}
            required
          />
        </div>

        {/* Grading config component */}
        <GradingConfigForm
          initialConfig={gradingConfig}
          onChange={(config) => setGradingConfig(config)}
        />

        <div className="mt-3">
          <button type="submit" className="btn btn-primary">Save Assignment</button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate('/lecturer')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignmentForm;