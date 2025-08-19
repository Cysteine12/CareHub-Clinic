import { sendEmail } from '../config/email.js'
import config from '../config/config.js'
import type { Appointment, AppointmentPurpose } from '@prisma/client'
import type { AppointmentSchedule } from '../cron-job.js'
import { formatInTimeZone } from 'date-fns-tz'

const sendWelcomeMail = async (email: string, firstName: string) => {
  return await sendEmail({
    to: email,
    subject: `Welcome to ${config.APP_NAME}!`,
    html: `
      <h3>Hey ${firstName},</h3>
      <div>
        Welcome to ${config.APP_NAME}. It's great to meet you!
        ${config.APP_NAME} is your trusted clinic for best in class health services. We specialize in providing premium care,
          reliability, hospitality and standard treatment at all times.
        <br/><br/>
        Your email has been confirmed and we are glad to have you with us.
        <br/><br/>
        Here are some of our services:
        <ul>
          <li>✔ Round-the-Clock Availability</li>
          <li>✔ Top Professional Health Providers</li>
          <li>✔ Standard & Modern Care Facilities</li>
          <li>✔ Satisfactory Patient Hospitality</li>
          <li>✔ Cheap & Reasonable Payment Services</li>
        </ul>
        <br/><br/>
        To know more about our services:
        <a href="${config.ORIGIN_URL}" 
          style="text-align:center;background:#4f5ddb;color:#fff;padding:6px 10px;font-size:16px;border-radius:3px;"
        >
          Explore
        </a>
      </div>
      <br/>
      Warm Regards,<br/>
      ${config.APP_NAME} Team.
    `,
  })
}

const sendEmailVerificationRequestMail = async (
  user: { email: string; first_name?: string },
  otp: string
) => {
  return await sendEmail({
    to: user.email,
    subject: 'Confirm your email address',
    html: `
      <h3>Hello, ${user.first_name || ''}</h3>
      <div>
        There's one quick step you need to complete for creating an account. 
        Let's make sure this is the right email address for you - 
        please confirm that this is the right address to use for your new account.
        Kindly use this OTP to get started on ${config.APP_NAME}:
        <br/><br/>
        <span style="margin:auto;background:#fff;color:#000;padding:6px 10px;font-size:30px;border-radius:3px;font-weight:bold;">
          ${otp}
        </span>
        <br/><br/>
        This OTP expires after 15 minutes. Only enter this code on our official website.
        Don't share it with anyone. We'll never ask for it outside our official website.
      </div>
      <br/>
      Warm Regards,
      <br/>
      ${config.APP_NAME} Team.
    `,
  })
}

const sendForgotPasswordMail = async (email: string, otp: string) => {
  return await sendEmail({
    to: email,
    subject: `${config.APP_NAME} Account Password Reset`,
    html: `
      <h3>Dear valued user,</h3>
      You are receiving this email because you requested a password reset.
      Please use the following one-time password to reset your password:
        <br/><br/>
        <span style="margin:auto;background:#fff;color:#000;padding:6px 10px;font-size:30px;border-radius:3px;font-weight:bold;">
          ${otp}
        </span>
      <br/><br/>
      If you did not request this, kindly ignore.
      <br/><br/>
      Thanks,
      <br/>
      ${config.APP_NAME} Team.
    `,
  })
}

const sendPasswordChangedMail = async (email: string, first_name: string) => {
  return await sendEmail({
    to: email,
    subject: 'Your account password was changed!',
    html: `
      <h3>Hey ${first_name},</h3>
      <div>
        Please be informed that your user account password has been updated.
        <br/><br/>
        If this activity wasn't performed by you, please revoke the account password immediately.
        <br/><br/>
        <a href="${config.ORIGIN_URL}/profile/change-password" 
          style="text-align:center;background:#4f5ddb;color:#fff;padding:6px 10px;font-size:16px;border-radius:3px;"
        >
          Change Password
        </a>
      </div>
      <br/>
      Warm Regards, 
      <br/>
      ${config.APP_NAME} Team.
    `,
  })
}

const sendAppointmentScheduledMail = async (
  patient: { email: string; first_name: string },
  schedule: AppointmentSchedule
) => {
  return await sendEmail({
    to: patient.email,
    subject: 'Your appointment request is now scheduled',
    html: `
      <h3>Dear ${patient.first_name},</h3>
      <div>
        This is to inform you that your appointment request has been scheduled for: 
        <br/><br/>
        <li>
          ${formatInTimeZone(schedule.date, 'Africa/Lagos', 'do MMMM, yyyy')}
        </li>
        <li>
          ${schedule.time}
        </li>

        If this appointment schedule is no longer possible, please feel free to reschedule or cancel here:
        <br/><br/>
        <a href="${config.ORIGIN_URL}/appointments" 
          style="text-align:center;background:#4f5ddb;color:#fff;padding:6px 10px;font-size:16px;border-radius:3px;"
        >
          View appointment
        </a>
      </div>
      <br/>
      Warm Regards, 
      <br/>
      ${config.APP_NAME} Team.
    `,
  })
}

const sendAppointmentReminderMail = async (
  appointment: Appointment,
  patient: { email: string; first_name: string }
) => {
  return await sendEmail({
    to: patient.email,
    subject: 'Upcoming appointment reminder',
    html: `
      <h3>Dear ${patient.first_name},</h3>
      <div>
        This is a friendly reminder for your ${
          appointment.purposes.length > 0 ? appointment.purposes.join() : ''
        } appointment coming up:
        <br/><br/>
        <li>
          ${(appointment.schedule as AppointmentSchedule).date}
        </li>
        <li>
          ${(appointment.schedule as AppointmentSchedule).time}
        </li>

        If this appointment schedule is no longer possible, please feel free to reschedule or cancel here:
        <br/><br/>
        <a href="${config.ORIGIN_URL}/appointments" 
          style="text-align:center;background:#4f5ddb;color:#fff;padding:6px 10px;font-size:16px;border-radius:3px;"
        >
          Update appointment
        </a>
      </div>
      <br/>
      Warm Regards, 
      <br/>
      ${config.APP_NAME} Team.
    `,
  })
}

const sendAppointmentResheduleRequestMail = async (
  appointment: { schedule: unknown; purposes: AppointmentPurpose[] },
  patient: { email: string; first_name: string }
) => {
  return await sendEmail({
    to: patient.email,
    subject: 'Reschedule your missed appointment',
    html: `
      <h3>Dear ${patient.first_name},</h3>
      <div>
        You missed your ${
          appointment.purposes.length > 0 ? appointment.purposes.join() : ''
        } appointment today scheduled at:
        <br/><br/>
        <li>
          ${(appointment.schedule as AppointmentSchedule).date}
        </li>
        <li>
          ${(appointment.schedule as AppointmentSchedule).time}
        </li>

        If you would like to reschedule this appointment, please feel free to reschedule here:
        <br/><br/>
        <a href="${config.ORIGIN_URL}/appointments" 
          style="text-align:center;background:#4f5ddb;color:#fff;padding:6px 10px;font-size:16px;border-radius:3px;"
        >
          Reschedule appointment
        </a>
      </div>
      <br/>
      Warm Regards, 
      <br/>
      ${config.APP_NAME} Team.
    `,
  })
}

export default {
  sendWelcomeMail,
  sendEmailVerificationRequestMail,
  sendForgotPasswordMail,
  sendPasswordChangedMail,
  sendAppointmentScheduledMail,
  sendAppointmentReminderMail,
  sendAppointmentResheduleRequestMail,
}
