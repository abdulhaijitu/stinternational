import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCategoriesByGroup } from "@/hooks/useProducts";
import { getCategoryIcon } from "@/lib/categoryIcons";

const Categories = () => {
  const { groups, isLoading, error } = useCategoriesByGroup();

  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">পণ্য ক্যাটাগরি</h1>
          <p className="text-muted-foreground max-w-2xl">
            বৈজ্ঞানিক, শিল্প এবং শিক্ষামূলক যন্ত্রপাতির সম্পূর্ণ সংগ্রহ। 
            প্রতিটি ক্যাটাগরিতে বিশ্বস্ত ব্র্যান্ডের প্রিমিয়াম পণ্য রয়েছে।
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container-premium">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-muted-foreground">
              ক্যাটাগরি লোড করতে সমস্যা হয়েছে
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              কোনো ক্যাটাগরি নেই
            </div>
          ) : (
            <div className="space-y-16">
              {groups.map((group) => (
                <div key={group.slug} id={group.slug} className="scroll-mt-24">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{group.name}</h2>
                    <p className="text-muted-foreground">{group.categories.length}টি ক্যাটাগরি</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.categories.map((category) => {
                      const IconComponent = getCategoryIcon(category.icon_name);
                      return (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="group bg-card border border-border rounded-lg p-6 card-hover"
                        >
                          <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <IconComponent className="h-7 w-7" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center justify-end">
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Categories;
