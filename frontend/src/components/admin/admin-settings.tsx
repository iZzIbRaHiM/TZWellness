"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { createClient } from "@/lib/supabase/client";
import { logSettingsUpdate } from "@/lib/admin-activity-logger";
import { Loader2, Save, User, Lock, Settings as SettingsIcon } from "lucide-react";

interface AdminSettingsData {
  maintenance_mode: boolean;
  blog_visibility: boolean;
  event_visibility: boolean;
  appointments_enabled: boolean;
}

export function AdminSettings() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const supabase = createClient();

  // Profile state
  const [fullName, setFullName] = useState(adminUser?.full_name || "");
  const [email, setEmail] = useState(adminUser?.email || "");
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<AdminSettingsData>({
    maintenance_mode: false,
    blog_visibility: true,
    event_visibility: true,
    appointments_enabled: true,
  });
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [isFetchingSettings, setIsFetchingSettings] = useState(true);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("setting_key, setting_value");

        if (error) throw error;

        if (data) {
          const settingsObj: AdminSettingsData = {
            maintenance_mode: false,
            blog_visibility: true,
            event_visibility: true,
            appointments_enabled: true,
          };

          data.forEach((setting) => {
            const key = setting.setting_key as keyof AdminSettingsData;
            if (key === "maintenance_mode") {
              settingsObj[key] = setting.setting_value?.enabled === true;
            } else if (key === "blog_visibility" || key === "event_visibility") {
              settingsObj[key] = setting.setting_value?.public === true;
            } else if (key === "appointments_enabled") {
              settingsObj[key] = setting.setting_value?.enabled === true;
            }
          });

          setSettings(settingsObj);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsFetchingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  // Update profile
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    setIsProfileLoading(true);
    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ full_name: fullName })
        .eq("id", adminUser.id);

      if (error) throw error;

      await logSettingsUpdate(
        adminUser.id,
        "profile",
        { full_name: adminUser.full_name },
        { full_name: fullName }
      );

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Update password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      await logSettingsUpdate(adminUser.id, "password", {}, { changed: true });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Update settings
  const handleSettingChange = async (
    key: keyof AdminSettingsData,
    value: boolean
  ) => {
    if (!adminUser) return;

    const oldValue = settings[key];
    
    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      let settingValue: any;
      if (key === "maintenance_mode" || key === "appointments_enabled") {
        settingValue = { enabled: value };
      } else {
        settingValue = { public: value };
      }

      const { error } = await supabase
        .from("admin_settings")
        .upsert(
          {
            setting_key: key,
            setting_value: settingValue,
            updated_by: adminUser.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "setting_key" }
        );

      if (error) throw error;

      await logSettingsUpdate(adminUser.id, key, oldValue, value);

      toast({
        title: "Setting updated",
        description: `${key.replace(/_/g, " ")} has been ${value ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: oldValue }));
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  if (isFetchingSettings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your admin profile and system settings</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your admin profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your admin password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <Button type="submit" disabled={isPasswordLoading}>
              {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-gray-500">
                Enable maintenance mode to restrict public access
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) =>
                handleSettingChange("maintenance_mode", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Blog Visibility</Label>
              <p className="text-sm text-gray-500">
                Make blog posts visible to public visitors
              </p>
            </div>
            <Switch
              checked={settings.blog_visibility}
              onCheckedChange={(checked) =>
                handleSettingChange("blog_visibility", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Event Visibility</Label>
              <p className="text-sm text-gray-500">
                Make events visible to public visitors
              </p>
            </div>
            <Switch
              checked={settings.event_visibility}
              onCheckedChange={(checked) =>
                handleSettingChange("event_visibility", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointments Enabled</Label>
              <p className="text-sm text-gray-500">
                Allow users to book appointments
              </p>
            </div>
            <Switch
              checked={settings.appointments_enabled}
              onCheckedChange={(checked) =>
                handleSettingChange("appointments_enabled", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
