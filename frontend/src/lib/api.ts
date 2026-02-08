/**
 * Supabase API Client
 * Complete replacement for Django REST Framework
 */

import { createClient } from './supabase/client'

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Log email notification failures to activity logs
 */
async function logEmailFailure(
  action: string,
  error: any,
  context: Record<string, any>
): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from('activity_logs').insert({
      action: `email_failed_${action}`,
      description: `Email notification failed: ${error.message || 'Unknown error'}`,
      metadata: {
        error: error.message || String(error),
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (logError) {
    // If logging fails, at least console.error it
    console.error('Failed to log email error:', logError)
  }
}

/**
 * Validate active session before admin operations
 * Throws error if session is invalid, forcing re-authentication
 */
async function validateAdminSession(): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('No active session')
    }

    // Verify token is still valid
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Invalid session token')
    }

    return true
  } catch (error) {
    console.error('Session validation failed:', error)
    // Clear any stale local data
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.error('Error clearing storage:', e)
      }
      // Force redirect to login
      window.location.replace('/admin/login')
    }
    throw new Error('Session expired - please login again')
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

// Database row types
export interface Service {
  id: string
  category_id?: string
  title: string
  slug: string
  short_description?: string
  description?: string
  symptoms?: string
  approach?: string
  what_to_expect?: string
  image?: string
  icon?: string
  modality: 'in_person' | 'virtual' | 'both'
  duration_minutes: number
  price?: number
  price_note?: string
  is_featured: boolean
  is_published: boolean
  order: number
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  created_at: string
  updated_at: string
  category?: ServiceCategory
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  order: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  reference_id: string
  patient_name: string
  patient_email: string
  patient_phone: string
  patient_type: 'new' | 'returning'
  service_id?: string
  modality: 'virtual' | 'in_person' | 'phone'
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  timezone: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'no_show'
  reason?: string
  admin_notes?: string
  confirmation_sent: boolean
  reminder_sent: boolean
  meeting_link?: string
  created_at: string
  updated_at: string
  service?: Service
}

