import * as z from "zod";

export const personalSchema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(11, "Phone is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "NULL"], "Gender is required"),
  address: z.string().min(1, "Address is required"),
  occupation: z.string().optional(),
  emergency_contact_name: z
    .string()
    .min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact is required"),
  blood_group: z.string().min(1, "Blood group is required"),
  allergies: z.string().optional(),
  insurance_coverage: z.string().min(1, "Insurance coverage is required"),
  insurance_provider_id: z.string().optional(),
});

export const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const fullSchema = personalSchema.extend(passwordSchema.shape);
export type FormData = z.infer<typeof fullSchema>;

const isEmail = (val: string) => {
  const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(val);
};

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").refine(isEmail, {
    message: "Enter a valid email",
  }),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    otp: z.string().min(1, "OTP is required"),
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const appointmentSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  purpose: z.string().min(1, "Purpose is required"),
  status: z.string().min(1, "Status is required"),
  insurance: z.string().min(1, "Insurance Coverage is required"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const AppointmentPurpose = {
  ROUTINE_HEALTH_CHECKUP: "ROUTINE HEALTH CHECKUP",
  MATERNAL_CHILD_HEALTH: "MATERNAL & CHILD HEALTH",
  IMMUNIZATIONS_AND_VACCINATIONS: "IMMUNIZATIONS AND VACCINATIONS",
  FAMILY_PLANNING: "FAMILY PLANNING",
  HIV_AIDS_COUNSELING_AND_TESTING: "HIV AIDS COUNSELING AND TESTING",
  TUBERCULOSIS_SCREENING_AND_TREATMENT: "TUBERCULOSIS SCREENING AND TREATMENT",
  MEDICAL_CONSULTATION_AND_TREATMENT: "MEDICAL CONSULTATION AND TREATMENT",
  NUTRITION_COUNSELING_AND_SUPPORT: "NUTRITION COUNSELING AND SUPPORT",
  CHRONIC_DISEASE_MANAGEMENT: "CHRONIC DISEASE MANAGEMENT",
  MENTAL_HEALTH_SUPPORT_OR_COUNSELING: "MENTAL HEALTH SUPPORT OR COUNSELING",
  HEALTH_EDUCATION_AND_AWARENESS: "HEALTH EDUCATION AND AWARENESS",
  ANTENATAL_OR_POSTNATAL_CARE: "ANTENATAL OR POSTNATAL CARE",
  SEXUAL_AND_REPRODUCTIVE_HEALTH_SERVICES:
    "SEXUAL AND REPRODUCTIVE HEALTH SERVICES",
  MALARIA_DIAGNOSIS_AND_TREATMENT: "MALARIA DIAGNOSIS AND TREATMENT",
  HEALTH_SCREENING_CAMPAIGNS: "HEALTH SCREENING CAMPAIGNS",
  DRUG_OR_SUBSTANCE_ABUSE_COUNSELING: "DRUG OR SUBSTANCE ABUSE COUNSELING",
  FOLLOWUP_APPOINTMENT: "FOLLOWUP APPOINTMENT",
  DENTAL_CARE: "DENTAL CARE",
  REFERRAL: "REFERRAL",
  OTHERS: "OTHERS",
} as const;

export type AppointmentPurpose =
  (typeof AppointmentPurpose)[keyof typeof AppointmentPurpose];

export const appointmentPurposes = Object.values(AppointmentPurpose);

export const getWeekdays = (): string[] => {
  const today = new Date();
  const day = today.getDay(); // 0 (Sun) to 6 (Sat)
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7)); // Move to Monday

  const weekdays = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    weekdays.push(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }

  return weekdays;
};

export const timeSlots: string[] = Array.from({ length: 20 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const date = new Date();
  date.setHours(hour, Number(minute));
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});
