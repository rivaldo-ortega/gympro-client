import {useState} from 'react'
import {Link, useLocation} from 'wouter'
import {Check, Dumbbell, ArrowRight, Upload, X} from 'lucide-react'
import {useQuery, useMutation} from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {useToast} from '@/hooks/use-toast'
import {t} from '@/lib/i18n'
import {MembershipPlan} from '@shared/schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {getQueryFn, apiRequest, queryClient} from '@/lib/queryClient'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

export default function PlansPage() {
  const {toast} = useToast()
  const [, setLocation] = useLocation()
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentStep, setPaymentStep] = useState<
    'info' | 'upload' | 'success' | 'pending'
  >('info')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Consultar pagos pendientes del usuario actual
  const {data: pendingPayments = []} = useQuery({
    queryKey: ['/api/user/pending-payments'],
    queryFn: getQueryFn({on401: 'returnNull'}),
    // Solo actualizar cada 60 segundos para evitar muchas solicitudes
    refetchInterval: 60000,
  })

  const {data: plans = [], isLoading} = useQuery<MembershipPlan[]>({
    queryKey: ['/api/membership-plans/public'],
    queryFn: getQueryFn({on401: 'returnNull'}),
  })

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setPaymentStep('info')
    setUploadedImage(null)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentStep('upload')
  }

  const compressImage = (
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = event => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          // Calcular las dimensiones manteniendo la proporción
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Convertir a formato JPEG con calidad reducida
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(dataUrl)
        }
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'))
        }
      }
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Validar el tamaño del archivo (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: t('error'),
            description: t('fileTooLarge'),
            variant: 'destructive',
          })
          return
        }

        // Validar el tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: t('error'),
            description: t('fileTypeNotSupported'),
            variant: 'destructive',
          })
          return
        }

        // Comprimir la imagen antes de cargarla
        try {
          const compressedImage = await compressImage(file)
          setUploadedImage(compressedImage)
          toast({
            title: t('success'),
            description: t('fileUploadSuccess'),
          })
        } catch (compressionError) {
          console.error('Error al comprimir la imagen:', compressionError)
          // Si falla la compresión, intentamos cargar la imagen original
          const reader = new FileReader()
          reader.onload = event => {
            if (event.target?.result) {
              setUploadedImage(event.target.result as string)
              toast({
                title: t('success'),
                description: t('fileUploadSuccess'),
              })
            }
          }
          reader.onerror = () => {
            toast({
              title: t('error'),
              description: t('fileUploadError'),
              variant: 'destructive',
            })
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('Error al cargar el archivo:', error)
        toast({
          title: t('error'),
          description: t('fileUploadError'),
          variant: 'destructive',
        })
      }
    }
  }

  // Mutation para verificar un pago con Yape
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest(
        'POST',
        '/api/yape-payment/verify',
        paymentData,
      )
      return response.json()
    },
    onSuccess: () => {
      // Cuando el pago se crea con éxito, actualizar la lista de pagos pendientes
      queryClient.invalidateQueries({queryKey: ['/api/user/pending-payments']})
      // Mostrar mensaje de éxito y cambiar al paso final
      toast({
        title: t('paymentCreated'),
        description: t('paymentCreatedDescription'),
      })
      setPaymentStep('success')
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || t('paymentCreationError'),
        variant: 'destructive',
      })
    },
  })

  const handleConfirmUpload = async () => {
    if (!selectedPlan || !uploadedImage) {
      toast({
        title: t('error'),
        description: t('missingUploadedReceipt'),
        variant: 'destructive',
      })
      return
    }

    // Obtener los nombres a partir del nombre completo
    const nameParts = formData.name.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    try {
      // Preparar datos del pago con Yape
      const paymentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        planId: selectedPlan.id,
        paymentProofImageUrl: uploadedImage, // La imagen codificada en base64
        // Información adicional para crear un nuevo miembro si es necesario
        memberData: {
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
        },
      }

      // Enviar la solicitud al servidor
      createPaymentMutation.mutate(paymentData)
    } catch (error) {
      console.error('Error al procesar el pago:', error)
      toast({
        title: t('error'),
        description: t('paymentProcessingError'),
        variant: 'destructive',
      })
    }
  }

  const handleBackToHomeFromSuccess = () => {
    handleCloseDialog()
    setLocation('/public')
  }

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Navigation */}
      <header className='border-b'>
        <div className='container mx-auto flex items-center justify-between py-4'>
          <div className='flex items-center'>
            <div className='h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center'>
              <Dumbbell className='h-5 w-5 text-white' />
            </div>
            <h1 className='ml-3 text-xl font-semibold'>{t('appName')}</h1>
          </div>
          <nav className='flex space-x-6'>
            <Link
              href='/'
              className='text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
            >
              {t('home')}
            </Link>
            <Link
              href='/plans'
              className='text-sm font-medium text-primary-600 dark:text-primary-400'
            >
              {t('membershipPlans')}
            </Link>
            <Link
              href='/public-announcements'
              className='text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
            >
              {t('announcements')}
            </Link>
            <Link
              href='/auth'
              className='text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
            >
              {t('login')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className='py-12 bg-gray-50 dark:bg-gray-900 flex-grow'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl mx-auto text-center mb-16'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
              {t('membershipPlansTitle')}
            </h1>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              {t('membershipPlansDescription')}
            </p>
          </div>

          <Tabs defaultValue='monthly' className='max-w-5xl mx-auto'>
            <TabsList className='grid w-72 grid-cols-2 mx-auto mb-12'>
              <TabsTrigger value='monthly'>{t('monthly')}</TabsTrigger>
              <TabsTrigger value='annual'>{t('annual')}</TabsTrigger>
            </TabsList>

            <TabsContent value='monthly'>
              {isLoading ? (
                <div className='flex justify-center py-20'>
                  <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600'></div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                  {plans
                    .filter(plan => plan.durationType === 'monthly')
                    .map(plan => (
                      <Card
                        key={plan.id}
                        className={`overflow-hidden ${
                          plan.name === 'Premium'
                            ? 'border-primary-500 dark:border-primary-400 shadow-lg'
                            : ''
                        }`}
                      >
                        {plan.name === 'Premium' && (
                          <div className='bg-primary-500 dark:bg-primary-600 text-white text-center py-1 text-sm font-medium'>
                            {t('mostPopular')}
                          </div>
                        )}
                        <CardHeader
                          className={
                            plan.name === 'Premium'
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : ''
                          }
                        >
                          <CardTitle className='text-2xl'>
                            {plan.name}
                          </CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className='pt-6'>
                          <div className='mb-6'>
                            <span className='text-4xl font-bold'>
                              S/ {plan.price.toFixed(2)}
                            </span>
                            <span className='text-gray-500 dark:text-gray-400 ml-1'>
                              / {t('month')}
                            </span>
                          </div>
                          <ul className='space-y-3 mb-6'>
                            {plan.features?.map((feature, index) => (
                              <li key={index} className='flex items-start'>
                                <Check className='h-5 w-5 text-green-500 shrink-0 mr-2' />
                                <span className='text-gray-600 dark:text-gray-300'>
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className='w-full'
                            onClick={() => handlePlanSelect(plan)}
                            variant={
                              plan.name === 'Premium' ? 'default' : 'outline'
                            }
                          >
                            {t('selectPlan')}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value='annual'>
              {isLoading ? (
                <div className='flex justify-center py-20'>
                  <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600'></div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                  {plans
                    .filter(plan => plan.durationType === 'annual')
                    .map(plan => (
                      <Card
                        key={plan.id}
                        className={`overflow-hidden ${
                          plan.name === 'Premium Anual'
                            ? 'border-primary-500 dark:border-primary-400 shadow-lg'
                            : ''
                        }`}
                      >
                        {plan.name === 'Premium Anual' && (
                          <div className='bg-primary-500 dark:bg-primary-600 text-white text-center py-1 text-sm font-medium'>
                            {t('bestValue')}
                          </div>
                        )}
                        <CardHeader
                          className={
                            plan.name === 'Premium Anual'
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : ''
                          }
                        >
                          <CardTitle className='text-2xl'>
                            {plan.name}
                          </CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className='pt-6'>
                          <div className='mb-6'>
                            <span className='text-4xl font-bold'>
                              S/ {plan.price.toFixed(2)}
                            </span>
                            <span className='text-gray-500 dark:text-gray-400 ml-1'>
                              / {t('year')}
                            </span>
                          </div>
                          <ul className='space-y-3 mb-6'>
                            {plan.features?.map((feature, index) => (
                              <li key={index} className='flex items-start'>
                                <Check className='h-5 w-5 text-green-500 shrink-0 mr-2' />
                                <span className='text-gray-600 dark:text-gray-300'>
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className='w-full'
                            onClick={() => handlePlanSelect(plan)}
                            variant={
                              plan.name === 'Premium Anual'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {t('selectPlan')}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-gray-50 dark:bg-gray-900 py-12 border-t'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center'>
                <div className='h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center'>
                  <Dumbbell className='h-5 w-5 text-white' />
                </div>
                <h1 className='ml-3 text-xl font-semibold text-gray-900 dark:text-white'>
                  {t('appName')}
                </h1>
              </div>
              <p className='mt-4 text-gray-600 dark:text-gray-400'>
                {t('footerDescription')}
              </p>
            </div>
            <div>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
                {t('resources')}
              </h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/plans'
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  >
                    {t('membershipPlans')}
                  </Link>
                </li>
                <li>
                  <Link
                    href='/public-announcements'
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  >
                    {t('announcements')}
                  </Link>
                </li>
                <li>
                  <Link
                    href='/auth'
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  >
                    {t('login')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
                {t('legal')}
              </h3>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  >
                    {t('privacy')}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                  >
                    {t('terms')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
                {t('contact')}
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Lima, Perú
                <br />
                info@gympro.com
                <br />
                +51 987 654 321
              </p>
            </div>
          </div>
          <div className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-700'>
            <p className='text-gray-500 dark:text-gray-400 text-center'>
              &copy; {new Date().getFullYear()} GymPro. {t('allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          {paymentStep === 'info' && (
            <>
              <DialogHeader>
                <DialogTitle>{t('subscribeToMembership')}</DialogTitle>
                <DialogDescription>
                  {selectedPlan && (
                    <div className='mt-2'>
                      <div className='font-semibold text-lg'>
                        {selectedPlan.name}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        {selectedPlan.description}
                      </div>
                      <div className='text-lg font-bold mt-1'>
                        S/ {selectedPlan.price.toFixed(2)} /{' '}
                        {selectedPlan.durationType === 'monthly'
                          ? t('month')
                          : t('year')}
                      </div>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit}>
                <div className='grid gap-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>{t('fullName')}</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={e =>
                        setFormData({...formData, name: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>{t('email')}</Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={e =>
                        setFormData({...formData, email: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>{t('phone')}</Label>
                    <Input
                      id='phone'
                      value={formData.phone}
                      onChange={e =>
                        setFormData({...formData, phone: e.target.value})
                      }
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCloseDialog}
                  >
                    {t('cancel')}
                  </Button>
                  <Button type='submit'>
                    {t('continueToPay')} <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {paymentStep === 'upload' && (
            <>
              <DialogHeader>
                <DialogTitle>{t('payWithYape')}</DialogTitle>
                <DialogDescription>
                  {t('yapePaymentDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-6 py-4'>
                <div className='mx-auto w-64 h-64 bg-white p-4 rounded-lg'>
                  <img
                    src='https://www.yape.com.pe/img/yape-brand-elements/qr.png'
                    alt='Yape QR'
                    className='w-full h-full object-contain'
                  />
                </div>
                <div className='text-center py-2'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {t('orYapeTo')}
                  </p>
                  <p className='font-bold text-lg'>991 123 456</p>
                </div>

                <div className='space-y-3'>
                  <p className='text-sm font-medium'>
                    {t('uploadPaymentProof')}
                  </p>
                  {uploadedImage ? (
                    <div className='relative bg-gray-100 dark:bg-gray-800 rounded-lg p-2'>
                      <img
                        src={uploadedImage}
                        alt='Payment proof'
                        className='max-h-40 mx-auto object-contain rounded'
                      />
                      <button
                        className='absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1'
                        onClick={() => setUploadedImage(null)}
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  ) : (
                    <div className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center'>
                      <Upload className='h-8 w-8 mx-auto text-gray-400' />
                      <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                        {t('dragAndDropOrClick')}
                      </p>
                      <div>
                        <label className='mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 cursor-pointer'>
                          {t('selectFile')}
                          <input
                            type='file'
                            className='hidden'
                            accept='image/*'
                            onChange={handleFileUpload}
                            onClick={e => {
                              // Reset input value on click to allow selecting the same file again
                              ;(e.target as HTMLInputElement).value = ''
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setPaymentStep('info')}
                >
                  {t('back')}
                </Button>
                <Button
                  type='button'
                  onClick={handleConfirmUpload}
                  disabled={!uploadedImage || createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending
                    ? t('processing')
                    : t('confirmPayment')}
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === 'success' && (
            <>
              <div className='text-center space-y-2'>
                <div className='mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4'>
                  <Check className='h-6 w-6 text-green-600' />
                </div>
                <DialogTitle>{t('paymentReceived')}</DialogTitle>
                <DialogDescription>
                  {t('paymentSuccessDescription')}
                </DialogDescription>
              </div>
              <div className='text-center py-6'>
                <p>{t('paymentSuccessMessage')}</p>

                {pendingPayments && pendingPayments.length > 0 && (
                  <div className='mt-6 border rounded-md p-4 text-left'>
                    <h3 className='text-lg font-medium mb-2'>
                      {t('yourPendingPayments')}
                    </h3>
                    <div className='space-y-3'>
                      {pendingPayments.slice(0, 3).map((payment: any) => (
                        <div
                          key={payment.id}
                          className='flex items-center justify-between gap-2 border-b pb-2'
                        >
                          <div>
                            <p className='font-medium'>{payment.planName}</p>
                            <p className='text-sm text-muted-foreground'>
                              {new Date(
                                payment.paymentDate,
                              ).toLocaleDateString()}{' '}
                              -{' '}
                              {payment.status === 'pending'
                                ? t('pendingVerification')
                                : payment.status}
                            </p>
                          </div>
                          <div className='flex-shrink-0'>
                            <Badge
                              variant={
                                payment.status === 'pending'
                                  ? 'outline'
                                  : payment.status === 'verified'
                                  ? 'success'
                                  : 'destructive'
                              }
                            >
                              {t(payment.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='mt-3 text-sm text-center'>
                      <p>{t('paymentVerificationNote')}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className='sm:justify-center'>
                <Button type='button' onClick={handleBackToHomeFromSuccess}>
                  {t('backToHome')}
                </Button>
                {pendingPayments && pendingPayments.length > 0 && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setPaymentStep('pending')}
                  >
                    {t('checkPaymentStatus')}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}

          {paymentStep === 'pending' && (
            <>
              <DialogHeader>
                <DialogTitle>{t('pendingPayments')}</DialogTitle>
                <DialogDescription>
                  {t('pendingPaymentsDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className='py-4'>
                {pendingPayments && pendingPayments.length > 0 ? (
                  <div className='space-y-4'>
                    {pendingPayments.map((payment: any) => (
                      <div key={payment.id} className='border rounded-md p-3'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h4 className='font-medium'>{payment.planName}</h4>
                            <p className='text-sm text-muted-foreground'>
                              {payment.memberName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              payment.status === 'pending'
                                ? 'outline'
                                : payment.status === 'verified'
                                ? 'success'
                                : 'destructive'
                            }
                          >
                            {t(payment.status)}
                          </Badge>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span>
                            {t('amount')}: S/ {payment.amount.toFixed(2)}
                          </span>
                          <span>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-6'>
                    <p>{t('noPaymentsFound')}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type='button' onClick={() => setPaymentStep('success')}>
                  {t('back')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
