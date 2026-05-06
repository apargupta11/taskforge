import { useDroppable } from '@dnd-kit/core';

const COLUMN_META = {
  'todo':        { label: 'To Do',       dot: 'bg-slate-400',   ring: 'ring-slate-400/30'  },
  'in-progress': { label: 'In Progress', dot: 'bg-amber-400',   ring: 'ring-amber-400/30'  },
  'done':        { label: 'Done',        dot: 'bg-emerald-400', ring: 'ring-emerald-400/30' },
};

const TaskColumn = ({ status, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = COLUMN_META[status] ?? { label: status, dot: 'bg-slate-400', ring: 'ring-slate-400/30' };

  return (
    <div
      ref={setNodeRef}
      className={[
        'w-80 flex flex-col rounded-2xl transition-all duration-150',
        'bg-slate-900/20 p-2',
        isOver ? `ring-2 ${meta.ring} bg-slate-900/40` : '',
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-2 py-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
          <h3 className="font-bold text-slate-200">{meta.label}</h3>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-bold">
            {count}
          </span>
        </div>
      </div>

      {/* Drop zone body */}
      <div
        className={[
          'space-y-3 flex-1 overflow-y-auto pb-4 min-h-[120px] rounded-xl transition-colors duration-150',
          isOver ? 'bg-slate-800/20' : '',
        ].join(' ')}
      >
        {children}
        {/* Visual drop target when column is empty */}
        {count === 0 && (
          <div className={`h-20 rounded-xl border-2 border-dashed transition-colors duration-150 ${
            isOver ? 'border-violet-500/60 bg-violet-500/5' : 'border-slate-800'
          } flex items-center justify-center`}>
            <span className="text-xs text-slate-600">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
