import {useState, memo} from 'react'
import {useQuery} from '@tanstack/react-query'
import {format} from 'date-fns'
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileDigit,
  Receipt,
  BadgeCheck,
  UserX,
  FileX,
  Plus,
  CreditCard,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react'
import {Member, MembershipPlan, Payment} from '@shared/schema'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Textarea} from '@/components/ui/textarea'
import {Input} from '@/components/ui/input'
import {Badge} from '@/components/ui/badge'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {useToast} from '@/hooks/use-toast'
import {apiRequest, queryClient} from '@/lib/queryClient'
import {getInitials} from '@/lib/utils'
import {t} from '@/lib/i18n'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'

// Schema para rechazar pagos
const rejectSchema = z.object({
  notes: z.string().min(1, {message: t('pleaseProvideRejectionReason')}),
})

// Schema para crear pagos
const createPaymentSchema = z.object({
  memberId: z
    .string()
    .min(1, {message: t('selectMemberRequired')})
    .transform(value => parseInt(value)),
  planId: z
    .string()
    .min(1, {message: t('selectPlanRequired')})
    .transform(value => parseInt(value)),
  amount: z.number().optional(), // El monto se toma automáticamente del plan
  paymentMethod: z.string().min(1, {message: t('paymentMethodRequired')}),
  status: z.string().default('verified'),
  paymentDate: z.string().min(1, {message: t('dateRequired')}),
  notes: z.string().optional(),
})

type RejectFormValues = z.infer<typeof rejectSchema>
type CreatePaymentFormValues = z.infer<typeof createPaymentSchema>

