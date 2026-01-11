// ============================================
// SEND APPOINTMENT REJECTION EMAIL
// ============================================
// 
// Deploy: supabase functions deploy send-rejection-email
// Invoke: POST /functions/v1/send-rejection-email
//
// Triggered when appointment status changes to 'rejected'
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
      subject: `Appointment Update - ${appointment.reference_id}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Update</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #ffffff; border: 1px solid #E5E7EB; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
              .badge { display: inline-block; background: #EF4444; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; }
              .info-box { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; margin: 20px 0; }
              .info-box p { margin: 8px 0; }
              .info-box strong { color: #DC2626; display: inline-block; min-width: 140px; }
              .button { display: inline-block; background: #064E3B; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
              .actions { text-align: center; margin: 30px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #6B7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Appointment Update</h1>
              <div class="badge">UNAVAILABLE</div>
            </div>
            
            <div class="content">
              <p>Hi <strong>${appointment.patient_name}</strong>,</p>
              
              <p>Thank you for your interest in TZ Wellness. Unfortunately, we're unable to confirm your requested appointment at this time.</p>
              
              <div class="info-box">
                <p><strong>Reference ID:</strong> ${appointment.reference_id}</p>
                <p><strong>Requested Date:</strong> ${new Date(appointment.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Requested Time:</strong> ${appointment.scheduled_time}</p>
                <p><strong>Service:</strong> ${appointment.service_name || 'N/A'}</p>
              </div>

              ${appointment.admin_notes ? `
                <div class="info-box">
                  <p><strong>Reason:</strong><br>
                  ${appointment.admin_notes}</p>
                </div>
              ` : ''}

              <h3>What's Next?</h3>
              <p>We understand this may be disappointing. Here are your options:</p>
              
              <ul>
                <li><strong>Book Another Time:</strong> Check our available slots and select a different date/time</li>
                <li><strong>Contact Us Directly:</strong> Call us at (555) 123-4567 for personalized scheduling assistance</li>
                <li><strong>Join Waitlist:</strong> Get notified when new slots open up</li>
              </ul>

              <div class="actions">
                <a href="https://tzwellness.com/appointments" class="button">View Available Times</a>
                <a href="https://tzwellness.com/contact" style="background: #6B7280;" class="button">Contact Support</a>
              </div>

              <p>We apologize for any inconvenience and look forward to serving you soon.</p>
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
