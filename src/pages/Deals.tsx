import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, Loader2, Calendar, Building2, User
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn, formatCurrency } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { Modal } from '../components/Modal'
import type { Deal, PipelineStage, Contact, Company } from '../types/database'

interface DealWithRelations extends Deal {
  contact?: Contact | null
  company?: Company | null
  stage?: PipelineStage | null
}

export function Deals() {
  const { user } = useAuthStore()
  const [deals, setDeals] = useState<DealWithRelations[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '', value: '', currency: 'USD', stage_id: '', contact_id: '', company_id: '',
    expected_close_date: '', probability: '0', status: 'open', description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const [dealsRes, stagesRes, contactsRes, companiesRes] = await Promise.all([
        supabase.from('deals').select('*, contact:contacts(*), company:companies(*), stage:pipeline_stages(*)').order('created_at', { ascending: false }),
        supabase.from('pipeline_stages').select('*').order('position'),
        supabase.from('contacts').select('*').order('first_name'),
        supabase.from('companies').select('*').order('name')
      ])
      setDeals(dealsRes.data || [])
      setStages(stagesRes.data || [])
      setContacts(contactsRes.data || [])
      setCompanies(companiesRes.data || [])
    } catch (error) { console.error('Error:', error) }
    finally { setIsLoading(false) }
  }

  const filteredDeals = deals.filter(deal =>
    deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deal.contact?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (deal.company?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  const dealsByStage = stages.map(stage => ({
    stage,
    deals: filteredDeals.filter(d => d.stage_id === stage.id),
    totalValue: filteredDeals.filter(d => d.stage_id === stage.id).reduce((sum, d) => sum + d.value, 0)
  }))

  function openCreateModal() {
    setEditingDeal(null)
    setFormData({
      name: '', value: '', currency: 'USD', stage_id: stages[0]?.id || '', contact_id: '',
      company_id: '', expected_close_date: '', probability: '0', status: 'open', description: ''
    })
    setShowModal(true)
  }

  function openEditModal(deal: Deal) {
    setEditingDeal(deal)
    setFormData({
      name: deal.name, value: deal.value.toString(), currency: deal.currency,
      stage_id: deal.stage_id || '', contact_id: deal.contact_id || '',
      company_id: deal.company_id || '', expected_close_date: deal.expected_close_date || '',
      probability: deal.probability.toString(), status: deal.status, description: deal.description || ''
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    try {
      setIsSaving(true)
      const dealData = {
        name: formData.name,
        value: parseFloat(formData.value) || 0,
        currency: formData.currency,
        stage_id: formData.stage_id || null,
        contact_id: formData.contact_id || null,
        company_id: formData.company_id || null,
        expected_close_date: formData.expected_close_date || null,
        probability: parseInt(formData.probability) || 0,
        status: formData.status,
        description: formData.description || null,
        pipeline_id: '00000000-0000-0000-0000-000000000001',
        owner_id: user.id,
        created_by: user.id
      }
      if (editingDeal) {
        const { error } = await supabase.from('deals').update(dealData).eq('id', editingDeal.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('deals').insert(dealData)
        if (error) throw error
      }
      setShowModal(false)
      fetchData()
    } catch (error) { console.error('Error:', error) }
    finally { setIsSaving(false) }
  }

  async function handleStageChange(dealId: string, newStageId: string) {
    try {
      const stage = stages.find(s => s.id === newStageId)
      const update: any = { stage_id: newStageId }
      if (stage?.is_won) { update.status = 'won'; update.actual_close_date = new Date().toISOString() }
      if (stage?.is_lost) { update.status = 'lost'; update.actual_close_date = new Date().toISOString() }
      await supabase.from('deals').update(update).eq('id', dealId)
      fetchData()
    } catch (error) { console.error('Error:', error) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this deal?')) return
    try {
      await supabase.from('deals').delete().eq('id', id)
      fetchData()
    } catch (error) { console.error('Error:', error) }
  }

  const totalPipelineValue = deals.filter(d => d.status === 'open').reduce((sum, d) => sum + d.value, 0)
  const wonValue = deals.filter(d => d.status === 'won').reduce((sum, d) => sum + d.value, 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Deals</h1>
          <p className="text-slate-400 mt-1">Manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <button onClick={() => setViewMode('board')}
              className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                viewMode === 'board' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white')}>
              Board
            </button>
            <button onClick={() => setViewMode('list')}
              className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white')}>
              List
            </button>
          </div>
          <button onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25">
            <Plus className="w-5 h-5" />Add Deal
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pipeline Value</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalPipelineValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Won Deals</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(wonValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Open Deals</p>
          <p className="text-2xl font-bold text-white mt-1">{deals.filter(d => d.status === 'open').length}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input type="text" placeholder="Search deals..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {dealsByStage.map(({ stage, deals: stageDeals, totalValue }) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-semibold text-white">{stage.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">{stageDeals.length}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{formatCurrency(totalValue)}</p>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {stageDeals.map((deal) => (
                  <motion.div key={deal.id} layout
                    className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-slate-600/50 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white">{deal.name}</h4>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(deal)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(deal.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary-400 mb-3">{formatCurrency(deal.value)}</p>
                    <div className="space-y-2 text-sm">
                      {deal.company && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Building2 className="w-4 h-4" />
                          <span className="truncate">{deal.company.name}</span>
                        </div>
                      )}
                      {deal.contact && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <User className="w-4 h-4" />
                          <span className="truncate">{deal.contact.first_name} {deal.contact.last_name}</span>
                        </div>
                      )}
                      {deal.expected_close_date && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <select value={deal.stage_id || ''} onChange={(e) => handleStageChange(deal.id, e.target.value)}
                      className="mt-3 w-full px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white cursor-pointer">
                      {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/70">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Deal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Stage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Close Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{deal.name}</p>
                    {deal.contact && <p className="text-sm text-slate-400">{deal.contact.first_name} {deal.contact.last_name}</p>}
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">{formatCurrency(deal.value)}</td>
                  <td className="px-6 py-4">
                    {deal.stage && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: deal.stage.color }} />
                        {deal.stage.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{deal.company?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-400">{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(deal)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(deal.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDeal ? 'Edit Deal' : 'Add New Deal'}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Deal Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="New Enterprise Deal" />
            </div>
            <div>
              <label className="label">Value</label>
              <input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="input" placeholder="10000" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="input">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="label">Stage</label>
              <select value={formData.stage_id} onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })} className="input">
                {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input">
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="label">Contact</label>
              <select value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })} className="input">
                <option value="">Select contact</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Company</label>
              <select value={formData.company_id} onChange={(e) => setFormData({ ...formData, company_id: e.target.value })} className="input">
                <option value="">Select company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expected Close Date</label>
              <input type="date" value={formData.expected_close_date} onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Probability (%)</label>
              <input type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: e.target.value })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[100px]" placeholder="Deal details..." />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingDeal ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

