import { useState } from "react";
import { Save, User, Clock, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "@/types/Task";

interface SettingsPageProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
}

export const SettingsPage = ({ settings, onUpdateSettings }: SettingsPageProps) => {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
  };

  const handleInputChange = (field: keyof Settings, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">Settings</h1>
          <p className="text-xl text-muted-foreground">
            Customize your Pomodoro experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card-glow p-8 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Personal Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="card-glow p-8 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Timer Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="pomodoroLength" className="text-sm font-medium">
                  Pomodoro Length (minutes)
                </Label>
                <Input
                  id="pomodoroLength"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.pomodoroLength}
                  onChange={(e) => handleInputChange('pomodoroLength', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shortBreakLength" className="text-sm font-medium">
                  Short Break (minutes)
                </Label>
                <Input
                  id="shortBreakLength"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.shortBreakLength}
                  onChange={(e) => handleInputChange('shortBreakLength', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="longBreakLength" className="text-sm font-medium">
                  Long Break (minutes)
                </Label>
                <Input
                  id="longBreakLength"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.longBreakLength}
                  onChange={(e) => handleInputChange('longBreakLength', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="card-glow p-8 rounded-xl border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <Coffee className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Break Information</h2>
            </div>
            
            <div className="text-muted-foreground space-y-2">
              <p>• Every 4 completed pomodoros triggers a long break</p>
              <p>• Short breaks happen between individual pomodoro sessions</p>
              <p>• Take your breaks seriously - they help maintain focus!</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};