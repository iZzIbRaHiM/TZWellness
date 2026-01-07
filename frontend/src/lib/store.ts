import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PatientType = "new" | "returning" | "discovery";
export type Modality = "virtual" | "in_person" | "phone";

export interface PatientDetails {
  name: string;
  email: string;
  phone: string;
}

export interface BookingState {
  // Current step (1-6)
  step: number;
  maxStep: number;

  // Step 1: Service Selection
  serviceId: string | null;
  serviceName: string | null;

  // Step 2: Patient Type
  patientType: PatientType | null;

  // Step 3: Modality
  modality: Modality | null;

  // Step 4: Date & Time
  doctorId: number | null;
  doctorName: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  timezone: string;

  // Step 5: Patient Details
  patientDetails: PatientDetails;
  reason: string;
  honeypot: string; // Bot detection

  // Step 6: Confirmation
  referenceId: string | null;
  isSubmitting: boolean;
  error: string | null;

  // Metadata
  _lastUpdated: number;
  _version: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPatientType: (type: PatientType) => void;
  setModality: (modality: Modality) => void;
  setService: (id: string | null, name: string | null) => void;
  setDoctor: (id: number, name: string) => void;
  setDateTime: (date: string, time: string) => void;
  setPatientDetails: (details: Partial<PatientDetails>) => void;
  setReason: (reason: string) => void;
  setHoneypot: (value: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  setReferenceId: (id: string) => void;
  reset: () => void;
  canProceed: () => boolean;
  validateState: () => boolean;
}

// Version for state migration
const STORE_VERSION = 1;

// Max age for persisted state (24 hours)
const MAX_STATE_AGE_MS = 24 * 60 * 60 * 1000;

// Helper to get current timezone (safely for SSR)
function getCurrentTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Create fresh initial state (called on each reset to get fresh timezone)
function createInitialState() {
  return {
    step: 1,
    maxStep: 1,
    patientType: null,
    modality: null,
    serviceId: null,
    serviceName: null,
    doctorId: null,
    doctorName: null,
    selectedDate: null,
    selectedTime: null,
    timezone: getCurrentTimezone(),
    patientDetails: {
      name: "",
      email: "",
      phone: "",
    },
    reason: "",
    honeypot: "",
    referenceId: null,
    isSubmitting: false,
    error: null,
    _lastUpdated: Date.now(),
    _version: STORE_VERSION,
  };
}

// Validate step transitions
function isValidStepTransition(currentStep: number, newStep: number, state: BookingState): boolean {
  // Can always go back
  if (newStep < currentStep) return true;
  
  // Can only go forward if current step is complete
  if (newStep > currentStep + 1) return false;
  
  // Validate current step before proceeding
  switch (currentStep) {
    case 1:
      return state.serviceId !== null;
    case 2:
      return state.patientType !== null;
    case 3:
      return state.modality !== null;
    case 4:
      return !!(
        state.selectedDate &&
        state.selectedTime &&
        /^\d{2}:\d{2}(:\d{2})?$/.test(state.selectedTime)
      );
    case 5:
      return (
        state.patientDetails.name.trim().length > 0 &&
        state.patientDetails.email.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.patientDetails.email) &&
        state.patientDetails.phone.trim().length >= 10
      );
    case 6:
      return state.referenceId !== null;
    default:
      return false;
  }
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setStep: (step) => {
        const state = get();
        // Validate step transition
        if (step >= 1 && step <= 6 && isValidStepTransition(state.step, step, state)) {
          set({
            step,
            maxStep: Math.max(state.maxStep, step),
            _lastUpdated: Date.now(),
          });
        }
      },

      nextStep: () => {
        const state = get();
        if (state.step < 6 && isValidStepTransition(state.step, state.step + 1, state)) {
          set({
            step: state.step + 1,
            maxStep: Math.max(state.maxStep, state.step + 1),
            _lastUpdated: Date.now(),
          });
        }
      },

      prevStep: () =>
        set((state) => ({
          step: Math.max(state.step - 1, 1),
          _lastUpdated: Date.now(),
        })),

      setPatientType: (patientType) =>
        set({ patientType, _lastUpdated: Date.now() }),

      setModality: (modality) =>
        set({ modality, _lastUpdated: Date.now() }),

      setService: (serviceId, serviceName) =>
        set({ serviceId, serviceName, _lastUpdated: Date.now() }),

      setDoctor: (doctorId, doctorName) =>
        set({ doctorId, doctorName, _lastUpdated: Date.now() }),

      setDateTime: (selectedDate, selectedTime) =>
        set({ selectedDate, selectedTime, _lastUpdated: Date.now() }),

