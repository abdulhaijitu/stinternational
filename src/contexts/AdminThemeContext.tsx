import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Theme = "light" | "dark";

interface AdminThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const AdminThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from database
  useEffect(() => {
    const loadPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("admin_preferences")
          .select("dark_mode")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          const savedTheme = data.dark_mode ? "dark" : "light";
          setThemeState(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (err) {
        console.error("Error loading admin theme preference:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Save preference to database
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    if (!user) return;

    try {
      const { error } = await supabase
        .from("admin_preferences")
        .upsert(
          { user_id: user.id, dark_mode: newTheme === "dark" },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Error saving admin theme preference:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, [user]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLoading }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = (): AdminThemeContextType => {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    // Fallback for edge cases
    return {
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      isLoading: true,
    };
  }
  return context;
};
