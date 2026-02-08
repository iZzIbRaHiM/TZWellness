"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { adminSettingsApi, type AdminSettings } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { 
  User, 
  Bell, 
  Settings as SettingsIcon, 
  Clock, 
  Building2, 
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabType = "profile" | "notifications" | "system" | "business" | "clinic";

export function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await adminSettingsApi.get();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        throw new Error(response.error?.message || "Failed to load settings");
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await adminSettingsApi.update(settings);
      if (response.success && response.data) {
        setSettings(response.data);
        setHasChanges(false);
        toast({
          title: "Settings saved",
          description: "Your settings have been updated successfully.",
        });
      } else {
        throw new Error(response.error?.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof AdminSettings>(field: K, value: AdminSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const updateBusinessHours = (day: string, field: string, value: any) => {
    if (!settings || !settings.business_hours) return;
    setSettings({
      ...settings,
      business_hours: {
        ...settings.business_hours,
        [day]: {
          ...settings.business_hours[day],
          [field]: value,
        },
      },
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">Manage your profile and system preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Clock className="h-4 w-4" />
            Business Hours
          </TabsTrigger>
          <TabsTrigger value="clinic" className="gap-2">
            <Building2 className="h-4 w-4" />
            Clinic Info
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={settings.full_name || ""}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="A brief description about yourself"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what updates you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notifications">WhatsApp Notifications</Label>
                  <p className="text-sm text-gray-500">Receive WhatsApp notifications for important updates</p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => updateField("email_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appointment_notifications">Appointment Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about new and updated appointments</p>
                </div>
                <Switch
                  id="appointment_notifications"
                  checked={settings.appointment_notifications}
                  onCheckedChange={(checked) => updateField("appointment_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event_notifications">Event Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about new event registrations</p>
                </div>
                <Switch
                  id="event_notifications"
                  checked={settings.event_notifications}
                  onCheckedChange={(checked) => updateField("event_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="blog_notifications">Blog Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about blog comments and interactions</p>
                </div>
                <Switch
                  id="blog_notifications"
                  checked={settings.blog_notifications}
                  onCheckedChange={(checked) => updateField("blog_notifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_online_booking">Enable Online Booking</Label>
                  <p className="text-sm text-gray-500">Allow patients to book appointments online</p>
                </div>
                <Switch
                  id="enable_online_booking"
                  checked={settings.enable_online_booking}
                  onCheckedChange={(checked) => updateField("enable_online_booking", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require_appointment_approval">Require Approval</Label>
                  <p className="text-sm text-gray-500">New appointments require admin approval</p>
                </div>
                <Switch
                  id="require_appointment_approval"
                  checked={settings.require_appointment_approval}
                  onCheckedChange={(checked) => updateField("require_appointment_approval", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_send_confirmations">Auto-send Confirmations</Label>
                  <p className="text-sm text-gray-500">Automatically send WhatsApp confirmations</p>
                </div>
                <Switch
                  id="auto_send_confirmations"
                  checked={settings.auto_send_confirmations}
                  onCheckedChange={(checked) => updateField("auto_send_confirmations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_send_reminders">Auto-send Reminders</Label>
                  <p className="text-sm text-gray-500">Automatically send appointment reminders</p>
                </div>
                <Switch
                  id="auto_send_reminders"
                  checked={settings.auto_send_reminders}
                  onCheckedChange={(checked) => updateField("auto_send_reminders", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_hours_before">Reminder Hours Before</Label>
                <Input
                  id="reminder_hours_before"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.reminder_hours_before}
                  onChange={(e) => updateField("reminder_hours_before", parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">Send reminders this many hours before appointments</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_appointments_per_day">Max Appointments Per Day</Label>
                <Input
                  id="max_appointments_per_day"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.max_appointments_per_day}
                  onChange={(e) => updateField("max_appointments_per_day", parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">Maximum number of appointments allowed per day</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_buffer_minutes">Booking Buffer (minutes)</Label>
                <Input
                  id="booking_buffer_minutes"
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={settings.booking_buffer_minutes}
                  onChange={(e) => updateField("booking_buffer_minutes", parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500">Buffer time between appointments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your clinic's operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.business_hours && Object.entries(settings.business_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label className="capitalize">{day}</Label>
                  </div>
                  <Switch
                    checked={hours.enabled}
                    onCheckedChange={(checked) => updateBusinessHours(day, "enabled", checked)}
                  />
                  {hours.enabled && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateBusinessHours(day, "open", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateBusinessHours(day, "close", e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                  {!hours.enabled && (
                    <span className="text-gray-400 italic w-64 text-center">Closed</span>
                  )}
                </div>
              ))}
              {!settings.business_hours && (
                <p className="text-gray-500 text-center py-4">Loading business hours...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Info Tab */}
        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>Update your clinic's contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={settings.clinic_name}
                  onChange={(e) => updateField("clinic_name", e.target.value)}
                  placeholder="TZ Wellness"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_email">Clinic Email</Label>
                <Input
                  id="clinic_email"
                  type="email"
                  value={settings.clinic_email}
                  onChange={(e) => updateField("clinic_email", e.target.value)}
                  placeholder="contact@tzwellness.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_phone">Clinic Phone</Label>
                <Input
                  id="clinic_phone"
                  type="tel"
                  value={settings.clinic_phone}
                  onChange={(e) => updateField("clinic_phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Textarea
                  id="clinic_address"
                  value={settings.clinic_address || ""}
                  onChange={(e) => updateField("clinic_address", e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-white border border-emerald-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
          <div className="text-sm">
            <p className="font-medium text-gray-900">You have unsaved changes</p>
            <p className="text-gray-500">Don't forget to save your settings</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Now
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
