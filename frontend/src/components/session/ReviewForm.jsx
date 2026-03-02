import { useState } from 'react'
import { motion } from 'framer-motion'
import { reviewService } from '../../services/sessionService'
import StarRating from '../common/StarRating'
import toast from 'react-hot-toast'

export default function ReviewForm({ sessionId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    try {
      await reviewService.create(sessionId, { rating, comment })
      toast.success('Review submitted!')
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="card space-y-4"
    >
      <h3 className="font-semibold text-white">Leave a Review</h3>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/60">Rating</label>
        <StarRating rating={rating} interactive onChange={setRating} size={24} />
      </div>
      <div>
        <label className="text-sm text-white/60 block mb-2">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="input resize-none text-sm"
        />
      </div>
      <button type="submit" disabled={submitting || rating === 0} className="btn-primary w-full text-sm">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </motion.form>
  )
}
