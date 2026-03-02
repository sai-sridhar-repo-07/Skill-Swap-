import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'

const Input = forwardRef(({ label, error, hint, className, icon, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
    )}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">{icon}</span>}
      <input
        ref={ref}
        className={cn('input', icon && 'pl-10', error && 'border-red-500/60 focus:border-red-500', className)}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs text-white/35">{hint}</p>}
  </div>
))
Input.displayName = 'Input'
export default Input
