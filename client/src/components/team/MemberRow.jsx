const MemberRow = ({ member, isAdmin, onRoleChange }) => {
  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-violet-300">
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-white">{member.name}</p>
            <p className="text-xs text-slate-500">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        {isAdmin ? (
          <select 
            value={member.role} 
            onChange={(e) => onRoleChange(member.id, e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            member.role === 'admin' ? 'bg-violet-500/10 text-violet-400' : 
            member.role === 'member' ? 'bg-emerald-500/10 text-emerald-400' : 
            'bg-slate-700/30 text-slate-400'
          }`}>
            {member.role}
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-sm text-slate-500">
        {new Date(member.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
};

export default MemberRow;
