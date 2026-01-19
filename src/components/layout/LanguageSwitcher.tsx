import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'pill';
  /** When true, uses colors suitable for dark backgrounds like the topbar */
  invertColors?: boolean;
}

const LanguageSwitcher = ({ className, variant = 'default', invertColors = false }: LanguageSwitcherProps) => {
  const { language, setLanguage, languageNames } = useLanguage();

  // Pill variant - modern toggle switch style
  if (variant === 'pill') {
    return (
      <div className={cn(
        "relative inline-flex items-center p-1 rounded-full",
        invertColors 
          ? "bg-white/10 backdrop-blur-sm border border-white/20" 
          : "bg-muted border border-border",
        className
      )}>
        {/* Sliding background indicator */}
        <motion.div
          className={cn(
            "absolute top-1 bottom-1 rounded-full",
            invertColors ? "bg-white/25" : "bg-primary"
          )}
          initial={false}
          animate={{
            left: language === 'en' ? '4px' : '50%',
            right: language === 'bn' ? '4px' : '50%',
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
        
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            "relative z-10 px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200",
            language === 'en'
              ? invertColors ? "text-white" : "text-primary-foreground"
              : invertColors ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Switch to English"
          aria-pressed={language === 'en'}
        >
          EN
        </button>
        
        <button
          onClick={() => setLanguage('bn')}
          className={cn(
            "relative z-10 px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 font-siliguri",
            language === 'bn'
              ? invertColors ? "text-white" : "text-primary-foreground"
              : invertColors ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="বাংলায় পরিবর্তন করুন"
          aria-pressed={language === 'bn'}
        >
          বাং
        </button>
      </div>
    );
  }

  // Compact variant - for mobile header
  if (variant === 'compact') {
    return (
      <button
        onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
        className={cn(
          "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium",
          "transition-all duration-200",
          invertColors
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            : "bg-accent/10 hover:bg-accent/20 text-foreground border border-accent/30",
          className
        )}
        aria-label={language === 'en' ? "বাংলায় পরিবর্তন করুন" : "Switch to English"}
      >
        <Globe className="h-3.5 w-3.5" />
        <AnimatePresence mode="wait">
          <motion.span
            key={language}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(language === 'bn' && "font-siliguri")}
          >
            {language === 'en' ? 'বাং' : 'EN'}
          </motion.span>
        </AnimatePresence>
      </button>
    );
  }

  // Default variant - for topbar with improved styling
  return (
    <div className={cn(
      "flex items-center gap-1 p-1 rounded-lg",
      invertColors 
        ? "bg-white/10 backdrop-blur-sm" 
        : "bg-muted/50",
      className
    )}>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "relative px-3 py-1 text-sm font-medium rounded-md transition-all duration-200",
          language === 'en'
            ? invertColors 
              ? "bg-white/20 text-white shadow-sm" 
              : "bg-background text-foreground shadow-sm"
            : invertColors 
              ? "text-white/70 hover:text-white hover:bg-white/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        <span className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          EN
        </span>
      </button>
      
      <button
        onClick={() => setLanguage('bn')}
        className={cn(
          "relative px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 font-siliguri",
          language === 'bn'
            ? invertColors 
              ? "bg-white/20 text-white shadow-sm" 
              : "bg-background text-foreground shadow-sm"
            : invertColors 
              ? "text-white/70 hover:text-white hover:bg-white/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label="বাংলায় পরিবর্তন করুন"
        aria-pressed={language === 'bn'}
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageSwitcher;
