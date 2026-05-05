import { useEffect, useState } from 'react';
import { 
  Users, UserPlus, Search, 
  Shield, UserCheck, Eye, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Components
import MemberRow from '../components/team/MemberRow';
import InviteModal from '../components/team/InviteModal';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'member', name: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('users').select('*').order('name');
      setMembers(data || []);
    } catch (err) {
      console.error('Failed to load team members', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.updateUserRole(memberId, newRole);
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      console.error('Failed to update role', err);
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      // Simulating invite for now as per original logic
      alert(`Invitation sent to ${inviteData.email} for role ${inviteData.role}! (Simulated)`);
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'member', name: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="text-slate-200 p-8">
      <main className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Team Members</h1>
            <p className="text-slate-400">{members.length} members across your workspace</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowInviteModal(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Member
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-slate-700/50 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400"><Shield className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400">Admins</p><h3 className="text-2xl font-bold text-white">{members.filter(m => m.role === 'admin').length}</h3></div>
          </div>
          <div className="glass-card p-6 border-slate-700/50 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><UserCheck className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400">Members</p><h3 className="text-2xl font-bold text-white">{members.filter(m => m.role === 'member').length}</h3></div>
          </div>
          <div className="glass-card p-6 border-slate-700/50 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-500/10 text-slate-400"><Eye className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400">Viewers</p><h3 className="text-2xl font-bold text-white">{members.filter(m => m.role === 'viewer').length}</h3></div>
          </div>
        </div>

        {/* Members List */}
        <div className="glass-card overflow-hidden border-slate-700/50">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">All Members</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search members..." className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 text-left border-b border-slate-800">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Role</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <MemberRow 
                    key={member.id} 
                    member={member} 
                    isAdmin={isAdmin} 
                    onRoleChange={handleRoleChange} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <InviteModal 
        show={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
        onInvite={handleInvite} 
        inviteData={inviteData} 
        setInviteData={setInviteData} 
        loading={inviteLoading} 
      />
    </div>
  );
};

export default Team;