export interface BlogPost {
  id: string
  category_id?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string
  image_caption?: string
  author_name?: string
  author_bio?: string
  author_avatar?: string
  is_published: boolean
  is_featured: boolean
  published_at: string
  read_time_minutes?: number
  views: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  category?: BlogCategory
  tags?: BlogTag[]
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  order: number
  created_at: string
  updated_at: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Testimonial {
  id: string
  patient_name: string
  content: string
  rating: number
  service?: string
  is_featured: boolean
  is_verified: boolean
  created_at: string
}

export interface Event {
  id: string
  category_id?: string
  title: string
  slug: string
  description?: string
  what_to_bring?: string
  modality: 'virtual' | 'in_person' | 'hybrid'
  start_date: string
  end_date: string
  timezone: string
  location_name?: string
  location_address?: string
  virtual_link?: string
  image?: string
  is_published: boolean
  is_featured: boolean
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  category?: EventCategory
}

export interface EventCategory {
  id: string
  name: string
  slug: string
  event_type: 'workshop' | 'live_qa' | 'support_group' | 'webinar' | 'seminar'
  description?: string
  color: string
  icon?: string
  created_at: string
}

// ============================================
// SERVICES API
// ============================================

export const servicesApi = {
  getAll: async (params?: { category?: string; featured?: boolean }): Promise<ApiResponse<Service[]>> => {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_published', true)
        .order('order', { ascending: true })

      if (params?.category) {
        query = query.eq('category_id', params.category)
      }

      if (params?.featured) {
        query = query.eq('is_featured', true)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data as Service[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SERVICES_FETCH_ERROR',
          message: error.message || 'Failed to fetch services',
        },
      }
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Service>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data as Service,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: error.message || 'Service not found',
        },
      }
    }
  },

  // Admin methods for managing services (requires authentication)
  create: async (serviceData: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      // Validate session before admin operation
      await validateAdminSession()
      
      const supabase = createClient()
      
      // Insert new service
      const { data, error } = await supabase
        .from('services')
        .insert({
          title: serviceData.title,
          slug: serviceData.slug,
          category_id: serviceData.category_id,
          short_description: serviceData.short_description,
          description: serviceData.description,
          symptoms: serviceData.symptoms,
          approach: serviceData.approach,
          what_to_expect: serviceData.what_to_expect,
          image: serviceData.image,
          icon: serviceData.icon,
          modality: serviceData.modality || 'both',
          duration_minutes: serviceData.duration_minutes || 60,
          price: serviceData.price,
          price_note: serviceData.price_note,
          is_featured: serviceData.is_featured || false,
          is_published: serviceData.is_published !== false,
          order: serviceData.order || 0,
          meta_title: serviceData.meta_title,
          meta_description: serviceData.meta_description,
          meta_keywords: serviceData.meta_keywords,
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          action: 'service_created',
          description: `Created service: ${data.title}`,
          metadata: { service_id: data.id, service_title: data.title },
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
      }

      return {
        success: true,
        data: data as Service,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Failed to create service',
        },
      }
    }
  },

  update: async (id: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      // Validate session before admin operation
      await validateAdminSession()
      
      const supabase = createClient()
      
      // Update service
      const { data, error } = await supabase
        .from('services')
        .update({
          title: serviceData.title,
          slug: serviceData.slug,
          category_id: serviceData.category_id,
          short_description: serviceData.short_description,
          description: serviceData.description,
          symptoms: serviceData.symptoms,
          approach: serviceData.approach,
          what_to_expect: serviceData.what_to_expect,
          image: serviceData.image,
          icon: serviceData.icon,
          modality: serviceData.modality,
          duration_minutes: serviceData.duration_minutes,
          price: serviceData.price,
          price_note: serviceData.price_note,
          is_featured: serviceData.is_featured,
          is_published: serviceData.is_published,
          order: serviceData.order,
          meta_title: serviceData.meta_title,
          meta_description: serviceData.meta_description,
          meta_keywords: serviceData.meta_keywords,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          action: 'service_updated',
          description: `Updated service: ${data.title}`,
          metadata: { service_id: data.id, service_title: data.title },
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
      }

      return {
        success: true,
        data: data as Service,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || 'Failed to update service',
        },
      }
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      // Validate session before admin operation
      await validateAdminSession()
      
      const supabase = createClient()
      
      // Get service title before deletion for logging
      const { data: service } = await supabase
        .from('services')
        .select('title')
        .eq('id', id)
        .single()

      // Delete service
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          action: 'service_deleted',
          description: `Deleted service: ${service?.title || id}`,
          metadata: { service_id: id, service_title: service?.title },
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
      }

      return {
        success: true,
        data: null,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Failed to delete service',
        },
      }
    }
  },
}

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data as ServiceCategory[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'CATEGORIES_ERROR',
          message: error.message || 'Failed to fetch categories',
        },
      }
    }
  },
}

// ============================================
// APPOINTMENTS API
// ============================================

