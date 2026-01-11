// ============================================
// SEND BOOKING CONFIRMATION EMAIL
// ============================================
// 
// Deploy: supabase functions deploy send-booking-confirmation
// Invoke: POST /functions/v1/send-booking-confirmation
//
// Triggered when appointment status changes to 'approved'
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// CORS headers - Allow all origins for Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { appointment } = await req.json()

    const { data, error } = await resend.emails.send({
      from: 'TZ Wellness <noreply@tzwellness.com>',
      to: [appointment.patient_email],
      subject: `Appointment Confirmed - ${appointment.reference_id}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmed</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #ffffff; border: 1px solid #E5E7EB; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
              .badge { display: inline-block; background: #10B981; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; }
              .info-box { background: #F9FAFB; border-left: 4px solid #064E3B; padding: 16px; margin: 20px 0; }
              .info-box p { margin: 8px 0; }
              .info-box strong { color: #064E3B; display: inline-block; min-width: 140px; }
              .meeting-link { display: inline-block; background: #064E3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #6B7280; font-size: 14px; }
              .button { display: inline-block; background: #064E3B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
              .actions { text-align: center; margin: 30px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✓ Appointment Confirmed</h1>
              <div class="badge">APPROVED</div>
            </div>
            
            <div class="content">
              <p>Hi <strong>${appointment.patient_name}</strong>,</p>
              
              <p>Great news! Your appointment has been confirmed. We look forward to seeing you.</p>
              
              <div class="info-box">
                <p><strong>Reference ID:</strong> ${appointment.reference_id}</p>
                <p><strong>Service:</strong> ${appointment.service_name || 'N/A'}</p>
                <p><strong>Date:</strong> ${new Date(appointment.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${appointment.scheduled_time}</p>
                <p><strong>Duration:</strong> ${appointment.duration_minutes} minutes</p>
                <p><strong>Modality:</strong> ${appointment.modality === 'virtual' ? '💻 Virtual (Online)' : appointment.modality === 'in_person' ? '🏥 In-Person' : '📞 Phone Call'}</p>
              </div>

              ${appointment.modality === 'virtual' && appointment.meeting_link ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appointment.meeting_link}" class="meeting-link">Join Virtual Session</a>
                </div>
              ` : ''}

              ${appointment.modality === 'in_person' ? `
                <div class="info-box">
                  <p><strong>Location:</strong><br>
                  TZ Wellness Center<br>
                  123 Health Street, Suite 200<br>
                  Wellness City, WC 12345</p>
                </div>
              ` : ''}

              <h3>Before Your Appointment:</h3>
              <ul>
                <li>Please arrive 10 minutes early for in-person appointments</li>
                <li>For virtual appointments, test your internet connection</li>
                <li>Have your medical history and current medications ready</li>
                <li>Write down any questions you'd like to discuss</li>
              </ul>

              <div class="actions">
                <a href="https://tzwellness.com/appointments/lookup?ref=${appointment.reference_id}" class="button">View Appointment</a>
                <a href="https://tzwellness.com/appointments/cancel?ref=${appointment.reference_id}" style="background: #EF4444;" class="button">Cancel Appointment</a>
              </div>

              <p><strong>Need to reschedule?</strong><br>
              Please cancel this appointment and book a new time that works for you.</p>
            </div>
            
            <div class="footer">
              <p>TZ Wellness | Holistic Mental Health & Wellbeing</p>
              <p>📧 <a href="mailto:support@tzwellness.com">support@tzwellness.com</a> | 📞 (555) 123-4567</p>
              <p style="font-size: 12px; color: #9CA3AF; margin-top: 10px;">
                You're receiving this because you booked an appointment with TZ Wellness.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
