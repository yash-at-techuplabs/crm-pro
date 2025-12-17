import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, CheckCircle2, Clock, AlertCircle, Loader2, Edit2, Trash2, Calendar, Flag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, getPriorityColor } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { Modal } from '../components/Modal'
import type { Task, Contact, Deal } from '../types/database'

export function Tasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'pending',
    due_date: '', contact_id: '', deal_id: ''
  })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const [tasksRes, contactsRes, dealsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('contacts').select('*').order('first_name'),
        supabase.from('deals').select('*').order('name')
      ])
      setTasks(tasksRes.data || [])
      setContacts(contactsRes.data || [])
      setDeals(dealsRes.data || [])
    } catch (error) { console.error('Error:', error) }
    finally { setIsLoading(false) }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  }

  function openCreateModal() {
    setEditingTask(null)
    setFormData({ title: '', description: '', priority: 'medium', status: 'pending', due_date: '', contact_id: '', deal_id: '' })
    setShowModal(true)
  }

  function openEditModal(task: Task) {
    setEditingTask(task)
    setFormData({
      title: task.title, description: task.description || '', priority: task.priority,
      status: task.status, due_date: task.due_date?.split('T')[0] || '',
      contact_id: task.contact_id || '', deal_id: task.deal_id || ''
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    try {
      setIsSaving(true)
      const taskData = {
        title: formData.title, description: formData.description || null, priority: formData.priority,
        status: formData.status, due_date: formData.due_date || null,
        contact_id: formData.contact_id || null, deal_id: formData.deal_id || null,
        assigned_to: user.id, created_by: user.id
      }
      if (editingTask) {
        await supabase.from('tasks').update(taskData).eq('id', editingTask.id)
      } else {
        await supabase.from('tasks').insert(taskData)
      }
      setShowModal(false)
      fetchData()
    } catch (error) { console.error('Error:', error) }
    finally { setIsSaving(false) }
  }

  async function handleStatusChange(id: string, status: string) {
    const update: any = { status }
    if (status === 'completed') update.completed_at = new Date().toISOString()
    await supabase.from('tasks').update(update).eq('id', id)
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    await supabase.from('tasks').delete().eq('id', id)
    fetchData()
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-1">Manage your to-do list</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25">
          <Plus className="w-5 h-5" />Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2"><Clock className="w-5 h-5" /><span className="font-medium">Pending</span></div>
          <p className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2"><AlertCircle className="w-5 h-5" /><span className="font-medium">In Progress</span></div>
          <p className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'in_progress').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-400 mb-2"><CheckCircle2 className="w-5 h-5" /><span className="font-medium">Completed</span></div>
          <p className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2"><Flag className="w-5 h-5" /><span className="font-medium">Overdue</span></div>
          <p className="text-2xl font-bold text-white">{tasks.filter(t => t.status !== 'completed' && isOverdue(t.due_date)).length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Search tasks..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white">
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-slate-500/50 mb-3" />
          <p className="text-slate-400">No tasks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['pending', 'in_progress', 'completed'] as const).map(status => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <h3 className="font-semibold text-white capitalize">{status.replace('_', ' ')}</h3>
                <span className="px-2.5 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300">{tasksByStatus[status].length}</span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {tasksByStatus[status].map((task) => (
                  <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={cn('bg-slate-800/50 border rounded-xl p-4 hover:border-slate-600/50 transition-all group',
                      isOverdue(task.due_date) && task.status !== 'completed' ? 'border-red-500/30' : 'border-slate-700/50')}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <button onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                          className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                            task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-600 hover:border-primary-500')}>
                          {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </button>
                        <div>
                          <p className={cn('font-medium transition-all', task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white')}>{task.title}</p>
                          {task.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(task)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getPriorityColor(task.priority))}>{task.priority}</span>
                      {task.due_date && (
                        <span className={cn('flex items-center gap-1 text-xs',
                          isOverdue(task.due_date) && task.status !== 'completed' ? 'text-red-400' : 'text-slate-400')}>
                          <Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="mt-3 w-full px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white cursor-pointer">
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTask ? 'Edit Task' : 'Add Task'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div><label className="label">Title *</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input" placeholder="Follow up with client" /></div>
            <div><label className="label">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[80px]" placeholder="Task details..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
              <div><label className="label">Due Date</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="input" /></div>
            </div>
            <div><label className="label">Contact</label><select value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })} className="input"><option value="">Select contact</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
            <div><label className="label">Deal</label><select value={formData.deal_id} onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })} className="input"><option value="">Select deal</option>{deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

