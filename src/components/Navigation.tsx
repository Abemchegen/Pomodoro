import { Home, Timer, CheckSquare, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Accordion } from "@radix-ui/react-accordion";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "pomodoro", label: "Timer", icon: Timer },
    { id: "completed", label: "Completed", icon: CheckSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const isMobile = useIsMobile();

  const [menu, setMenu] = useState(false);

  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Timer className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-gradient">Focus Flow</h1>
          </div>

          {!isMobile && (
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-4 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {isMobile && <Menu onClick={() => setMenu(true)} />}

          {menu && (
            <div className="fixed right-1 top-1 bg-black z-10 flex justify-end">
              <div className="bg-card w-64 h-full shadow-lg p-4 flex flex-col">
                <button
                  className="self-end mb-4"
                  onClick={() => setMenu(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className="justify-start w-full mb-2 hover:bg-muted"
                    onClick={() => {
                      onNavigate(item.id);
                      setMenu(false);
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
