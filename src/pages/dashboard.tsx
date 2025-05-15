import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {useLocation} from 'wouter'
import {useI18nStore, t} from '@/lib/i18n'
import {
  Users,
  CalendarCheck,
  DollarSign,
  UserPlus,
  Search,
  CalendarDays,
} from 'lucide-react'
import {PageHeader} from '@/components/ui/page-header'
import {StatCard} from '@/components/dashboard/stat-card'
import {ActivityItem} from '@/components/dashboard/activity-item'
import {AnnouncementCard} from '@/components/dashboard/announcement-card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {DataTable} from '@/components/ui/data-table'
import {Badge} from '@/components/ui/badge'
import {
  formatCurrency,
  formatTime,
  getStatusColor,
  getInitials,
} from '@/lib/utils'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {MemberForm} from '@/components/members/member-form'

export default function Dashboard() {
  const [, navigate] = useLocation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Fetch dashboard stats
  const {data: stats, isLoading: isLoadingStats} = useQuery({
    queryKey: ['/api/dashboard/stats'],
  })

  // Fetch recent activities
  const {data: activities = [], isLoading: isLoadingActivities} = useQuery({
    queryKey: ['/api/activities/recent'],
    queryFn: async () => {
      const res = await fetch('/api/activities/recent?limit=4')
      if (!res.ok) throw new Error('Failed to fetch activities')
      return res.json()
    },
  })

 
  // Fetch today's classes
  const {data: todayClasses = [], isLoading: isLoadingClasses} = useQuery({
    queryKey: ['/api/classes/today'],
  })

  // Fetch members for the table
  const {data: members = [], isLoading: isLoadingMembers} = useQuery({
    queryKey: ['/api/members'],
  })

  // Filter members based on search term
  const filteredMembers = members.filter((member: any) => {
    if (!searchTerm) return true

    const searchTermLower = searchTerm.toLowerCase()
    return (
      member.firstName.toLowerCase().includes(searchTermLower) ||
      member.lastName.toLowerCase().includes(searchTermLower) ||
      member.email.toLowerCase().includes(searchTermLower) ||
      (member.phone && member.phone.toLowerCase().includes(searchTermLower))
    )
  })

  // Columns for the members table
  const membersColumns = [
    {
      header: t('name'),
      accessorKey: (member: any) => (
        <div className='flex items-center'>
          <Avatar className='h-10 w-10 mr-3'>
            {/* Comentado para usar siempre iniciales */}
            {/* <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} /> */}
            <AvatarFallback>
              {getInitials(`${member.firstName} ${member.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>
              {member.firstName} {member.lastName}
            </div>
            <div className='text-sm text-gray-500'>{member.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('membership'),
      accessorKey: (member: any) => (
        <div>
          <div className='text-sm text-gray-900'>
            {member.plan?.name || 'Unknown'}
          </div>
          <div className='text-sm text-gray-500'>
            {member.plan?.durationType || ''}
          </div>
        </div>
      ),
    },
    {
      header: t('status'),
      accessorKey: (member: any) => (
        <Badge className={getStatusColor(member.status)}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </Badge>
      ),
    },
    {
      header: t('joinDate'),
      accessorKey: (member: any) => (
        <span className='text-sm text-gray-500'>
          {new Date(member.joinDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: t('actions'),
      accessorKey: (member: any) => (
        <div className='space-x-3'>
          <Button
            variant='link'
            className='text-primary-600 hover:text-primary-900 p-0 h-auto'
            onClick={() => {
              setSelectedMember(member)
              setIsFormOpen(true)
            }}
          >
            {t('edit')}
          </Button>
          <Button
            variant='link'
            className='text-gray-600 hover:text-gray-900 p-0 h-auto'
            onClick={() => navigate(`/members/${member.id}`)}
          >
            {t('view')}
          </Button>
        </div>
      ),
    },
  ]

  // Columns for today's classes table
  const classesColumns = [
    {
      header: t('time'),
      accessorKey: (gymClass: any) => (
        <span className='text-sm text-gray-500'>
          {formatTime(gymClass.startTime)} - {formatTime(gymClass.endTime)}
        </span>
      ),
    },
    {
      header: t('classes'),
      accessorKey: (gymClass: any) => (
        <div className='text-sm font-medium text-gray-900'>{gymClass.name}</div>
      ),
    },
    {
      header: t('trainer'),
      accessorKey: (gymClass: any) => (
        <div className='flex items-center'>
          <Avatar className='h-8 w-8 mr-2'>
            {/* Comentado para usar siempre iniciales */}
            {/* <AvatarImage src={gymClass.trainer?.avatarUrl} alt={`${gymClass.trainer?.firstName} ${gymClass.trainer?.lastName}`} /> */}
            <AvatarFallback>
              {gymClass.trainer?.firstName && gymClass.trainer?.lastName
                ? getInitials(
                    `${gymClass.trainer.firstName} ${gymClass.trainer.lastName}`,
                  )
                : 'T'}
            </AvatarFallback>
          </Avatar>
          <div className='text-sm text-gray-900'>
            {gymClass.trainer?.firstName} {gymClass.trainer?.lastName}
          </div>
        </div>
      ),
    },
    {
      header: t('room'),
      accessorKey: (gymClass: any) => (
        <span className='text-sm text-gray-500'>{gymClass.room}</span>
      ),
    },
    {
      header: t('capacity'),
      accessorKey: (gymClass: any) => {
        const bookingsCount = gymClass.bookingsCount || 0
        const capacity = gymClass.capacity || 0
        const percentage =
          capacity > 0 ? Math.round((bookingsCount / capacity) * 100) : 0

        return (
          <div className='flex items-center'>
            <span className='text-sm text-gray-500 mr-2'>
              {bookingsCount}/{capacity}
            </span>
            <div className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='bg-primary-600 h-full rounded-full'
                style={{width: `${percentage}%`}}
              ></div>
            </div>
          </div>
        )
      },
    },
    {
      header: t('status'),
      accessorKey: (gymClass: any) => {
        const bookingsCount = gymClass.bookingsCount || 0
        const capacity = gymClass.capacity || 0
        const isFull = bookingsCount >= capacity

        return (
          <Badge
            className={
              isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }
          >
            {isFull ? t('classFull') : t('classOpen')}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className='py-6 md:py-8 px-4 sm:px-6 lg:px-8'>
      {/* Page header */}
      <PageHeader
        title={t('dashboard')}
        description={t('dashboardDescription')}
        actions={
            <Button
              onClick={() => {
                setSelectedMember(null)
                setIsFormOpen(true)
              }}
            >
              <UserPlus className='h-4 w-4 mr-2' />
              {t('addMember')}
            </Button>
        }
      />

      {/* Stats */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-6 animate-slide-in'>
        <StatCard
          label={t('activeMembers')}
          value={isLoadingStats ? '--' : stats?.activeMembers.toLocaleString()}
          change='12%'
          changeType='increase'
          icon={Users}
          iconBgColor='bg-primary-100'
          iconColor='text-primary-600'
        />

        <StatCard
          label={t('classesToday')}
          value={isLoadingStats ? '--' : stats?.classesToday.toString()}
          change='8%'
          changeType='increase'
          icon={CalendarCheck}
          iconBgColor='bg-orange-100'
          iconColor='text-orange-500'
        />

        <StatCard
          label={t('monthlyRevenue')}
          value={
            isLoadingStats ? '--' : formatCurrency(stats?.monthlyRevenue || 0)
          }
          change='5.2%'
          changeType='increase'
          icon={DollarSign}
          iconBgColor='bg-green-100'
          iconColor='text-green-500'
        />

        <StatCard
          label={t('newSignups')}
          value={isLoadingStats ? '--' : stats?.newSignups.toString()}
          change='3%'
          changeType='decrease'
          icon={UserPlus}
          iconBgColor='bg-yellow-100'
          iconColor='text-yellow-500'
        />
      </div>

      {/* Recent Activity & Announcements */}
      <div className='mt-8 grid grid-cols-1 gap-6 animate-slide-in'>
        {/* Recent Activity */}
        {/* <Card className='lg:col-span-2'>
          <CardHeader className='px-6 py-5 border-b border-gray-200 flex flex-row items-center justify-between'>
            <CardTitle className='text-lg font-medium'>
              {t('recentActivity')}
            </CardTitle>
            <Button
              variant='link'
              className='text-primary-600 hover:text-primary-700 font-medium text-sm p-0'
            >
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent className='p-6'>
            {isLoadingActivities ? (
              <div className='space-y-4'>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className='animate-pulse flex items-center space-x-4'
                  >
                    <div className='h-10 w-10 rounded-full bg-gray-200'></div>
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 w-3/4 bg-gray-200 rounded'></div>
                      <div className='h-3 w-1/2 bg-gray-200 rounded'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className='divide-y divide-gray-200'>
                {activities.map((activity: any) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.description}
                    timestamp={activity.timestamp}
                    avatarUrl={activity.member?.avatarUrl}
                    avatarFallback={
                      activity.member
                        ? getInitials(
                            `${activity.member.firstName} ${activity.member.lastName}`,
                          )
                        : undefined
                    }
                    isUserActivity={!activity.member}
                  />
                ))}
                {activities.length === 0 && (
                  <div className='text-center py-6 text-gray-500'>
                    {t('noActivitiesToDisplay')}
                  </div>
                )}
              </ul>
            )}
          </CardContent>
        </Card> */}

        {/* Announcements */}
        {/* <Card>
          <CardHeader className="px-6 py-5 border-b border-gray-200 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">{t('announcements')}</CardTitle>
            <Button variant="outline" size="sm" className="text-primary-600 border-primary-600">
              <span className="sr-only">Add</span>
              <span className="text-xl leading-none">+</span>
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingAnnouncements ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement: any) => {
                  let type: "warning" | "info" | "promo" = "info";
                  if (announcement.category === "operational" || announcement.category === "maintenance") {
                    type = "warning";
                  } else if (announcement.category === "promotion") {
                    type = "promo";
                  }
                  
                  return (
                    <AnnouncementCard
                      key={announcement.id}
                      title={announcement.title}
                      content={announcement.content}
                      timestamp={`${t('posted')} ${new Date(announcement.publishDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}`}
                      type={type}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                {t('noAnnouncementsToDisplay')}
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Members */}
      <Card className='mt-8 animate-slide-in'>
        <CardHeader className='px-6 py-5 border-b border-gray-200 flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-medium'>
            {t('recentMembers')}
          </CardTitle>
          <div className='flex space-x-3'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-4 w-4 text-gray-400' />
              </div>
              <Input
                type='search'
                className='block w-full pl-10 pr-3 py-2'
                placeholder={t('searchMembers')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant='outline' className='h-10'>
              {t('filter')}
            </Button>
          </div>
        </CardHeader>
        <div>
          <DataTable
            columns={membersColumns}
            data={filteredMembers.slice(0, 5)}
            pagination={false}
            isLoading={isLoadingMembers}
          />
        </div>
      </Card>

      {/* Classes Schedule */}
      <Card className='mt-8 animate-slide-in'>
        <CardHeader className='px-6 py-5 border-b border-gray-200 flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-medium'>
            {t('todaysClasses')}
          </CardTitle>
          <Button
            variant='link'
            className='text-primary-600 hover:text-primary-700 font-medium text-sm p-0'
          >
            {t('viewFullSchedule')}
          </Button>
        </CardHeader>
        <div>
          <DataTable
            columns={classesColumns}
            data={todayClasses}
            pagination={false}
            isLoading={isLoadingClasses}
          />
        </div>
      </Card>

      {/* Footer */}
      <footer className='mt-8 text-center text-sm text-gray-500'>
        <p>
          © {new Date().getFullYear()} GymPro Admin. {t('allRightsReserved')}.
        </p>
      </footer>

      {/* Member form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? t('editMember') : t('addNewMember')}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            initialData={selectedMember}
            onSuccess={() => {
              setIsFormOpen(false)
              setSelectedMember(null)
            }}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedMember(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
