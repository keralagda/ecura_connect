
/**
 * Pabbly Connect Integration Service
 * This service handles sending appointment data to a Pabbly Webhook.
 * From Pabbly, you can route this to WhatsApp Cloud API, Twilio, or other services.
 */

import { Appointment, Clinic } from '../types';

// NOTE: Replace this with your actual Pabbly Webhook URL obtained from your Pabbly dashboard
const PABBLY_WEBHOOK_URL = "https://connect.pabbly.com/workflow/sendwebhookdata/YOUR_UNIQUE_ID";

export async function sendBookingToPabbly(appointment: Appointment, clinic: Clinic) {
  const doctor = clinic.doctors.find(d => d.id === appointment.doctorId);
  
  // Structured payload for easy mapping in Pabbly
  const payload = {
    source: "Ecura Connect CMS",
    event_type: "new_appointment",
    appointment_id: appointment.id,
    clinic_name: clinic.name,
    clinic_location: clinic.location,
    doctor_name: doctor?.name || "Unassigned",
    patient_name: appointment.patientName,
    patient_phone: appointment.patientPhone,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    reason: appointment.reason,
    created_at: new Date(appointment.createdAt).toISOString(),
    status: appointment.status
  };

  try {
    console.log("Triggering Pabbly Webhook...", payload);
    const response = await fetch(PABBLY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Pabbly Webhook failed with status: ${response.status}`);
    }

    return { success: true, data: await response.json().catch(() => ({})) };
  } catch (error) {
    console.error("Error sending to Pabbly:", error);
    return { success: false, error };
  }
}