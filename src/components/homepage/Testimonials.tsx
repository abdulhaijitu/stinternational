import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Star, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import inarsLogo from "@/assets/logos/inars-logo.png";
import bcsirLogo from "@/assets/logos/bcsir-logo.png";

interface Testimonial {
  id: string;
  client_name: string;
  company_name: string;
  designation: string | null;
  quote: string;
  avatar_url: string | null;
  rating: number;
}

// Map institution names to their logos
const getInstitutionLogo = (companyName: string): string | null => {
  const lowerName = companyName.toLowerCase();
  if (lowerName.includes('inars') || lowerName.includes('national analytical')) {
    return inarsLogo;
  }
  if (lowerName.includes('bcsir') || lowerName.includes('council of scientific')) {
    return bcsirLogo;
  }
  return null;
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const institutionLogo = getInstitutionLogo(testimonial.company_name);
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 relative group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Quote Icon */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
        <Quote className="h-5 w-5 text-primary-foreground" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? "text-accent fill-accent"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-foreground/90 leading-relaxed mb-6 flex-grow">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white border border-border/50 shadow-sm flex-shrink-0">
          {institutionLogo ? (
            <img
              src={institutionLogo}
              alt={testimonial.company_name}
              className="w-10 h-10 object-contain"
            />
          ) : testimonial.avatar_url ? (
            <img
              src={testimonial.avatar_url}
              alt={testimonial.client_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <Building2 className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">
            {testimonial.client_name}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {testimonial.designation && `${testimonial.designation}, `}
            {testimonial.company_name}
          </p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const isMobile = useIsMobile();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    skipSnaps: false,
    slidesToScroll: isMobile ? 1 : 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-premium">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container-premium">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Client Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Leading Institutions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our valued partners about their experience working with ST International
          </p>
        </div>

        {/* Carousel for both Mobile and Desktop */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className={cn(
                    "min-w-0 pl-1 pt-4",
                    isMobile ? "flex-[0_0_85%]" : "flex-[0_0_calc(33.333%-16px)]"
                  )}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={scrollPrev}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full border border-border bg-card flex items-center justify-center transition-all duration-200",
                "hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95"
              )}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            
            {/* Dot Indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    selectedIndex === index 
                      ? "bg-primary w-6 md:w-8" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={scrollNext}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full border border-border bg-card flex items-center justify-center transition-all duration-200",
                "hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95"
              )}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
