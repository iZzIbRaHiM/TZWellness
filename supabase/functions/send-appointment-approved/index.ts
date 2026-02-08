// ============================================
// SEND APPOINTMENT APPROVED EMAIL
// ============================================
// 
// Deploy: supabase functions deploy send-appointment-approved
// Invoke: POST /functions/v1/send-appointment-approved
//
// Triggered when admin approves an appointment
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const { appointment_id } = await req.json()

    if (!appointment_id) {
      return new Response(
        JSON.stringify({ error: 'appointment_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch appointment details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(
          title,
          duration_minutes
        )
      `)
      .eq('id', appointment_id)
      .single()

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Appointment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate meeting link for virtual appointments
    let meeting_link = appointment.meeting_link
    if (appointment.modality === 'virtual' && !meeting_link) {
      meeting_link = `https://meet.tzwellness.com/${appointment.reference_id.toLowerCase()}`
      
      // Update appointment with meeting link
      await supabase
        .from('appointments')
        .update({ meeting_link })
        .eq('id', appointment_id)
    }

    // Send approval email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'TZ Wellness <noreply@tz-wellness-health.vercel.app>',
      to: [appointment.patient_email],
      subject: `✓ Appointment Confirmed - ${appointment.reference_id}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmed</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB; }
              .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0 0 10px 0; font-size: 32px; }
              .badge { display: inline-block; background: #10B981; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; margin-bottom: 20px; }
              .info-box { background: #F0FDF4; border-left: 4px solid #064E3B; padding: 20px; margin: 25px 0; border-radius: 4px; }
              .info-box p { margin: 12px 0; font-size: 15px; }
              .info-box strong { color: #064E3B; display: inline-block; min-width: 120px; }
              .meeting-link { display: block; text-align: center; margin: 30px 0; }
              .meeting-link a { display: inline-block; background: #064E3B; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background 0.3s; }
              .meeting-link a:hover { background: #065F46; }
              .instructions { background: #FFFBEB; border: 1px solid #FCD34D; padding: 20px; border-radius: 8px; margin: 25px 0; }
              .instructions h3 { margin-top: 0; color: #92400E; }
              .instructions ul { margin: 10px 0; padding-left: 20px; }
              .instructions li { margin: 8px 0; color: #78350F; }
              .location-box { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 20px; border-radius: 8px; margin: 25px 0; }
              .location-box p { margin: 5px 0; }
              .footer { text-align: center; padding: 30px; background: #F9FAFB; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px; }
              .footer a { color: #064E3B; text-decoration: none; }
              .actions { text-align: center; margin: 30px 0; padding-top: 20px; border-top: 1px solid #E5E7EB; }
              .button { display: inline-block; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 8px; font-size: 14px; }
              .button-primary { background: #064E3B; color: white; }
              .button-secondary { background: white; color: #064E3B; border: 2px solid #064E3B; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✓ Appointment Confirmed</h1>
                <div class="badge">APPROVED</div>
              </div>
              
              <div class="content">
                <p class="greeting">Hi <strong>${appointment.patient_name}</strong>,</p>
                
                <p>Great news! Your appointment has been confirmed by our team. We look forward to helping you on your wellness journey.</p>
                
                <div class="info-box">
                  <p><strong>Reference ID:</strong> ${appointment.reference_id}</p>
                  <p><strong>Service:</strong> ${appointment.service?.title || 'Wellness Session'}</p>
                  <p><strong>Date:</strong> ${new Date(appointment.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Time:</strong> ${appointment.scheduled_time}</p>
                  <p><strong>Duration:</strong> ${appointment.service?.duration_minutes || appointment.duration_minutes || 60} minutes</p>
                  <p><strong>Type:</strong> ${appointment.modality === 'virtual' ? '💻 Virtual (Online)' : appointment.modality === 'in_person' ? '🏥 In-Person' : '📞 Phone Call'}</p>
                </div>

                ${appointment.modality === 'virtual' ? `
                  <div class="meeting-link">
                    <a href="${meeting_link}">Join Virtual Session</a>
                  </div>
                  <p style="text-align: center; color: #6B7280; font-size: 14px;">
                    Meeting link: <a href="${meeting_link}" style="color: #064E3B;">${meeting_link}</a>
                  </p>
                ` : ''}

                ${appointment.modality === 'in_person' ? `
                  <div class="location-box">
                    <h3 style="margin-top: 0; color: #1E40AF;">📍 Location</h3>
                    <p><strong>TZ Wellness Center</strong></p>
                    <p>123 Health Street, Suite 200</p>
                    <p>Wellness City, WC 12345</p>
                    <p style="margin-top: 12px;">
                      <a href="https://maps.google.com/?q=TZ+Wellness+Center" style="color: #1E40AF; text-decoration: none;">
                        Get Directions →
                      </a>
                    </p>
                  </div>
                ` : ''}

                ${appointment.modality === 'phone' ? `
                  <div class="info-box">
                    <p><strong>📞 Phone:</strong> ${appointment.patient_phone}</p>
                    <p style="color: #6B7280; font-size: 14px; margin-top: 8px;">
                      We'll call you at this number at the scheduled time.
                    </p>
                  </div>
                ` : ''}

                <div class="instructions">
                  <h3>📋 Before Your Appointment:</h3>
                  <ul>
                    ${appointment.modality === 'in_person' ? '<li>Please arrive 10-15 minutes early</li>' : ''}
                    ${appointment.modality === 'virtual' ? '<li>Test your internet connection and camera</li>' : ''}
                    ${appointment.modality === 'virtual' ? '<li>Find a quiet, private space for the session</li>' : ''}
                    <li>Have your medical history and current medications ready</li>
                    <li>Write down any questions or concerns you'd like to discuss</li>
                    <li>Bring a valid ID and insurance information (if applicable)</li>
                  </ul>
                </div>

                <div class="actions">
                  <a href="https://tz-wellness-health.vercel.app/appointments/lookup?ref=${appointment.reference_id}" class="button button-primary">
                    View Appointment
                  </a>
                  <a href="https://tz-wellness-health.vercel.app/appointments/lookup" class="button button-secondary">
                    Manage Appointments
                  </a>
                </div>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
                  Need to reschedule or cancel? Use your reference ID <strong>${appointment.reference_id}</strong> to manage your appointment.
                </p>
              </div>
              
              <div class="footer">
                <p><strong>TZ Wellness Health</strong></p>
                <p>Nurturing Our Health Through Metabolic Care</p>
                <p style="margin-top: 15px;">
                  <a href="https://tz-wellness-health.vercel.app">Visit Website</a> • 
                  <a href="mailto:support@tzwellness.com">Contact Support</a>
                </p>
                <p style="margin-top: 15px; font-size: 12px;">
                  © ${new Date().getFullYear()} TZ Wellness. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Resend API Error:', emailError)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update confirmation_sent flag
    await supabase
      .from('appointments')
      .update({ confirmation_sent: true })
      .eq('id', appointment_id)

    return new Response(
      JSON.stringify({ success: true, email_id: emailData?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
