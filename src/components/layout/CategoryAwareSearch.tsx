import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveCategories, DBCategory } from '@/hooks/useCategories';

interface CategoryAwareSearchProps {
  currentCategorySlug?: string;
  isCompact?: boolean;
}

const CategoryAwareSearch = ({ currentCategorySlug, isCompact = false }: CategoryAwareSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DBCategory | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { data: categories } = useActiveCategories();

  // Set initial category based on current route
  useEffect(() => {
    if (currentCategorySlug && categories) {
      const category = categories.find(c => c.slug === currentCategorySlug);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [currentCategorySlug, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      if (selectedCategory) {
        params.set('category', selectedCategory.slug);
      }
      navigate(`/products?${params.toString()}`);
    }
  };

  const handleCategorySelect = (category: DBCategory | null) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
  };

  const getPlaceholder = () => {
    if (selectedCategory) {
      return `Search in ${selectedCategory.name}...`;
    }
    return 'Search products, categories, brands...';
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className={`flex items-center rounded-md border border-border bg-muted/50 transition-all duration-200 ${
        isCompact ? 'h-9' : 'h-11'
      }`}>
        {/* Category Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`flex items-center gap-1 border-r border-border bg-background/50 hover:bg-background transition-colors ${
              isCompact ? 'px-2 h-9 text-xs' : 'px-3 h-11 text-sm'
            } ${selectedCategory ? 'text-primary font-medium' : 'text-muted-foreground'}`}
          >
            <span className={`truncate ${isCompact ? 'max-w-[60px]' : 'max-w-[100px]'}`}>
              {selectedCategory ? selectedCategory.name : 'All'}
            </span>
            <ChevronDown className={`shrink-0 transition-transform duration-200 ${
              isCategoryDropdownOpen ? 'rotate-180' : ''
            } ${isCompact ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </button>

          {/* Category Dropdown */}
          {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                  !selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                }`}
              >
                All Categories
              </button>
              
              <div className="h-px bg-border my-1" />
              
              {/* Category List */}
              {categories?.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                    selectedCategory?.id === category.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <span className="block truncate">{category.name}</span>
                  {category.parent_group && (
                    <span className="text-xs text-muted-foreground">{category.parent_group}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className={`w-full bg-transparent focus:outline-none ${
              isCompact ? 'px-2 text-xs' : 'px-3 text-sm'
            }`}
          />
          
          {/* Clear Category Button */}
          {selectedCategory && (
            <button
              type="button"
              onClick={clearCategory}
              className="p-1 hover:bg-muted rounded mr-1"
              title="Clear category filter"
            >
              <X className={`text-muted-foreground hover:text-foreground ${
                isCompact ? 'h-3 w-3' : 'h-4 w-4'
              }`} />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          className={`flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${
            isCompact ? 'h-7 w-7 mx-1 rounded' : 'h-9 w-9 mx-1 rounded'
          }`}
        >
          <Search className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </button>
      </div>
    </form>
  );
};

export default CategoryAwareSearch;
