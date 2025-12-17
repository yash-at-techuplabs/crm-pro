import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Target, Edit2, Trash2, Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, getInitials, generateColor, getStatusColor } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { Modal } from '../components/Modal'
import type { Lead } from '../types/database'

export function Leads() {
  const { user } = useAuthStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', company_name: '',
    job_title: '', lead_source: '', status: 'new', score: '0', description: '', website: ''
  })

  const leadSources = ['Website', 'Referral', 'Social Media', 'Trade Show', 'Cold Call', 'Email Campaign', 'Other']
  const leadStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted']

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setLeads(data || [])
    } catch (error) { console.error('Error:', error) }
    finally { setIsLoading(false) }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lead.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function openCreateModal() {
    setEditingLead(null)
    setFormData({ first_name: '', last_name: '', email: '', phone: '', company_name: '',
      job_title: '', lead_source: '', status: 'new', score: '0', description: '', website: '' })
    setShowModal(true)
  }

  function openEditModal(lead: Lead) {
    setEditingLead(lead)
    setFormData({
      first_name: lead.first_name, last_name: lead.last_name || '', email: lead.email || '',
      phone: lead.phone || '', company_name: lead.company_name || '', job_title: lead.job_title || '',
      lead_source: lead.lead_source || '', status: lead.status, score: lead.score.toString(),
      description: lead.description || '', website: lead.website || ''
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    try {
      setIsSaving(true)
      const leadData = { ...formData, score: parseInt(formData.score) || 0, owner_id: user.id, created_by: user.id }
      if (editingLead) {
        const { error } = await supabase.from('leads').update(leadData).eq('id', editingLead.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('leads').insert(leadData)
        if (error) throw error
      }
      setShowModal(false)
      fetchLeads()
    } catch (error) { console.error('Error:', error) }
    finally { setIsSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (error) throw error
      fetchLeads()
    } catch (error) { console.error('Error:', error) }
  }

  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    unqualified: leads.filter(l => l.status === 'unqualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">Track and convert your sales leads</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25">
          <Plus className="w-5 h-5" />Add Lead
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button key={status} onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
            className={cn('p-4 rounded-xl border transition-all text-left',
              statusFilter === status ? 'bg-primary-500/10 border-primary-500/30' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50')}>
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-sm text-slate-400 capitalize">{status}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" placeholder="Search leads..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="w-12 h-12 text-slate-500/50 mb-3" />
            <p className="text-slate-400">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Lead</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: generateColor(lead.first_name + (lead.last_name || '')) }}>
                          {getInitials(lead.first_name + ' ' + (lead.last_name || ''))}
                        </div>
                        <div>
                          <p className="text-white font-medium">{lead.first_name} {lead.last_name}</p>
                          {lead.email && <p className="text-sm text-slate-400">{lead.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{lead.company_name || '-'}</td>
                    <td className="px-6 py-4 text-slate-400">{lead.lead_source || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all',
                            lead.score >= 80 ? 'bg-green-500' : lead.score >= 50 ? 'bg-yellow-500' : 'bg-slate-500')}
                            style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-sm text-slate-400">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getStatusColor(lead.status))}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(lead)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingLead ? 'Edit Lead' : 'Add New Lead'}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">First Name *</label><input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input" placeholder="John" /></div>
            <div><label className="label">Last Name</label><input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input" placeholder="Doe" /></div>
            <div><label className="label">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="john@example.com" /></div>
            <div><label className="label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" placeholder="+1 234 567 890" /></div>
            <div><label className="label">Company Name</label><input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="input" placeholder="Acme Inc." /></div>
            <div><label className="label">Job Title</label><input type="text" value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className="input" placeholder="CEO" /></div>
            <div><label className="label">Lead Source</label><select value={formData.lead_source} onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })} className="input"><option value="">Select source</option>{leadSources.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="label">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input">{leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="label">Score (0-100)</label><input type="number" min="0" max="100" value={formData.score} onChange={(e) => setFormData({ ...formData, score: e.target.value })} className="input" /></div>
            <div><label className="label">Website</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" placeholder="https://example.com" /></div>
            <div className="sm:col-span-2"><label className="label">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[100px]" placeholder="Notes..." /></div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

