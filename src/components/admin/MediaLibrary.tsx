import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Search, 
  Trash2, 
  Copy, 
  Check,
  Image as ImageIcon,
  Upload,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface MediaFile {
  name: string;
  id: string;
  url: string;
  created_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

interface MediaLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (url: string) => void;
  selectable?: boolean;
}

const MediaLibrary = ({ 
  open, 
  onOpenChange, 
  onSelect,
  selectable = false 
}: MediaLibraryProps) => {
  const { t } = useAdminLanguage();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('product-content')
        .list('content', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const filesWithUrls: MediaFile[] = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          name: file.name,
          id: file.id || file.name,
          url: supabase.storage
            .from('product-content')
            .getPublicUrl(`content/${file.name}`).data.publicUrl,
          created_at: file.created_at || '',
          metadata: file.metadata as MediaFile['metadata'],
        }));

      setFiles(filesWithUrls);
    } catch (error: any) {
      console.error('Failed to fetch media files:', error);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [open, fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast.success('Image uploaded successfully');
      fetchFiles();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    setDeleting(fileName);
    try {
      const { error } = await supabase.storage
        .from('product-content')
        .remove([`content/${fileName}`]);

      if (error) throw error;

      toast.success('Image deleted');
      setFiles(prev => prev.filter(f => f.name !== fileName));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleSelect = (url: string) => {
    if (onSelect) {
      onSelect(url);
      onOpenChange(false);
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Library
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 py-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchFiles}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <label>
            <Button variant="default" asChild disabled={uploading}>
              <span className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </span>
            </Button>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
              <p>{searchTerm ? 'No images found' : 'No images uploaded yet'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "group relative aspect-square rounded-lg overflow-hidden border bg-muted",
                    selectable && "cursor-pointer hover:ring-2 hover:ring-primary"
                  )}
                  onClick={() => selectable && handleSelect(file.url)}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {selectable ? (
                      <Button size="sm" variant="secondary">
                        Select
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(file.url);
                          }}
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.name);
                          }}
                          disabled={deleting === file.name}
                        >
                          {deleting === file.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-4 p-3 hover:bg-muted/50",
                    selectable && "cursor-pointer"
                  )}
                  onClick={() => selectable && handleSelect(file.url)}
                >
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.metadata?.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectable ? (
                      <Button size="sm" variant="secondary">
                        Select
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(file.url);
                          }}
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.name);
                          }}
                          disabled={deleting === file.name}
                        >
                          {deleting === file.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MediaLibrary;
