import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  name_bn: string;
  slug: string;
  description: string;
  description_bn: string;
  short_description: string;
  short_description_bn: string;
  price: string;
  compare_price: string;
  sku: string;
  category_id: string;
  image_url: string;
  images: string[];
  in_stock: boolean;
  stock_quantity: string;
  is_featured: boolean;
  is_active: boolean;
  specifications: string;
  features: string;
}

interface DraftData {
  formData: ProductFormData;
  savedAt: number;
  productId: string | null;
}

const DRAFT_KEY_PREFIX = 'product_draft_';
const AUTO_SAVE_DELAY = 3000; // 3 seconds
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const useProductDraft = (productId: string | null) => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  const getDraftKey = useCallback(() => {
    return `${DRAFT_KEY_PREFIX}${productId || 'new'}`;
  }, [productId]);

  // Check for existing draft on mount
  const checkForDraft = useCallback((): DraftData | null => {
    try {
      const key = getDraftKey();
      const saved = localStorage.getItem(key);
      
      if (!saved) return null;

      const draft: DraftData = JSON.parse(saved);
      
      // Check if draft has expired
      if (Date.now() - draft.savedAt > DRAFT_EXPIRY) {
        localStorage.removeItem(key);
        return null;
      }

      setHasDraft(true);
      setDraftSavedAt(new Date(draft.savedAt));
      return draft;
    } catch (error) {
      console.error('Error reading draft:', error);
      return null;
    }
  }, [getDraftKey]);

  // Save draft to localStorage
  const saveDraft = useCallback((formData: ProductFormData, showToast = false) => {
    try {
      const dataString = JSON.stringify(formData);
      
      // Skip if data hasn't changed
      if (dataString === lastSavedDataRef.current) {
        return;
      }

      const draft: DraftData = {
        formData,
        savedAt: Date.now(),
        productId,
      };

      localStorage.setItem(getDraftKey(), JSON.stringify(draft));
      lastSavedDataRef.current = dataString;
      setDraftSavedAt(new Date());
      setHasDraft(true);

      if (showToast) {
        toast.success('Draft saved', { duration: 1500 });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [getDraftKey, productId]);

  // Auto-save with debounce
  const autoSave = useCallback((formData: ProductFormData) => {
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setIsAutoSaving(true);

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraft(formData);
      setIsAutoSaving(false);
    }, AUTO_SAVE_DELAY);
  }, [saveDraft]);

  // Load draft data
  const loadDraft = useCallback((): ProductFormData | null => {
    const draft = checkForDraft();
    return draft?.formData || null;
  }, [checkForDraft]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(getDraftKey());
      setHasDraft(false);
      setDraftSavedAt(null);
      lastSavedDataRef.current = '';
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [getDraftKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Initial draft check
  useEffect(() => {
    checkForDraft();
  }, [checkForDraft]);

  return {
    hasDraft,
    draftSavedAt,
    isAutoSaving,
    saveDraft,
    autoSave,
    loadDraft,
    clearDraft,
    checkForDraft,
  };
};