export const appointmentsApi = {
  getAvailableDates: async (days: number = 30): Promise<ApiResponse<{ dates: string[] }>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('get_available_dates', {
        days_ahead: days,
      })

      if (error) throw error

      return {
        success: true,
        data: { dates: data || [] },
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'AVAILABILITY_ERROR',
          message: error.message || 'Failed to fetch available dates',
        },
      }
    }
  },

  getAvailableSlots: async (params: {
    start_date: string
    end_date: string
    modality?: string
  }): Promise<ApiResponse<{ slots: Record<string, any[]> }>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('get_available_slots', {
        start_date: params.start_date,
        end_date: params.end_date,
        modality_filter: params.modality || null,
      })

      if (error) throw error

      // Supabase RPC returns JSONB directly - data IS the slots object
      const slotsData = data || {}

      return {
        success: true,
        data: { slots: slotsData },
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SLOTS_ERROR',
          message: error.message || 'Failed to fetch available slots',
        },
      }
    }
  },

  book: async (bookingData: {
    service_id?: string
    modality: string
    scheduled_date: string
    scheduled_time: string
    patient_name: string
    patient_email: string
    patient_phone: string
    patient_type: string
    reason: string
  }): Promise<ApiResponse<Appointment>> => {
    try {
      const supabase = createClient()
      
      // Insert appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...bookingData,
          status: 'pending',
          confirmation_sent: false,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          duration_minutes: 30,
        }])
        .select(`
          *,
          service:services(*)
        `)
        .single()

      if (error) throw error

      // Trigger email confirmation via Edge Function
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: { appointment_id: data.id },
        })
      } catch (emailError: any) {
        // Log error to activity logs for admin visibility
        console.error('Email notification failed:', emailError)
        await logEmailFailure('booking_confirmation', emailError, {
          appointment_id: data.id,
          reference_id: data.reference_id,
          patient_email: bookingData.patient_email,
        })
      }

      return {
        success: true,
        data: data as Appointment,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'BOOKING_ERROR',
          message: error.message || 'Failed to create booking',
        },
      }
    }
  },

  lookup: async (reference_id: string): Promise<ApiResponse<Appointment>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*)
        `)
        .eq('reference_id', reference_id.toUpperCase())
        .single()

      if (error) throw error

      return {
        success: true,
        data: data as Appointment,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found',
        },
      }
    }
  },

  cancel: async (reference_id: string, email: string): Promise<ApiResponse<Appointment>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('reference_id', reference_id.toUpperCase())
        .eq('patient_email', email)
        .select(`
          *,
          service:services(*)
        `)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data as Appointment,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'CANCEL_ERROR',
          message: error.message || 'Failed to cancel appointment',
        },
      }
    }
  },

  // Admin APIs
  getAll: async (): Promise<ApiResponse<Appointment[]>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*)
        `)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data as Appointment[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'APPOINTMENTS_ERROR',
          message: error.message || 'Failed to fetch appointments',
        },
      }
    }
  },

  approve: async (id: string): Promise<ApiResponse<Appointment>> => {
    try {
      // Validate session before admin operation
      await validateAdminSession()
      
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'approved' })
        .eq('id', id)
        .select(`
          *,
          service:services(*)
        `)
        .single()

      if (error) throw error

      // Trigger approval email
      try {
        await supabase.functions.invoke('send-appointment-approved', {
          body: { appointment_id: data.id },
        })
      } catch (emailError: any) {
        console.error('Email notification failed:', emailError)
        await logEmailFailure('appointment_approval', emailError, {
          appointment_id: data.id,
          reference_id: data.reference_id,
        })
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'appointment_approved',
        description: `Appointment ${data.reference_id} approved`,
        metadata: { appointment_id: data.id },
      })

      return {
        success: true,
        data: data as Appointment,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'APPROVE_ERROR',
          message: error.message || 'Failed to approve appointment',
        },
      }
    }
  },

  reject: async (id: string, reason?: string): Promise<ApiResponse<Appointment>> => {
    try {
      // Validate session before admin operation
      await validateAdminSession()
      
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          status: 'rejected',
          admin_notes: reason,
        })
        .eq('id', id)
        .select(`
          *,
          service:services(*)
        `)
        .single()

      if (error) throw error

      // Trigger rejection email
      try {
        await supabase.functions.invoke('send-appointment-rejected', {
          body: { appointment_id: data.id },
        })
      } catch (emailError: any) {
        console.error('Email notification failed:', emailError)
        await logEmailFailure('appointment_rejection', emailError, {
          appointment_id: data.id,
          reference_id: data.reference_id,
          reason,
        })
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'appointment_rejected',
        description: `Appointment ${data.reference_id} rejected`,
        metadata: { appointment_id: data.id, reason },
      })

      return {
        success: true,
        data: data as Appointment,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'REJECT_ERROR',
          message: error.message || 'Failed to reject appointment',
        },
      }
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      // Validate session before admin operation
      await validateAdminSession()
      
      const supabase = createClient()
      
      // Get appointment details before deletion for logging
      const { data: appointment } = await supabase
        .from('appointments')
        .select('reference_id, patient_name')
        .eq('id', id)
        .single()
      
      // Delete appointment
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Log activity
      try {
        await supabase.from('activity_logs').insert({
          action: 'appointment_deleted',
          description: `Appointment ${appointment?.reference_id || id} deleted (Patient: ${appointment?.patient_name || 'Unknown'})`,
          metadata: { appointment_id: id, reference_id: appointment?.reference_id },
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
      }

      return {
        success: true,
        data: null,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Failed to delete appointment',
        },
      }
    }
  },
}

