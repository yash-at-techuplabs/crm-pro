import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Lock, Palette, Globe, Save, Loader2, Camera } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn, getInitials } from '../lib/utils'

export function Settings() {
  const { profile, updateProfile, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    job_title: profile?.job_title || '',
    department: profile?.department || '',
    timezone: profile?.timezone || 'UTC'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'localization', label: 'Localization', icon: Globe },
  ]

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney'
  ]

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      setIsSaving(true)
      setMessage(null)
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone || null,
        job_title: formData.job_title || null,
        department: formData.department || null,
        timezone: formData.timezone
      })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                  activeTab === tab.id ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50')}>
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
                
                {message && (
                  <div className={cn('p-4 rounded-lg mb-6',
                    message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400')}>
                    {message.text}
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                      {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full flex items-center justify-center transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{profile?.full_name || 'User'}</h3>
                    <p className="text-slate-400">{profile?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="label">Full Name</label><input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="input" placeholder="John Doe" /></div>
                    <div><label className="label">Email</label><input type="email" value={formData.email} disabled className="input opacity-50 cursor-not-allowed" /></div>
                    <div><label className="label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" placeholder="+1 234 567 890" /></div>
                    <div><label className="label">Timezone</label><select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="input">{timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}</select></div>
                    <div><label className="label">Job Title</label><input type="text" value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className="input" placeholder="Sales Manager" /></div>
                    <div><label className="label">Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input" placeholder="Sales" /></div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { id: 'email_deals', label: 'Deal updates', description: 'Get notified when deals are created, updated, or closed' },
                    { id: 'email_tasks', label: 'Task reminders', description: 'Receive reminders for upcoming and overdue tasks' },
                    { id: 'email_mentions', label: 'Mentions', description: 'Get notified when someone mentions you' },
                    { id: 'email_weekly', label: 'Weekly digest', description: 'Receive a weekly summary of your CRM activity' },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-slate-400">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <h3 className="font-medium text-white mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div><label className="label">Current Password</label><input type="password" className="input" placeholder="••••••••" /></div>
                      <div><label className="label">New Password</label><input type="password" className="input" placeholder="••••••••" /></div>
                      <div><label className="label">Confirm New Password</label><input type="password" className="input" placeholder="••••••••" /></div>
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg">Update Password</button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <h3 className="font-medium text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-400 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg">Enable 2FA</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['Dark', 'Light', 'System'].map(theme => (
                        <button key={theme}
                          className={cn('p-4 rounded-xl border-2 transition-all',
                            theme === 'Dark' ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 hover:border-slate-600')}>
                          <div className={cn('w-full h-20 rounded-lg mb-3',
                            theme === 'Light' ? 'bg-slate-200' : theme === 'System' ? 'bg-gradient-to-r from-slate-800 to-slate-200' : 'bg-slate-800')} />
                          <p className="text-sm font-medium text-white">{theme}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label mb-3">Accent Color</label>
                    <div className="flex gap-3">
                      {['#0c8ee5', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'].map(color => (
                        <button key={color}
                          className={cn('w-10 h-10 rounded-full transition-transform hover:scale-110',
                            color === '#0c8ee5' && 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white')}
                          style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'localization' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-semibold text-white mb-6">Localization</h2>
                <div className="space-y-4">
                  <div><label className="label">Language</label><select className="input"><option>English</option><option>Spanish</option><option>French</option><option>German</option></select></div>
                  <div><label className="label">Date Format</label><select className="input"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
                  <div><label className="label">Currency</label><select className="input"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>INR (₹)</option></select></div>
                  <div><label className="label">Number Format</label><select className="input"><option>1,234.56</option><option>1.234,56</option><option>1 234,56</option></select></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

