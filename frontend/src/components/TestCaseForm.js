import { useState } from 'react';

function TestCaseForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    assignment: initialData.assignment,
    input_data: initialData.input_data || '',
    expected_output: initialData.expected_output || '',
    is_hidden: initialData.is_hidden || false,
    id: initialData.id || null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      assignment: form.assignment,
      input_data: form.input_data,
      expected_output: form.expected_output,
      is_hidden: form.is_hidden,
    };
    if (form.id) payload.id = form.id;
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Input data (stdin)</label>
        <textarea
          name="input_data"
          className="form-control"
          rows="3"
          value={form.input_data}
          onChange={handleChange}
          required
        />
        <small className="text-muted">What the student's code will read from input.</small>
      </div>
      <div className="mb-3">
        <label className="form-label">Expected output (stdout)</label>
        <textarea
          name="expected_output"
          className="form-control"
          rows="3"
          value={form.expected_output}
          onChange={handleChange}
          required
        />
        <small className="text-muted">Exact output the student's program should print.</small>
      </div>
      <div className="mb-3 form-check">
        <input
          type="checkbox"
          name="is_hidden"
          className="form-check-input"
          id="isHidden"
          checked={form.is_hidden}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="isHidden">
          Hidden (student cannot see)
        </label>
      </div>
      <button type="submit" className="btn btn-primary">Save</button>
      <button type="button" className="btn btn-secondary ms-2" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default TestCaseForm;