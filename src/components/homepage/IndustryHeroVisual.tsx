import { memo } from 'react';

type IndustryType = 'laboratory' | 'engineering' | 'measurement' | 'default';

interface IndustryHeroVisualProps {
  industry: IndustryType;
}

const LaboratoryVisual = () => (
  <div className="relative w-full aspect-square max-w-md mx-auto">
    {/* Outer Glow Ring - Blue tone for lab */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 via-accent/20 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Inner Circle */}
    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-foreground/10 to-transparent backdrop-blur-sm border border-primary-foreground/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6 p-8">
          {/* Microscope */}
          <div className="w-20 h-20 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-400/20">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v6M8 13h8M10 13v4a2 2 0 002 2h0a2 2 0 002-2v-4M7 21h10"/>
            </svg>
          </div>
          {/* Flask */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3h6v5l4 9a2 2 0 01-2 3H7a2 2 0 01-2-3l4-9V3"/>
              <path d="M9 3h6"/>
            </svg>
          </div>
          {/* Test Tube */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/>
              <path d="M8.5 2h7"/>
              <path d="M14.5 16h-5"/>
            </svg>
          </div>
          {/* Petri Dish */}
          <div className="w-20 h-20 bg-accent/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-accent/20">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent/80" fill="none" stroke="currentColor" strokeWidth="1.5">
              <ellipse cx="12" cy="12" rx="9" ry="4"/>
              <ellipse cx="12" cy="12" rx="6" ry="2.5"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    {/* Floating Stats */}
    <div className="absolute -top-4 -right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-blue-600">Lab</div>
      <div className="text-xs text-muted-foreground">Equipment</div>
    </div>
    
    <div className="absolute -bottom-4 -left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-primary">Research</div>
      <div className="text-xs text-muted-foreground">Grade Quality</div>
    </div>
  </div>
);

const EngineeringVisual = () => (
  <div className="relative w-full aspect-square max-w-md mx-auto">
    {/* Outer Glow Ring - Amber tone for engineering */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-500/20 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Inner Circle */}
    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-foreground/10 to-transparent backdrop-blur-sm border border-primary-foreground/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6 p-8">
          {/* Hard Hat */}
          <div className="w-20 h-20 bg-amber-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-amber-400/20">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 18a1 1 0 001 1h18a1 1 0 001-1v-2a1 1 0 00-1-1H3a1 1 0 00-1 1v2z"/>
              <path d="M10 15V6a2 2 0 012-2h0a2 2 0 012 2v9"/>
              <path d="M4 15c0-2.5 1.5-4.5 4-5.5V6a4 4 0 018 0v3.5c2.5 1 4 3 4 5.5"/>
            </svg>
          </div>
          {/* Wrench */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          {/* Building */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/>
              <path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/>
              <path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/>
              <path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>
            </svg>
          </div>
          {/* Shield */}
          <div className="w-20 h-20 bg-amber-500/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-amber-400/15">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    {/* Floating Stats */}
    <div className="absolute -top-4 -right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-amber-600">Industrial</div>
      <div className="text-xs text-muted-foreground">Grade</div>
    </div>
    
    <div className="absolute -bottom-4 -left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-primary">Safety</div>
      <div className="text-xs text-muted-foreground">Certified</div>
    </div>
  </div>
);

const MeasurementVisual = () => (
  <div className="relative w-full aspect-square max-w-md mx-auto">
    {/* Outer Glow Ring - Emerald tone for measurement */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Inner Circle */}
    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-foreground/10 to-transparent backdrop-blur-sm border border-primary-foreground/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6 p-8">
          {/* Scale */}
          <div className="w-20 h-20 bg-emerald-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-400/20">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3v18M4 8l8-5 8 5M4 8l4 8h8l4-8"/>
            </svg>
          </div>
          {/* Gauge */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-teal-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          </div>
          {/* Ruler */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 5h20v14H2zM6 5v4M10 5v2M14 5v4M18 5v2"/>
            </svg>
          </div>
          {/* Precision */}
          <div className="w-20 h-20 bg-emerald-500/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-400/15">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <circle cx="12" cy="12" r="7"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    {/* Floating Stats */}
    <div className="absolute -top-4 -right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-emerald-600">Precision</div>
      <div className="text-xs text-muted-foreground">Instruments</div>
    </div>
    
    <div className="absolute -bottom-4 -left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-primary">0.001g</div>
      <div className="text-xs text-muted-foreground">Accuracy</div>
    </div>
  </div>
);

const DefaultVisual = () => (
  <div className="relative w-full aspect-square max-w-md mx-auto">
    {/* Outer Glow Ring */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/30 via-primary-foreground/10 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Inner Circle */}
    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-foreground/10 to-transparent backdrop-blur-sm border border-primary-foreground/10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6 p-8">
          {/* Microscope Icon */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v6M8 13h8M10 13v4a2 2 0 002 2h0a2 2 0 002-2v-4M7 21h10"/>
            </svg>
          </div>
          {/* Scale Icon */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3v18M4 8l8-5 8 5M4 8l4 8h8l4-8"/>
            </svg>
          </div>
          {/* Gauge Icon */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          </div>
          {/* Flask Icon */}
          <div className="w-20 h-20 bg-primary-foreground/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/10">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent/80" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3h6v5l4 9a2 2 0 01-2 3H7a2 2 0 01-2-3l4-9V3"/>
              <path d="M9 3h6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    {/* Floating Stats */}
    <div className="absolute -top-4 -right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-primary">5000+</div>
      <div className="text-xs text-muted-foreground">Products</div>
    </div>
    
    <div className="absolute -bottom-4 -left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border border-border">
      <div className="text-2xl font-bold text-primary">19+</div>
      <div className="text-xs text-muted-foreground">Years Experience</div>
    </div>
  </div>
);

const IndustryHeroVisual = memo(({ industry }: IndustryHeroVisualProps) => {
  switch (industry) {
    case 'laboratory':
      return <LaboratoryVisual />;
    case 'engineering':
      return <EngineeringVisual />;
    case 'measurement':
      return <MeasurementVisual />;
    default:
      return <DefaultVisual />;
  }
});

IndustryHeroVisual.displayName = 'IndustryHeroVisual';

export default IndustryHeroVisual;
