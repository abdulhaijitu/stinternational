import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  RemoveFormatting,
  Image as ImageIcon,
  Table as TableIcon,
  Trash2,
  Plus,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useState, useRef, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Lazy load MediaLibrary
const MediaLibrary = lazy(() => import('./MediaLibrary'));

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isBangla?: boolean;
  minHeight?: string;
}

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Start typing...', 
  className,
  isBangla = false,
  minHeight = '150px'
}: RichTextEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Image upload handler
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF images are allowed');
      return null;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return null;
    }

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `content/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-content')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-content')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-accent transition-colors',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border w-full my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/50 p-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none',
          'prose-headings:font-semibold prose-headings:text-foreground',
          'prose-p:text-foreground prose-p:leading-relaxed',
          'prose-strong:text-foreground prose-strong:font-semibold',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:text-foreground',
          'prose-img:rounded-lg prose-img:max-w-full',
          'prose-table:border-collapse prose-table:w-full',
          isBangla && 'font-siliguri'
        ),
        style: `min-height: ${minHeight}`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
              }
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Image upload handler with editor integration
  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    setIsUploading(true);
    const url = await uploadImage(file);
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Image uploaded successfully');
    }
    
    setIsUploading(false);
  }, [editor, uploadImage]);

  // File input change handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleImageUpload]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the container
    if (!editorContainerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  // Media library selection handler
  const handleMediaSelect = useCallback((url: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  // Insert table
  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // Table actions
  const addRowBefore = useCallback(() => editor?.chain().focus().addRowBefore().run(), [editor]);
  const addRowAfter = useCallback(() => editor?.chain().focus().addRowAfter().run(), [editor]);
  const deleteRow = useCallback(() => editor?.chain().focus().deleteRow().run(), [editor]);
  const addColumnBefore = useCallback(() => editor?.chain().focus().addColumnBefore().run(), [editor]);
  const addColumnAfter = useCallback(() => editor?.chain().focus().addColumnAfter().run(), [editor]);
  const deleteColumn = useCallback(() => editor?.chain().focus().deleteColumn().run(), [editor]);
  const deleteTable = useCallback(() => editor?.chain().focus().deleteTable().run(), [editor]);

  if (!editor) {
    return (
      <div className={cn(
        "border border-input rounded-md bg-background p-3",
        className
      )}>
        <div className="animate-pulse h-[150px] bg-muted rounded" />
      </div>
    );
  }

  const isInTable = editor.isActive('table');

  return (
    <>
      <div 
        ref={editorContainerRef}
        className={cn(
          "border border-input rounded-md bg-background overflow-hidden relative",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          isDragging && "ring-2 ring-primary ring-offset-2",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
          {/* Text formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bold') && "bg-accent text-accent-foreground"
            )}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('italic') && "bg-accent text-accent-foreground"
            )}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('heading', { level: 2 }) && "bg-accent text-accent-foreground"
            )}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('heading', { level: 3 }) && "bg-accent text-accent-foreground"
            )}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bulletList') && "bg-accent text-accent-foreground"
            )}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('orderedList') && "bg-accent text-accent-foreground"
            )}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('link') && "bg-accent text-accent-foreground"
            )}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          {/* Image Upload Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUploading}
                className="h-8 w-8 p-0"
                title="Insert Image"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                Upload New Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMediaLibraryOpen(true)}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Choose from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Table Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  isInTable && "bg-accent text-accent-foreground"
                )}
                title="Table"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {!isInTable ? (
                <DropdownMenuItem onClick={insertTable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Insert Table (3×3)
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={addRowBefore}>
                    Add Row Before
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={addRowAfter}>
                    Add Row After
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deleteRow} className="text-destructive">
                    Delete Row
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={addColumnBefore}>
                    Add Column Before
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={addColumnAfter}>
                    Add Column After
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deleteColumn} className="text-destructive">
                    Delete Column
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={deleteTable} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Table
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Clear formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="h-8 w-8 p-0"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </Button>

          <div className="flex-1" />
          
          {/* Undo/Redo */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <div className={cn("p-3 relative", isBangla && "font-siliguri")}>
          <EditorContent editor={editor} />
          {editor.isEmpty && (
            <p className={cn(
              "text-muted-foreground text-sm absolute top-3 left-3 pointer-events-none",
              isBangla && "font-siliguri"
            )}>
              {placeholder}
            </p>
          )}
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2 text-primary">
              <ImageIcon className="h-8 w-8" />
              <p className="font-medium">Drop image here</p>
            </div>
          </div>
        )}

        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading image...
            </div>
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      <Suspense fallback={null}>
        {mediaLibraryOpen && (
          <MediaLibrary
            open={mediaLibraryOpen}
            onOpenChange={setMediaLibraryOpen}
            onSelect={handleMediaSelect}
            selectable
          />
        )}
      </Suspense>
    </>
  );
};

export default RichTextEditor;
