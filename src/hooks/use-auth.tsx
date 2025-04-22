import {createContext, ReactNode, useContext} from 'react'
import {useQuery, useMutation, UseMutationResult} from '@tanstack/react-query'
import {insertUserSchema, User as SelectUser, InsertUser} from '@shared/schema'
import {getQueryFn, apiRequest, queryClient} from '@/lib/queryClient'
import {useToast} from '@/hooks/use-toast'

type AuthContextType = {
  user: SelectUser | null
  isLoading: boolean
  error: Error | null
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>
  logoutMutation: UseMutationResult<void, Error, void>
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>
}

type LoginData = Pick<InsertUser, 'username' | 'password'>

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({children}: {children: ReactNode}) {
  const {toast} = useToast()
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({on401: 'returnNull'}),
  })

  // Asegurarse de que user sea siempre SelectUser | null
  const user = userData || null

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest('POST', '/api/login', credentials)
        return await res.json()
      } catch (error) {
        console.error('Error en login mutation:', error)
        throw error
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(['/api/user'], user)
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido, ${user.name}`,
      })
    },
    onError: (error: Error) => {
      console.error('Error completo:', error)
      toast({
        title: 'Error de inicio de sesión',
        description: 'Usuario o contraseña incorrectos',
        variant: 'destructive',
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest('POST', '/api/register', userData)
      return await res.json()
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData([`/api/user`], user)
      toast({
        title: 'Registro exitoso',
        description: `Bienvenido, ${user.name}`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error de registro',
        description:
          'No se pudo crear la cuenta. El nombre de usuario podría estar en uso.',
        variant: 'destructive',
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      toast({
        title: 'Sesión cerrada',
        description: 'Ha cerrado sesión correctamente',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al cerrar sesión',
        description: 'No se pudo cerrar la sesión. Intente de nuevo.',
        variant: 'destructive',
      })
    },
  })

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
