/**
 * Admin Activity Logger
 * Logs all admin actions to activity_logs table
 */

import { createClient } from "@/lib/supabase/client";

export type ActionType =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive";

export type EntityType =
  | "blog_post"
  | "blog_category"
  | "event"
  | "event_category"
  | "appointment"
  | "service"
  | "service_category"
  | "settings"
  | "admin_user";

interface LogActivityParams {
  adminId: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log an admin activity to the database
 */
export async function logAdminActivity({
  adminId,
  actionType,
  entityType,
  entityId,
  description,
  metadata = {},
}: LogActivityParams): Promise<boolean> {
  try {
    const supabase = createClient();

    // Get IP address and user agent from browser
    const ipAddress = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip)
      .catch(() => null);

    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : null;

    const { error } = await supabase.from("activity_logs").insert({
      admin_id: adminId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId || null,
      description,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error("Failed to log activity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Activity logging error:", error);
    return false;
  }
}

/**
 * Helper functions for common activities
 */

export async function logLogin(adminId: string, email: string) {
  return logAdminActivity({
    adminId,
    actionType: "login",
    entityType: "admin_user",
    entityId: adminId,
    description: `Admin logged in: ${email}`,
    metadata: { email },
  });
}

export async function logLogout(adminId: string, email: string) {
  return logAdminActivity({
    adminId,
    actionType: "logout",
    entityType: "admin_user",
    entityId: adminId,
    description: `Admin logged out: ${email}`,
    metadata: { email },
  });
}

export async function logBlogCreate(adminId: string, blogId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "create",
    entityType: "blog_post",
    entityId: blogId,
    description: `Created blog post: ${title}`,
    metadata: { title },
  });
}

export async function logBlogUpdate(adminId: string, blogId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "update",
    entityType: "blog_post",
    entityId: blogId,
    description: `Updated blog post: ${title}`,
    metadata: { title },
  });
}

export async function logBlogDelete(adminId: string, blogId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "delete",
    entityType: "blog_post",
    entityId: blogId,
    description: `Deleted blog post: ${title}`,
    metadata: { title },
  });
}

export async function logBlogPublish(adminId: string, blogId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "publish",
    entityType: "blog_post",
    entityId: blogId,
    description: `Published blog post: ${title}`,
    metadata: { title },
  });
}

export async function logEventCreate(adminId: string, eventId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "create",
    entityType: "event",
    entityId: eventId,
    description: `Created event: ${title}`,
    metadata: { title },
  });
}

export async function logEventUpdate(adminId: string, eventId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "update",
    entityType: "event",
    entityId: eventId,
    description: `Updated event: ${title}`,
    metadata: { title },
  });
}

export async function logEventDelete(adminId: string, eventId: string, title: string) {
  return logAdminActivity({
    adminId,
    actionType: "delete",
    entityType: "event",
    entityId: eventId,
    description: `Deleted event: ${title}`,
    metadata: { title },
  });
}

export async function logAppointmentDelete(
  adminId: string,
  appointmentId: string,
  patientName: string
) {
  return logAdminActivity({
    adminId,
    actionType: "delete",
    entityType: "appointment",
    entityId: appointmentId,
    description: `Deleted appointment for: ${patientName}`,
    metadata: { patientName },
  });
}

export async function logSettingsUpdate(
  adminId: string,
  settingKey: string,
  oldValue: any,
  newValue: any
) {
  return logAdminActivity({
    adminId,
    actionType: "update",
    entityType: "settings",
    description: `Updated setting: ${settingKey}`,
    metadata: { settingKey, oldValue, newValue },
  });
}
