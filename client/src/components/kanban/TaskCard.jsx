import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Users, Calendar, GripVertical } from 'lucide-react';

const TaskCard = ({ task, assignee, canEdit, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canEdit,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={!isDragging ? { y: -2 } : {}}
      className={[
        'glass-card p-4 border-slate-700/50 transition-colors group select-none',
        canEdit ? 'hover:border-violet-500/30' : 'opacity-75',
        isDragging ? 'opacity-50 shadow-2xl shadow-violet-500/20 border-violet-500/40 scale-105' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between mb-3">
        {/* Priority badge */}
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
          task.priority === 'high'   ? 'bg-red-500/10 text-red-400' :
          task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                       'bg-green-500/10 text-green-400'
        }`}>
          {task.priority}
        </span>

        <div className="flex items-center gap-1">
          {/* Action buttons — visible on hover */}
          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-1 text-slate-500 hover:text-violet-400 transition-colors">
                <Edit3 className="w-3 h-3" />
              </button>
              {onDelete && (
                <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Drag handle — only for users who can edit */}
          {canEdit && (
            <div
              {...listeners}
              {...attributes}
              className="p-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors touch-none"
              title="Drag to move"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <h4 className={`font-medium text-sm mb-2 leading-relaxed text-slate-200 ${
        task.status === 'done' ? 'line-through opacity-50' : ''
      }`}>
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-3">
        <div className="flex items-center gap-2">
          {assignee ? (
            <div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-[9px] font-bold text-violet-300"
              title={assignee.name}
            >
              {assignee.name.split(' ').map(n => n[0]).join('')}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs" title="Unassigned">
              <Users className="w-3 h-3" />
            </div>
          )}
          {task.deadline && (
            <span className={`text-[10px] flex items-center gap-1 ${
              new Date(task.deadline) < new Date() && task.status !== 'done'
                ? 'text-red-400' : 'text-slate-500'
            }`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500">
          {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

export default TaskCard;
