import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { cn } from "@/lib/utils";

const AdminLanguageSwitcher = () => {
  const { language, setLanguage, t } = useAdminLanguage();

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
        {t.language.en}
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
        {t.language.bn}
      </button>
    </div>
  );
};

export default AdminLanguageSwitcher;