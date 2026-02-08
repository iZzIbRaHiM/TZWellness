/**
 * API Client with Token Refresh & Structured Error Handling
 * 
 * Features:
 * - Automatic token refresh on 401 errors
 * - Standardized error format
 * - SSR-safe localStorage access
 * - Retry logic for network failures
 */

import { API_BASE_URL } from "./env";

// Use validated environment variable
const API_URL = API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retryCount?: number;
}

// Token refresh state to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Safely access localStorage (SSR-safe)
 */
function getStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

/**
 * Attempt to refresh the access token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getStorageItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid - clear auth
      removeStorageItem("accessToken");
      removeStorageItem("refreshToken");
      return false;
    }

    const data = await response.json();
    if (data.access) {
      setStorageItem("accessToken", data.access);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Handle token refresh with deduplication
 */
async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Main API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, retryCount = 0, ...fetchOptions } = options;

  let url = `${API_URL}/api/v1${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  // Determine if body is FormData
  const isFormData = fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    // Only set Content-Type for non-FormData requests
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getStorageItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && !skipAuth && retryCount === 0) {
      const refreshed = await handleTokenRefresh();
      if (refreshed) {
        // Retry the request with new token
        return apiRequest<T>(endpoint, { ...options, retryCount: 1 });
      }
      
      // Refresh failed - redirect to login if in browser
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
      
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Session expired. Please log in again.",
        },
      };
    }

    // Handle rate limiting
    if (response.status === 429) {
      return {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please wait a moment and try again.",
        },
      };
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch {
      // Non-JSON response
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: "SERVER_ERROR",
            message: `Server error (${response.status})`,
          },
        };
      }
      data = {};
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: data.code || "API_ERROR",
          message: data.detail || data.message || "An error occurred",
          details: data.details,
        },
      };
    }

    // If data has success field, return as-is, otherwise wrap it
    if ("success" in data) {
      return data;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Network error - log for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", endpoint, error);
    }

    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Unable to connect to the server. Please check your connection and try again.",
      },
    };
  }
}

// Services API
export const servicesApi = {
  getAll: (params?: { category?: string; featured?: boolean }) =>
    apiRequest<{ count: number; next: string | null; previous: string | null; results: Service[] }>("/services/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getBySlug: (slug: string) =>
    apiRequest<Service>(`/services/${slug}/`),

  getCategories: () =>
    apiRequest<{ count: number; next: string | null; previous: string | null; results: ServiceCategory[] }>("/services/categories/"),

  // Admin endpoints
  create: (data: Partial<Service>) =>
    apiRequest<Service>("/services/admin/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Service>) =>
    apiRequest<Service>(`/services/admin/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/services/admin/${id}/`, {
      method: "DELETE",
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    apiRequest<ServiceCategory[]>("/services/categories/"),
};

// Appointments API
export const appointmentsApi = {
  getAvailableSlots: (params: {
    doctor_id?: number;  // Optional in single-clinic mode
    start_date?: string;
    end_date?: string;
    modality?: string;
  }) =>
    apiRequest<{ slots: Record<string, TimeSlot[]>; total_slots: number }>(
      "/appointments/slots/",
      { params: params as Record<string, string | number | boolean | undefined> }
    ),

  getAvailableDates: (days?: number) =>
    apiRequest<{ dates: string[] }>("/appointments/dates/", {
      params: { days },
    }),

  book: (data: BookingRequest) =>
    apiRequest<BookingResponse>("/appointments/book/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  lookup: (referenceId: string) =>
    apiRequest<Appointment>(`/appointments/lookup/${referenceId}/`),

  cancel: (referenceId: string, reason?: string) =>
    apiRequest<{ message: string }>(`/appointments/cancel/${referenceId}/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

