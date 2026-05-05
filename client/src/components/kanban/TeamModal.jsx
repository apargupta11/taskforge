import ModalOverlay from '../common/ModalOverlay';

const TeamModal = ({ show, onClose, allUsers, members, onAddMember, onRemoveMember }) => {
  if (!show) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="text-xl font-bold text-white mb-6">Manage Team</h3>
      <div className="space-y-4">
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {allUsers.map(u => {
            const isMember = members.some(m => m.user_id === u.id);
            return (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                {isMember ? (
                  <button 
                    onClick={() => onRemoveMember(u.id)} 
                    className="text-xs font-bold text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    onClick={() => onAddMember(u.id, 'member')} 
                    className="text-xs font-bold text-violet-400 hover:bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-violet-500/20"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ModalOverlay>
  );
};

export default TeamModal;
