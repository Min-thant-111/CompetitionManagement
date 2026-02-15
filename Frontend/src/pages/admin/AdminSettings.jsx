import { useState } from "react";
import { 
  Settings, Shield, Bell, Database, Users, Mail,
  Save, RefreshCw, AlertTriangle
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "AcademiX",
    siteDescription: "Academic Competition Management Platform",
    
    // Notification Settings
    emailNotifications: true,
    approvalNotifications: true,
    deadlineReminders: true,
    reminderDays: "3",
    
    // Moderation Settings
    autoFlagThreshold: "3",
    requireApprovalForExternal: true,
    allowStudentCreatedCompetitions: true,
    
    // Points Settings
    firstPlacePoints: "500",
    secondPlacePoints: "350",
    thirdPlacePoints: "200",
    participationPoints: "50",
    
    // Social Settings
    enableSocialFeed: true,
    enableComments: true,
    enableLikes: true,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    toast.info("Settings reset to defaults");
  };

  return (
    <AppLayout role="admin">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              System Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure platform behavior and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* General Settings */}
        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-semibold text-lg">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-semibold text-lg">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Approval Notifications</p>
                <p className="text-sm text-muted-foreground">Notify students when proofs are approved/rejected</p>
              </div>
              <Switch
                checked={settings.approvalNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, approvalNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Deadline Reminders</p>
                <p className="text-sm text-muted-foreground">Send reminders before submission deadlines</p>
              </div>
              <Switch
                checked={settings.deadlineReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, deadlineReminders: checked }))}
              />
            </div>

            {settings.deadlineReminders && (
              <div className="pl-4 border-l-2 border-secondary/20">
                <Label htmlFor="reminderDays">Days before deadline</Label>
                <Select 
                  value={settings.reminderDays}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, reminderDays: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-semibold text-lg">Moderation Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="autoFlagThreshold">Auto-flag threshold (reports)</Label>
              <Input
                id="autoFlagThreshold"
                type="number"
                className="w-40"
                value={settings.autoFlagThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, autoFlagThreshold: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Posts with this many reports will be auto-flagged for review
              </p>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Require Approval for External Proofs</p>
                <p className="text-sm text-muted-foreground">All external competition proofs must be approved by admin</p>
              </div>
              <Switch
                checked={settings.requireApprovalForExternal}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireApprovalForExternal: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Allow Student-Created Competitions</p>
                <p className="text-sm text-muted-foreground">Students can report their own external competition participation</p>
              </div>
              <Switch
                checked={settings.allowStudentCreatedCompetitions}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowStudentCreatedCompetitions: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Points Configuration */}
        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-semibold text-lg">Merit Points Configuration</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="firstPlace">1st Place</Label>
              <Input
                id="firstPlace"
                type="number"
                value={settings.firstPlacePoints}
                onChange={(e) => setSettings(prev => ({ ...prev, firstPlacePoints: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="secondPlace">2nd Place</Label>
              <Input
                id="secondPlace"
                type="number"
                value={settings.secondPlacePoints}
                onChange={(e) => setSettings(prev => ({ ...prev, secondPlacePoints: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="thirdPlace">3rd Place</Label>
              <Input
                id="thirdPlace"
                type="number"
                value={settings.thirdPlacePoints}
                onChange={(e) => setSettings(prev => ({ ...prev, thirdPlacePoints: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="participation">Participation</Label>
              <Input
                id="participation"
                type="number"
                value={settings.participationPoints}
                onChange={(e) => setSettings(prev => ({ ...prev, participationPoints: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Social Settings */}
        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-semibold text-lg">Social Feed Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Enable Social Feed</p>
                <p className="text-sm text-muted-foreground">Show achievement posts in the social feed</p>
              </div>
              <Switch
                checked={settings.enableSocialFeed}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSocialFeed: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Enable Comments</p>
                <p className="text-sm text-muted-foreground">Allow students to comment on posts</p>
              </div>
              <Switch
                checked={settings.enableComments}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableComments: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Enable Likes</p>
                <p className="text-sm text-muted-foreground">Allow students to like posts</p>
              </div>
              <Switch
                checked={settings.enableLikes}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableLikes: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-static p-6 border-destructive/30">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-display font-semibold text-lg text-destructive">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Clear All Cache</p>
                <p className="text-sm text-muted-foreground">Clear system cache and refresh all data</p>
              </div>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                Clear Cache
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Reset Leaderboards</p>
                <p className="text-sm text-muted-foreground">Reset all leaderboard data (irreversible)</p>
              </div>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
