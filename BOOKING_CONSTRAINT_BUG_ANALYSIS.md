## 🔍 BOOKING CONSTRAINT ERROR - ROOT CAUSE ANALYSIS

### Error Message
```
new row for relation "appointments" violates check constraint 
"appointments_patient_type_check"
```

---

## 🐛 ROOT CAUSE

### The Problem
The booking form allows users to select from **3 patient types**:
1. "new"
2. "returning" 
3. "discovery" ← **THIS IS THE BUG**

But the database only accepts **2 values**:
```sql
-- Line 121 in all_querries.sql
patient_type VARCHAR(20) DEFAULT 'new' CHECK (patient_type IN ('new', 'returning'))
```

### The Mismatch

**Frontend (`frontend/src/lib/store.ts` line 4):**
```typescript
export type PatientType = "new" | "returning" | "discovery";  // ❌ 3 values
```

**Backend (all_querries.sql line 121):**
```sql
CHECK (patient_type IN ('new', 'returning'))  -- ✅ Only 2 values
```

---

## 📊 WHERE THE BUG OCCURS

### Step 2: Patient Type Selection
The booking wizard Step 2 (StepIdentity) lets users choose:
- ✅ New Patient
- ✅ Returning Patient
- ❌ Discovery Call → **stores as "discovery" (NOT ALLOWED)**

### Step 5: Booking Submission
When user submits, `step-details.tsx` line 113 sends:
```typescript
const bookingData = {
  // ...
  patient_type: patientType || 'new',  // Could be "discovery" ❌
  // ...
};
```

The appointment API (line 593 in api.ts) inserts directly:
```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert([{
    ...bookingData,  // ← patient_type = "discovery" ❌
    status: 'pending',
  }])
```

PostgreSQL rejects because "discovery" violates the constraint!

---

## 🔗 THE CODE CHAIN

```
StepIdentity (Step 2)
    ↓
User selects "Discovery Call"
    ↓
useBookingStore.setPatientType("discovery")
    ↓
StepModality (Step 3)
    ↓
(Modality selection doesn't change patientType - still "discovery")
    ↓
StepDetails (Step 5)
    ↓
appointmentsApi.book({
    patient_type: "discovery"  // ❌ NOT IN DATABASE CONSTRAINT
})
    ↓
PostgreSQL: CHECK (patient_type IN ('new', 'returning'))
    ↓
ERROR: "discovery" is not allowed!
```

---

## ✅ THE FIX (3 Options)

### Option 1: Remove "discovery" from Frontend (RECOMMENDED)
- Delete "discovery" from PatientType in store.ts
- Update StepIdentity component to only show "New" and "Returning"
- Add logic: if user selects phone modality, treat as "new" patient

### Option 2: Add "discovery" to Database
- Update constraint: `CHECK (patient_type IN ('new', 'returning', 'discovery'))`
- Would require new migration

### Option 3: Map "discovery" to Database Values
- Keep "discovery" in frontend
- Before saving, map: `"discovery" → "new"`
- Discovery calls are always phone consultations with new patients anyway

---

## 🎯 RECOMMENDED FIX

**Use Option 1 + handle discovery call logic:**

1. Remove "discovery" from `PatientType` type
2. In StepIdentity, show only "New Patient" and "Returning Patient"
3. Move discovery call selection logic:
   - Ask modality first
   - If user picks "Phone" → suggest it's for "Discovery Call"
   - Default patient_type to "new"

This way:
- Frontend: 3 consultation types (Virtual, In-Person, Phone)
- Database: 2 patient types (New, Returning)
- Phone consultations are marked as "new" patients (first call)

---

## 📁 FILES TO CHECK/MODIFY

1. **frontend/src/lib/store.ts** (line 4)
   - Change: `export type PatientType = "new" | "returning" | "discovery";`
   - To: `export type PatientType = "new" | "returning";`

2. **frontend/src/components/booking/steps/step-identity.tsx**
   - Remove discovery call option
   - Or move it to Step 3 (modality)

3. **frontend/src/lib/api.ts** (line 18)
   - Update: `patient_type: 'new' | 'returning' | 'discovery'`
   - To: `patient_type: 'new' | 'returning'`

4. **all_querries.sql** (line 121)
   - Keep as-is (no change needed to database)

---

## 🧪 WHY THIS HAPPENS

The original Django backend had 3 patient types, but when migrating to Supabase:
- Frontend types were copied as-is
- Database constraint was defined with only 2 types
- **The mismatch wasn't caught until user tried booking with "discovery" type**

This is why "Your Laptop" works - if you didn't select "Discovery Call" (only "New" or "Returning"), the booking succeeds!

---

## ✨ PREVENTION

Add this validation before insertion (in step-details.tsx):
```typescript
if (!['new', 'returning'].includes(patientType)) {
  console.error(`Invalid patient type: ${patientType}`);
  // Fall back to 'new'
  patientType = 'new';
}
```

This would catch the mismatch client-side before sending to backend.
