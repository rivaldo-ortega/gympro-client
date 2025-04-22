import {useState, useEffect} from 'react'
import {useLocation} from 'wouter'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useToast} from '@/hooks/use-toast'
import {useAuth} from '@/hooks/use-auth'
import {Dumbbell} from 'lucide-react'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, {message: 'El nombre de usuario debe tener al menos 3 caracteres'}),
  password: z
    .string()
    .min(6, {message: 'La contraseña debe tener al menos 6 caracteres'}),
})

const registerSchema = z.object({
  username: z
    .string()
    .min(3, {message: 'El nombre de usuario debe tener al menos 3 caracteres'}),
  password: z
    .string()
    .min(6, {message: 'La contraseña debe tener al menos 6 caracteres'}),
  name: z
    .string()
    .min(3, {message: 'El nombre debe tener al menos 3 caracteres'}),
  email: z.string().email({message: 'Email inválido'}),
  phone: z.string().optional(),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [, navigate] = useLocation()
  const {toast} = useToast()
  const {user, isLoading, loginMutation, registerMutation} = useAuth()

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    // Redirigir si el usuario ya está autenticado
    if (user) {
      navigate('/dashboard') // Redirigimos al dashboard
    }
  }, [user, navigate])

  const onLoginSubmit = async (data: LoginValues) => {
    try {
      await loginMutation.mutateAsync(data)
      // La redirección ocurrirá automáticamente con el hook useEffect
      console.log('Inicio de sesión exitoso, redirigiendo...')
    } catch (error) {
      console.error('Error de inicio de sesión:', error)
      // El error se maneja en el mutation en use-auth.tsx, pero podemos agregar más feedback aquí
      toast({
        title: 'Error de inicio de sesión',
        description: 'Verifica tu nombre de usuario y contraseña',
        variant: 'destructive',
      })
    }
  }

  const onRegisterSubmit = async (data: RegisterValues) => {
    try {
      await registerMutation.mutateAsync(data)
      // La redirección ocurrirá automáticamente con el hook useEffect
    } catch (error) {
      console.error('Error de registro:', error)
      // El error se maneja en el mutation en use-auth.tsx
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 bg-white p-6 rounded-xl shadow-sm'>
        <div className='flex flex-col items-center'>
          <div className='h-16 w-16 rounded-xl bg-primary-600 flex items-center justify-center'>
            <Dumbbell className='h-10 w-10 text-white' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
            GymPro Admin
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Sistema de administración para gimnasios
          </p>
          <div className='mt-3 text-center text-sm font-medium px-4 py-2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 w-full'>
            Solo administradores pueden acceder al panel de administración
          </div>
        </div>

        <div className='mt-8'>
          <Tabs
            defaultValue='login'
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'login' | 'register')}
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='login'>Iniciar Sesión</TabsTrigger>
              <TabsTrigger value='register'>Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value='login'>
              <Card className='border-0 shadow-none'>
                <CardHeader className='px-1 pt-6'>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingrese sus credenciales para acceder al sistema
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className='space-y-4 px-1'>
                    <div className='space-y-2'>
                      <Label htmlFor='login-username'>Usuario</Label>
                      <Input
                        id='login-username'
                        placeholder='Nombre de usuario'
                        {...loginForm.register('username')}
                      />
                      {loginForm.formState.errors.username && (
                        <p className='text-sm text-red-500'>
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='login-password'>Contraseña</Label>
                      <Input
                        id='login-password'
                        type='password'
                        placeholder='Contraseña'
                        {...loginForm.register('password')}
                      />
                      {loginForm.formState.errors.password && (
                        <p className='text-sm text-red-500'>
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className='px-1'>
                    <Button
                      className='w-full'
                      type='submit'
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending
                        ? 'Iniciando sesión...'
                        : 'Iniciar Sesión'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value='register'>
              <Card className='border-0 shadow-none'>
                <CardHeader className='px-1 pt-6'>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Cree su cuenta para acceder al sistema
                  </CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className='space-y-4 px-1'>
                    <div className='space-y-2'>
                      <Label htmlFor='register-username'>Usuario</Label>
                      <Input
                        id='register-username'
                        placeholder='Nombre de usuario'
                        {...registerForm.register('username')}
                      />
                      {registerForm.formState.errors.username && (
                        <p className='text-sm text-red-500'>
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='register-name'>Nombre Completo</Label>
                      <Input
                        id='register-name'
                        placeholder='Nombre completo'
                        {...registerForm.register('name')}
                      />
                      {registerForm.formState.errors.name && (
                        <p className='text-sm text-red-500'>
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='register-email'>Email</Label>
                      <Input
                        id='register-email'
                        type='email'
                        placeholder='email@ejemplo.com'
                        {...registerForm.register('email')}
                      />
                      {registerForm.formState.errors.email && (
                        <p className='text-sm text-red-500'>
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='register-phone'>
                        Teléfono (opcional)
                      </Label>
                      <Input
                        id='register-phone'
                        placeholder='Teléfono'
                        {...registerForm.register('phone')}
                      />
                      {registerForm.formState.errors.phone && (
                        <p className='text-sm text-red-500'>
                          {registerForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='register-password'>Contraseña</Label>
                      <Input
                        id='register-password'
                        type='password'
                        placeholder='Contraseña'
                        {...registerForm.register('password')}
                      />
                      {registerForm.formState.errors.password && (
                        <p className='text-sm text-red-500'>
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className='px-1'>
                    <Button
                      className='w-full'
                      type='submit'
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? 'Registrando...'
                        : 'Registrarse'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
