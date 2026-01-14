import { Link } from "react-router-dom";
import { CheckCircle, Users, Award, Building2, Target, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t, language } = useLanguage();
  const fontClass = language === "bn" ? "font-siliguri" : "";

  const values = [
    {
      icon: CheckCircle,
      title: t.about.qualityAssurance,
      description: t.about.qualityDesc,
    },
    {
      icon: Users,
      title: t.about.expertSupport,
      description: t.about.expertDesc,
    },
    {
      icon: Award,
      title: t.about.trustedBrands,
      description: t.about.brandsDesc,
    },
    {
      icon: Building2,
      title: t.about.institutionalFocus,
      description: t.about.institutionalDesc,
    },
  ];

  const milestones = [
    { year: "2005", event: t.about.milestone2005 },
    { year: "2008", event: t.about.milestone2008 },
    { year: "2012", event: t.about.milestone2012 },
    { year: "2015", event: t.about.milestone2015 },
    { year: "2018", event: t.about.milestone2018 },
    { year: "2024", event: t.about.milestone2024 },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground">
        <div className={`container-premium py-16 md:py-24 ${fontClass}`}>
          <div className="max-w-3xl">
            <h1 className="mb-6">{t.about.title}</h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
              {t.about.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className={`container-premium ${fontClass}`}>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t.about.ourMission}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.about.missionText}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="w-14 h-14 bg-accent text-accent-foreground rounded-lg flex items-center justify-center mb-6">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t.about.ourVision}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.about.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className={`container-premium ${fontClass}`}>
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.about.coreValues}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.about.coreValuesSubtitle}
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
        <div className={`container-premium ${fontClass}`}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">{t.about.ourJourney}</h2>
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
        <div className={`container-premium text-center ${fontClass}`}>
          <h2 className="mb-4">{t.about.readyToPartner}</h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            {t.about.partnerSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">
                {t.about.contactUs}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-secondary" size="lg" asChild>
              <Link to="/categories">{t.about.browseProducts}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