// ============================================
// BLOG API
// ============================================

export const blogApi = {
  getPosts: async (params?: { category?: string; tag?: string; featured?: boolean }): Promise<ApiResponse<BlogPost[]>> => {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq('is_published', true)

      // Filter by featured status if requested
      if (params?.featured === true) {
        query = query.eq('is_featured', true)
      }

      if (params?.category) {
        query = query.eq('category_id', params.category)
      }

      // Order by published date (newest first)
      query = query.order('published_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data as BlogPost[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'BLOG_FETCH_ERROR',
          message: error.message || 'Failed to fetch blog posts',
        },
      }
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<BlogPost>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error

      // Increment views
      await supabase.rpc('increment_blog_views', { post_id: data.id })

      return {
        success: true,
        data: data as BlogPost,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: error.message || 'Blog post not found',
        },
      }
    }
  },

  getCategories: async (): Promise<ApiResponse<BlogCategory[]>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data as BlogCategory[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'CATEGORIES_ERROR',
          message: error.message || 'Failed to fetch categories',
        },
      }
    }
  },

  getTags: async (): Promise<ApiResponse<BlogTag[]>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data as BlogTag[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'TAGS_ERROR',
          message: error.message || 'Failed to fetch tags',
        },
      }
    }
  },

  // Admin methods for managing blog posts (requires authentication)
  admin: {
    getAll: async (): Promise<ApiResponse<BlogPost[]>> => {
      try {
        // Validate admin session before fetching all posts
        await validateAdminSession()
        
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            category:blog_categories(*)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return {
          success: true,
          data: data as BlogPost[],
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'ADMIN_BLOG_ERROR',
            message: error.message || 'Failed to fetch blog posts',
          },
        }
      }
    },

    create: async (postData: Partial<BlogPost> | FormData): Promise<ApiResponse<BlogPost>> => {
      try {
        // Validate admin session before creating
        await validateAdminSession()
        
        const supabase = createClient()
        
        // Extract data from FormData if needed
        let blogPostData: any
        let imageUrl: string | null = null
        
        if (postData instanceof FormData) {
          // Handle image upload if present
          const imageFile = postData.get('featured_image') as File | null
          if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `blog-images/${fileName}`
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('blog-images')
              .upload(filePath, imageFile, {
                cacheControl: '3600',
                upsert: false
              })
            
            if (uploadError) {
              console.error('Image upload error:', uploadError)
              // Continue without image rather than failing the entire post
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath)
              imageUrl = publicUrl
            }
          }
          
          blogPostData = {
            title: postData.get('title') as string,
            slug: postData.get('slug') as string || (postData.get('title') as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category_id: postData.get('category_id') as string,
            excerpt: postData.get('excerpt') as string,
            content: postData.get('content') as string,
            featured_image: imageUrl,
            is_published: true,
            is_featured: postData.get('is_featured') === 'true',
            published_at: new Date().toISOString(),
          }
        } else {
          blogPostData = {
            title: postData.title,
            slug: postData.slug,
            category_id: postData.category_id,
            excerpt: postData.excerpt,
            content: postData.content,
            featured_image: postData.featured_image,
            image_caption: postData.image_caption,
            author_name: postData.author_name,
            author_bio: postData.author_bio,
            author_avatar: postData.author_avatar,
            is_published: postData.is_published !== false,
            is_featured: postData.is_featured || false,
            published_at: postData.published_at || new Date().toISOString(),
            read_time_minutes: postData.read_time_minutes,
            meta_title: postData.meta_title,
            meta_description: postData.meta_description,
          }
        }
        
        // Insert new blog post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(blogPostData)
          .select(`
            *,
            category:blog_categories(*)
          `)
          .single()

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: 'blog_post_created',
            description: `Created blog post: ${data.title}`,
            metadata: { post_id: data.id, post_title: data.title },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: data as BlogPost,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: error.message || 'Failed to create blog post',
          },
        }
      }
    },

    update: async (id: string, postData: Partial<BlogPost> | FormData): Promise<ApiResponse<BlogPost>> => {
      try {
        // Validate admin session before updating
        await validateAdminSession()
        
        const supabase = createClient()
        
        let updateData: any
        
        // Handle FormData with image upload
        if (postData instanceof FormData) {
          let imageUrl: string | null = null
          
          const imageFile = postData.get('featured_image') as File | null
          if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `blog-images/${fileName}`
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('blog-images')
              .upload(filePath, imageFile, {
                cacheControl: '3600',
                upsert: false
              })
            
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath)
              imageUrl = publicUrl
            }
          }
          
          updateData = {
            title: postData.get('title') as string,
            slug: postData.get('slug') as string,
            category_id: postData.get('category_id') as string,
            excerpt: postData.get('excerpt') as string,
            content: postData.get('content') as string,
            featured_image: imageUrl || undefined,
            updated_at: new Date().toISOString(),
          }
        } else {
          updateData = {
            title: postData.title,
            slug: postData.slug,
            category_id: postData.category_id,
            excerpt: postData.excerpt,
            content: postData.content,
            featured_image: postData.featured_image,
            image_caption: postData.image_caption,
            author_name: postData.author_name,
            author_bio: postData.author_bio,
            author_avatar: postData.author_avatar,
            is_published: postData.is_published,
            is_featured: postData.is_featured,
            published_at: postData.published_at,
            read_time_minutes: postData.read_time_minutes,
            meta_title: postData.meta_title,
            meta_description: postData.meta_description,
            updated_at: new Date().toISOString(),
          }
        }
        
        // Update blog post
        const { data, error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            category:blog_categories(*)
          `)
          .single()

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: 'blog_post_updated',
            description: `Updated blog post: ${data.title}`,
            metadata: { post_id: data.id, post_title: data.title },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: data as BlogPost,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: error.message || 'Failed to update blog post',
          },
        }
      }
    },

    delete: async (id: string | number): Promise<ApiResponse<null>> => {
      try {
        // Validate admin session before deleting
        await validateAdminSession()
        
        const supabase = createClient()
        
        // Get post title before deletion for logging
        const { data: post } = await supabase
          .from('blog_posts')
          .select('title')
          .eq('id', id)
          .single()

        // Delete blog post
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: 'blog_post_deleted',
            description: `Deleted blog post: ${post?.title || id}`,
            metadata: { post_id: id, post_title: post?.title },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: null,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: error.message || 'Failed to delete blog post',
          },
        }
      }
    },

    togglePublish: async (id: string, currentStatus: boolean): Promise<ApiResponse<BlogPost>> => {
      try {
        // Validate admin session before toggling publish status
        await validateAdminSession()
        
        const supabase = createClient()
        const newStatus = !currentStatus
        
        // Update publish status and set published_at timestamp if publishing
        const updateData: any = {
          is_published: newStatus,
          updated_at: new Date().toISOString(),
        }
        
        if (newStatus) {
          updateData.published_at = new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            category:blog_categories(*)
          `)
          .single()

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: newStatus ? 'blog_post_published' : 'blog_post_unpublished',
            description: `${newStatus ? 'Published' : 'Unpublished'} blog post: ${data.title}`,
            metadata: { post_id: data.id, post_title: data.title, is_published: newStatus },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: data as BlogPost,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'TOGGLE_PUBLISH_ERROR',
            message: error.message || 'Failed to toggle publish status',
          },
        }
      }
    },
  },
}

