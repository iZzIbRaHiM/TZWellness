// ============================================
// SEND EVENT REGISTRATION CONFIRMATION
// ============================================
// 
// Deploy: supabase functions deploy send-event-confirmation
// Invoke: POST /functions/v1/send-event-confirmation
//
// Triggered when user registers for an event
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { registration, event } = await req.json()

    const { data, error } = await resend.emails.send({
      from: 'TZ Wellness Events <events@tzwellness.com>',
      to: [registration.email],
      subject: `Event Registration Confirmed - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Registration Confirmed</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #ffffff; border: 1px solid #E5E7EB; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
              .badge { display: inline-block; background: #10B981; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 10px 0; }
              .event-card { background: #F9FAFB; border: 2px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .event-card h2 { margin: 0 0 10px 0; color: #064E3B; }
              .event-card p { margin: 8px 0; }
              .event-card strong { color: #064E3B; display: inline-block; min-width: 120px; }
              .join-button { display: inline-block; background: #7C3AED; color: white; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; font-size: 16px; }
              .info-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #6B7280; font-size: 14px; }
              .calendar-button { display: inline-block; background: #6B7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 You're Registered!</h1>
              <div class="badge">CONFIRMED</div>
            </div>
            
            <div class="content">
              <p>Hi <strong>${registration.name}</strong>,</p>
              
              <p>Your registration for our event has been confirmed. We're excited to have you join us!</p>
              
              <div class="event-card">
                <h2>${event.title}</h2>
                <p>${event.description || ''}</p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;">
                <p><strong>📅 Date:</strong> ${new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>🕐 Time:</strong> ${new Date(event.start_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</p>
                <p><strong>⏱️ Duration:</strong> ${Math.round((new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) / 60000)} minutes</p>
                <p><strong>📍 Location:</strong> ${event.modality === 'virtual' ? '💻 Virtual (Online)' : event.modality === 'in_person' ? '🏢 ' + (event.location_name || 'In-Person') : '🔀 Hybrid'}</p>
                ${event.current_participants && event.max_participants ? `
                  <p><strong>👥 Capacity:</strong> ${event.current_participants} / ${event.max_participants} registered</p>
                ` : ''}
              </div>

              ${event.virtual_link ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${event.virtual_link}" class="join-button">Join Virtual Event</a>
                  <p style="font-size: 14px; color: #6B7280;">Link will be active 15 minutes before start time</p>
                </div>
              ` : ''}

              ${event.modality === 'in_person' && event.location_address ? `
                <div class="info-box">
                  <p><strong>📍 Event Location:</strong><br>
                  ${event.location_name ? event.location_name + '<br>' : ''}
                  ${event.location_address}</p>
                </div>
              ` : ''}

              ${event.what_to_bring ? `
                <h3>What to Bring:</h3>
                <p>${event.what_to_bring}</p>
              ` : ''}

              <h3>Add to Calendar:</h3>
              <div style="text-align: center;">
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(event.end_date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description || '')}" class="calendar-button">Google Calendar</a>
                <a href="https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${new Date(event.start_date).toISOString()}&enddt=${new Date(event.end_date).toISOString()}" class="calendar-button">Outlook</a>
              </div>

              <div class="info-box">
                <p><strong>⚠️ Important:</strong> You'll receive a reminder email 24 hours before the event. If you need to cancel, please do so at least 48 hours in advance.</p>
              </div>

              <p>Looking forward to seeing you there!</p>
            </div>
            
            <div class="footer">
              <p>TZ Wellness | Holistic Mental Health & Wellbeing</p>
              <p>📧 <a href="mailto:events@tzwellness.com">events@tzwellness.com</a> | 📞 (555) 123-4567</p>
              <p style="font-size: 12px; color: #9CA3AF; margin-top: 10px;">
                You're receiving this because you registered for an event with TZ Wellness.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