      setPatientDetails: (details) =>
        set((state) => ({
          patientDetails: { ...state.patientDetails, ...details },
          _lastUpdated: Date.now(),
        })),

      setReason: (reason) =>
        set({ reason, _lastUpdated: Date.now() }),

      setHoneypot: (honeypot) =>
        set({ honeypot, _lastUpdated: Date.now() }),

      setSubmitting: (isSubmitting) =>
        set({ isSubmitting, _lastUpdated: Date.now() }),

      setError: (error) =>
        set({ error, _lastUpdated: Date.now() }),

      setReferenceId: (referenceId) =>
        set({ referenceId, _lastUpdated: Date.now() }),

      // Reset with fresh initial state (including fresh timezone)
      reset: () => set(createInitialState()),

      canProceed: () => {
        const state = get();
        switch (state.step) {
          case 1:
            return state.serviceId !== null;
          case 2:
            return state.patientType !== null;
          case 3:
            return state.modality !== null;
          case 4:
            // Must have both date AND time selected with valid format
            return !!(
              state.selectedDate &&
              state.selectedTime &&
              state.selectedTime.trim().length > 0 &&
              /^\d{2}:\d{2}(:\d{2})?$/.test(state.selectedTime)
            );
          case 5:
            return (
              state.patientDetails.name.trim() !== "" &&
              state.patientDetails.email.trim() !== "" &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.patientDetails.email) &&
              state.patientDetails.phone.trim().length >= 10
            );
          case 6:
            return state.referenceId !== null;
          default:
            return false;
        }
      },

      // Validate entire state consistency
      validateState: () => {
        const state = get();
        
        // Check version
        if (state._version !== STORE_VERSION) {
          return false;
        }
        
        // Check age
        if (Date.now() - state._lastUpdated > MAX_STATE_AGE_MS) {
          return false;
        }
        
        // Step must match data presence
        if (state.step > 1 && !state.serviceId) return false;
        if (state.step > 2 && !state.patientType) return false;
        if (state.step > 3 && !state.modality) return false;
        if (state.step > 4 && (!state.selectedDate || !state.selectedTime)) return false;
        
        return true;
      },
    }),
    {
      name: "tf-wellfare-booking",
      version: STORE_VERSION,
      storage: createJSONStorage(() => {
        // SSR-safe localStorage access
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        // Only persist these fields for recovery
        patientType: state.patientType,
        modality: state.modality,
        serviceId: state.serviceId,
        serviceName: state.serviceName,
        doctorId: state.doctorId,
        doctorName: state.doctorName,
        patientDetails: state.patientDetails,
        reason: state.reason,
        step: state.step,
        maxStep: state.maxStep,
        _lastUpdated: state._lastUpdated,
        _version: state._version,
      }),
      // Handle rehydration with validation
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Validate rehydrated state
        const isValid = state.validateState();
        
        if (!isValid) {
          // Reset to initial state if invalid or stale
          console.info("[BookingStore] Purging stale/invalid persisted state");
          state.reset();
          return;
        }
        
        // Update timezone on rehydration (user may have changed timezone)
        const currentTz = getCurrentTimezone();
        if (state.timezone !== currentTz) {
          state.timezone = currentTz;
        }
      },
      // Migration for version changes
      migrate: (persistedState: unknown, version: number) => {
        if (version < STORE_VERSION) {
          // Old version - return fresh state
          return createInitialState();
        }
        return persistedState as BookingState;
      },
    }
  )
);

// Auth store
interface AuthState {
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (access: string, refresh: string) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
  syncFromStorage: () => void;
}

// Helper for SSR-safe localStorage
function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken) => {
        // Sync to localStorage for API client
        safeSetStorage("accessToken", accessToken);
        safeSetStorage("refreshToken", refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        // Clear localStorage
        safeRemoveStorage("accessToken");
        safeRemoveStorage("refreshToken");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Sync state from localStorage (useful after token refresh)
      syncFromStorage: () => {
        const accessToken = safeGetStorage("accessToken");
        const refreshToken = safeGetStorage("refreshToken");
        const currentState = get();
        
        if (accessToken !== currentState.accessToken || refreshToken !== currentState.refreshToken) {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: !!accessToken,
          });
        }
      },
    }),
    {
      name: "tf-wellfare-auth",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Don't persist tokens in the zustand store - they're already in localStorage
      // This prevents double-storage and sync issues
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Sync tokens from localStorage on rehydration
        state.syncFromStorage();
      },
    }
  )
);

// UI store
interface UIState {
  isBookingModalOpen: boolean;
  isMobileMenuOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isBookingModalOpen: false,
  isMobileMenuOpen: false,
  setBookingModalOpen: (isBookingModalOpen) => set({ isBookingModalOpen }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
}));
