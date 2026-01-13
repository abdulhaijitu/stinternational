import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { adminEn } from "@/lib/translations/admin-en";
import { adminBn } from "@/lib/translations/admin-bn";

type AdminLanguage = "en" | "bn";
type AdminTranslations = typeof adminEn;

interface AdminLanguageContextType {
  language: AdminLanguage;
  setLanguage: (lang: AdminLanguage) => void;
  t: AdminTranslations;
  isLoading: boolean;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export const AdminLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<AdminLanguage>("en");
  const [isLoading, setIsLoading] = useState(true);

  // Load admin preference from database
  useEffect(() => {
    const loadPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("admin_preferences")
          .select("language")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          setLanguageState(data.language as AdminLanguage);
        }
      } catch (err) {
        console.error("Error loading admin language preference:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user]);

  // Save preference to database
  const setLanguage = useCallback(async (lang: AdminLanguage) => {
    setLanguageState(lang);

    if (!user) return;

    try {
      const { error } = await supabase
        .from("admin_preferences")
        .upsert(
          { user_id: user.id, language: lang },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Error saving admin language preference:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, [user]);

  const t: AdminTranslations = language === "bn" ? (adminBn as unknown as AdminTranslations) : adminEn;

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = () => {
  const context = useContext(AdminLanguageContext);
  if (context === undefined) {
    throw new Error("useAdminLanguage must be used within an AdminLanguageProvider");
  }
  return context;
};