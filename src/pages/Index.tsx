import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Truck, Shield, Headphones, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategoriesByGroup, useFeaturedProducts } from "@/hooks/useProducts";
import Layout from "@/components/layout/Layout";
import DBProductCard from "@/components/products/DBProductCard";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import { 
  FlaskConical, 
  Microscope, 
  Scale, 
  HardHat, 
  TestTube, 
  GraduationCap,
  Timer,
  Ruler,
  ShieldCheck
} from "lucide-react";

const iconMap: Record<string, any> = {
  FlaskConical,
  Microscope,
  Scale,
  HardHat,
  TestTube,
  GraduationCap,
  Timer,
  Ruler,
  ShieldCheck,
  Weight: Scale,
  Shield: ShieldCheck,
};

const trustBadges = [
  {
    icon: Truck,
    title: "সারাদেশে ডেলিভারি",
    description: "বাংলাদেশের সর্বত্র দ্রুত ডেলিভারি",
  },
  {
    icon: Shield,
    title: "অরিজিনাল পণ্য",
    description: "১০০% অথেনটিক যন্ত্রপাতি",
  },
  {
    icon: Headphones,
    title: "বিশেষজ্ঞ সাপোর্ট",
    description: "প্রযুক্তিগত সহায়তা",
  },
  {
    icon: CheckCircle,
    title: "নিরাপদ পেমেন্ট",
    description: "ক্যাশ অন ডেলিভারি ও ব্যাংক ট্রান্সফার",
  },
];

const stats = [
  { value: "১৯+", label: "বছরের অভিজ্ঞতা" },
  { value: "৫০০০+", label: "পণ্য" },
  { value: "২০০০+", label: "সন্তুষ্ট গ্রাহক" },
  { value: "৫০+", label: "ব্র্যান্ড" },
];

const Index = () => {
  const { groups, isLoading: categoriesLoading } = useCategoriesByGroup();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className="container-premium py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>বাংলাদেশের ২০০০+ প্রতিষ্ঠানের বিশ্বস্ত পার্টনার</span>
              </div>
              <h1 className="text-balance">
                বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি{" "}
                <span className="text-accent">পেশাদার মানের জন্য</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed">
                ল্যাবরেটরি, শিক্ষা এবং শিল্প যন্ত্রপাতির জন্য আপনার নির্ভরযোগ্য পার্টনার।
                ২০০৫ সাল থেকে গবেষণা প্রতিষ্ঠান, বিশ্ববিদ্যালয় এবং ব্যবসায়ী প্রতিষ্ঠানকে সেবা দিচ্ছি।
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/categories">
                    পণ্য দেখুন
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="hero-secondary" size="xl" asChild>
                  <Link to="/contact">কোটেশন নিন</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-square bg-primary-foreground/5 rounded-lg border border-primary-foreground/10 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-24 h-24 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                    <Microscope className="w-12 h-12 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">প্রিমিয়াম যন্ত্রপাতি</h3>
                  <p className="text-primary-foreground/60 text-sm">
                    ল্যাবরেটরি, শিল্প ও শিক্ষা সমাধান
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background rounded-lg shadow-sm flex items-center justify-center shrink-0">
                  <badge.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{badge.title}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">পণ্য ক্যাটাগরি</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              আপনার প্রয়োজনে বৈজ্ঞানিক, পরিমাপ এবং শিল্প যন্ত্রপাতির সম্পূর্ণ সংগ্রহ
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.slug}
                  className="bg-card border border-border rounded-lg p-6 card-hover"
                >
                  <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {group.categories.length}টি ক্যাটাগরি
                  </p>
                  <ul className="space-y-3 mb-6">
                    {group.categories.slice(0, 4).map((category) => {
                      const IconComponent = iconMap[category.icon_name || ""] || FlaskConical;
                      return (
                        <li key={category.id}>
                          <Link
                            to={`/category/${category.slug}`}
                            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            {category.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    to={`/categories#${group.slug}`}
                    className="text-sm font-medium text-primary hover:text-accent transition-colors inline-flex items-center gap-1"
                  >
                    সব দেখুন
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-premium">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="mb-2">জনপ্রিয় পণ্য</h2>
              <p className="text-muted-foreground">পেশাদারদের পছন্দের সেরা যন্ত্রপাতি</p>
            </div>
            <Link
              to="/categories"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              সব পণ্য দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <DBProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              কোনো ফিচার্ড পণ্য নেই
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/categories">
                সব পণ্য দেখুন
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedProducts maxItems={6} />
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">কেন ST International বেছে নেবেন?</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              দশকের অভিজ্ঞতায় বাংলাদেশের শীর্ষস্থানীয় প্রতিষ্ঠানগুলোকে প্রিমিয়াম বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহ
            </p>
          </div>
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

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-premium">
          <div className="bg-muted rounded-lg p-8 md:p-12 text-center">
            <h2 className="mb-4">বাল্ক প্রাইসিং বা কাস্টম কোটেশন দরকার?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              আমরা প্রতিষ্ঠান, সরকারি সংস্থা এবং বড় অর্ডারের জন্য বিশেষ মূল্য অফার করি।
              ব্যক্তিগত কোটেশন এবং বিশেষজ্ঞ পরামর্শের জন্য আমাদের টিমের সাথে যোগাযোগ করুন।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact">
                  কোটেশন নিন
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:+8801234567890">
                  কল করুন: +880 1234 567 890
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
