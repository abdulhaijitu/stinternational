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
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import InstitutionLogos from "@/components/homepage/InstitutionLogos";
import QuickRfqForm from "@/components/homepage/QuickRfqForm";
import Testimonials from "@/components/homepage/Testimonials";
import HeroSlider from "@/components/homepage/HeroSlider";
import { useQueryClient } from "@tanstack/react-query";

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

// Stats data (bilingual)
const stats = {
  en: [
    { value: "19+", label: "Years of Experience" },
    { value: "5000+", label: "Products Available" },
    { value: "2000+", label: "Satisfied Clients" },
    { value: "50+", label: "Trusted Brands" },
  ],
  bn: [
    { value: "১৯+", label: "বছরের অভিজ্ঞতা" },
    { value: "৫০০০+", label: "পণ্য উপলব্ধ" },
    { value: "২০০০+", label: "সন্তুষ্ট গ্রাহক" },
    { value: "৫০+", label: "বিশ্বস্ত ব্র্যান্ড" },
  ],
};

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
  const { groups, isLoading: categoriesLoading } = useActiveCategoriesByGroup();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Get language-specific content
  const currentTrustSignals = trustSignals[language];
  const currentCategoryCards = categoryCards[language];
  const currentWhyChooseUs = whyChooseUs[language];
  const currentStats = stats[language];

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['featured-products'] });
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  }, [queryClient]);

  return (
    <Layout>
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

      {/* Institution Logos Section */}
      <InstitutionLogos />

      {/* Product Category Entry Section */}
      <section className="py-16 md:py-20">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">{language === 'bn' ? 'পণ্য বিভাগ' : 'Product Categories'}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'bn' 
                ? 'বৈজ্ঞানিক, পরিমাপ এবং শিল্প যন্ত্রপাতির ব্যাপক পরিসর ব্রাউজ করুন'
                : 'Browse our comprehensive range of scientific, measurement, and industrial equipment'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {currentCategoryCards.map((category) => (
              <Link
                key={category.slug}
                to={`/categories#${category.slug}`}
                className="group bg-card border border-border rounded-lg p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <category.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {category.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:text-accent transition-colors">
                  {language === 'bn' ? 'পণ্য দেখুন' : 'View Products'}
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
                        +{group.categories.length - 4} {language === 'bn' ? 'আরো' : 'more'}
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
            <h2 className="mb-4">
              {language === 'bn' ? 'কেন ST International বেছে নেবেন' : 'Why Choose ST International'}
            </h2>
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
      <section className="py-12 md:py-24 bg-muted/20">
        <div className="container-premium px-4 sm:px-6">
          {/* Section Header */}
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
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors shrink-0"
            >
              {language === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Products Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
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
          
          {/* Mobile CTA */}
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

      {/* Testimonials Section */}
      <Testimonials />

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {currentStats.map((stat, index) => (
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
        </PageTransition>
      </PullToRefresh>
    </Layout>
  );
};

export default Index;
