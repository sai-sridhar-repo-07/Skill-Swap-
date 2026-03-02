import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/sessionService'

export const useCredits = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { data } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => userService.getTransactions({ limit: 5 }),
    enabled: isAuthenticated,
    staleTime: 30000,
  })
  return {
    balance: user?.creditsBalance ?? 0,
    transactions: data?.data?.data?.transactions || [],
  }
}
