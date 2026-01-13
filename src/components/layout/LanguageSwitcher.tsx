import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const LanguageSwitcher = ({ className, variant = 'default' }: LanguageSwitcherProps) => {
  const { language, setLanguage, languageNames } = useLanguage();

  return (
    <div className={cn("flex items-center", className)}>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "transition-all duration-200 text-sm font-medium",
          language === 'en'
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        <span className={cn(
          "relative pb-0.5",
          language === 'en' && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent"
        )}>
          {languageNames.en.native}
        </span>
      </button>
      
      <span className="mx-2 text-border">|</span>
      
      <button
        onClick={() => setLanguage('bn')}
        className={cn(
          "transition-all duration-200 font-medium",
          variant === 'compact' ? "text-sm" : "text-base",
          language === 'bn'
            ? "text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="বাংলায় পরিবর্তন করুন"
        aria-pressed={language === 'bn'}
        style={{ fontFamily: language === 'bn' ? "'Hind Siliguri', sans-serif" : undefined }}
      >
        <span className={cn(
          "relative pb-0.5",
          language === 'bn' && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-accent"
        )}>
          {languageNames.bn.native}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
