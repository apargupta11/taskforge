import ModalOverlay from '../common/ModalOverlay';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
    {children}
  </div>
);

const TaskModal = ({ show, onClose, onSubmit, task, setTask, members, isEdit, onDelete, isAdmin }) => {
  if (!show) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="text-xl font-bold text-white mb-6">
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Title">
          <input 
            type="text" 
            value={task.title} 
            onChange={e => setTask({...task, title: e.target.value})} 
            placeholder="E.g. Design Landing Page" 
            className="input-field" 
            required 
          />
        </Field>
        <Field label="Description">
          <textarea 
            value={task.description || ''} 
            onChange={e => setTask({...task, description: e.target.value})} 
            placeholder="Add details..." 
            className="input-field h-24 resize-none" 
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority">
            <select 
              value={task.priority} 
              onChange={e => setTask({...task, priority: e.target.value})} 
              className="input-field bg-slate-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Assign To">
            <select 
              value={task.assigned_to || ''} 
              onChange={e => setTask({...task, assigned_to: e.target.value})} 
              className="input-field bg-slate-900"
              disabled={isEdit && !isAdmin}
            >
              <option value="">Select Member</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.users?.name || 'Unknown'}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" className="btn-primary flex-1 py-3">
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
          {isEdit && (
            <button 
              type="button" 
              onClick={onDelete} 
              className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </ModalOverlay>
  );
};

export default TaskModal;
