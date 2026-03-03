import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Zap, Sparkles, Clock, Users } from 'lucide-react'
import { sessionService } from '../../services/sessionService'
import Navbar from '../../components/layout/Navbar'
import { SKILL_CATEGORIES } from '../../utils/helpers'
import toast from 'react-hot-toast'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const DURATIONS = [15, 30, 45, 60]

const LEVEL_PILL = { Beginner: 'pill-lime', Intermediate: 'pill-yellow', Advanced: 'pill-fire' }

export default function CreateSession() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { duration: 30, creditCost: 5, maxSeats: 1, sessionType: 'one-to-one', level: 'Beginner' },
  })

  const mutation = useMutation({
    mutationFn: (data) => sessionService.create(data),
    onSuccess: ({ data }) => {
      toast.success('Session created! 🎉')
      navigate(`/sessions/${data.data.session._id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create session'),
  })

  const creditCost = watch('creditCost') || 0
  const maxSeats = watch('maxSeats') || 0
  const totalEarnings = creditCost * maxSeats

  const onSubmit = (data) => {
    const startTime = new Date(data.startTime).toISOString()
    mutation.mutate({ ...data, startTime, creditCost: Number(data.creditCost), maxSeats: Number(data.maxSeats), duration: Number(data.duration) })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-16">
        {/* Hero header */}
        <div className="border-b border-white/5 py-10 px-4"
          style={{ background: 'linear-gradient(180deg, rgba(255,153,51,0.05) 0%, transparent 100%)' }}>
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Link to="/sessions" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-5 transition-colors group">
                <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Back
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 pill-lime mb-3">
              <Sparkles size={11} /> Create a Session
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-3xl font-black text-white">
              Share your <span className="gradient-text-jungle">knowledge</span>, earn credits
            </motion.h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Session Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card space-y-4" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-white/8 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #CC5200, #FF8C00)' }} />
                Session Details
              </h2>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Title *</label>
                <input className="input" placeholder="e.g. React Hooks Explained in 30 Minutes"
                  {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })} />
                {errors.title && <p className="text-xs text-coral-400 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Description *</label>
                <textarea className="input min-h-[110px] resize-none" placeholder="What will students learn? Be specific about what you'll cover…"
                  {...register('description', { required: 'Description required', minLength: { value: 20, message: 'Min 20 characters' } })} />
                {errors.description && <p className="text-xs text-coral-400 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Skill Tag *</label>
                  <input className="input" placeholder="e.g. React, Python, Guitar…"
                    {...register('skillTag', { required: 'Skill tag required' })} />
                  {errors.skillTag && <p className="text-xs text-coral-400 mt-1">{errors.skillTag.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Category</label>
                  <select className="input" {...register('category')}>
                    <option value="">Select category</option>
                    {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Level *</label>
                  <select className="input" {...register('level', { required: true })}>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Session Type</label>
                  <select className="input" {...register('sessionType')}>
                    <option value="one-to-one">1-on-1</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Schedule & Pricing */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card space-y-4" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-white/8 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #FF9933, #FFAD5C)' }} />
                Schedule &amp; Pricing
              </h2>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Start Time *</label>
                <input type="datetime-local" className="input"
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  {...register('startTime', { required: 'Start time is required' })} />
                {errors.startTime && <p className="text-xs text-coral-400 mt-1">{errors.startTime.message}</p>}
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Clock size={10} /> Duration
                  </label>
                  <select className="input" {...register('duration', { required: true })}>
                    {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Zap size={10} /> Credit Cost
                  </label>
                  <input type="number" min={1} max={50} className="input"
                    {...register('creditCost', { required: true, min: 1, max: 50 })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Users size={10} /> Max Seats
                  </label>
                  <input type="number" min={1} max={20} className="input"
                    {...register('maxSeats', { min: 1, max: 20 })} />
                </div>
              </div>

              {/* Earnings preview */}
              <motion.div
                animate={{ scale: totalEarnings > 0 ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.2)' }}>
                <div>
                  <p className="text-xs text-white/45 mb-0.5">Potential earnings (if full)</p>
                  <p className="text-2xl font-black" style={{ color: '#FF9933' }}>{totalEarnings} <span className="text-base font-normal text-white/50">credits</span></p>
                </div>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  className="text-3xl">💰</motion.div>
              </motion.div>
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex gap-3 justify-end">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="submit" disabled={mutation.isPending}
                className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
                {mutation.isPending ? 'Creating…' : 'Create Session 🚀'}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  )
}
