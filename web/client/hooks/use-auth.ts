import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/endpoints/auth'
import { useAuthStore } from '@/store/auth-store'
import { QUERY_KEYS } from '@/lib/constants'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setAuth, logout: storeLogout, isAuthenticated, user } = useAuthStore()

  // Check if we have a valid session on mount
  const { data: currentUser, isLoading } = useQuery({
    queryKey: QUERY_KEYS.AUTH,
    queryFn: authApi.getCurrentUser,
    retry: false,
  })

  // Sync store with query result
  useEffect(() => {
    if (currentUser && !isAuthenticated) {
      setAuth(currentUser)
    }
  }, [currentUser, isAuthenticated, setAuth])

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user)
      queryClient.setQueryData(QUERY_KEYS.AUTH, data.user)
      router.push('/dashboard')
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user)
      queryClient.setQueryData(QUERY_KEYS.AUTH, data.user)
      router.push('/dashboard')
    },
  })

  const logout = () => {
    // Call backend to clear cookie
    authApi.logout().finally(() => {
      storeLogout()
      queryClient.clear()
      router.push('/login')
    })
  }

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  }
}
