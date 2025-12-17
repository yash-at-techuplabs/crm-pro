import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Building2,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatCompactNumber, cn, getInitials } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'
import type { Contact, Deal, Lead, Task, Activity } from '../types/database'

const COLORS = ['#0c8ee5', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

interface DashboardStats {
  totalContacts: number
  totalCompanies: number
  totalLeads: number
  totalDeals: number
  totalDealValue: number
  wonDeals: number
  openDeals: number
  tasksToday: number
  activitiesThisWeek: number
}

const revenueData = [
  { month: 'Jan', value: 45000, target: 50000 },
  { month: 'Feb', value: 52000, target: 52000 },
  { month: 'Mar', value: 48000, target: 54000 },
  { month: 'Apr', value: 61000, target: 56000 },
  { month: 'May', value: 58000, target: 58000 },
  { month: 'Jun', value: 67000, target: 60000 },
]

const dealStageData = [
  { name: 'Lead', value: 35, color: '#94a3b8' },
  { name: 'Qualified', value: 28, color: '#3b82f6' },
  { name: 'Proposal', value: 18, color: '#8b5cf6' },
  { name: 'Negotiation', value: 12, color: '#f59e0b' },
  { name: 'Won', value: 7, color: '#22c55e' },
]

const activityData = [
  { day: 'Mon', calls: 12, emails: 24, meetings: 4 },
  { day: 'Tue', calls: 8, emails: 18, meetings: 6 },
  { day: 'Wed', calls: 15, emails: 32, meetings: 8 },
  { day: 'Thu', calls: 10, emails: 22, meetings: 5 },
  { day: 'Fri', calls: 14, emails: 28, meetings: 7 },
]

export function Dashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalCompanies: 0,
    totalLeads: 0,
    totalDeals: 0,
    totalDealValue: 0,
    wonDeals: 0,
    openDeals: 0,
    tasksToday: 0,
    activitiesThisWeek: 0
  })
  const [recentDeals, setRecentDeals] = useState<Deal[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setIsLoading(true)
      
      // Fetch counts
      const [
        { count: contactsCount },
        { count: companiesCount },
        { count: leadsCount },
        { data: dealsData },
        { data: tasksData },
        { data: activitiesData }
      ] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('deals').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('tasks').select('*').eq('status', 'pending').order('due_date', { ascending: true }).limit(5),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(5)
      ])

      const deals = dealsData || []
      const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
      const wonDeals = deals.filter(d => d.status === 'won').length
      const openDeals = deals.filter(d => d.status === 'open').length

      setStats({
        totalContacts: contactsCount || 0,
        totalCompanies: companiesCount || 0,
        totalLeads: leadsCount || 0,
        totalDeals: deals.length,
        totalDealValue,
        wonDeals,
        openDeals,
        tasksToday: tasksData?.length || 0,
        activitiesThisWeek: activitiesData?.length || 0
      })

      setRecentDeals(deals.slice(0, 5))
      setUpcomingTasks(tasksData || [])
      setRecentActivities(activitiesData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Companies',
      value: stats.totalCompanies,
      change: '+8%',
      trend: 'up',
      icon: Building2,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Active Leads',
      value: stats.totalLeads,
      change: '+23%',
      trend: 'up',
      icon: Target,
      color: 'from-orange-500 to-amber-500'
    },
    {
      title: 'Deal Value',
      value: formatCurrency(stats.totalDealValue),
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your sales today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 group hover:border-slate-600/50 transition-all duration-300"
          >
            <div className={cn(
              'absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl transition-opacity group-hover:opacity-20',
              `bg-gradient-to-br ${stat.color}`
            )} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                  stat.color
                )}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                )}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">
                {typeof stat.value === 'number' ? formatCompactNumber(stat.value) : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white text-lg">Revenue Overview</h3>
              <p className="text-slate-400 text-sm mt-1">Monthly revenue vs target</p>
            </div>
            <select className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8ee5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0c8ee5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [formatCurrency(value as number), '']}
                />
                <Area type="monotone" dataKey="value" stroke="#0c8ee5" strokeWidth={2} fill="url(#colorValue)" />
                <Line type="monotone" dataKey="target" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Deal Pipeline */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="font-semibold text-white text-lg mb-6">Deal Pipeline</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dealStageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dealStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {dealStageData.map((stage) => (
              <div key={stage.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-slate-400">{stage.name}</span>
                </div>
                <span className="text-white font-medium">{stage.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity & Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
        >
          <h3 className="font-semibold text-white text-lg mb-6">Weekly Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="calls" fill="#0c8ee5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emails" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meetings" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-sm text-slate-400">Calls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-slate-400">Emails</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-400">Meetings</span>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white text-lg">Upcoming Tasks</h3>
            <span className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer">View all</span>
          </div>
          
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500/50 mb-3" />
              <p className="text-slate-400">No pending tasks</p>
              <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    task.priority === 'urgent' && 'bg-red-500',
                    task.priority === 'high' && 'bg-orange-500',
                    task.priority === 'medium' && 'bg-blue-500',
                    task.priority === 'low' && 'bg-slate-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-md text-xs font-medium',
                    task.priority === 'urgent' && 'bg-red-500/20 text-red-400',
                    task.priority === 'high' && 'bg-orange-500/20 text-orange-400',
                    task.priority === 'medium' && 'bg-blue-500/20 text-blue-400',
                    task.priority === 'low' && 'bg-slate-500/20 text-slate-400'
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Deals */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white text-lg">Recent Deals</h3>
          <span className="text-sm text-primary-400 hover:text-primary-300 cursor-pointer">View all</span>
        </div>
        
        {recentDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <DollarSign className="w-12 h-12 text-slate-500/50 mb-3" />
            <p className="text-slate-400">No deals yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first deal to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-sm font-semibold text-slate-400">Deal Name</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">Value</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">Status</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400">Expected Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-900/30">
                    <td className="py-3">
                      <p className="text-white font-medium">{deal.name}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-white font-medium">{formatCurrency(deal.value)}</p>
                    </td>
                    <td className="py-3">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        deal.status === 'won' && 'bg-green-500/20 text-green-400',
                        deal.status === 'lost' && 'bg-red-500/20 text-red-400',
                        deal.status === 'open' && 'bg-blue-500/20 text-blue-400'
                      )}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {deal.expected_close_date
                        ? new Date(deal.expected_close_date).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

