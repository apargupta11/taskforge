import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, ChevronRight, Loader2, List, LayoutGrid, Clock, Users, Calendar,
  Edit3, Trash2
} from 'lucide-react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Modular Components
import TaskCard from '../components/kanban/TaskCard';
import TaskColumn from '../components/kanban/TaskColumn';
import TaskModal from '../components/kanban/TaskModal';
import TeamModal from '../components/kanban/TeamModal';

const KanbanBoard = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  
  // State
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assigned_to: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState('board');
  const [members, setMembers] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null); // for DragOverlay

  // ── Roles & Permissions ────────────────────────────────────────────────
  // Always derive from the project-scoped role, not the global platform role.
  // A platform admin might be a viewer in this specific project.
  const [projectMemberRole, setProjectMemberRole] = useState(null);

  const ROLE_PERMISSIONS = {
    admin:  { canCreate: true,  canEditAny: true,  canDeleteAny: true,  canManageTeam: true,  readAll: true  },
    member: { canCreate: true,  canEditAny: false, canDeleteAny: false, canManageTeam: false, readAll: true  },
    viewer: { canCreate: false, canEditAny: false, canDeleteAny: false, canManageTeam: false, readAll: false },
  };
  const perms = ROLE_PERMISSIONS[projectMemberRole] ?? ROLE_PERMISSIONS.viewer;

  const isAdmin       = projectMemberRole === 'admin';
  const canEditTask   = (task) => perms.canEditAny || (perms.canCreate && task.assigned_to === user?.id);
  const canDeleteTask = (task) => perms.canDeleteAny || (perms.canCreate && task.assigned_to === user?.id);

  // Realtime & Initial Load
  useEffect(() => {
    loadInitialData();
    
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks(prev => [...prev, payload.new]);
        else if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        else if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [projectId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projectRes, membersRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('project_members').select('*, users(name, email, role)').eq('project_id', projectId)
      ]);

      setProject(projectRes.data);
      const memberList = membersRes.data || [];
      setMembers(memberList);

      // Resolve project-scoped role from members list
      const myMembership = memberList.find(m => m.user_id === user?.id);
      setProjectMemberRole(myMembership?.role ?? 'viewer');

      let taskRows = [];
      try {
        const tasksRes = await api.getTasks(projectId);
        taskRows = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      } catch (apiErr) {
        console.warn('Task API fetch failed, using Supabase client', apiErr);
        const { data: sbTasks, error: sbErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
        if (sbErr) throw sbErr;
        taskRows = sbTasks || [];
      }
      setTasks(taskRows);
    } catch (err) {
      console.error('Failed to load board data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    const { data } = await supabase.from('project_members').select('*, users(name, email, role)').eq('project_id', projectId);
    setMembers(data || []);
  };

  const loadAllUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('name');
    setAllUsers(data || []);
  };

  useEffect(() => {
    if (showTeamModal) loadAllUsers();
  }, [showTeamModal]);

  // dnd-kit sensor — requires 8px movement before drag starts (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Task Actions
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Optimistic update
    const prevTasks = tasks;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      // Revert on failure so the UI stays in sync with the DB
      console.error('Failed to update task status:', err.response?.data?.error ?? err.message);
      setTasks(prevTasks);
    }
  };

  const handleDragStart = ({ active }) => setActiveTaskId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveTaskId(null);
    if (!over) return;
    const taskId = active.id;
    const newStatus = over.id; // column id === status string
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    if (!canEditTask(task)) return;
    handleUpdateTaskStatus(taskId, newStatus);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await api.deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask, project_id: projectId, assigned_to: newTask.assigned_to || user?.id };
      const res = await api.createTask(payload);
      const created = res?.data;
      if (created?.id) setTasks(prev => [...prev, created]);
      setShowAddModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '' });
    } catch (err) {
      console.error('Failed to add task', err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleSaveEditTask = async (e) => {
    e.preventDefault();
    try {
      await api.updateTask(editTask.id, {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        assigned_to: editTask.assigned_to
      });
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...editTask } : t));
      setEditTask(null);
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  // Member Actions
  const handleAddMember = async (userId, role) => {
    try {
      await api.addProjectMember(projectId, userId, role);
      loadMembers();
    } catch (err) {
      console.error('Failed to add member', err);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.removeProjectMember(projectId, userId);
      loadMembers();
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  // Server already scopes the task list for viewers — no client-side filtering needed.
  // We still apply search + priority filters for UX.
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  if (loading) return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-md px-8 py-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-slate-500 hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-white">{project?.name || 'Project'}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 mr-4">
              {members.slice(0, 4).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0b1326] bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300" title={m.users?.name}>
                  {m.users?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
              ))}
              {members.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-[#0b1326] bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  +{members.length - 4}
                </div>
              )}
            </div>
            {isAdmin && (
              <button onClick={() => setShowTeamModal(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 mr-2">
                <Users className="w-4 h-4" /> Manage Team
              </button>
            )}
            {perms.canCreate && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            )}
            {!perms.canCreate && (
              <span className="text-xs text-slate-500 border border-slate-700/50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                View Only
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            {[{ id: 'board', icon: LayoutGrid, label: 'Board' }, { id: 'list', icon: List, label: 'List' }].map(v => (
              <button 
                key={v.id} 
                onClick={() => setViewMode(v.id)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === v.id ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-white'
                }`}
              >
                <v.icon className="w-3.5 h-3.5" /> {v.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search tasks..." 
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all w-48" 
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)} 
                className={`p-2 border rounded-lg transition-colors ${
                  filterPriority !== 'all' ? 'border-violet-500/50 text-violet-400 bg-violet-500/10' : 'border-slate-700/50 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30">
                  {['all', 'high', 'medium', 'low'].map(p => (
                    <button 
                      key={p} 
                      onClick={() => { setFilterPriority(p); setShowFilter(false); }} 
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                        filterPriority === p ? 'bg-violet-500/10 text-violet-400' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {p === 'all' ? 'All Priorities' : `${p.charAt(0).toUpperCase() + p.slice(1)} Priority`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Board View */}
      {viewMode === 'board' && (
        <main className="flex-1 p-8 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full min-w-max">
              {['todo', 'in-progress', 'done'].map(status => (
                <TaskColumn
                  key={status}
                  status={status}
                  count={filteredTasks.filter(t => t.status === status).length}
                >
                  {filteredTasks.filter(t => t.status === status).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={members.find(m => m.user_id === task.assigned_to)?.users}
                      canEdit={canEditTask(task)}
                      onEdit={() => setEditTask({...task})}
                      onDelete={canDeleteTask(task) ? () => handleDeleteTask(task.id) : undefined}
                    />
                  ))}
                </TaskColumn>
              ))}
            </div>

            {/* Floating drag ghost */}
            <DragOverlay dropAnimation={null}>
              {activeTaskId ? (() => {
                const task = tasks.find(t => t.id === activeTaskId);
                return task ? (
                  <TaskCard
                    task={task}
                    assignee={members.find(m => m.user_id === task.assigned_to)?.users}
                    canEdit={true}
                  />
                ) : null;
              })() : null}
            </DragOverlay>
          </DndContext>
        </main>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6">Task</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6">Status</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6">Priority</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6">Deadline</th>
                  <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-6">
                      <span className={`text-sm font-medium text-slate-200 ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>{task.title}</span>
                      {task.description && <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{task.description}</p>}
                    </td>
                    <td className="py-3 px-6">
                      <select 
                        value={task.status} 
                        onChange={e => handleUpdateTaskStatus(task.id, e.target.value)} 
                        className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        disabled={!canEditTask(task)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400' : 
                        task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-500">
                      {task.deadline ? (
                        <span className={`flex items-center gap-1 ${new Date(task.deadline) < new Date() && task.status !== 'done' ? 'text-red-400' : ''}`}>
                          <Clock className="w-3 h-3" /> {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {(canEditTask(task) || canDeleteTask(task)) && (
                        <div className="flex items-center justify-end gap-2">
                          {canEditTask(task) && <button onClick={() => setEditTask({...task})} className="text-slate-500 hover:text-violet-400"><Edit3 className="w-3.5 h-3.5" /></button>}
                          {canDeleteTask(task) && <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && <div className="py-12 text-center text-slate-500 text-sm">No tasks found</div>}
          </div>
        </main>
      )}

      {/* Modals */}
      <AnimatePresence>
        <TaskModal 
          show={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddTask} 
          task={newTask} 
          setTask={setNewTask} 
          members={members} 
          isEdit={false} 
        />
        
        <TaskModal 
          show={!!editTask} 
          onClose={() => setEditTask(null)} 
          onSubmit={handleSaveEditTask} 
          task={editTask} 
          setTask={setEditTask} 
          members={members} 
          isEdit={true} 
          onDelete={() => handleDeleteTask(editTask.id)} 
          isAdmin={isAdmin}
        />

        <TeamModal 
          show={showTeamModal} 
          onClose={() => setShowTeamModal(false)} 
          allUsers={allUsers} 
          members={members} 
          onAddMember={handleAddMember} 
          onRemoveMember={handleRemoveMember} 
        />
      </AnimatePresence>
    </div>
  );
};

export default KanbanBoard;