// ============================================
// EVENTS API
// ============================================

export const eventsApi = {
  getAll: async (params?: { category?: string; upcoming?: boolean }): Promise<ApiResponse<Event[]>> => {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('events')
        .select(`
          *,
          category:event_categories(*)
        `)
        .eq('is_published', true)

      if (params?.upcoming) {
        query = query.gte('start_date', new Date().toISOString())
      }

      query = query.order('start_date', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data as Event[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'EVENTS_ERROR',
          message: error.message || 'Failed to fetch events',
        },
      }
    }
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Event>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:event_categories(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data as Event,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: error.message || 'Event not found',
        },
      }
    }
  },

  getCategories: async (): Promise<ApiResponse<EventCategory[]>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data as EventCategory[],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'EVENT_CATEGORIES_ERROR',
          message: error.message || 'Failed to fetch event categories',
        },
      }
    }
  },

  register: async (event_id: string, registrationData: {
    name: string
    email: string
    phone: string
  }): Promise<ApiResponse<any>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id,
          ...registrationData,
          status: 'registered',
        }])
        .select()
        .single()

      if (error) throw error

      // Trigger confirmation email
      try {
        await supabase.functions.invoke('send-event-confirmation', {
          body: { registration_id: data.id },
        })
      } catch (emailError: any) {
        console.error('Email notification failed:', emailError)
        await logEmailFailure('event_confirmation', emailError, {
          registration_id: data.id,
          event_id,
          participant_email: registrationData.email,
        })
      }

      return {
        success: true,
        data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: error.message || 'Failed to register for event',
        },
      }
    }
  },

  // Admin methods for managing events (requires authentication)
  admin: {
    getAll: async (): Promise<ApiResponse<Event[]>> => {
      try {
        // Validate admin session before fetching all events
        await validateAdminSession()
        
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            category:event_categories(*)
          `)
          .order('start_date', { ascending: true })

        if (error) throw error

        return {
          success: true,
          data: data as Event[],
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'ADMIN_EVENTS_ERROR',
            message: error.message || 'Failed to fetch events',
          },
        }
      }
    },

    create: async (eventData: Partial<Event> | FormData): Promise<ApiResponse<Event>> => {
      try {
        // Validate admin session before creating
        await validateAdminSession()
        
        const supabase = createClient()
        
        // Extract data from FormData if needed
        let eventPostData: any
        if (eventData instanceof FormData) {
          eventPostData = {
            title: eventData.get('title') as string,
            slug: eventData.get('slug') as string || (eventData.get('title') as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category_id: eventData.get('category_id') as string,
            description: eventData.get('description') as string,
            what_to_bring: eventData.get('what_to_bring') as string || null,
            modality: eventData.get('modality') as string || 'in_person',
            start_date: eventData.get('start_date') as string,
            end_date: eventData.get('end_date') as string,
            timezone: eventData.get('timezone') as string || 'UTC',
            location_name: eventData.get('location_name') as string || null,
            location_address: eventData.get('location_address') as string || null,
            virtual_link: eventData.get('virtual_link') as string || null,
            image: eventData.get('image') as string || null,
            is_published: eventData.get('is_published') === 'true',
            is_featured: eventData.get('is_featured') === 'true',
            meta_title: eventData.get('meta_title') as string || null,
            meta_description: eventData.get('meta_description') as string || null,
          }
        } else {
          eventPostData = {
            title: eventData.title,
            slug: eventData.slug,
            category_id: eventData.category_id,
            description: eventData.description,
            what_to_bring: eventData.what_to_bring,
            modality: eventData.modality || 'in_person',
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            timezone: eventData.timezone || 'UTC',
            location_name: eventData.location_name,
            location_address: eventData.location_address,
            virtual_link: eventData.virtual_link,
            image: eventData.image,
            is_published: eventData.is_published !== false,
            is_featured: eventData.is_featured || false,
            meta_title: eventData.meta_title,
            meta_description: eventData.meta_description,
          }
        }
        
        // Insert new event
        const { data, error } = await supabase
          .from('events')
          .insert(eventPostData)
          .select(`
            *,
            category:event_categories(*)
          `)
          .single()

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: 'event_created',
            description: `Created event: ${data.title}`,
            metadata: { event_id: data.id, event_title: data.title },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: data as Event,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'CREATE_ERROR',
            message: error.message || 'Failed to create event',
          },
        }
      }
    },

    update: async (id: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
      try {
        // Validate admin session before updating
        await validateAdminSession()
        
        const supabase = createClient()
        
        // Update event
        const { data, error } = await supabase
          .from('events')
          .update({
            title: eventData.title,
            slug: eventData.slug,
            category_id: eventData.category_id,
            description: eventData.description,
            what_to_bring: eventData.what_to_bring,
            modality: eventData.modality,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            timezone: eventData.timezone,
            location_name: eventData.location_name,
            location_address: eventData.location_address,
            virtual_link: eventData.virtual_link,
            image: eventData.image,
            is_published: eventData.is_published,
            is_featured: eventData.is_featured,
            meta_title: eventData.meta_title,
            meta_description: eventData.meta_description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select(`
            *,
            category:event_categories(*)
          `)
          .single()

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: 'event_updated',
            description: `Updated event: ${data.title}`,
            metadata: { event_id: data.id, event_title: data.title },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: data as Event,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'UPDATE_ERROR',
            message: error.message || 'Failed to update event',
          },
        }
      }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
      try {
        // Validate admin session before deleting
        await validateAdminSession()
        
        const supabase = createClient()
        
        // Get event title before deletion for logging
        const { data: event } = await supabase
          .from('events')
          .select('title')
          .eq('id', id)
          .single()

        // Delete event
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: 'event_deleted',
            description: `Deleted event: ${event?.title || id}`,
            metadata: { event_id: id, event_title: event?.title },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: null,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: error.message || 'Failed to delete event',
          },
        }
      }
    },

    togglePublish: async (id: string, currentStatus: boolean): Promise<ApiResponse<Event>> => {
      try {
        // Validate admin session before toggling publish status
        await validateAdminSession()
        
        const supabase = createClient()
        const newStatus = !currentStatus
        
        // Update publish status
        const updateData: any = {
          is_published: newStatus,
          updated_at: new Date().toISOString(),
        }
        
        const { data, error } = await supabase
          .from('events')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            category:event_categories(*)
          `)
          .single()

        if (error) throw error

        // Log activity
        try {
          await supabase.from('activity_logs').insert({
            action: newStatus ? 'event_published' : 'event_unpublished',
            description: `${newStatus ? 'Published' : 'Unpublished'} event: ${data.title}`,
            metadata: { event_id: data.id, event_title: data.title, is_published: newStatus },
          })
        } catch (logError) {
          console.error('Failed to log activity:', logError)
        }

        return {
          success: true,
          data: data as Event,
        }
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: 'TOGGLE_PUBLISH_ERROR',
            message: error.message || 'Failed to toggle publish status',
          },
        }
      }
    },
  },
}

