import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useToast} from '@/hooks/use-toast'
import {queryClient, apiRequest} from '@/lib/queryClient'
import {Button} from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
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
import {Switch} from '@/components/ui/switch'
import {X, Plus} from 'lucide-react'
import useTranslation from '@/hooks/use-translation'

// Extended schema with additional validations
const planFormSchema = z.object({
  name: z.string().min(2, {message: 'Plan name must be at least 2 characters'}),
  description: z
    .string()
    .min(5, {message: 'Description must be at least 5 characters'}),
  price: z.coerce
    .number()
    .positive({message: 'Price must be a positive number'}),
  duration: z.coerce
    .number()
    .positive({message: 'Duration must be a positive number'}),
  durationType: z.string(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof planFormSchema>

interface PlanFormProps {
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function PlanForm({initialData, onSuccess, onCancel}: PlanFormProps) {
  const {toast} = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [features, setFeatures] = useState<string[]>(
    initialData?.features || [],
  )
  const [newFeature, setNewFeature] = useState('')
  const isEditing = !!initialData

  const {t} = useTranslation()

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    duration: initialData?.duration || 30,
    durationType: initialData?.durationType || 'monthly',
    features: initialData?.features || [],
    isActive: initialData?.isActive ?? true,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues,
  })

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()]
      setFeatures(updatedFeatures)
      form.setValue('features', updatedFeatures)
      setNewFeature('')
    }
  }

  const removeFeature = (feature: string) => {
    const updatedFeatures = features.filter(f => f !== feature)
    setFeatures(updatedFeatures)
    form.setValue('features', updatedFeatures)
  }

  async function onSubmit(values: FormValues) {
    // Convert price to cents for API
    const formData = {
      ...values,
      price: Math.round(values.price),
      features: features,
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await apiRequest(
          'PATCH',
          `/api/membership-plans/${initialData.id}`,
          formData,
        )
        toast({
          title: 'Plan updated',
          description: 'Membership plan has been updated successfully.',
        })
      } else {
        await apiRequest('POST', '/api/membership-plans', formData)
        toast({
          title: 'Plan created',
          description: 'New membership plan has been added successfully.',
        })
      }

      // Invalidate queries to update the UI
      queryClient.invalidateQueries({queryKey: ['/api/membership-plans']})

      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: `Failed to ${
          isEditing ? 'update' : 'create'
        } membership plan. Please try again.`,
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
            name='name'
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('planName')}</FormLabel>
                <FormControl>
                  <Input placeholder='Plan Name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('price')} (S/.)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    step='0.01'
                    placeholder='0.00'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter price in dollars (will be stored in cents)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='duration'
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('duration')}</FormLabel>
                <FormControl>
                  <Input type='number' min='1' placeholder='30' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='durationType'
            render={({field}) => (
              <FormItem>
                <FormLabel>{t('durationType')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='daily'>Daily</SelectItem>
                    <SelectItem value='weekly'>Weekly</SelectItem>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                    <SelectItem value='quarterly'>Quarterly</SelectItem>
                    <SelectItem value='annual'>Annual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({field}) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Description of the membership plan'
                    className='h-24 resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='md:col-span-2'>
            <FormLabel>{t('planFeatures')}</FormLabel>
            <div className='flex mt-1 mb-2'>
              <Input
                placeholder='Add a feature'
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                className='flex-1'
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <Button
                type='button'
                onClick={addFeature}
                className='ml-2'
                variant='secondary'
              >
                <Plus className='h-4 w-4 mr-1' />
                {t('add')}
              </Button>
            </div>

            <div className='space-y-2 mt-2'>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className='flex items-center bg-muted p-2 rounded-md'
                >
                  <span className='flex-1'>{feature}</span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeFeature(feature)}
                    className='h-8 w-8 p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
              {features.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No features added yet.
                </p>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name='isActive'
            render={({field}) => (
              <FormItem className='flex flex-row items-center justify-between space-x-2 rounded-md border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel>{t('activeStatus')}</FormLabel>
                  <FormDescription>
                    Whether this plan is available for new members
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className='flex justify-end space-x-4'>
          <Button variant='outline' type='button' onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Plan'
              : 'Add Plan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
