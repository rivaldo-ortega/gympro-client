import {type ClassValue, clsx} from 'clsx'
import moment from 'moment'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Convert from cents to dollars

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}


export function formatDate(date: string): string {
  if (!date) {
    return 'N/A'
  }

  return new Date(moment(date).toString()).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })
}

export function formatTime(time: string): string {
  // Parse time string (HH:MM:SS)
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)

  // Format to 12-hour with AM/PM
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12

  return `${hour12}:${minutes} ${period}`
}

export function getRelativeTimeString(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

// Status badge color utilities
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'frozen':
      return 'bg-blue-100 text-blue-800'
    case 'open':
      return 'bg-green-100 text-green-800'
    case 'full':
      return 'bg-red-100 text-red-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    case 'excellent':
      return 'bg-green-100 text-green-800'
    case 'good':
      return 'bg-blue-100 text-blue-800'
    case 'fair':
      return 'bg-yellow-100 text-yellow-800'
    case 'poor':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Equipment image urls
export const gymEquipmentImageUrls = [
  'https://images.unsplash.com/photo-1570440828762-c86aa7168ef4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Treadmill
  'https://images.unsplash.com/photo-1580261450046-d0a30080dc9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Dumbbells
  'https://images.unsplash.com/photo-1607077803136-eea8548b9f15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Yoga Mats
  'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Squat Rack
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Barbell
  'https://images.unsplash.com/photo-1584863231364-2edc166de576?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Cable Machine
]

// Trainer image urls
export const trainerImageUrls = [
  'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80', // Emma Lee
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80', // Michael Torres
  'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80', // Jessica Brown
  'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80', // Ryan Peterson
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
]

// Gym interior image urls
export const gymInteriorImageUrls = [
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Modern gym
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Weights area
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Cardio area
  'https://images.unsplash.com/photo-1630395822970-acd6a28ecfb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Yoga studio
  'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Locker room
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Reception area
]

// Workout activities image urls
export const workoutActivitiesImageUrls = [
  'https://images.unsplash.com/photo-1616279969768-88f5706fa597?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Yoga
  'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Running
  'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Weight lifting
  'https://images.unsplash.com/photo-1518310383802-640c2de311b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // HIIT
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Spin class
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Stretching
]

// Member avatar image urls
export const memberAvatarUrls = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120&q=80',
]

/**
 * Genera las iniciales a partir de un nombre completo.
 * Toma la primera letra del primer nombre y la primera letra del primer apellido.
 * @param name Nombre completo de la persona
 * @returns Las iniciales en formato "AB"
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    // Si solo hay una palabra, retorna la primera letra
    return parts[0].charAt(0).toUpperCase()
  }

  // Tomar la primera letra del primer nombre y del primer apellido
  const firstInitial = parts[0].charAt(0)
  const lastInitial = parts[parts.length - 1].charAt(0)

  return (firstInitial + lastInitial).toUpperCase()
}
