import TaskItem from './TaskItem';

export default function TaskList({ tasks, onUpdate, onDelete, onToggle }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tasks yet. Create your first task to get started!
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Tasks ({todoTasks.length})</h3>
        <div className="space-y-3">
          {todoTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed ({completedTasks.length})</h3>
          <div className="space-y-3 opacity-75">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
