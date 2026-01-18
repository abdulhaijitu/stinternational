import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  Users, 
  Award, 
  Building2, 
  Target, 
  ArrowRight,
  ShoppingCart,
  FileText,
  CreditCard,
  Truck,
  Shield,
  Eye,
  Heart,
  FlaskConical,
  Ruler,
  Wrench,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageSEO } from "@/components/seo/PageSEO";

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

  const howItWorksSteps = [
    {
      icon: ShoppingCart,
      title: t.about.step1Title,
      description: t.about.step1Desc,
      step: "01",
    },
    {
      icon: FileText,
      title: t.about.step2Title,
      description: t.about.step2Desc,
      step: "02",
    },
    {
      icon: CreditCard,
      title: t.about.step3Title,
      description: t.about.step3Desc,
      step: "03",
    },
    {
      icon: Truck,
      title: t.about.step4Title,
      description: t.about.step4Desc,
      step: "04",
    },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: t.about.securePayments,
      description: t.about.securePaymentsDesc,
    },
    {
      icon: Eye,
      title: t.about.clearAccessRules,
      description: t.about.clearAccessRulesDesc,
    },
    {
      icon: Heart,
      title: t.about.userFocusedDesign,
      description: t.about.userFocusedDesignDesc,
    },
  ];

  const productTypeIcons = [FlaskConical, Ruler, Wrench, BookOpen];

  return (
    <Layout>
      <PageSEO 
        pageSlug="/about"
        fallbackTitle={{
          en: "About Us - ST International | Scientific Equipment Supplier Since 2005",
          bn: "আমাদের সম্পর্কে - ST International | ২০০৫ সাল থেকে বৈজ্ঞানিক যন্ত্রপাতি সরবরাহকারী"
        }}
        fallbackDescription={{
          en: "Learn about ST International's 10+ years of experience as Bangladesh's trusted supplier of scientific and industrial equipment.",
          bn: "বাংলাদেশের বিশ্বস্ত বৈজ্ঞানিক ও শিল্প যন্ত্রপাতি সরবরাহকারী হিসেবে ST International-এর ১০+ বছরের অভিজ্ঞতা সম্পর্কে জানুন।"
        }}
      />

      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground overflow-hidden">
        <div className={`container-premium py-16 md:py-24 ${fontClass}`}>
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t.about.title}
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t.about.subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* About the Platform */}
      <section className="py-16 md:py-24">
        <div className={`container-premium ${fontClass}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.about.aboutPlatform}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                {t.about.platformDescription}
              </p>
              
              {/* What We Offer */}
              <h3 className="text-xl font-semibold mb-4">{t.about.whatWeOffer}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {(t.about.productTypes as readonly string[]).map((type, index) => {
                  const IconComponent = productTypeIcons[index] || CheckCircle;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg transition-colors duration-200 hover:bg-muted"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.about.ourMission}</h3>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {t.about.missionText}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="w-14 h-14 bg-accent text-accent-foreground rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.about.ourVision}</h3>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {t.about.visionText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className={`container-premium ${fontClass}`}>
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.about.howItWorks}</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative bg-card border border-border rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
              >
                {/* Step Number */}
                <motion.div 
                  className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                >
                  {step.step}
                </motion.div>
                
                <motion.div 
                  className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mt-2"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                  >
                    <step.icon className="h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
                  </motion.div>
                </motion.div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                
                {/* Connector Line (hidden on last item and mobile) */}
                {index < howItWorksSteps.length - 1 && (
                  <motion.div 
                    className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-16 md:py-24">
        <div className={`container-premium ${fontClass}`}>
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.about.trustTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.about.trustSubtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {trustFeatures.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="bg-card border border-border rounded-lg p-8 text-center transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
              >
                <motion.div 
                  className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.2, type: "spring", stiffness: 150 }}
                  >
                    <feature.icon className="h-7 w-7 text-accent transition-transform duration-200 group-hover:scale-110" />
                  </motion.div>
                </motion.div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
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
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-card border border-border rounded-lg p-6 text-center transition-shadow duration-200 hover:shadow-lg hover:border-primary/20 group cursor-pointer"
              >
                <motion.div 
                  className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <value.icon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                </motion.div>
                <h3 className="font-semibold mb-2 transition-colors duration-200 group-hover:text-primary">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className={`container-premium ${fontClass}`}>
          <div className="max-w-3xl mx-auto">
            <motion.h2 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {t.about.ourJourney}
            </motion.h2>
            <div className="relative">
              {/* Timeline Line */}
              <motion.div 
                className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              
              {/* Timeline Items */}
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative flex items-start gap-6 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <motion.div 
                      className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 md:-translate-x-1.5 mt-1.5"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.5 }}
                    />
                    <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <motion.span 
                        className="text-sm font-semibold text-accent inline-block"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {milestone.year}
                      </motion.span>
                      <p className="text-foreground">{milestone.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Animated Background Glow */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 50% 50%, hsl(var(--primary-foreground) / 0.15) 0%, transparent 60%)"
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className={`container-premium text-center relative z-10 ${fontClass}`}>
          <motion.h2 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t.about.readyToPartner}
          </motion.h2>
          <motion.p 
            className="text-primary-foreground/70 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t.about.partnerSubtitle}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="hero" size="lg" asChild className="relative overflow-hidden group">
                <Link to="/products">
                  <motion.span
                    className="absolute inset-0 bg-white/10"
                    animate={{
                      x: ["-100%", "100%"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                  {t.about.exploreProducts}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="hero-secondary" size="lg" asChild>
                <Link to="/contact">{t.about.contactUs}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