// ============================================
// ADMIN DASHBOARD API
// ============================================

export const dashboardApi = {
  getSummary: async (): Promise<ApiResponse<any>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('get_dashboard_summary')

      if (error) throw error

      return {
        success: true,
        data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DASHBOARD_ERROR',
          message: error.message || 'Failed to fetch dashboard data',
        },
      }
    }
  },

  getRecentActivity: async (limit: number = 20): Promise<ApiResponse<any[]>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        data: data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'ACTIVITY_ERROR',
          message: error.message || 'Failed to fetch activity logs',
        },
      }
    }
  },

  getAppointmentsByDate: async (days: number = 30): Promise<ApiResponse<any[]>> => {
    try {
      const supabase = createClient()
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const { data, error } = await supabase
        .from('appointments')
        .select('scheduled_date, status')
        .gte('scheduled_date', startDate.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })

      if (error) throw error

      // Group by date
      const grouped = data.reduce((acc: any, curr: any) => {
        const date = curr.scheduled_date
        if (!acc[date]) {
          acc[date] = { date, count: 0, pending: 0, approved: 0, completed: 0 }
        }
        acc[date].count++
        if (curr.status === 'pending') acc[date].pending++
        if (curr.status === 'approved') acc[date].approved++
        if (curr.status === 'completed') acc[date].completed++
        return acc
      }, {})

      return {
        success: true,
        data: Object.values(grouped),
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'APPOINTMENTS_BY_DATE_ERROR',
          message: error.message || 'Failed to fetch appointments by date',
        },
      }
    }
  },
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        success: true,
        data: data.user,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error.message || 'Invalid credentials',
        },
      }
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const supabase = createClient()
      
      // Sign out with 'local' scope to clear this device's session
      const { error } = await supabase.auth.signOut({ scope: 'local' })

      if (error) throw error
      
      // Clear all local storage
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch (e) {
          console.error('Error clearing storage:', e)
        }
      }

      return {
        success: true,
        data: null,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error.message || 'Failed to logout',
        },
      }
    }
  },

  getUser: async (): Promise<ApiResponse<any>> => {
    try {
      const supabase = createClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error

      return {
        success: true,
        data: user,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'USER_ERROR',
          message: error.message || 'Failed to fetch user',
        },
      }
    }
  },
}

