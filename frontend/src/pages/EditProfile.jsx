import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Camera, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { userService } from '../services/sessionService'
import Input from '../components/ui/Input'
import Avatar from '../components/ui/Avatar'
import Navbar from '../components/layout/Navbar'
import { LEVEL_COLORS, SKILL_CATEGORIES } from '../utils/helpers'
import toast from 'react-hot-toast'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function EditProfile() {
  const { user, updateUser } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef()
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || [])
  const [skillsWanted, setSkillsWanted] = useState(user?.skillsWanted || [])
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner', category: '' })
  const [newWanted, setNewWanted] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, bio: user?.bio },
  })

  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: ({ data }) => {
      updateUser(data.data.user)
      toast.success('Profile updated! ✅')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })

  const avatarMutation = useMutation({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: ({ data }) => {
      setAvatarUrl(data.data.avatar)
      updateUser({ avatar: data.data.avatar })
      toast.success('Avatar updated! 📸')
    },
    onError: () => toast.error('Upload failed'),
  })

  const addSkillOffered = () => {
    if (!newSkill.name.trim()) return
    setSkillsOffered((prev) => [...prev, { ...newSkill }])
    setNewSkill({ name: '', level: 'Beginner', category: '' })
  }

  const addSkillWanted = () => {
    if (!newWanted.trim()) return
    setSkillsWanted((prev) => [...prev, { name: newWanted.trim() }])
    setNewWanted('')
  }

  const removeSkill = (type, idx) => {
    if (type === 'offered') setSkillsOffered((prev) => prev.filter((_, i) => i !== idx))
    else setSkillsWanted((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = (data) => {
    updateMutation.mutate({ ...data, skillsOffered, skillsWanted })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/5 py-10 px-4"
          style={{ background: 'linear-gradient(180deg, rgba(255,153,51,0.05) 0%, transparent 100%)' }}>
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 pill-ocean mb-3">
              <Sparkles size={11} /> Edit Profile
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-3xl font-black text-white">
              Your <span className="gradient-text-ocean">profile</span>
            </motion.h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Avatar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card flex items-center gap-5"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="relative">
                <Avatar src={avatarUrl} name={user?.name} size="xl" />
                <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #CC5200, #FF8C00)' }}>
                  <Camera size={13} />
                </motion.button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && avatarMutation.mutate(e.target.files[0])} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-xs text-white/40 mt-0.5">Click the camera to change your photo</p>
                {avatarMutation.isPending && (
                  <p className="text-xs text-coral-400 mt-1 animate-pulse">Uploading…</p>
                )}
              </div>
            </motion.div>

            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card space-y-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Basic Info</h2>
              <Input label="Full Name" error={errors.name?.message}
                {...register('name', { required: 'Name required', minLength: { value: 2, message: 'Min 2 chars' } })} />
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea className="input min-h-[100px] resize-none" placeholder="Tell others about yourself and your skills…"
                  {...register('bio', { maxLength: { value: 500, message: 'Max 500 chars' } })} />
                {errors.bio && <p className="text-xs text-coral-400 mt-1">{errors.bio.message}</p>}
              </div>
            </motion.div>

            {/* Skills I Teach */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card space-y-4" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Skills I Can Teach</h2>
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                <AnimatePresence>
                  {skillsOffered.map((s, i) => (
                    <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className={`text-xs flex items-center gap-1 ${LEVEL_COLORS[s.level]}`}>
                      {s.name} <span className="opacity-60">· {s.level}</span>
                      <button type="button" onClick={() => removeSkill('offered', i)}
                        className="ml-0.5 hover:text-red-400 transition-colors"><X size={10} /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <input className="input flex-1 py-2 text-sm" placeholder="Skill name…"
                  value={newSkill.name} onChange={(e) => setNewSkill((n) => ({ ...n, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())} />
                <select className="input w-34 py-2 text-sm"
                  value={newSkill.level} onChange={(e) => setNewSkill((n) => ({ ...n, level: e.target.value }))}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={addSkillOffered}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1"
                  style={{ background: 'rgba(255,153,51,0.15)', border: '1px solid rgba(255,153,51,0.3)' }}>
                  <Plus size={14} /> Add
                </motion.button>
              </div>
            </motion.div>

            {/* Skills Wanted */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card space-y-4" style={{ border: '1px solid rgba(255,153,51,0.15)' }}>
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Skills I Want to Learn</h2>
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                <AnimatePresence>
                  {skillsWanted.map((s, i) => (
                    <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="pill-ocean text-xs flex items-center gap-1">
                      {s.name || s}
                      <button type="button" onClick={() => removeSkill('wanted', i)}
                        className="ml-0.5 hover:text-red-400 transition-colors"><X size={10} /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <input className="input flex-1 py-2 text-sm" placeholder="What do you want to learn?"
                  value={newWanted} onChange={(e) => setNewWanted(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())} />
                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={addSkillWanted}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1"
                  style={{ background: 'rgba(255,153,51,0.12)', border: '1px solid rgba(255,153,51,0.25)' }}>
                  <Plus size={14} /> Add
                </motion.button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="flex gap-3 justify-end">
              <motion.button type="submit" disabled={updateMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
                {updateMutation.isPending ? 'Saving…' : 'Save Changes ✅'}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  )
}
