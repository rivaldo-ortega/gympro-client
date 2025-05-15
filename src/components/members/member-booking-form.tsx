import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {CalendarIcon} from 'lucide-react'
import {useToast} from '@/hooks/use-toast'
import {queryClient, apiRequest} from '@/lib/queryClient'
import {Button} from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Calendar} from '@/components/ui/calendar'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {cn} from '@/lib/utils'
import {memberAvatarUrls} from '@/lib/utils'
import {useQuery} from '@tanstack/react-query'
import {formatDate} from '@/lib/utils'
import useTranslation from '@/hooks/use-translation'

const newBookingFormSchema = z.object({
  classId: z.number(),
  memberId: z.number(),
  bookingDate: z.date(),
  status: z.string(),
  attendanceStatus: z.string(),
})

// Extended schema with additional validations for editing existing members
const editBookingFormSchema = z.object({
  classId: z.number(),
  memberId: z.number(),
  bookingDate: z.date(),
  status: z.string(),
  attendanceStatus: z.string(),
})

type NewBookingFormValues = z.infer<typeof newBookingFormSchema>
type EditBookingFormValues = z.infer<typeof editBookingFormSchema>
type FormValues = NewBookingFormValues & EditBookingFormValues

interface BookingFormProps {
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function BookingForm({
  initialData,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const {toast} = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {t} = useTranslation()
  const isEditing = !!initialData

  const {data: classes = []} = useQuery({
    queryKey: ['/api/classes'],
  })

  const {data: members = []} = useQuery<any[]>({
    queryKey: ['/api/members'],
  })

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    classId: initialData?.classId || undefined,
    memberId: initialData?.memberId || undefined,
    bookingDate: initialData?.bookingDate || undefined,
    status: initialData?.status || 'active',
    attendanceStatus: initialData?.attendanceStatus || 'attended',
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(
      isEditing ? editBookingFormSchema : newBookingFormSchema,
    ),
    defaultValues,
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        await apiRequest(
          'PATCH',
          `/api/class-bookings/${initialData.id}`,
          values,
        )
        toast({
          title: 'Booking updated',
          description: 'Booking has been updated successfully.',
        })
      } else {
        await apiRequest('POST', '/api/class-bookings', values)
        toast({
          title: 'Booking created',
          description: 'New Booking has been added successfully.',
        })
      }

      // Invalidate queries to update the UI
      queryClient.invalidateQueries({queryKey: ['/api/members']})
      queryClient.invalidateQueries({queryKey: ['/api/dashboard/stats']})

      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: `Failed to ${
          isEditing ? 'update' : 'create'
        } Booking. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='bookingDate'
            render={({field}) => (
              <FormItem className='flex flex-col'>
                <FormLabel>{t('bookingDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={date =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='classId'
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('class')}</FormLabel>
                <Select
                  onValueChange={value => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a Class' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((clas: any) => (
                      <SelectItem key={clas.id} value={clas.id.toString()}>
                        {clas.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='memberId'
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('member')}</FormLabel>
                <Select
                  onValueChange={value => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a member' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {members.map((member: any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end space-x-4'>
          <Button variant='outline' type='button' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Class'
              : 'Add Class'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
