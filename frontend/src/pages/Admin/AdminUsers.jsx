import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, Ban, Coins, Users } from 'lucide-react'
import { adminService } from '../../services/sessionService'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [creditModal, setCreditModal] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminService.getUsers({ search, page, limit: 15 }),
  })

  const users = data?.data?.data?.users || []
  const total = data?.data?.data?.total || 0
  const pages = data?.data?.data?.pages || 1

  const banMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.banUser(id, reason),
    onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries(['admin-users']) },
  })

  const creditMutation = useMutation({
    mutationFn: ({ id, amount, reason }) => adminService.adjustCredits(id, { amount: Number(amount), reason }),
    onSuccess: () => {
      toast.success('Credits adjusted ⚡')
      setCreditModal(null)
      setCreditAmount('')
      setCreditReason('')
      qc.invalidateQueries(['admin-users'])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)' }}>
            <Users size={20} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <span className="pill-ocean text-xs ml-1">{total} total</span>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="relative mb-6 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input pl-9 text-sm" placeholder="Search users…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card !p-0 overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <tr className="text-left">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-8" /></td></tr>
                ))
              ) : users.map((u, idx) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-white/4 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-white">{u.name}</p>
                        <p className="text-xs text-white/35">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.role === 'admin' ? 'pill-yellow text-xs' : 'pill-ocean text-xs'}>
                      {u.role === 'admin' ? <Shield size={9} className="inline mr-0.5" /> : null}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.isBanned ? 'pill-fire text-xs' : 'pill-lime text-xs'}>
                      {u.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/35">{timeAgo(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => { setCreditModal(u); setCreditAmount(''); setCreditReason('') }}
                        className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-yellow-400 transition-colors"
                        title="Adjust credits">
                        <Coins size={14} />
                      </motion.button>
                      {u.role !== 'admin' && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => banMutation.mutate({ id: u._id, reason: 'Admin action' })}
                          className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'hover:bg-orange-500/10 text-orange-300' : 'hover:bg-red-500/10 text-red-400'}`}
                          title={u.isBanned ? 'Unban' : 'Ban'}>
                          <Ban size={14} />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!isLoading && users.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">
              <div className="text-3xl mb-2">👥</div>
              No users found
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-30">← Prev</motion.button>
            <span className="text-sm text-white/40 px-2">{page} / {pages}</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
              className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-30">Next →</motion.button>
          </div>
        )}
      </div>

      {/* Credit Modal */}
      <Modal isOpen={!!creditModal} onClose={() => setCreditModal(null)}
        title={`⚡ Adjust Credits — ${creditModal?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">
              Amount (positive to add, negative to deduct)
            </label>
            <input type="number" className="input" placeholder="e.g. 10 or -5"
              value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Reason</label>
            <input className="input" placeholder="Reason for adjustment"
              value={creditReason} onChange={(e) => setCreditReason(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => setCreditModal(null)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => creditMutation.mutate({ id: creditModal._id, amount: creditAmount, reason: creditReason })}
              disabled={creditMutation.isPending}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
              {creditMutation.isPending ? 'Applying…' : 'Apply'}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
