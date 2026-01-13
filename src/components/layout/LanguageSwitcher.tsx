import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
  /** When true, uses colors suitable for dark backgrounds like the topbar */
  invertColors?: boolean;
}

const LanguageSwitcher = ({ className, variant = 'default', invertColors = false }: LanguageSwitcherProps) => {
  const { language, setLanguage, languageNames } = useLanguage();

  // Color classes based on context
  const activeColor = invertColors ? "text-white font-semibold" : "text-foreground font-semibold";
  const inactiveColor = invertColors 
    ? "text-white/70 hover:text-white" 
    : "text-muted-foreground hover:text-foreground";
  const dividerColor = invertColors ? "text-white/40" : "text-border";
  const underlineColor = invertColors ? "after:bg-white" : "after:bg-accent";

  return (
    <div className={cn("flex items-center", className)}>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "transition-all duration-200 text-sm font-medium",
          language === 'en' ? activeColor : inactiveColor
        )}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        <span className={cn(
          "relative pb-0.5",
          language === 'en' && `after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 ${underlineColor}`
        )}>
          {languageNames.en.native}
        </span>
      </button>
      
      <span className={cn("mx-2", dividerColor)}>|</span>
      
      <button
        onClick={() => setLanguage('bn')}
        className={cn(
          "transition-all duration-200 font-medium",
          variant === 'compact' ? "text-sm" : "text-base",
          language === 'bn' ? activeColor : inactiveColor
        )}
        aria-label="বাংলায় পরিবর্তন করুন"
        aria-pressed={language === 'bn'}
        style={{ fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : undefined }}
      >
        <span className={cn(
          "relative pb-0.5",
          language === 'bn' && `after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 ${underlineColor}`
        )}>
          {languageNames.bn.native}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
