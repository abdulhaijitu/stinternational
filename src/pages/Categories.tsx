import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { categoryGroups } from "@/lib/categories";

const Categories = () => {
  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container-premium py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Product Categories</h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse our comprehensive range of scientific, industrial, and educational equipment. 
            Each category features premium products from trusted brands.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container-premium space-y-16">
          {categoryGroups.map((group) => (
            <div key={group.id} id={group.slug} className="scroll-mt-24">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{group.name}</h2>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="group bg-card border border-border rounded-lg p-6 card-hover"
                  >
                    <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <category.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category.productCount} products
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Categories;
