import { Link } from "react-router-dom";
import { useCallback } from "react";
import { 
  ArrowRight, 
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
import { useActiveCategoriesByGroup } from "@/hooks/useCategories";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import PullToRefresh from "@/components/layout/PullToRefresh";
import DBProductCard from "@/components/products/DBProductCard";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import { useProductImagePreload } from "@/hooks/useImagePreload";
import InstitutionLogos from "@/components/homepage/InstitutionLogos";

import Testimonials from "@/components/homepage/Testimonials";
import HeroSlider from "@/components/homepage/HeroSlider";
import StatsSection from "@/components/homepage/StatsSection";
import { useQueryClient } from "@tanstack/react-query";
import { PageSEO } from "@/components/seo/PageSEO";

// Trust signals data - speaks to both B2B and B2C (bilingual)
const trustSignals = {
  en: [
    {
      icon: Building2,
      title: "Trusted Partner",
      description: "Serving 2000+ institutions and individual professionals",
    },
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: "Fast shipping for orders of any size across Bangladesh",
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Technical assistance for all customers, big or small",
    },
    {
      icon: Shield,
      title: "Certified Products",
      description: "Authentic equipment with warranty & documentation",
    },
  ],
  bn: [
    {
      icon: Building2,
      title: "বিশ্বস্ত অংশীদার",
      description: "২০০০+ প্রতিষ্ঠান এবং পেশাদারদের সেবা প্রদান",
    },
    {
      icon: Truck,
      title: "দেশব্যাপী ডেলিভারি",
      description: "বাংলাদেশ জুড়ে যেকোনো সাইজের অর্ডারে দ্রুত শিপিং",
    },
    {
      icon: Headphones,
      title: "বিশেষজ্ঞ সহায়তা",
      description: "ছোট-বড় সব গ্রাহকের জন্য প্রযুক্তিগত সহায়তা",
    },
    {
      icon: Shield,
      title: "প্রত্যয়িত পণ্য",
      description: "ওয়ারেন্টি ও ডকুমেন্টেশন সহ প্রকৃত যন্ত্রপাতি",
    },
  ],
};

// Top-level category cards (bilingual)
const categoryCards = {
  en: [
    {
      icon: FlaskConical,
      title: "Laboratory & Education",
      description: "Precision instruments for research labs, universities & educational institutions",
      slug: "laboratory-education",
    },
    {
      icon: Gauge,
      title: "Measurement & Instruments",
      description: "Accurate measuring tools for quality control & testing applications",
      slug: "measurement-instruments",
    },
    {
      icon: HardHat,
      title: "Engineering & Industrial",
      description: "Heavy-duty equipment for manufacturing, construction & industrial use",
      slug: "engineering-industrial",
    },
  ],
  bn: [
    {
      icon: FlaskConical,
      title: "ল্যাবরেটরি ও শিক্ষা",
      description: "গবেষণা ল্যাব, বিশ্ববিদ্যালয় এবং শিক্ষা প্রতিষ্ঠানের জন্য নির্ভুল যন্ত্রপাতি",
      slug: "laboratory-education",
    },
    {
      icon: Gauge,
      title: "পরিমাপ ও যন্ত্রপাতি",
      description: "গুণগত নিয়ন্ত্রণ ও পরীক্ষার জন্য সঠিক পরিমাপ সরঞ্জাম",
      slug: "measurement-instruments",
    },
    {
      icon: HardHat,
      title: "প্রকৌশল ও শিল্প",
      description: "উৎপাদন, নির্মাণ এবং শিল্প ব্যবহারের জন্য ভারী যন্ত্রপাতি",
      slug: "engineering-industrial",
    },
  ],
};

// Why choose us points (bilingual)
const whyChooseUs = {
  en: [
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
  ],
  bn: [
    {
      icon: Target,
      title: "সঠিক স্পেসিফিকেশন",
      description: "সচেতন ক্রয় সিদ্ধান্তের জন্য বিস্তারিত প্রযুক্তিগত তথ্য",
    },
    {
      icon: Award,
      title: "নির্ভরযোগ্য সোর্সিং",
      description: "বিশ্বস্ত বৈশ্বিক প্রস্তুতকারকদের সাথে অংশীদারিত্ব",
    },
    {
      icon: Wrench,
      title: "বিক্রয়োত্তর সেবা",
      description: "ইনস্টলেশন, ক্যালিব্রেশন ও রক্ষণাবেক্ষণ সেবা",
    },
    {
      icon: Building2,
      title: "প্রাতিষ্ঠানিক প্রস্তুত",
      description: "বাল্ক মূল্য, ডকুমেন্টেশন এবং প্রকিউরমেন্ট সহায়তা",
    },
  ],
};

// Stats data moved to StatsSection component

// Product card skeleton removed - using ProductGridSkeleton component instead