// Blog API
export const blogApi = {
  getPosts: (params?: {
    page?: number;
    category?: string;
    search?: string;
    featured?: boolean;
  }) =>
    apiRequest<{ results: BlogPost[]; count: number; next: string | null }>(
      "/blog/posts/",
      { params: params as Record<string, string | number | boolean | undefined> }
    ),

  getPost: (slug: string) =>
    apiRequest<BlogPost>(`/blog/posts/${slug}/`),

  getCategories: () =>
    apiRequest<BlogCategory[]>("/blog/categories/"),

  getRelatedPosts: (slug: string) =>
    apiRequest<BlogPost[]>(`/blog/posts/${slug}/related/`),

  // Admin endpoints
  admin: {
    getAll: () =>
      apiRequest<BlogPost[]>("/blog/admin/"),

    create: (data: FormData | Partial<BlogPost>) =>
      apiRequest<BlogPost>("/blog/admin/", {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),

    update: (id: number, data: FormData | Partial<BlogPost>) =>
      apiRequest<BlogPost>(`/blog/admin/${id}/`, {
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),

    delete: (id: number) =>
      apiRequest<{ message: string }>(`/blog/admin/${id}/`, {
        method: "DELETE",
      }),
  },
};

// Events API
export const eventsApi = {
  getAll: (params?: {
    page?: number;
    category?: string;
    status?: string;
    start_date?: string;
  }) =>
    apiRequest<{ results: Event[]; count: number; next: string | null }>(
      "/events/",
      { params: params as Record<string, string | number | boolean | undefined> }
    ),

  getBySlug: (slug: string) =>
    apiRequest<Event>(`/events/${slug}/`),

  getCategories: () =>
    apiRequest<EventCategory[]>("/events/categories/"),

  register: (eventId: number, data: EventRegistration) =>
    apiRequest<{ confirmation_code: string }>(`/events/${eventId}/register/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin endpoints
  admin: {
    getAll: () =>
      apiRequest<Event[]>("/events/admin/"),

    create: (data: FormData | Partial<Event>) =>
      apiRequest<Event>("/events/admin/", {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),

    update: (id: number, data: FormData | Partial<Event>) =>
      apiRequest<Event>(`/events/admin/${id}/`, {
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),

    delete: (id: number) =>
      apiRequest<{ message: string }>(`/events/admin/${id}/`, {
        method: "DELETE",
      }),
  },
};

// Clinic Staff API (previously doctors - now returns admins)
export const doctorsApi = {
  getAll: () =>
    apiRequest<Doctor[]>("/auth/doctors/"),  // Returns clinic admins

  getById: (id: number) =>
    apiRequest<Doctor>(`/auth/doctors/${id}/`),
};

// Resources API
export const resourcesApi = {
  getAll: () =>
    apiRequest<Resource[]>("/resources/"),

  getBySlug: (slug: string) =>
    apiRequest<Resource>(`/resources/${slug}/`),
};

// Testimonials API
export const testimonialsApi = {
  getAll: (params?: { service_id?: number; featured?: boolean }) =>
    apiRequest<{ count: number; next: string | null; previous: string | null; results: Testimonial[] }>("/services/testimonials/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    apiRequest<{ access: string }>("/auth/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  getMe: () => apiRequest<User>("/auth/me/"),
};

// Types
export interface Service {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  symptoms: string;
  approach: string;
  what_to_expect: string;
  image: string | null;
  icon: string;
  category: ServiceCategory;
  modality: "in_person" | "virtual" | "both";
  duration_minutes: number;
  /** @deprecated Use duration_minutes instead */
  duration?: number;
  price: number | null;
  price_note: string;
  is_featured: boolean;
  is_published: boolean;
  faqs: ServiceFAQ[];
  meta_title: string;
  meta_description: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  service_count: number;
}

export interface ServiceFAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  modality: string[];
}

export interface BookingRequest {
  patient_type: "new" | "returning" | "discovery";
  patient_details: {
    name: string;
    email: string;
    phone: string;
  };
  service_id?: number;
  doctor_id?: number;  // Optional in single-clinic mode
  scheduled_date: string;
  scheduled_time: string;
  modality: "virtual" | "in_person" | "phone";
  timezone: string;
  reason?: string;
  website?: string; // Honeypot field
}

export interface BookingResponse {
  reference_id: string;
  message: string;
  appointment: Appointment;
}

export interface Appointment {
  id: number;
  reference_id: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled" | "confirmed";
  status_display: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_type: string;
  service: Service | null;
  service_title?: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  modality: "virtual" | "in_person" | "phone" | "in-person";
  modality_display: string;
  timezone: string;
  reason: string;
  meeting_link: string;
  is_upcoming: boolean;
  can_cancel: boolean;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  featured_image_alt: string;
  category: BlogCategory;
  tags: BlogTag[];
  author_name: string;
  author_bio: string;
  author_avatar: string | null;
  read_time_minutes: number;
  views: number;
  published_at: string;
  updated_at: string;
  is_featured: boolean;
  is_published: boolean;
  status?: "draft" | "published" | "archived";
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  post_count: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  what_to_expect: string;
  image: string | null;
  video_url: string;
  category: EventCategory;
  host_name: string;
  host_bio: string;
  start_datetime: string;
  end_datetime: string;
  /** @deprecated Use start_datetime instead */
  date?: string;
  /** @deprecated Use start_datetime instead */
  start_time?: string;
  /** @deprecated Use end_datetime instead */
  end_time?: string;
  timezone: string;
  modality: "virtual" | "in_person" | "hybrid";
  /** @deprecated Use modality instead */
  is_virtual?: boolean;
  location: string;
  meeting_link: string;
  speaker?: string;
  is_free: boolean;
  price: number | null;
  max_attendees: number | null;
  current_attendees: number;
  /** @deprecated Use current_attendees instead */
  registered_count?: number;
  spots_left: number | null;
  is_full: boolean;
  can_register: boolean;
  registration_deadline: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled" | "draft" | "published";
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  schema_markup: object;
}

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  event_type: string;
  description: string;
  color: string;
  icon: string;
  event_count: number;
}

export interface EventRegistration {
  name: string;
  email: string;
  phone?: string;
}

export interface Doctor {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  bio: string;
  avatar: string | null;
  specialization: string;
  credentials: string;
}

export interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  file: string | null;
  file_type: string;
  category: string;
  is_published: boolean;
}

export interface Testimonial {
  id: number;
  patient_name: string;
  location: string;
  content: string;
  rating: number;
  service: number | null;
  service_name: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "staff";
  phone: string;
  bio: string;
  avatar: string | null;
  specialization: string;
  credentials: string;
}
