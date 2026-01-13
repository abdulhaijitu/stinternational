import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Truck, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryGroups } from "@/lib/categories";
import { getFeaturedProducts, formatPrice } from "@/lib/products";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";

const trustBadges = [
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Fast shipping across Bangladesh",
  },
  {
    icon: Shield,
    title: "Genuine Products",
    description: "100% authentic equipment",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Technical assistance available",
  },
  {
    icon: CheckCircle,
    title: "Secure Payments",
    description: "COD & Bank Transfer accepted",
  },
];

const stats = [
  { value: "19+", label: "Years Experience" },
  { value: "5000+", label: "Products" },
  { value: "2000+", label: "Happy Clients" },
  { value: "50+", label: "Brands" },
];

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className="container-premium py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full text-sm">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Trusted by 2000+ institutions in Bangladesh</span>
              </div>
              <h1 className="text-balance">
                Scientific & Industrial Equipment for{" "}
                <span className="text-accent">Professional Excellence</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed">
                Your reliable partner for laboratory, educational, and industrial equipment. 
                Serving research institutions, universities, and businesses since 2005.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/categories">
                    Browse Products
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="hero-secondary" size="xl" asChild>
                  <Link to="/contact">Request Quote</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-square bg-primary-foreground/5 rounded-lg border border-primary-foreground/10 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-24 h-24 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Premium Equipment</h3>
                  <p className="text-primary-foreground/60 text-sm">
                    Laboratory, Industrial & Educational Solutions
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
            <h2 className="mb-4">Product Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive range of scientific, measurement, and industrial equipment for your professional needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card border border-border rounded-lg p-6 card-hover"
              >
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{group.description}</p>
                <ul className="space-y-3 mb-6">
                  {group.categories.slice(0, 4).map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/category/${category.slug}`}
                        className="flex items-center justify-between text-sm group"
                      >
                        <span className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                          <category.icon className="h-4 w-4 text-muted-foreground" />
                          {category.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{category.productCount} products</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/categories#${group.slug}`}
                  className="text-sm font-medium text-primary hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-premium">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Top-selling equipment trusted by professionals</p>
            </div>
            <Link
              to="/categories"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
            >
              View All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/categories">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose ST International?</h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Decades of experience serving Bangladesh's leading institutions with premium scientific and industrial equipment
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
            <h2 className="mb-4">Need Bulk Pricing or Custom Quotes?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We offer special pricing for institutions, government bodies, and bulk orders. 
              Contact our team for personalized quotes and expert consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact">
                  Request Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:+8801234567890">
                  Call: +880 1234 567 890
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
