// ============================================
// SEND PENDING APPOINTMENT NOTIFICATION
// ============================================
// 
// Deploy: supabase functions deploy send-pending-notification
// Invoke: POST /functions/v1/send-pending-notification
//
// Triggered immediately after guest creates an appointment
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      subject: `Appointment Request Received - ${appointment.reference_id}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Request Received</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #ffffff; border: 1px solid #E5E7EB; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
              .badge { display: inline-block; background: #F59E0B; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; }
              .info-box { background: #F0F9FF; border-left: 4px solid #0284C7; padding: 16px; margin: 20px 0; }
              .info-box p { margin: 8px 0; }
              .info-box strong { color: #0284C7; display: inline-block; min-width: 140px; }
              .warning-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; }
              .button { display: inline-block; background: #0284C7; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #6B7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✉️ Request Received</h1>
              <div class="badge">PENDING REVIEW</div>
            </div>
            
            <div class="content">
              <p>Hi <strong>${appointment.patient_name}</strong>,</p>
              
              <p>Thank you for booking with TZ Wellness! We've received your appointment request and will review it shortly.</p>
              
              <div class="info-box">
                <p><strong>Reference ID:</strong> ${appointment.reference_id}</p>
                <p><strong>Service:</strong> ${appointment.service_name || 'N/A'}</p>
                <p><strong>Requested Date:</strong> ${new Date(appointment.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Requested Time:</strong> ${appointment.scheduled_time}</p>
                <p><strong>Duration:</strong> ${appointment.duration_minutes} minutes</p>
                <p><strong>Modality:</strong> ${appointment.modality === 'virtual' ? '💻 Virtual (Online)' : appointment.modality === 'in_person' ? '🏥 In-Person' : '📞 Phone Call'}</p>
              </div>

              <div class="warning-box">
                <p><strong>⏳ What Happens Next?</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Our team will review your request within 24 hours</li>
                  <li>You'll receive a confirmation email once approved</li>
                  <li>If the slot is unavailable, we'll suggest alternatives</li>
                </ul>
              </div>

              <h3>Save Your Reference ID:</h3>
              <p>Use <strong>${appointment.reference_id}</strong> to check your appointment status or make changes.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://tzwellness.com/appointments/lookup?ref=${appointment.reference_id}" class="button">Track Status</a>
                <a href="https://tzwellness.com/appointments/cancel?ref=${appointment.reference_id}" style="background: #EF4444;" class="button">Cancel Request</a>
              </div>

              <h3>Questions?</h3>
              <p>If you have any questions or need immediate assistance, please contact us:</p>
              <ul>
                <li>📧 Email: <a href="mailto:support@tzwellness.com">support@tzwellness.com</a></li>
                <li>📞 Phone: (555) 123-4567</li>
                <li>💬 Live Chat: Available on our website</li>
              </ul>

              <p>We appreciate your patience and look forward to serving you soon!</p>
            </div>
            
            <div class="footer">
              <p>TZ Wellness | Holistic Mental Health & Wellbeing</p>
              <p>📧 <a href="mailto:support@tzwellness.com">support@tzwellness.com</a> | 📞 (555) 123-4567</p>
              <p style="font-size: 12px; color: #9CA3AF; margin-top: 10px;">
                You're receiving this because you requested an appointment with TZ Wellness.
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
