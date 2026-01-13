import { Link } from "react-router-dom";
import { CheckCircle, Users, Award, Building2, Target, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: CheckCircle,
    title: "Quality Assurance",
    description: "Every product we supply meets international quality standards and comes with proper documentation.",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Our technical team provides pre-sales consultation and after-sales support for all equipment.",
  },
  {
    icon: Award,
    title: "Trusted Brands",
    description: "We partner with globally recognized manufacturers to bring you reliable, proven equipment.",
  },
  {
    icon: Building2,
    title: "Institutional Focus",
    description: "Specialized in serving educational institutions, research labs, and industrial facilities.",
  },
];

const milestones = [
  { year: "2005", event: "ST International founded in Dhaka" },
  { year: "2008", event: "Expanded to laboratory equipment segment" },
  { year: "2012", event: "Became authorized distributor for major brands" },
  { year: "2015", event: "Opened dedicated service center" },
  { year: "2018", event: "Reached 1000+ institutional clients" },
  { year: "2024", event: "Launched online ordering platform" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className="container-premium py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="mb-6">About ST International</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
              For nearly two decades, ST International has been Bangladesh's trusted partner 
              for scientific, industrial, and educational equipment. We bridge the gap between 
              global technology and local expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="container-premium">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower Bangladesh's educational institutions, research laboratories, and 
                industrial facilities with world-class equipment and unwavering support. We 
                believe that access to quality scientific instruments is fundamental to progress 
                and innovation.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="w-14 h-14 bg-accent text-accent-foreground rounded-lg flex items-center justify-center mb-6">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To be the most trusted and comprehensive supplier of scientific and industrial 
                equipment in South Asia, known for our quality products, technical expertise, 
                and customer-centric approach to every partnership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-premium">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide every interaction and decision at ST International
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">Our Journey</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
              
              {/* Timeline Items */}
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative flex items-start gap-6 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 md:-translate-x-1.5 mt-1.5" />
                    <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <span className="text-sm font-semibold text-accent">{milestone.year}</span>
                      <p className="text-foreground">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container-premium text-center">
          <h2 className="mb-4">Ready to Partner With Us?</h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Whether you need a single instrument or complete laboratory setup, 
            our team is ready to help you find the right solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-secondary" size="lg" asChild>
              <Link to="/categories">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
