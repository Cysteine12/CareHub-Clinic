export type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  insurance_provider_id?: string;
};

export type AppointmentProvider = {
  appointment_id?: string;
  provider_id?: string;
  provider: Provider;
};

export type Appointment = {
  id: string;
  patient: Patient;
  purposes: string[];
  other_purpose: string;
  status:
    | "SUBMITTED"
    | "CONFIRMED"
    | "CANCELLED"
    | "COMPLETED"
    | "SCHEDULED"
    | "ATTENDING";
  has_insurance: boolean;
  is_follow_up_required: boolean;
  follow_up_id: string | null;
  schedule: {
    schedule_count: number;
    appointment_date: string;
    appointment_time: string;
  };
  vitals_id: string | null;
  created_at: string;
  updated_at: string;
  appointment_providers: AppointmentProvider[];
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

export type Provider = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_title: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export const formatPurposeText = (purposes: string[]): string => {
  return purposes
    .map((purpose) =>
      purpose
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    )
    .join(", ");
};

export function formatTimeToAmPm(time24: string): string {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12; // convert 0 -> 12 and 13..23 -> 1..11
  return `${hour}:${minute} ${ampm}`;
}

export const formatDateParts = (isoDate: string) => {
  const date = new Date(isoDate);

  const day = date.getDate(); // e.g., 1
  const month = date.toLocaleString("en-US", { month: "short" }); // e.g., "Aug"

  return { day, month };
};

export const providerRoles = new Set([
  "GENERAL_PRACTIONER",
  "NURSE",
  "PHARMACIST",
  "LAB_TECHNICIAN",
  "PAEDIATRICIAN",
  "GYNAECOLOGIST",
]);
