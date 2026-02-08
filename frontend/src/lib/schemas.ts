/**
 * Zod Validation Schemas for API Contracts
 * 
 * These schemas EXACTLY match the Django Rest Framework serializers.
 * Any deviation here indicates a contract mismatch.
 * 
 * IMPORTANT: Backend serializers are the source of truth.
 * These schemas must be updated when backend changes.
 */

import { z } from "zod";

// ============================================
// PRIMITIVE SCHEMAS
// ============================================

export const PatientTypeSchema = z.enum(["new", "returning"]);
export type PatientType = z.infer<typeof PatientTypeSchema>;

export const ModalitySchema = z.enum(["virtual", "in_person", "phone"]);
export type Modality = z.infer<typeof ModalitySchema>;

export const AppointmentStatusSchema = z.enum([
  "pending",
  "approved", 
  "rejected",
  "completed",
  "cancelled",
  "no_show",
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

// ISO-8601 date format validation (YYYY-MM-DD)
export const ISODateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Date must be in ISO-8601 format (YYYY-MM-DD)"
);

// Time format validation (HH:MM or HH:MM:SS)
export const TimeSchema = z.string().regex(
  /^\d{2}:\d{2}(:\d{2})?$/,
  "Time must be in HH:MM or HH:MM:SS format"
);

// ============================================
// PATIENT DETAILS SCHEMA
// ============================================

export const PatientDetailsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});
export type PatientDetails = z.infer<typeof PatientDetailsSchema>;

// ============================================
// SERVICE SCHEMAS
// ============================================

export const ServiceCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string(),
  service_count: z.number().optional(),
});
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

export const ServiceFAQSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  order: z.number(),
});
export type ServiceFAQ = z.infer<typeof ServiceFAQSchema>;

export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  short_description: z.string(),
  description: z.string(),
  symptoms: z.string().optional().default(""),
  approach: z.string().optional().default(""),
  what_to_expect: z.string().optional().default(""),
  image: z.string().nullable(),
  icon: z.string(),
  category: ServiceCategorySchema.nullable().optional(),
  modality: z.enum(["in_person", "virtual", "both"]),
  duration_minutes: z.number(),
  price: z.number().nullable(),
  price_note: z.string().optional().default(""),
  is_featured: z.boolean(),
  faqs: z.array(ServiceFAQSchema).optional().default([]),
  meta_title: z.string().optional().default(""),
  meta_description: z.string().optional().default(""),
});
export type Service = z.infer<typeof ServiceSchema>;

// ============================================
// APPOINTMENT SCHEMAS
// ============================================

export const TimeSlotSchema = z.object({
  start_time: TimeSchema,
  end_time: TimeSchema,
  modality: z.array(z.string()),
});
export type TimeSlot = z.infer<typeof TimeSlotSchema>;

export const AvailableSlotsResponseSchema = z.object({
  slots: z.record(z.string(), z.array(TimeSlotSchema)),
  total_slots: z.number(),
});

export const AvailableDatesResponseSchema = z.object({
  dates: z.array(ISODateSchema),
});

export const BookingRequestSchema = z.object({
  patient_type: PatientTypeSchema,
  patient_details: PatientDetailsSchema,
  service_id: z.number().optional(),
  doctor_id: z.number().optional(), // Optional in single-clinic mode
  scheduled_date: ISODateSchema,
  scheduled_time: TimeSchema,
  modality: ModalitySchema,
  timezone: z.string().default("UTC"),
  reason: z.string().optional().default(""),
  website: z.string().optional(), // Honeypot field - must be empty
});
export type BookingRequest = z.infer<typeof BookingRequestSchema>;

export const AppointmentSchema = z.object({
  id: z.number(),
  reference_id: z.string(),
  status: AppointmentStatusSchema,
  status_display: z.string(),
  patient_name: z.string(),
  patient_email: z.string(),
  patient_phone: z.string().optional().default(""),
  patient_type: z.string(),
  patient_type_display: z.string().optional(),
  service: ServiceSchema.nullable().optional(),
  scheduled_date: ISODateSchema,
  scheduled_time: TimeSchema,
  duration_minutes: z.number(),
  modality: z.string(),
  modality_display: z.string(),
  timezone: z.string(),
  reason: z.string().optional().default(""),
  meeting_link: z.string().optional().default(""),
  is_upcoming: z.boolean(),
  can_cancel: z.boolean(),
  confirmation_sent: z.boolean().optional(),
  reminder_sent: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;

export const BookingResponseSchema = z.object({
  reference_id: z.string(),
  message: z.string(),
  appointment: AppointmentSchema,
});
export type BookingResponse = z.infer<typeof BookingResponseSchema>;

// ============================================
// BLOG SCHEMAS
// ============================================

export const BlogCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(""),
  post_count: z.number().optional(),
});
export type BlogCategory = z.infer<typeof BlogCategorySchema>;

export const BlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional().default(""),
  content: z.string(),
  featured_image: z.string().nullable().optional(),
  category: BlogCategorySchema.nullable().optional(),
  author_name: z.string().optional().default(""),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  reading_time: z.number().optional(),
  published_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  meta_title: z.string().optional().default(""),
  meta_description: z.string().optional().default(""),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

// ============================================
// EVENT SCHEMAS
// ============================================

export const EventCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(""),
});
export type EventCategory = z.infer<typeof EventCategorySchema>;

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  short_description: z.string().optional().default(""),
  image: z.string().nullable().optional(),
  category: EventCategorySchema.nullable().optional(),
  event_type: z.string(),
  event_type_display: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  start_time: TimeSchema.nullable().optional(),
  end_time: TimeSchema.nullable().optional(),
  location: z.string().optional().default(""),
  virtual_link: z.string().optional().default(""),
  capacity: z.number().nullable().optional(),
  spots_remaining: z.number().optional(),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  status: z.string().optional(),
  created_at: z.string(),
});
export type Event = z.infer<typeof EventSchema>;

export const EventRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

// ============================================
// AUTH SCHEMAS
// ============================================

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  full_name: z.string(),
  role: z.string(),
  is_active: z.boolean().optional().default(true),
});
export type User = z.infer<typeof UserSchema>;

export const AuthTokensSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const RefreshTokenResponseSchema = z.object({
  access: z.string(),
});

// ============================================
// API RESPONSE SCHEMAS
// ============================================

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.array(z.string())).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export function createApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      error: ApiErrorSchema,
    }),
  ]);
}

// ============================================
// TESTIMONIAL SCHEMA
// ============================================

export const TestimonialSchema = z.object({
  id: z.number(),
  patient_name: z.string(),
  patient_initials: z.string().optional(),
  content: z.string(),
  rating: z.number().min(1).max(5),
  service: ServiceSchema.nullable().optional(),
  is_featured: z.boolean().optional().default(false),
  created_at: z.string(),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Safely parse data with a Zod schema.
 * Returns the parsed data or null if validation fails.
 * Logs errors in development.
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: string
): T | null {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return result.data;
  }
  
  // Log validation errors in development
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[Validation Error]${context ? ` (${context})` : ""}:`,
      result.error.format()
    );
  }
  
  return null;
}

/**
 * Parse data with a Zod schema, throwing on failure.
 * Use when data MUST be valid (e.g., after successful API response).
 */
export function strictParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = `${context ? `${context}: ` : ""}Validation failed`;
      console.error(message, error.format());
      throw new Error(message);
    }
    throw error;
  }
}
