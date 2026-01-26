/**
 * WhatsApp utility functions for generating links and messages
 */

/**
 * Converts a tel: href to WhatsApp number format
 * @param phoneHref - Phone href like "tel:+923325858314"
 * @returns WhatsApp number like "923325858314"
 */
export function getWhatsAppNumber(phoneHref?: string): string {
  if (!phoneHref) return "";
  return phoneHref.replace(/^tel:\+?/, "").replace(/\D/g, "");
}

/**
 * Creates a WhatsApp link with optional pre-filled message
 * @param phoneHref - Phone href from settings
 * @param message - Optional pre-filled message
 * @returns WhatsApp web URL
 */
export function getWhatsAppLink(phoneHref?: string, message?: string): string {
  const number = getWhatsAppNumber(phoneHref);
  if (!number) return "#";
  
  const baseUrl = `https://wa.me/${number}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

/**
 * Generates WhatsApp message for appointment confirmation
 * @param referenceId - Appointment reference number
 * @returns Pre-filled message string
 */
export function getAppointmentWhatsAppMessage(referenceId: string): string {
  return `Hi! I have a question about my appointment (Reference: ${referenceId}). Please assist me.`;
}

/**
 * Generates WhatsApp message for general inquiry
 * @returns Pre-filled message string
 */
export function getGeneralInquiryMessage(): string {
  return "Hi! I'd like to inquire about your services. Please guide me.";
}

/**
 * Generates WhatsApp message for package inquiry
 * @param packageName - Name of the package
 * @returns Pre-filled message string
 */
export function getPackageInquiryMessage(packageName: string): string {
  return `Hi! I'm interested in "${packageName}". It'd be great if you'd guide me more.`;
}

/**
 * Generates WhatsApp message for service inquiry
 * @param serviceName - Name of the service
 * @returns Pre-filled message string
 */
export function getServiceInquiryMessage(serviceName: string): string {
  return `Hi! I'm interested in your "${serviceName}" service. Could you provide more details?`;
}

/**
 * Generates WhatsApp message for event registration
 * @param eventTitle - Title of the event
 * @returns Pre-filled message string
 */
export function getEventInquiryMessage(eventTitle: string): string {
  return `Hi! I'm interested in registering for "${eventTitle}". Please share more details.`;
}
