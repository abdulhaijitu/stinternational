import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

interface AdminLanguageSwitcherProps {
  variant?: "default" | "compact";
}

const AdminLanguageSwitcher = ({ variant = "default" }: AdminLanguageSwitcherProps) => {
  const { language, setLanguage, t } = useAdminLanguage();

  const enLabel = t.language?.en || "EN";
  const bnLabel = t.language?.bn || "বাংলা";

  // Compact variant: text-only EN | বাংলা
  if (variant === "compact") {
    return (
      <div className="flex items-center text-sm">
        <button
          onClick={() => setLanguage("en")}
          className={cn(
            "px-2 py-1 font-medium transition-colors",
            language === "en"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {enLabel}
        </button>
        <span className="text-muted-foreground/50">|</span>
        <button
          onClick={() => setLanguage("bn")}
          className={cn(
            "px-2 py-1 font-medium transition-colors font-siliguri",
            language === "bn"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {bnLabel}
        </button>
      </div>
    );
  }

  // Default variant with border
  return (
    <div className="flex items-center border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors",
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {enLabel}
      </button>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={() => setLanguage("bn")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors font-siliguri",
          language === "bn"
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {bnLabel}
      </button>
    </div>
  );
};

export default AdminLanguageSwitcher;