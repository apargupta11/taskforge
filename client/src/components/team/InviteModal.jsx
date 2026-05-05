import ModalOverlay from '../common/ModalOverlay';
import { Loader2 } from 'lucide-react';

const InviteModal = ({ show, onClose, onInvite, inviteData, setInviteData, loading }) => {
  if (!show) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Invite New Member</h3>
      </div>
      <form onSubmit={onInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Name (Optional)</label>
          <input 
            type="text" 
            value={inviteData.name} 
            onChange={e => setInviteData({...inviteData, name: e.target.value})} 
            placeholder="Jane Doe" 
            className="input-field" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input 
            type="email" 
            value={inviteData.email} 
            onChange={e => setInviteData({...inviteData, email: e.target.value})} 
            placeholder="jane@company.com" 
            className="input-field" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Workspace Role</label>
          <select 
            value={inviteData.role} 
            onChange={e => setInviteData({...inviteData, role: e.target.value})} 
            className="input-field bg-slate-900"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Invite'}
        </button>
      </form>
    </ModalOverlay>
  );
};

export default InviteModal;
