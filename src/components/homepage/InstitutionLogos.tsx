import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface InstitutionLogo {
  id: string;
  name: string;
  logo_url: string;
  display_order: number;
}

const InstitutionLogos = () => {
  const { data: logos, isLoading } = useQuery({
    queryKey: ["institution-logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institution_logos")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as InstitutionLogo[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container-premium">
          <div className="text-center mb-10">
            <Skeleton className="h-6 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/2] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 border-b border-border bg-background">
      <div className="container-premium">
        <div className="text-center mb-10">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Trusted by Institutions & Professional Buyers
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Leading research institutions, universities, and corporations rely on our equipment
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 items-center">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="group flex items-center justify-center p-4 md:p-6 bg-muted/30 rounded-lg border border-border/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-border"
            >
              <img
                src={logo.logo_url}
                alt={logo.name}
                className="max-h-10 md:max-h-12 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200"
                title={logo.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstitutionLogos;
