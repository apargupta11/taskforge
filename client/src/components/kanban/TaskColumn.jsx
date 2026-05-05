const TaskColumn = ({ title, count, children, onDrop }) => (
  <div 
    className="w-80 flex flex-col h-full rounded-2xl bg-slate-900/20 p-2" 
    onDragOver={e => e.preventDefault()} 
    onDrop={e => onDrop(e.dataTransfer.getData('taskId'))}
  >
    <div className="flex items-center justify-between mb-4 px-2 py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          title === 'To Do' ? 'bg-slate-400' : 
          title === 'In Progress' ? 'bg-amber-400' : 
          'bg-emerald-400'
        }`} />
        <h3 className="font-bold text-slate-200">{title}</h3>
        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-bold">{count}</span>
      </div>
    </div>
    <div className="space-y-3 flex-1 overflow-y-auto pb-4">{children}</div>
  </div>
);

export default TaskColumn;
