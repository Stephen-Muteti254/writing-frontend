import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const notificationSettings = [
  {
    id: "orders",
    label: "Order Notifications",
    description: "Get notified about new orders and updates",
    enabled: true
  },
  {
    id: "messages", 
    label: "Message Notifications",
    description: "Get notified when you receive new messages",
    enabled: true
  },
  {
    id: "payments",
    label: "Payment Notifications", 
    description: "Get notified about payments and withdrawals",
    enabled: true
  },
  {
    id: "reviews",
    label: "Review Notifications",
    description: "Get notified when clients leave reviews",
    enabled: false
  },
  {
    id: "marketing",
    label: "Marketing Updates",
    description: "Get notified about platform updates and promotions",
    enabled: false
  }
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState(notificationSettings);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <div className="space-y-6 px-4 lg:px-6 py-4 lg:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification Settings</h1>
          <p className="text-muted-foreground">Manage your notification preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex-1">
                <Label htmlFor={setting.id} className="text-base font-medium">
                  {setting.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {setting.description}
                </p>
              </div>
              <Switch
                id={setting.id}
                checked={setting.enabled}
                onCheckedChange={() => toggleSetting(setting.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
