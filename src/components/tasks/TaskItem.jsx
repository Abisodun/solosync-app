import { useState } from 'react';

export default function TaskItem({ task, onUpdate, onDelete, onToggle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const handleSave = async () => {
    if (title.trim()) {
      const result = await onUpdate(task.id, { title });
      if (result.success) {
        setIsEditing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
    }
  };

  const handleToggle = async () => {
    await onToggle(task.id, task.status);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => {
            setTitle(task.title);
            setIsEditing(false);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={handleToggle}
        className="w-5 h-5 cursor-pointer"
      />
      <div className="flex-1">
        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
        {task.due_date && (
          <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>
        )}
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
      >
        Delete
      </button>
    </div>
  );
}
