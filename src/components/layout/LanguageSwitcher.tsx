import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
  /** When true, uses colors suitable for dark backgrounds like the topbar */
  invertColors?: boolean;
}

const LanguageSwitcher = ({ className, variant = 'default', invertColors = false }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  // Compact variant — single toggle button for mobile header
  if (variant === 'compact') {
    return (
      <button
        onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
        className={cn(
          "relative h-8 px-2.5 rounded-md text-xs font-medium transition-all duration-200",
          "border",
          invertColors
            ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
            : "border-border bg-background hover:bg-muted text-foreground",
          className
        )}
        aria-label={language === 'en' ? "বাংলায় পরিবর্তন করুন" : "Switch to English"}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={language}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(language !== 'en' && "font-siliguri")}
          >
            {language === 'en' ? 'বাং' : 'EN'}
          </motion.span>
        </AnimatePresence>
      </button>
    );
  }

  // Default variant — shadcn Toggle-style segmented control for desktop topbar
  return (
    <div className={cn(
      "relative inline-flex items-center h-8 p-0.5 rounded-md border",
      invertColors
        ? "border-white/20 bg-white/10 backdrop-blur-sm"
        : "border-border bg-muted/50",
      className
    )}>
      {/* Sliding indicator */}
      <motion.div
        className={cn(
          "absolute top-0.5 bottom-0.5 rounded-[5px]",
          invertColors ? "bg-white/20" : "bg-primary"
        )}
        initial={false}
        animate={{
          left: language === 'en' ? '2px' : '50%',
          right: language === 'bn' ? '2px' : '50%',
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "relative z-10 px-3 h-full text-xs font-medium rounded-[5px] transition-colors duration-200",
          language === 'en'
            ? invertColors ? "text-white" : "text-primary-foreground"
            : invertColors ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>

      <button
        onClick={() => setLanguage('bn')}
        className={cn(
          "relative z-10 px-3 h-full text-xs font-medium rounded-[5px] transition-colors duration-200 font-siliguri",
          language === 'bn'
            ? invertColors ? "text-white" : "text-primary-foreground"
            : invertColors ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
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
