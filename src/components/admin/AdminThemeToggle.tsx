import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminTheme } from "@/contexts/AdminThemeContext";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const AdminThemeToggle = () => {
  const { theme, toggleTheme } = useAdminTheme();
  const { t, language } = useAdminLanguage();

  const label = theme === "dark" 
    ? (t.theme?.lightMode || "Light Mode")
    : (t.theme?.darkMode || "Dark Mode");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={label}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className={cn(language === "bn" && "font-siliguri")}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};