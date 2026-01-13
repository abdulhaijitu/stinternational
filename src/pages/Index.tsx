import { Link, useLocation } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle, 
  Truck, 
  Shield, 
  Headphones, 
  Building2,
  Award,
  Target,
  Wrench,
  FlaskConical,
  Gauge,
  HardHat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useActiveCategoriesByGroup, useCategoryBySlug, getIndustryFromCategory } from "@/hooks/useCategories";
import Layout from "@/components/layout/Layout";
import DBProductCard from "@/components/products/DBProductCard";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import InstitutionLogos from "@/components/homepage/InstitutionLogos";
import QuickRfqForm from "@/components/homepage/QuickRfqForm";
import HeroCta from "@/components/homepage/HeroCta";
import Testimonials from "@/components/homepage/Testimonials";
import IndustryHeroVisual from "@/components/homepage/IndustryHeroVisual";

// Trust signals data
const trustSignals = [
  {
    icon: Building2,
    title: "Trusted by Institutions",
    description: "Serving 2000+ research labs, universities & factories",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Fast, reliable shipping across Bangladesh",
  },
  {
    icon: Headphones,
    title: "Professional Support",
    description: "Expert technical assistance & after-sales service",
  },
  {
    icon: Shield,
    title: "Certified Products",
    description: "100% authentic equipment with warranty",
  },
];

// Top-level category cards
const categoryCards = [
  {
    icon: FlaskConical,
    title: "Laboratory & Education",
    description: "Precision instruments for research labs, universities & educational institutions",
    slug: "laboratory-education",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Gauge,
    title: "Measurement & Instruments",
    description: "Accurate measuring tools for quality control & testing applications",
    slug: "measurement-instruments",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: HardHat,
    title: "Engineering & Industrial",
    description: "Heavy-duty equipment for manufacturing, construction & industrial use",
    slug: "engineering-industrial",
    color: "bg-amber-500/10 text-amber-600",
  },
];

// Why choose us points
const whyChooseUs = [
  {
    icon: Target,
    title: "Specification Accuracy",
    description: "Detailed technical specs for informed purchasing decisions",
  },
  {
    icon: Award,
    title: "Reliable Sourcing",
    description: "Partnerships with trusted global manufacturers",
  },
  {
    icon: Wrench,
    title: "After-Sales Support",
    description: "Installation guidance, calibration & maintenance services",
  },
  {
    icon: Building2,
    title: "Institutional Ready",
    description: "Bulk pricing, documentation & procurement support",
  },
];

// Stats data
const stats = [
  { value: "19+", label: "Years of Experience" },
  { value: "5000+", label: "Products Available" },
  { value: "2000+", label: "Satisfied Clients" },
  { value: "50+", label: "Trusted Brands" },
];

// Product card skeleton for loading state
const ProductSkeleton = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-28" />
    </div>
  </div>
);

const Index = () => {
  const location = useLocation();
  const { groups, isLoading: categoriesLoading } = useActiveCategoriesByGroup();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  
  // Determine industry from referrer category (if coming from a category page)
  const referrerCategory = new URLSearchParams(location.search).get('from');
  const { data: categoryData } = useCategoryBySlug(referrerCategory || '');
  const industry = getIndustryFromCategory(categoryData);

  return (
    <Layout>
      {/* Hero Section - Above the Fold */}
      <section className="hero-gradient text-primary-foreground relative overflow-hidden">
        {/* Background Visual Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] transform translate-x-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-foreground/5 rounded-full blur-[80px]" />
          
          {/* Geometric Pattern */}
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-[0.03]">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="container-premium py-16 md:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm mb-8">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Trusted Partner for 2000+ Institutions</span>
              </div>
              
              <h1 className="text-balance mb-6">
                Reliable Scientific & Industrial{" "}
                <span className="text-accent">Equipment Supplier</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mb-10 leading-relaxed">
                Your trusted source for certified laboratory, measurement, and industrial equipment. 
                Serving research institutions and businesses with nationwide delivery since 2005.
              </p>
              
              <HeroCta />
            </div>

            {/* Right Column - Industry-aware Visual */}
            <div className="hidden lg:block relative">
              <IndustryHeroVisual industry={industry} />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-8 md:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {trustSignals.map((signal, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-background/50 transition-colors duration-200"
              >
                <div className="w-12 h-12 bg-background rounded-lg shadow-sm flex items-center justify-center shrink-0">
                  <signal.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{signal.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution Logos Section */}
      <InstitutionLogos />

      {/* Product Category Entry Section */}
      <section className="py-16 md:py-20">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">Product Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our comprehensive range of scientific, measurement, and industrial equipment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {categoryCards.map((category) => (
              <Link
                key={category.slug}
                to={`/categories#${category.slug}`}
                className="group bg-card border border-border rounded-lg p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-14 h-14 ${category.color} rounded-lg flex items-center justify-center mb-6`}>
                  <category.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {category.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:text-accent transition-colors">
                  View Products
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            ))}
          </div>

          {/* Subcategories Grid */}
          {!categoriesLoading && groups.length > 0 && (
            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.slug} className="bg-muted/30 rounded-lg p-5">
                  <h4 className="font-semibold text-sm mb-3">{group.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.categories.slice(0, 4).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="text-xs bg-background px-3 py-1.5 rounded-md border border-border hover:border-primary hover:text-primary transition-colors duration-200"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    {group.categories.length > 4 && (
                      <Link
                        to={`/categories#${group.slug}`}
                        className="text-xs text-primary font-medium px-3 py-1.5"
                      >
                        +{group.categories.length - 4} more
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose ST International */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose ST International</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by laboratories, factories, and institutions across Bangladesh
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-lg p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-20">
        <div className="container-premium">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Top-rated equipment trusted by professionals</p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <DBProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">No featured products available</p>
              <Button variant="outline" size="sm" asChild className="mt-4">
                <Link to="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts maxItems={6} />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick RFQ Form Section */}
      <QuickRfqForm />
    </Layout>
  );
};

export default Index;
