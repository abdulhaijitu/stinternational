import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { BilingualSEO } from "@/components/seo/BilingualSEO";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <BilingualSEO
        customTitle={{ en: "Page Not Found | ST International", bn: "পেইজ পাওয়া যায়নি | ST International" }}
        customDescription={{ en: "The page you are looking for does not exist.", bn: "আপনি যে পেইজটি খুঁজছেন তা বিদ্যমান নেই।" }}
        noIndex={true}
      />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">
            {language === 'bn' ? 'দুঃখিত! পেইজটি পাওয়া যায়নি' : 'Oops! Page not found'}
          </p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            {language === 'bn' ? 'হোম পেইজে ফিরে যান' : 'Return to Home'}
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
