import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Building2,
  Edit2,
  Trash2,
  Globe,
  Phone,
  Mail,
  Users,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency, getInitials, generateColor } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import { Modal } from '../components/Modal'
import type { Company } from '../types/database'

export function Companies() {
  const { user } = useAuthStore()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '',
    website: '',
    phone: '',
    email: '',
    description: '',
    annual_revenue: '',
    linkedin_url: ''
  })

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
    'Education', 'Real Estate', 'Consulting', 'Marketing', 'Other'
  ]

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.industry?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (company.domain?.toLowerCase() || '').includes(searchQuery.toLowerCase())

    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter

    return matchesSearch && matchesIndustry
  })

  function openCreateModal() {
    setEditingCompany(null)
    setFormData({
      name: '',
      domain: '',
      industry: '',
      size: '',
      website: '',
      phone: '',
      email: '',
      description: '',
      annual_revenue: '',
      linkedin_url: ''
    })
    setShowModal(true)
  }

  function openEditModal(company: Company) {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      domain: company.domain || '',
      industry: company.industry || '',
      size: company.size || '',
      website: company.website || '',
      phone: company.phone || '',
      email: company.email || '',
      description: company.description || '',
      annual_revenue: company.annual_revenue?.toString() || '',
      linkedin_url: company.linkedin_url || ''
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    try {
      setIsSaving(true)

      const companyData = {
        name: formData.name,
        domain: formData.domain || null,
        industry: formData.industry || null,
        size: formData.size || null,
        website: formData.website || null,
        phone: formData.phone || null,
        email: formData.email || null,
        description: formData.description || null,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        linkedin_url: formData.linkedin_url || null,
        owner_id: user.id,
        created_by: user.id
      }

      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingCompany.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('companies').insert(companyData)
        if (error) throw error
      }

      setShowModal(false)
      fetchCompanies()
    } catch (error) {
      console.error('Error saving company:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this company?')) return

    try {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
      fetchCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Companies</h1>
          <p className="text-slate-400 mt-1">Manage your business accounts</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
          />
        </div>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="all">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/50 border border-slate-700/50 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-500/50 mb-3" />
          <p className="text-slate-400">No companies found</p>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first company to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <motion.div
              key={company.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: generateColor(company.name) }}
                  >
                    {getInitials(company.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{company.name}</h3>
                    {company.industry && (
                      <p className="text-sm text-slate-400">{company.industry}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{company.domain || company.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{company.email}</span>
                  </a>
                )}
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-slate-400 hover:text-primary-400 transition-colors">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                {company.size && (
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Users className="w-4 h-4" />
                    {company.size} employees
                  </span>
                )}
                {company.annual_revenue && (
                  <span className="text-sm font-medium text-green-400">
                    {formatCurrency(company.annual_revenue)}/yr
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCompany ? 'Edit Company' : 'Add New Company'}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Company Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="label">Domain</label>
              <input type="text" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} className="input" placeholder="acme.com" />
            </div>
            <div>
              <label className="label">Website</label>
              <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" placeholder="https://acme.com" />
            </div>
            <div>
              <label className="label">Industry</label>
              <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="input">
                <option value="">Select industry</option>
                {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Company Size</label>
              <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="input">
                <option value="">Select size</option>
                {companySizes.map(size => <option key={size} value={size}>{size} employees</option>)}
              </select>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="contact@acme.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="label">Annual Revenue</label>
              <input type="number" value={formData.annual_revenue} onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })} className="input" placeholder="1000000" />
            </div>
            <div>
              <label className="label">LinkedIn URL</label>
              <input type="url" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} className="input" placeholder="https://linkedin.com/company/acme" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[100px]" placeholder="Add notes about this company..." />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingCompany ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

