import {useEffect, useState} from 'react'
import {useParams, Link} from 'wouter'
import {useQuery} from '@tanstack/react-query'
import {useTranslation} from '@/hooks/use-translation'
import {queryClient, apiRequest} from '@/lib/queryClient'
import {useToast} from '@/hooks/use-toast'
import {Badge} from '@/components/ui/badge'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Progress} from '@/components/ui/progress'
import {Separator} from '@/components/ui/separator'
import {
  CalendarDays,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  BarChart2,
  CreditCard,
  User,
  Phone,
  Mail,
  Home,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react'
import {formatCurrency, formatDate} from '@/lib/utils'

interface MemberProfileData {
  member: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string | null
    address: string | null
    joinDate: string
    planId: number
    status: string
    avatarUrl: string | null
    emergencyContact: string | null
    emergencyPhone: string | null
    notes: string | null
    expiryDate: string | null
  }
  plan: {
    id: number
    name: string
    description: string
    price: number
    duration: number
    durationType: string
    features: string[] | null
    isActive: boolean
  }
  payments: Array<{
    id: number
    memberId: number
    planId: number
    planName: string
    amount: number
    paymentMethod: string
    status: string
    paymentDate: string
    notes: string | null
    receiptUrl: string | null
    verifiedById: number | null
    verifiedAt: string | null
  }>
  classBookings: Array<{
    id: number
    memberId: number
    classId: number
    bookingDate: string
    status: string
    attendanceStatus: string | null
    classInfo: {
      id: number
      name: string
      trainerId: number
      room: string
      capacity: number
      startTime: string
      endTime: string
      daysOfWeek: string[]
      isActive: boolean
      description: string | null
    }
    trainerName: string
  }>
  activities: Array<{
    id: number
    description: string
    activityType: string
    memberId: number | null
    userId: number | null
    timestamp: string
  }>
  stats: {
    attendedClasses: number
    missedClasses: number
    totalBookings: number
    attendanceRate: number
    verifiedPayments: number
    pendingPayments: number
    totalPayments: number
  }
}

