import { cn } from '../../utils/helpers'

export function Skeleton({ className }) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

export function SessionCardSkeleton() {
  return (
    <div className="card space-y-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3.5 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="card flex items-center gap-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  )
}