export default function PaymentsPage() {
  const {toast} = useToast()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [viewMode, setViewMode] = useState<
    'details' | 'verify' | 'reject' | 'create' | null
  >(null)

  // Formulario para rechazar pagos

  // Obtener todos los pagos
  const {data: payments = []} = useQuery({
    queryKey: ['/api/payments'],
    staleTime: 10000, // 10 segundos
  })

  // Obtener pagos pendientes
  const {data: pendingPayments = []} = useQuery({
    queryKey: ['/api/payments/pending'],
    staleTime: 10000, // 10 segundos
  })

  // Obtener miembros para mostrar nombres
  const {data: members = []} = useQuery({
    queryKey: ['/api/members'],
    staleTime: 60000, // 1 minuto
  })

  // Obtener planes de membresía para mostrar nombres
  const {data: plans = []} = useQuery({
    queryKey: ['/api/membership-plans'],
    staleTime: 60000, // 1 minuto
  })

  // Formulario para rechazar pagos
  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      notes: '',
    },
  })

  // Encontrar miembro y plan correspondiente a un pago
  const getMemberName = (memberId: number) => {
    const member = members.find((m: Member) => m.id === memberId)
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown'
  }

  const getPlanName = (planId: number) => {
    const plan = plans.find((p: MembershipPlan) => p.id === planId)
    return plan ? plan.name : 'Unknown'
  }

  // Función para verificar un pago
  const handleVerifyPayment = async () => {
    if (!selectedPayment) return

    try {
      await apiRequest('POST', `/api/payments/${selectedPayment.id}/verify`)

      // Actualizar caché de consultas
      queryClient.invalidateQueries({queryKey: ['/api/payments']})
      queryClient.invalidateQueries({queryKey: ['/api/payments/pending']})

      toast({
        title: t('paymentVerifiedTitle'),
        description: t('paymentVerifiedMessage'),
      })

      setViewMode(null)
    } catch (error) {
      toast({
        title: t('paymentVerifyErrorTitle'),
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  // Función para rechazar un pago
  const handleRejectPayment = async (values: RejectFormValues) => {
    if (!selectedPayment) return

    try {
      await apiRequest('POST', `/api/payments/${selectedPayment.id}/reject`, {
        notes: values.notes,
      })

      // Actualizar caché de consultas
      queryClient.invalidateQueries({queryKey: ['/api/payments']})
      queryClient.invalidateQueries({queryKey: ['/api/payments/pending']})

      toast({
        title: t('paymentRejectedTitle'),
        description: t('paymentRejectedMessage'),
      })

      setViewMode(null)
      rejectForm.reset()
    } catch (error) {
      toast({
        title: t('paymentRejectErrorTitle'),
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  // Función para renderizar el badge de estado
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200'
          >
            <CheckCircle className='h-3.5 w-3.5 mr-1' />
            {t('statusVerified')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            <Clock className='h-3.5 w-3.5 mr-1' />
            {t('statusPending')}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge
            variant='outline'
            className='bg-red-50 text-red-700 border-red-200'
          >
            <XCircle className='h-3.5 w-3.5 mr-1' />
            {t('statusRejected')}
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Componente modal para ver detalles del pago
  const PaymentDetailsModal = () => {
    if (!selectedPayment) return null

    const member = members.find(
      (m: Member) => m.id === selectedPayment.memberId,
    )
    const plan = plans.find(
      (p: MembershipPlan) => p.id === selectedPayment.planId,
    )

    return (
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('paymentDetails')}</DialogTitle>
          <DialogDescription>
            {t('paymentDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={member?.avatarUrl || ''} />
              <AvatarFallback>
                {getInitials(getMemberName(selectedPayment.memberId))}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium'>
                {getMemberName(selectedPayment.memberId)}
              </p>
              <p className='text-sm text-muted-foreground'>{member?.email}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('membershipPlan')}
              </p>
              <p className='text-sm'>{getPlanName(selectedPayment.planId)}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('amount')}
              </p>
              <p className='text-sm'>${selectedPayment.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('paymentMethod')}
              </p>
              <p className='text-sm capitalize'>
                {selectedPayment.paymentMethod}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('paymentDate')}
              </p>
              <p className='text-sm'>
                {selectedPayment.paymentDate
                  ? format(
                      new Date(selectedPayment.paymentDate),
                      'dd/MM/yyyy HH:mm',
                    )
                  : '-'}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('status')}
              </p>
              <div className='mt-1'>
                {renderStatusBadge(selectedPayment.status)}
              </div>
            </div>
          </div>

          {selectedPayment.notes && (
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('notes')}
              </p>
              <p className='text-sm mt-1'>{selectedPayment.notes}</p>
            </div>
          )}

          {selectedPayment.receiptUrl && (
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('paymentReceipt')}
              </p>
              <div className='mt-2'>
                <a
                  href={selectedPayment.receiptUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block rounded-md overflow-hidden border border-border'
                >
                  <img
                    src={selectedPayment.receiptUrl}
                    alt='Payment receipt'
                    className='w-full h-48 object-cover'
                  />
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='sm:justify-start'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setViewMode(null)}
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  // Componente modal para verificar pago
  const VerifyPaymentModal = () => {
    if (!selectedPayment) return null

    return (
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('verifyPayment')}</DialogTitle>
          <DialogDescription>
            {t('paymentDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                src={
                  members.find((m: Member) => m.id === selectedPayment.memberId)
                    ?.avatarUrl || ''
                }
              />
              <AvatarFallback>
                {getInitials(getMemberName(selectedPayment.memberId))}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='text-sm font-medium'>
                {getMemberName(selectedPayment.memberId)}
              </p>
              <p className='text-sm text-muted-foreground'>
                {
                  members.find((m: Member) => m.id === selectedPayment.memberId)
                    ?.email
                }
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('membershipPlan')}
              </p>
              <p className='text-sm'>{getPlanName(selectedPayment.planId)}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('amount')}
              </p>
              <p className='text-sm'>${selectedPayment.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('paymentMethod')}
              </p>
              <p className='text-sm capitalize'>
                {selectedPayment.paymentMethod}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('paymentDate')}
              </p>
              <p className='text-sm'>
                {selectedPayment.paymentDate
                  ? format(
                      new Date(selectedPayment.paymentDate),
                      'dd/MM/yyyy HH:mm',
                    )
                  : '-'}
              </p>
            </div>
          </div>

          {selectedPayment.notes && (
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('notes')}
              </p>
              <p className='text-sm mt-1'>{selectedPayment.notes}</p>
            </div>
          )}

          {selectedPayment.receiptUrl && (
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {t('paymentReceipt')}
              </p>
              <div className='mt-2'>
                <a
                  href={selectedPayment.receiptUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block rounded-md overflow-hidden border border-border'
                >
                  <img
                    src={selectedPayment.receiptUrl}
                    alt='Payment receipt'
                    className='w-full h-48 object-cover'
                  />
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setViewMode(null)}
          >
            {t('cancel')}
          </Button>
          <Button type='button' onClick={handleVerifyPayment} className='gap-1'>
            <BadgeCheck className='h-4 w-4' />
            {t('verify')}
          </Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  // Componente modal para rechazar pago
  const RejectPaymentModal = () => {
    if (!selectedPayment) return null

    return (
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('rejectPayment')}</DialogTitle>
          <DialogDescription>{t('rejectPaymentDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...rejectForm}>
          <form
            onSubmit={rejectForm.handleSubmit(handleRejectPayment)}
            className='space-y-4 py-4'
          >
            <div className='flex items-center gap-4'>
              <Avatar className='h-10 w-10'>
                <AvatarImage
                  src={
                    members.find(
                      (m: Member) => m.id === selectedPayment.memberId,
                    )?.avatarUrl || ''
                  }
                />
                <AvatarFallback>
                  {getInitials(getMemberName(selectedPayment.memberId))}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium'>
                  {getMemberName(selectedPayment.memberId)}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {
                    members.find(
                      (m: Member) => m.id === selectedPayment.memberId,
                    )?.email
                  }
                </p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {t('membershipPlan')}
                </p>
                <p className='text-sm'>{getPlanName(selectedPayment.planId)}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {t('amount')}
                </p>
                <p className='text-sm'>${selectedPayment.amount.toFixed(2)}</p>
              </div>
            </div>

            <FormField
              control={rejectForm.control}
              name='notes'
              render={({field}) => (
                <FormItem>
                  <FormLabel>{t('rejectionReason')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('rejectionReasonPlaceholder')}
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='gap-2 sm:gap-0 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setViewMode(null)}
              >
                {t('cancel')}
              </Button>
              <Button type='submit' variant='destructive' className='gap-1'>
                <FileX className='h-4 w-4' />
                {t('confirmReject')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    )
  }

  // Componente modal como componente independiente para evitar re-renderizaciones
  function CreatePaymentDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const {toast} = useToast()

    // Obtener miembros para mostrar nombres
    const {data: members = []} = useQuery({
      queryKey: ['/api/members'],
      staleTime: 60000, // 1 minuto
    })

    // Obtener planes de membresía para mostrar nombres
    const {data: plans = []} = useQuery({
      queryKey: ['/api/membership-plans'],
      staleTime: 60000, // 1 minuto
    })

    // Formulario con su propio estado dentro del componente
    const form = useForm<CreatePaymentFormValues>({
      resolver: zodResolver(createPaymentSchema),
      defaultValues: {
        memberId: '',
        planId: '',
        amount: '',
        paymentMethod: 'cash',
        status: 'verified',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
      },
    })

    // Función para crear un nuevo pago (local al componente)
    const handleCreatePayment = async (values: CreatePaymentFormValues) => {
      try {
        // Obtener el monto del plan seleccionado si no se proporcionó un monto
        let amount = values.amount
        if (!amount) {
          const selectedPlan = plans.find(
            (p: MembershipPlan) => p.id === values.planId,
          )
          if (selectedPlan) {
            amount = selectedPlan.price
          } else {
            throw new Error(t('invalidPlan'))
          }
        }

        await apiRequest('POST', '/api/payments', {
          memberId: values.memberId, // Ya transformado por zod
          planId: values.planId, // Ya transformado por zod
          amount: amount, // Usar el monto del plan seleccionado
          paymentMethod: values.paymentMethod,
          status: values.status,
          paymentDate: values.paymentDate,
          notes: values.notes,
        })

        // Actualizar caché de consultas
        queryClient.invalidateQueries({queryKey: ['/api/payments']})
        queryClient.invalidateQueries({queryKey: ['/api/payments/pending']})
        queryClient.invalidateQueries({queryKey: ['/api/members']})

        toast({
          title: t('paymentCreatedTitle'),
          description: t('paymentCreatedMessage'),
        })

        // Cerrar el modal y reiniciar el formulario
        setIsOpen(false)
        form.reset({
          memberId: '',
          planId: '',
          amount: 0,
          paymentMethod: 'cash',
          status: 'verified',
          paymentDate: new Date().toISOString().split('T')[0],
          notes: '',
        })
      } catch (error) {
        toast({
          title: 'Error al crear el pago',
          description: String(error),
          variant: 'destructive',
        })
      }
    }

    return (
      <>
        {/* Botón para abrir el diálogo */}
        <Button onClick={() => setIsOpen(true)} className='gap-1'>
          <Plus className='h-4 w-4' />
          {t('addPayment')}
        </Button>

        {/* Diálogo encapsulado */}
        <Dialog
          open={isOpen}
          onOpenChange={open => {
            setIsOpen(open)
            if (!open) {
              // Reiniciar el formulario al cerrar
              form.reset({
                memberId: '',
                planId: '',
                amount: 0,
                paymentMethod: 'cash',
                status: 'verified',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: '',
              })
            }
          }}
        >
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>{t('createNewPayment')}</DialogTitle>
              <DialogDescription>
                {t('createNewPaymentDescription')}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreatePayment)}
                className='space-y-4 py-4'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='memberId'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t('member')}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('selectMemberPlaceholder')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {members.map((member: Member) => (
                                <SelectItem
                                  key={member.id}
                                  value={String(member.id)}
                                >
                                  {member.firstName} {member.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='planId'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t('membershipPlan')}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={value => {
                              field.onChange(value)

                              // Cuando se selecciona un plan, automáticamente ajustar el monto
                              const selectedPlan = plans.find(
                                (p: MembershipPlan) => p.id === parseInt(value),
                              )
                              if (selectedPlan) {
                                // Establecer el monto automáticamente
                                form.setValue('amount', selectedPlan.price)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('selectPlanPlaceholder')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {plans.map((plan: MembershipPlan) => (
                                <SelectItem
                                  key={plan.id}
                                  value={String(plan.id)}
                                >
                                  {plan.name} - S/
                                  {plan.price.toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='amount'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t('amount')} (S/.)</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                              S/
                            </span>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              className='pl-8'
                              disabled
                              placeholder={
                                t('amountPlaceholder') || 'Seleccione un plan'
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paymentMethod'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t('paymentMethod')}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('selectMethodPlaceholder')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='cash'>
                                {t('paymentMethodCash')}
                              </SelectItem>
                              <SelectItem value='card'>
                                {t('paymentMethodCard')}
                              </SelectItem>
                              <SelectItem value='yape'>
                                {t('paymentMethodYape')}
                              </SelectItem>
                              <SelectItem value='plin'>
                                {t('paymentMethodPlin')}
                              </SelectItem>
                              <SelectItem value='transfer'>
                                {t('paymentMethodTransfer')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='status'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t('status')}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('selectStatusPlaceholder')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='verified'>
                                {t('paymentStatusVerified')}
                              </SelectItem>
                              <SelectItem value='pending'>
                                {t('paymentStatusPending')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paymentDate'
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t('paymentDate')}</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='notes'
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t('notesOptional')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('notesPlaceholder')}
                          className='resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className='gap-2 sm:gap-0 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button type='submit' className='gap-1'>
                    <DollarSign className='h-4 w-4' />
                    {t('createPayment')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className='container py-6'>
      <div className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {t('paymentsTitle')}
            </h1>
            <p className='text-muted-foreground'>{t('paymentsDescription')}</p>
          </div>
          <CreatePaymentDialog />
        </div>

        <Tabs defaultValue='all' className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='all' className='flex items-center gap-1.5'>
              <Receipt className='h-4 w-4' />
              {t('allPayments')}
            </TabsTrigger>
            <TabsTrigger value='pending' className='flex items-center gap-1.5'>
              <Clock className='h-4 w-4' />
              {t('pendingPayments')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='all' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>{t('allPaymentsTitle')}</CardTitle>
                <CardDescription>{t('allPaymentsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>{t('paymentsTableCaption')}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('member')}</TableHead>
                      <TableHead>{t('membershipPlan')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead>{t('paymentMethod')}</TableHead>
                      <TableHead>{t('paymentDate')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length ? (
                      payments.map((payment: Payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className='font-medium'>
                            {getMemberName(payment.memberId)}
                          </TableCell>
                          <TableCell>{getPlanName(payment.planId)}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell className='capitalize'>
                            {payment.paymentMethod}
                          </TableCell>
                          <TableCell>
                            {payment.paymentDate
                              ? format(
                                  new Date(payment.paymentDate),
                                  'dd/MM/yyyy',
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={
                                viewMode === 'details' &&
                                selectedPayment?.id === payment.id
                              }
                              onOpenChange={open => {
                                if (!open) setViewMode(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => {
                                    setSelectedPayment(payment)
                                    setViewMode('details')
                                  }}
                                >
                                  <Eye className='h-4 w-4' />
                                  <span className='sr-only'>
                                    {t('viewDetails')}
                                  </span>
                                </Button>
                              </DialogTrigger>
                              <PaymentDetailsModal />
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='text-center py-6 text-muted-foreground'
                        >
                          <FileDigit className='mx-auto h-10 w-10 opacity-20 mb-2' />
                          <p>{t('noPaymentsFound')}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='pending' className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle>{t('pendingPaymentsTitle')}</CardTitle>
                <CardDescription>
                  {t('pendingPaymentsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>
                    {t('pendingPaymentsTableCaption')}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('member')}</TableHead>
                      <TableHead>{t('membershipPlan')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead>{t('paymentMethod')}</TableHead>
                      <TableHead>{t('paymentDate')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.length ? (
                      pendingPayments.map((payment: Payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className='font-medium'>
                            {getMemberName(payment.memberId)}
                          </TableCell>
                          <TableCell>{getPlanName(payment.planId)}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell className='capitalize'>
                            {payment.paymentMethod}
                          </TableCell>
                          <TableCell>
                            {payment.paymentDate
                              ? format(
                                  new Date(payment.paymentDate),
                                  'dd/MM/yyyy',
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <div className='flex gap-1'>
                              <Dialog
                                open={
                                  viewMode === 'details' &&
                                  selectedPayment?.id === payment.id
                                }
                                onOpenChange={open => {
                                  if (!open) setViewMode(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => {
                                      setSelectedPayment(payment)
                                      setViewMode('details')
                                    }}
                                  >
                                    <Eye className='h-4 w-4' />
                                    <span className='sr-only'>
                                      {t('viewDetails')}
                                    </span>
                                  </Button>
                                </DialogTrigger>
                                <PaymentDetailsModal />
                              </Dialog>

                              <Dialog
                                open={
                                  viewMode === 'verify' &&
                                  selectedPayment?.id === payment.id
                                }
                                onOpenChange={open => {
                                  if (!open) setViewMode(null)
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='text-green-600 hover:text-green-700'
                                    onClick={() => {
                                      setSelectedPayment(payment)
                                      setViewMode('verify')
                                    }}
                                  >
                                    <BadgeCheck className='h-4 w-4' />
                                    <span className='sr-only'>
                                      {t('verify')}
                                    </span>
                                  </Button>
                                </DialogTrigger>
                                <VerifyPaymentModal />
                              </Dialog>

                              <Dialog
                                open={
                                  viewMode === 'reject' &&
                                  selectedPayment?.id === payment.id
                                }
                                onOpenChange={open => {
                                  if (!open) {
                                    setViewMode(null)
                                    rejectForm.reset()
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='text-red-600 hover:text-red-700'
                                    onClick={() => {
                                      setSelectedPayment(payment)
                                      setViewMode('reject')
                                    }}
                                  >
                                    <UserX className='h-4 w-4' />
                                    <span className='sr-only'>
                                      {t('reject')}
                                    </span>
                                  </Button>
                                </DialogTrigger>
                                <RejectPaymentModal />
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-center py-6 text-muted-foreground'
                        >
                          <CheckCircle className='mx-auto h-10 w-10 opacity-20 mb-2' />
                          <p>{t('noPendingPaymentsFound')}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
