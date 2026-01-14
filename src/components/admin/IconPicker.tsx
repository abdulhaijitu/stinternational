import { useState } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { availableIcons, getIconsByCategory, getCategoryIcon, type IconOption } from "@/lib/categoryIcons";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

interface IconPickerProps {
  value: string | null;
  onChange: (iconName: string) => void;
}

const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const { language, t } = useAdminLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const iconsByCategory = getIconsByCategory();
  
  const picker = t.iconPicker;

  // Filter icons based on search
  const filteredIcons = searchQuery
    ? availableIcons.filter(
        (icon) =>
          icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          icon.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const CurrentIcon = getCategoryIcon(value);
  const fontClass = language === "bn" ? "font-siliguri" : "";

  return (
    <div className={`space-y-3 ${fontClass}`}>
      <div className="flex items-center gap-3">
        <Label>{picker?.label || "Category Icon"}</Label>
        {value && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CurrentIcon className="h-4 w-4" />
            <span>{value}</span>
          </div>
        )}
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={picker?.searchPlaceholder || "Search icons..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Icon Grid */}
      <ScrollArea className="h-[200px] border border-border rounded-lg">
        <div className="p-3">
          {filteredIcons ? (
            // Search results - flat grid
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {filteredIcons.map((iconOption) => (
                <IconButton
                  key={iconOption.name}
                  iconOption={iconOption}
                  isSelected={value === iconOption.name}
                  onClick={() => onChange(iconOption.name)}
                />
              ))}
              {filteredIcons.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground text-center py-4">
                  {picker?.noIconsFound || "No icons found"}
                </p>
              )}
            </div>
          ) : (
            // Grouped by category
            <div className="space-y-4">
              {Object.entries(iconsByCategory).map(([category, icons]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {icons.map((iconOption) => (
                      <IconButton
                        key={iconOption.name}
                        iconOption={iconOption}
                        isSelected={value === iconOption.name}
                        onClick={() => onChange(iconOption.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface IconButtonProps {
  iconOption: IconOption;
  isSelected: boolean;
  onClick: () => void;
}

const IconButton = ({ iconOption, isSelected, onClick }: IconButtonProps) => {
  const Icon = iconOption.icon;
  
  return (
    <button
      type="button"
      onClick={onClick}
      title={iconOption.label}
      className={cn(
        "relative h-9 w-9 rounded-md border flex items-center justify-center transition-all duration-150",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {isSelected && (
        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-primary rounded-full flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      )}
    </button>
  );
};

export default IconPicker;