// ============================================
// TESTIMONIALS API (Stub - table not yet created)
// ============================================

export const testimonialsApi = {
  getAll: async (): Promise<ApiResponse<{ results: Testimonial[] }>> => {
    // TODO: Create testimonials table in Supabase
    // For now, return empty array
    return {
      success: true,
      data: { results: [] },
    }
  },
}

// ============================================
// ADMIN SETTINGS API
// ============================================

export interface AdminSettings {
  id: string
  user_id: string
  
  // Profile Settings
  full_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  bio?: string
  
  // Notification Settings
  email_notifications: boolean
  appointment_notifications: boolean
  event_notifications: boolean
  blog_notifications: boolean
  
  // System Settings
  enable_online_booking: boolean
  require_appointment_approval: boolean
  auto_send_confirmations: boolean
  auto_send_reminders: boolean
  reminder_hours_before: number
  max_appointments_per_day: number
  booking_buffer_minutes: number
  
  // Business Hours
  business_hours: {
    [key: string]: {
      open: string
      close: string
      enabled: boolean
    }
  }
  
  // Contact Information
  clinic_name: string
  clinic_email: string
  clinic_phone: string
  clinic_address?: string
  
  // Metadata
  created_at: string
  updated_at: string
}

export const adminSettingsApi = {
  // Get current admin's settings
  get: async (): Promise<ApiResponse<AdminSettings>> => {
    try {
      await validateAdminSession()
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no settings exist, create default
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('admin_settings')
            .insert({
              user_id: user.id,
              full_name: user.user_metadata?.full_name || user.email,
              email: user.email,
            })
            .select()
            .single()
          
          if (insertError) throw insertError
          
          return {
            success: true,
            data: newData as AdminSettings,
          }
        }
        throw error
      }

      return {
        success: true,
        data: data as AdminSettings,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SETTINGS_GET_ERROR',
          message: error.message || 'Failed to fetch settings',
        },
      }
    }
  },

  // Update admin settings
  update: async (updates: Partial<AdminSettings>): Promise<ApiResponse<AdminSettings>> => {
    try {
      await validateAdminSession()
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Remove fields that shouldn't be updated directly
      const { id, user_id, created_at, updated_at, ...updateData } = updates as any

      const { data, error } = await supabase
        .from('admin_settings')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'settings_updated',
        description: 'Admin settings updated',
        metadata: { 
          updated_fields: Object.keys(updateData),
          user_id: user.id,
        },
      })

      return {
        success: true,
        data: data as AdminSettings,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SETTINGS_UPDATE_ERROR',
          message: error.message || 'Failed to update settings',
        },
      }
    }
  },

  // Update profile only
  updateProfile: async (profile: {
    full_name?: string
    email?: string
    phone?: string
    avatar_url?: string
    bio?: string
  }): Promise<ApiResponse<AdminSettings>> => {
    return adminSettingsApi.update(profile)
  },

  // Update notification preferences
  updateNotifications: async (notifications: {
    email_notifications?: boolean
    appointment_notifications?: boolean
    event_notifications?: boolean
    blog_notifications?: boolean
  }): Promise<ApiResponse<AdminSettings>> => {
    return adminSettingsApi.update(notifications)
  },

  // Update system settings
  updateSystemSettings: async (settings: {
    enable_online_booking?: boolean
    require_appointment_approval?: boolean
    auto_send_confirmations?: boolean
    auto_send_reminders?: boolean
    reminder_hours_before?: number
    max_appointments_per_day?: number
    booking_buffer_minutes?: number
  }): Promise<ApiResponse<AdminSettings>> => {
    return adminSettingsApi.update(settings)
  },

  // Update business hours
  updateBusinessHours: async (businessHours: AdminSettings['business_hours']): Promise<ApiResponse<AdminSettings>> => {
    return adminSettingsApi.update({ business_hours: businessHours })
  },

  // Update clinic contact info
  updateClinicInfo: async (info: {
    clinic_name?: string
    clinic_email?: string
    clinic_phone?: string
    clinic_address?: string
  }): Promise<ApiResponse<AdminSettings>> => {
    return adminSettingsApi.update(info)
  },
}