export default function MemberProfilePage() {
  const {id} = useParams<{id: string}>()
  const {t} = useTranslation()
  const {toast} = useToast()
  const [activeTab, setActiveTab] = useState('overview')

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery<MemberProfileData>({
    queryKey: [`/api/members/${id}/profile`],
    enabled: !!id,
  })

  useEffect(() => {
    if (error) {
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      })
    }
  }, [error, toast, t])

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full' />
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className='container py-10'>
        <div className='flex flex-col items-center justify-center min-h-[50vh]'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold'>{t('memberNotFound')}</h2>
            <p className='text-muted-foreground mt-2'>
              {t('memberNotFoundDesc')}
            </p>
            <Button asChild className='mt-4'>
              <Link href='/members'>{t('backToMembers')}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Asegurar que profileData es válido para evitar errores
  if (!profileData || !profileData.member) {
    return (
      <div className='container py-10'>
        <div className='flex flex-col items-center justify-center min-h-[50vh]'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold'>{t('memberNotFound')}</h2>
            <p className='text-muted-foreground mt-2'>
              {t('memberNotFoundDesc')}
            </p>
            <Button asChild className='mt-4'>
              <Link href='/members'>{t('backToMembers')}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Asegurarnos de que todos los datos existen
  const {
    member,
    plan = {
      id: 0,
      name: 'Plan no disponible',
      description: '',
      price: 0,
      duration: 0,
      durationType: '',
      features: null,
      isActive: false,
    },
    stats = {
      attendedClasses: 0,
      missedClasses: 0,
      totalBookings: 0,
      attendanceRate: 0,
      verifiedPayments: 0,
      pendingPayments: 0,
      totalPayments: 0,
    },
    payments = [],
    classBookings = [],
    activities = [],
  } = profileData

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'expired':
        return 'destructive'
      case 'frozen':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  /* const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  } */

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className='container py-6'>
      <div className='mb-6'>
        <Button variant='outline' size='sm' asChild>
          <Link href='/members'>← {t('backToMembers')}</Link>
        </Button>
      </div>

      {/* Header / Profile Summary */}
      <div className='flex flex-col md:flex-row gap-6 mb-6'>
        <div className='flex-1'>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-3xl font-bold'>
              {member.firstName} {member.lastName}
            </h1>
            <Badge
              variant={getStatusBadgeVariant(member.status) as any}
              className='uppercase text-xs'
            >
              {member.status}
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
            <div className='flex gap-2 items-center text-sm text-muted-foreground'>
              <Mail size={16} />
              <span>{member.email}</span>
            </div>
            <div className='flex gap-2 items-center text-sm text-muted-foreground'>
              <Phone size={16} />
              <span>{member.phone || t('noPhoneProvided')}</span>
            </div>
            <div className='flex gap-2 items-center text-sm text-muted-foreground'>
              <Home size={16} />
              <span>{member.address || t('noAddressProvided')}</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2 justify-center'>
          <div className='text-sm text-muted-foreground flex items-center gap-2'>
            <CalendarDays size={16} /> {t('joinedOn')}:{' '}
            <span className='font-medium text-foreground'>
              {formatDate(member.joinDate)}
            </span>
          </div>
          <div className='text-sm text-muted-foreground flex items-center gap-2'>
            <Calendar size={16} /> {t('expiresOn')}:{' '}
            <span className='font-medium text-foreground'>
              {formatDate(member.expiryDate || '')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid grid-cols-4 mb-6'>
          <TabsTrigger value='overview'>{t('overview')}</TabsTrigger>
          <TabsTrigger value='payments'>{t('payments')}</TabsTrigger>
          <TabsTrigger value='classes'>{t('classes')}</TabsTrigger>
          <TabsTrigger value='activity'>{t('activity')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Membership Plan */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CreditCard size={18} />
                  {t('membershipPlan')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-xl font-semibold'>{plan.name}</h3>
                  <Badge variant='outline'>{plan.durationType}</Badge>
                </div>
                <p className='text-muted-foreground text-sm'>
                  {plan.description}
                </p>
                <div className='flex justify-between mt-2'>
                  <span className='text-muted-foreground'>{t('price')}</span>
                  <span className='font-medium'>
                    {formatCurrency(plan.price)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('duration')}</span>
                  <span className='font-medium'>
                    {plan.duration} {t('days')}
                  </span>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <>
                    <Separator className='my-2' />
                    <div>
                      <h4 className='font-medium mb-2'>{t('features')}</h4>
                      <ul className='space-y-1'>
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className='text-sm flex items-center gap-2'
                          >
                            <CheckCircle size={14} className='text-green-500' />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart2 size={18} />
                  {t('stats')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <h4 className='font-medium'>{t('attendanceRate')}</h4>
                    <span className='font-medium'>{stats.attendanceRate}%</span>
                  </div>
                  <Progress value={stats.attendanceRate} className='h-2' />
                  <div className='flex justify-between text-xs text-muted-foreground mt-2'>
                    <span>
                      {t('attended')}: {stats.attendedClasses}
                    </span>
                    <span>
                      {t('missed')}: {stats.missedClasses}
                    </span>
                    <span>
                      {t('total')}: {stats.totalBookings}
                    </span>
                  </div>
                </div>

                <div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <p className='text-sm text-muted-foreground'>
                        {t('totalPayments')}
                      </p>
                      <p className='text-2xl font-bold'>
                        {stats.totalPayments}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm text-muted-foreground'>
                        {t('pendingPayments')}
                      </p>
                      <p className='text-2xl font-bold'>
                        {stats.pendingPayments}
                      </p>
                    </div>
                  </div>
                </div>

                {member.emergencyContact && (
                  <div className='p-3 bg-muted rounded-md'>
                    <h4 className='font-medium flex items-center gap-2 mb-2'>
                      <AlertTriangle size={16} className='text-yellow-500' />
                      {t('emergencyContact')}
                    </h4>
                    <p className='text-sm'>{member.emergencyContact}</p>
                    {member.emergencyPhone && (
                      <p className='text-sm'>{member.emergencyPhone}</p>
                    )}
                  </div>
                )}

                {member.notes && (
                  <div>
                    <h4 className='font-medium mb-1 flex items-center gap-2'>
                      <Info size={16} /> {t('notes')}
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {member.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity size={18} />
                {t('recentActivity')}
              </CardTitle>
              <CardDescription>{t('last5Activities')}</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className='text-muted-foreground text-center py-4'>
                  {t('noActivitiesYet')}
                </p>
              ) : (
                <div className='space-y-4'>
                  {activities.slice(0, 5).map(activity => (
                    <div
                      key={activity.id}
                      className='flex gap-4 items-start pb-3 border-b last:border-0'
                    >
                      <div className='p-2 rounded-full bg-muted'>
                        <Activity size={16} />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm'>{activity.description}</p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {activities.length > 5 && (
              <CardFooter>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={() => setActiveTab('activity')}
                >
                  {t('viewAllActivity')}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value='payments' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentHistory')}</CardTitle>
              <CardDescription>{t('allPayments')}</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className='text-muted-foreground text-center py-4'>
                  {t('noPaymentsYet')}
                </p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-3 px-2'>{t('date')}</th>
                        <th className='text-left py-3 px-2'>{t('plan')}</th>
                        <th className='text-left py-3 px-2'>{t('amount')}</th>
                        <th className='text-left py-3 px-2'>{t('method')}</th>
                        <th className='text-left py-3 px-2'>{t('status')}</th>
                        <th className='text-left py-3 px-2'>{t('verified')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr
                          key={payment.id}
                          className='border-b hover:bg-muted/50'
                        >
                          <td className='py-3 px-2'>
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className='py-3 px-2'>{payment.planName}</td>
                          <td className='py-3 px-2 font-medium'>
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className='py-3 px-2'>{payment.paymentMethod}</td>
                          <td className='py-3 px-2'>
                            <Badge
                              variant={
                                payment.status === 'verified'
                                  ? 'default'
                                  : payment.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className='text-xs'
                            >
                              {payment.status}
                            </Badge>
                          </td>
                          <td className='py-3 px-2 text-sm'>
                            {payment.verifiedAt
                              ? formatDate(payment.verifiedAt)
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value='classes' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>{t('classHistory')}</CardTitle>
              <CardDescription>{t('allClasses')}</CardDescription>
            </CardHeader>
            <CardContent>
              {classBookings.length === 0 ? (
                <p className='text-muted-foreground text-center py-4'>
                  {t('noClassBookingsYet')}
                </p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-3 px-2'>{t('date')}</th>
                        <th className='text-left py-3 px-2'>{t('class')}</th>
                        <th className='text-left py-3 px-2'>{t('trainer')}</th>
                        <th className='text-left py-3 px-2'>{t('time')}</th>
                        <th className='text-left py-3 px-2'>
                          {t('attendance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classBookings.map(booking => (
                        <tr
                          key={booking.id}
                          className='border-b hover:bg-muted/50'
                        >
                          <td className='py-3 px-2'>
                            {formatDate(booking.bookingDate)}
                          </td>
                          <td className='py-3 px-2 font-medium'>
                            {booking.classInfo.name}
                          </td>
                          <td className='py-3 px-2'>{booking.trainerName}</td>
                          <td className='py-3 px-2'>
                            {booking.classInfo.startTime} -{' '}
                            {booking.classInfo.endTime}
                          </td>
                          <td className='py-3 px-2'>
                            {booking.attendanceStatus ? (
                              <Badge
                                variant={
                                  booking.attendanceStatus === 'checked-in'
                                    ? 'default'
                                    : booking.attendanceStatus === 'no-show'
                                    ? 'destructive'
                                    : 'outline'
                                }
                                className='text-xs'
                              >
                                {booking.attendanceStatus}
                              </Badge>
                            ) : (
                              <span className='text-sm text-muted-foreground'>
                                {t('notRecorded')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value='activity' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>{t('activityLog')}</CardTitle>
              <CardDescription>{t('allActivities')}</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className='text-muted-foreground text-center py-4'>
                  {t('noActivitiesYet')}
                </p>
              ) : (
                <div className='space-y-4'>
                  {activities.map(activity => (
                    <div
                      key={activity.id}
                      className='flex gap-4 items-start pb-4 border-b last:border-0'
                    >
                      <div className='p-2 rounded-full bg-muted'>
                        <Activity size={16} />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm'>{activity.description}</p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
