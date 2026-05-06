import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Palette, Save, Check, Shield, Mail, Activity, Sparkles, Monitor, Moon, Sun } from 'lucide-react';
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
    { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your personal info' },
    { id: 'security', label: 'Security & Auth', icon: Shield, desc: 'Passwords and 2FA' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts and emails' },
    { id: 'appearance', label: 'Appearance', icon: Sparkles, desc: 'Theme and colors' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
      {/* Header section with gradient background */}
      <div className="relative mb-8 p-8 rounded-3xl overflow-hidden glass border-violet-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">Account Settings</h1>
          <p className="text-slate-400 text-lg">Manage your preferences, security, and aesthetics.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Modern Sidebar Tabs */}
        <div className="w-full lg:w-72 space-y-2 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 shadow-lg shadow-violet-500/5' 
                  : 'hover:bg-slate-800/40 border border-transparent hover:border-slate-700/50'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                activeTab === tab.id ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
              }`}>
                <tab.icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-semibold ${activeTab === tab.id ? 'text-white' : 'text-slate-300'}`}>
                  {tab.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{tab.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {activeTab === 'profile' && (
                <div className="glass-card !p-8">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
                    <User className="w-6 h-6 text-violet-400" />
                    <h3 className="text-xl font-display font-bold text-white">Profile Information</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-400 p-[3px]">
                        <div className="w-full h-full rounded-full bg-[#0b1326] flex items-center justify-center text-3xl font-display font-bold text-white group-hover:bg-opacity-80 transition-all">
                          {profile.name?.substring(0,2).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white">Edit</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-2xl font-display font-bold text-white mb-1">{profile.name || 'User'}</h4>
                      <p className="text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full inline-flex items-center gap-2 text-sm border border-slate-700/50">
                        <Mail className="w-3.5 h-3.5" />
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={profile.name} 
                        onChange={e => setProfile({...profile, name: e.target.value})} 
                        className="input-field bg-slate-900/50" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={profile.email} 
                        disabled 
                        className="input-field bg-slate-900/50 opacity-60 cursor-not-allowed" 
                      />
                      <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> Email address is tied to your authentication provider.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="glass-card !p-8">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-display font-bold text-white">Security Settings</h3>
                  </div>

                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="input-field bg-slate-900/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••" className="input-field bg-slate-900/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="input-field bg-slate-900/50" />
                    </div>
                  </div>

                  <div className="mt-10 p-6 bg-gradient-to-br from-slate-800/80 to-slate-800/30 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="relative z-10">
                      <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                        Two-Factor Authentication (2FA) <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Recommended</span>
                      </h4>
                      <p className="text-sm text-slate-400 max-w-sm">Protect your account from unauthorized access by requiring a second authentication method.</p>
                    </div>
                    <button className="relative z-10 px-5 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold border border-emerald-500/20 transition-colors flex-shrink-0">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="glass-card !p-8">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
                    <Bell className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-display font-bold text-white">Notification Preferences</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'email', label: 'Global Email Notifications', desc: 'Receive any email updates' },
                      { key: 'taskAssigned', label: 'Task Assigned', desc: 'Notify me when someone assigns a task to me' },
                      { key: 'taskCompleted', label: 'Task Completed', desc: 'Notify me when my created tasks are done' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A recap of my team\'s productivity every Monday' },
                    ].map(item => (
                      <div key={item.key} className="group flex items-center justify-between p-5 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl border border-slate-700/50 transition-colors">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">{item.label}</h4>
                          <p className="text-sm text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 focus:outline-none ${notifications[item.key] ? 'bg-violet-500' : 'bg-slate-600'}`}
                        >
                          <motion.div 
                            layout
                            className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 left-0.5"
                            animate={{ x: notifications[item.key] ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="glass-card !p-8">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
                    <Palette className="w-6 h-6 text-pink-400" />
                    <h3 className="text-xl font-display font-bold text-white">Appearance & Theme</h3>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Color Theme</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'Dark Theme', icon: Moon, active: true },
                        { name: 'Light Theme', icon: Sun, active: false },
                        { name: 'System Sync', icon: Monitor, active: false },
                      ].map(theme => (
                        <button 
                          key={theme.name} 
                          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${
                            theme.active 
                              ? 'border-violet-500 bg-violet-500/10 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                              : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50'
                          }`}
                        >
                          <theme.icon className="w-6 h-6" />
                          <span className="text-sm font-semibold">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Accent Color</h4>
                    <div className="flex flex-wrap gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                      {[
                        { color: 'bg-violet-500', shadow: 'shadow-violet-500/50' },
                        { color: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
                        { color: 'bg-cyan-500', shadow: 'shadow-cyan-500/50' },
                        { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
                        { color: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
                        { color: 'bg-pink-500', shadow: 'shadow-pink-500/50' },
                      ].map(c => (
                        <button 
                          key={c.color} 
                          className={`w-10 h-10 rounded-full ${c.color} ${
                            c.color === 'bg-violet-500' ? `ring-2 ring-white ring-offset-4 ring-offset-[#0b1326] shadow-lg ${c.shadow}` : ''
                          } hover:scale-110 transition-transform`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Sticky Action Footer */}
          <div className="sticky bottom-8 mt-8 p-6 bg-[#0b1326]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl flex justify-end items-center gap-4 shadow-2xl z-50">
            <button className="px-6 py-2.5 rounded-lg font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
              Discard
            </button>
            <button 
              onClick={handleSave} 
              className="btn-primary flex items-center gap-2 min-w-[140px] justify-center shadow-violet-500/25"
            >
              {saved ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> <span>Saved!</span>
                </motion.div>
              ) : (
                <><Save className="w-4 h-4" /> <span>Save Changes</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
