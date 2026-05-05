import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Save, Check } from 'lucide-react';
import { Sidebar, TopBar } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
  });
  const [notifications, setNotifications] = useState({
    email: true, taskAssigned: true, taskCompleted: false, weeklyDigest: true,
  });

  const handleSave = async () => {
    if (activeTab === 'profile') {
      await supabase.auth.updateUser({ data: { name: profile.name } });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account preferences</p>
      </div>

          <div className="flex gap-8">
            {/* Tabs */}
            <div className="w-56 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 max-w-2xl">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 p-0.5">
                        <div className="w-full h-full rounded-full bg-[#0b1326] flex items-center justify-center text-xl font-bold text-white">
                          {profile.name?.substring(0,2).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{profile.name}</h4>
                        <p className="text-sm text-slate-400">{profile.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <input type="email" value={profile.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <h4 className="text-sm font-bold text-white mb-1">Two-Factor Authentication</h4>
                      <p className="text-xs text-slate-400 mb-3">Add an extra layer of security to your account</p>
                      <button className="text-xs font-bold text-violet-400 hover:text-violet-300">Enable 2FA →</button>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Receive email updates for important events' },
                      { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a new task is assigned to you' },
                      { key: 'taskCompleted', label: 'Task Completed', desc: 'When a task you created is marked done' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your week every Monday' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.label}</h4>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                          className={`w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-violet-500' : 'bg-slate-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-[2px]'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white mb-4">Appearance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['Dark', 'Light', 'System'].map(theme => (
                        <button key={theme} className={`p-4 rounded-xl border text-center text-sm font-medium transition-all ${theme === 'Dark' ? 'border-violet-500/50 bg-violet-500/10 text-violet-400' : 'border-slate-700/50 text-slate-400 hover:border-slate-600'}`}>
                          {theme}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <h4 className="text-sm font-bold text-white mb-3">Accent Color</h4>
                      <div className="flex gap-3">
                        {['bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'].map(color => (
                          <button key={color} className={`w-8 h-8 rounded-full ${color} ${color === 'bg-violet-500' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b1326]' : ''} hover:scale-110 transition-transform`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
    </div>
  );
};

export default Settings;