const Index = () => {
  const { groups, isLoading: categoriesLoading } = useActiveCategoriesByGroup();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Preload above-the-fold product images for faster LCP
  useProductImagePreload(featuredProducts, 4);
  
  // Get language-specific content
  const currentTrustSignals = trustSignals[language];
  const currentCategoryCards = categoryCards[language];
  const currentWhyChooseUs = whyChooseUs[language];
  

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['featured-products'] });
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  }, [queryClient]);

  return (
    <Layout>
      <PageSEO 
        pageSlug="/"
        fallbackTitle={{
          en: "ST International - Scientific & Industrial Equipment in Bangladesh",
          bn: "ST International - বাংলাদেশে বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি"
        }}
        fallbackDescription={{
          en: "Your trusted partner for scientific, laboratory, industrial, and educational equipment in Bangladesh. Quality products with expert support since 2005.",
          bn: "বাংলাদেশে বৈজ্ঞানিক, ল্যাবরেটরি, শিল্প এবং শিক্ষামূলক যন্ত্রপাতির আপনার বিশ্বস্ত অংশীদার। ২০০৫ সাল থেকে বিশেষজ্ঞ সহায়তা সহ মানসম্পন্ন পণ্য।"
        }}
      />
      <PullToRefresh onRefresh={handleRefresh}>
        <PageTransition>
          {/* Hero Slider Section */}
          <HeroSlider />

      {/* Trust Signals Section */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-8 md:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {currentTrustSignals.map((signal, index) => (
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

      {/* Product Category Entry Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container-premium relative z-10">
          {/* Upgraded Header */}
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              {language === 'bn' ? 'যন্ত্রপাতি ব্রাউজ করুন' : 'Browse Equipment'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'bn' ? 'পণ্য বিভাগ' : 'Product Categories'}
            </h2>
            <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'bn' 
                ? 'বৈজ্ঞানিক, পরিমাপ এবং শিল্প যন্ত্রপাতির ব্যাপক পরিসর ব্রাউজ করুন'
                : 'Browse our comprehensive range of scientific, measurement, and industrial equipment'}
            </p>
          </div>
          
          {/* Redesigned Category Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {currentCategoryCards.map((category) => {
              const matchingGroup = groups.find(g => g.slug === category.slug);
              const productCount = matchingGroup?.categories?.length || 0;
              return (
                <Link
                  key={category.slug}
                  to={`/categories#${category.slug}`}
                  className="group bg-gradient-to-br from-card to-muted/20 border border-border rounded-xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/5 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <category.icon className="h-8 w-8 group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                      {language === 'bn' ? 'পণ্য দেখুন' : 'View Products'}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                    </span>
                    {productCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
                        {productCount} {language === 'bn' ? 'টি' : productCount === 1 ? 'type' : 'types'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Redesigned Subcategories Grid */}
          {!categoriesLoading && groups.length > 0 && (
            <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <div key={group.slug} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                      <FlaskConical className="h-3.5 w-3.5 text-primary" />
                    </span>
                    {group.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.categories.slice(0, 4).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        className="text-xs bg-muted/50 px-3 py-1.5 rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    {group.categories.length > 4 && (
                      <Link
                        to={`/categories#${group.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-primary font-medium px-3 py-1.5 hover:underline"
                      >
                        +{group.categories.length - 4} {language === 'bn' ? 'আরো' : 'more'}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Categories CTA */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/categories">
                {language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'View All Categories'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-24 bg-muted/20">
        <div className="container-premium px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                {language === 'bn' ? 'ফিচার্ড পণ্য' : 'Featured Products'}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                {language === 'bn' 
                  ? 'বাংলাদেশ জুড়ে পেশাদারদের বিশ্বাসযোগ্য শীর্ষ-রেটেড বৈজ্ঞানিক ও শিল্প যন্ত্রপাতির নির্বাচিত সংগ্রহ'
                  : 'Curated selection of top-rated scientific and industrial equipment trusted by professionals across Bangladesh.'}
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/70 transition-colors shrink-0"
            >
              {language === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {productsLoading ? (
            <ProductGridSkeleton 
              count={8} 
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
            />
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <DBProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {language === 'bn' ? 'কোনো ফিচার্ড পণ্য নেই' : 'No featured products available'}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/products">
                  {language === 'bn' ? 'সব পণ্য ব্রাউজ করুন' : 'Browse All Products'}
                </Link>
              </Button>
            </div>
          )}
          
          <div className="mt-6 sm:mt-10 text-center sm:hidden">
            <Button variant="outline" size="default" asChild>
              <Link to="/products">
                {language === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts maxItems={6} />

      {/* Why Choose ST International */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/40 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="container-premium relative z-10">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              {language === 'bn' ? 'আমাদের সুবিধা' : 'Our Advantages'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'bn' ? 'কেন ST International বেছে নেবেন' : 'Why Choose ST International'}
            </h2>
            <div className="w-12 h-1 bg-primary mx-auto mb-4 rounded-full" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'bn' 
                ? 'বাংলাদেশ জুড়ে ল্যাবরেটরি, কারখানা এবং প্রতিষ্ঠানের বিশ্বাসযোগ্য অংশীদার'
                : 'Trusted by laboratories, factories, and institutions across Bangladesh'}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentWhyChooseUs.map((item, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-card to-muted/20 border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <item.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution Logos Section */}
      <InstitutionLogos />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Stats Section */}
      <StatsSection />

        </PageTransition>
      </PullToRefresh>
    </Layout>
  );
};

export default Index;
