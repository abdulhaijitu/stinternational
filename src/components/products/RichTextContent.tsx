import { cn } from '@/lib/utils';

interface RichTextContentProps {
  content: string;
  className?: string;
  isBangla?: boolean;
}

/**
 * Renders HTML content from rich text editor with proper styling
 * Supports headings, lists, links, images, and tables
 */
const RichTextContent = ({ content, className, isBangla = false }: RichTextContentProps) => {
  if (!content || content === '<p></p>') {
    return null;
  }

  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none",
        // Headings
        "prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-4 prose-headings:mb-2",
        "prose-h2:text-xl prose-h3:text-lg",
        // Paragraphs
        "prose-p:text-foreground prose-p:leading-relaxed prose-p:my-2",
        // Lists
        "prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2",
        "prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2",
        "prose-li:text-foreground prose-li:my-0.5",
        // Links
        "prose-a:text-primary prose-a:underline prose-a:hover:text-accent prose-a:transition-colors",
        // Strong/Bold
        "prose-strong:text-foreground prose-strong:font-semibold",
        // Italic
        "prose-em:text-foreground",
        // Images
        "prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:my-4",
        // Tables - using custom styles since Tailwind prose doesn't handle tables well by default
        "[&_table]:border-collapse [&_table]:w-full [&_table]:my-4",
        "[&_table]:border [&_table]:border-border",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground",
        "[&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:text-foreground",
        "[&_tr]:border-b [&_tr]:border-border",
        "[&_tr:last-child]:border-b-0",
        // Bangla font
        isBangla && "font-siliguri",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextContent;
