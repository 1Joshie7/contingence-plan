import AssignmentForm from '../components/AssignmentForm';

export default function CreateAssignment() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Assignment</h1>
        <AssignmentForm mode="create" submitLabel="Create Assignment" />
      </div>
    </div>
  );
}