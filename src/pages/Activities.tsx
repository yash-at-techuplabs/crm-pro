import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Phone, Mail, Calendar, FileText, Clock, CheckCircle, X, Loader2, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, formatDateTime, getStatusColor } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import type { Activity, Contact, Deal } from '../types/database'

const activityTypes = [
  { value: 'call', label: 'Call', icon: Phone, color: 'bg-blue-500' },
  { value: 'email', label: 'Email', icon: Mail, color: 'bg-purple-500' },
  { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'bg-green-500' },
  { value: 'note', label: 'Note', icon: FileText, color: 'bg-yellow-500' },
  { value: 'task', label: 'Task', icon: CheckCircle, color: 'bg-orange-500' },
  { value: 'other', label: 'Other', icon: Clock, color: 'bg-slate-500' },
]

export function Activities() {
  const { user } = useAuthStore()
  const [activities, setActivities] = useState<Activity[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: 'call', subject: '', description: '', status: 'pending',
    due_date: '', duration_minutes: '', outcome: '', contact_id: '', deal_id: ''
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const [activitiesRes, contactsRes, dealsRes] = await Promise.all([
        supabase.from('activities').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('first_name'),
        supabase.from('deals').select('*').order('name')
      ])
      setActivities(activitiesRes.data || [])
      setContacts(contactsRes.data || [])
      setDeals(dealsRes.data || [])
    } catch (error) { console.error('Error:', error) }
    finally { setIsLoading(false) }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    return matchesSearch && matchesType
  })

  function openCreateModal(type: string = 'call') {
    setEditingActivity(null)
    setFormData({ type, subject: '', description: '', status: 'pending', due_date: '', duration_minutes: '', outcome: '', contact_id: '', deal_id: '' })
    setShowModal(true)
  }

  function openEditModal(activity: Activity) {
    setEditingActivity(activity)
    setFormData({
      type: activity.type, subject: activity.subject, description: activity.description || '',
      status: activity.status, due_date: activity.due_date?.split('T')[0] || '',
      duration_minutes: activity.duration_minutes?.toString() || '', outcome: activity.outcome || '',
      contact_id: activity.contact_id || '', deal_id: activity.deal_id || ''
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    try {
      setIsSaving(true)
      const activityData = {
        type: formData.type, subject: formData.subject, description: formData.description || null,
        status: formData.status, due_date: formData.due_date || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        outcome: formData.outcome || null, contact_id: formData.contact_id || null,
        deal_id: formData.deal_id || null, assigned_to: user.id, created_by: user.id
      }
      if (editingActivity) {
        await supabase.from('activities').update(activityData).eq('id', editingActivity.id)
      } else {
        await supabase.from('activities').insert(activityData)
      }
      setShowModal(false)
      fetchData()
    } catch (error) { console.error('Error:', error) }
    finally { setIsSaving(false) }
  }

  async function handleStatusChange(id: string, status: string) {
    const update: any = { status }
    if (status === 'completed') update.completed_at = new Date().toISOString()
    await supabase.from('activities').update(update).eq('id', id)
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this activity?')) return
    await supabase.from('activities').delete().eq('id', id)
    fetchData()
  }

  const getTypeIcon = (type: string) => activityTypes.find(t => t.value === type) || activityTypes[5]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Activities</h1>
          <p className="text-slate-400 mt-1">Track all your interactions</p>
        </div>
        <button onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25">
          <Plus className="w-5 h-5" />Log Activity
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {activityTypes.map(type => (
          <button key={type.value} onClick={() => openCreateModal(type.value)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', type.color)}>
              <type.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-300">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Search activities..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white">
          <option value="all">All Types</option>
          {activityTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <Calendar className="w-12 h-12 text-slate-500/50 mb-3" />
          <p className="text-slate-400">No activities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const typeInfo = getTypeIcon(activity.type)
            return (
              <motion.div key={activity.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeInfo.color)}>
                    <typeInfo.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-white">{activity.subject}</h3>
                        {activity.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{activity.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(activity)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(activity.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getStatusColor(activity.status))}>{activity.status}</span>
                      {activity.due_date && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />{new Date(activity.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {activity.duration_minutes && (
                        <span className="text-xs text-slate-400">{activity.duration_minutes} min</span>
                      )}
                      <span className="text-xs text-slate-500">{formatDateTime(activity.created_at)}</span>
                    </div>
                  </div>
                  <select value={activity.status} onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white cursor-pointer">
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">{editingActivity ? 'Edit Activity' : 'Log Activity'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div><label className="label">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {activityTypes.map(type => (
                        <button key={type.value} type="button" onClick={() => setFormData({ ...formData, type: type.value })}
                          className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                            formData.type === type.value ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 hover:border-slate-600')}>
                          <type.icon className="w-4 h-4 text-slate-300" />
                          <span className="text-sm text-slate-300">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="label">Subject *</label><input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input" placeholder="Call with client" /></div>
                  <div><label className="label">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[80px]" placeholder="Details..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="label">Due Date</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input" /></div>
                    <div><label className="label">Duration (min)</label><input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} className="input" placeholder="30" /></div>
                  </div>
                  <div><label className="label">Contact</label><select value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })} className="input"><option value="">Select contact</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
                  <div><label className="label">Deal</label><select value={formData.deal_id} onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })} className="input"><option value="">Select deal</option>{deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                  <div><label className="label">Outcome</label><textarea value={formData.outcome} onChange={(e) => setFormData({ ...formData, outcome: e.target.value })} className="input" placeholder="Result of the activity..." /></div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingActivity ? 'Save Changes' : 'Log Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

