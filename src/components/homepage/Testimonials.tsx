import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Star, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const Testimonials = () => {
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

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card border border-border rounded-lg p-6 md:p-8 relative group hover:shadow-lg transition-shadow duration-300"
            >
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
              <blockquote className="text-foreground/90 leading-relaxed mb-6 min-h-[100px]">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {(() => {
                  const institutionLogo = getInstitutionLogo(testimonial.company_name);
                  return (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white border border-border/50 shadow-sm">
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
                  );
                })()}
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.client_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.designation && `${testimonial.designation}, `}
                    {testimonial.company_name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
