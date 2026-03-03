import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Package, Users, Award } from "lucide-react";

const statsData = {
  en: [
    { value: 10, suffix: "+", label: "Years of Experience", icon: Award },
    { value: 5000, suffix: "+", label: "Products Available", icon: Package },
    { value: 2000, suffix: "+", label: "Satisfied Clients", icon: Users },
    { value: 50, suffix: "+", label: "Trusted Brands", icon: Building2 },
  ],
  bn: [
    { value: 10, suffix: "+", label: "বছরের অভিজ্ঞতা", icon: Award },
    { value: 5000, suffix: "+", label: "পণ্য উপলব্ধ", icon: Package },
    { value: 2000, suffix: "+", label: "সন্তুষ্ট গ্রাহক", icon: Users },
    { value: 50, suffix: "+", label: "বিশ্বস্ত ব্র্যান্ড", icon: Building2 },
  ],
};

// Convert number to Bengali digits
const toBengaliDigits = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const useCountUp = (end: number, duration: number = 2000, startCounting: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;
    
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startCounting]);

  return count;
};

const StatCard = ({ 
  value, suffix, label, icon: Icon, index, isVisible, language 
}: { 
  value: number; suffix: string; label: string; icon: React.ElementType; index: number; isVisible: boolean; language: 'en' | 'bn';
}) => {
  const count = useCountUp(value, 2000 + index * 200, isVisible);
  const displayValue = language === 'bn' ? toBengaliDigits(count) : count.toLocaleString();

  return (
    <div
      className="relative group text-center p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
      }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
          <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
        </div>
        <div className="text-4xl md:text-5xl font-bold text-primary mb-2 tabular-nums">
          {displayValue}{suffix}
        </div>
        <div className="text-sm text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
};

const StatsSection = () => {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentStats = statsData[language];

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) setIsVisible(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.3 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [handleIntersection]);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-muted/60 to-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container-premium relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            {language === 'bn' ? 'সংখ্যায় আমরা' : 'By the Numbers'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'bn' ? 'আমাদের অর্জন' : 'Our Impact'}
          </h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {currentStats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              index={index}
              isVisible={isVisible}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
