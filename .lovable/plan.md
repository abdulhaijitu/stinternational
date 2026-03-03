

## Product Card UI/UX অডিট ও ফিক্স

### সমস্যাসমূহ

| # | সমস্যা | ফাইল |
|---|---|---|
| 1 | **Skeleton CTA mismatch** — Skeleton এখনও আলাদা mobile/desktop বাটন ব্লক দেখাচ্ছে (lines 98-108), কিন্তু কার্ড এখন unified single block ব্যবহার করে। এতে CLS (Cumulative Layout Shift) হয়। | `ProductGridSkeleton.tsx` |
| 2 | **WishlistButton hover:scale-110** — ছোট কার্ডে scale-110 অতিরিক্ত, পাশের এলিমেন্টে overlap করতে পারে | `WishlistButton.tsx` |
| 3 | **Image aspect ratio inconsistency** — Default variant এ `aspect-[4/3] sm:aspect-square` ব্যবহার হচ্ছে, যার ফলে mobile → desktop এ ইমেজ হাইট জাম্প করে। সব সাইজে `aspect-[4/3]` রাখলে consistent হবে | `DBProductCard.tsx` |
| 4 | **RFQ link uses raw `product.name`** — bilingual `productFields.name` ব্যবহার করা উচিত, `product.name` নয় | `DBProductCard.tsx` line 275 |
| 5 | **Compare+Wishlist always visible on mobile** — `opacity-100 sm:opacity-0` মানে মোবাইলে সবসময় দেখায়, ইমেজ এরিয়া crowded হয় | `DBProductCard.tsx` |

### ফিক্স প্ল্যান

**ফাইল ১: `src/components/products/ProductGridSkeleton.tsx`**
- CTA skeleton কে unified করা: একটি `flex gap-2` ব্লক (View button flex-1 + Cart icon button) — mobile/desktop আলাদা সরানো

**ফাইল ২: `src/components/products/DBProductCard.tsx`**
- Image aspect ratio: `aspect-[4/3] sm:aspect-square` → `aspect-[4/3]` (consistent)
- RFQ link: `product.name` → `productFields.name`
- Wishlist/Compare visibility: mobile তেও hover-on-touch দিয়ে দেখানো (বা সবসময় দেখানো রাখা — মোবাইলে hover নেই তাই এটি ঠিক আছে, পরিবর্তন দরকার নেই)

**ফাইল ৩: `src/components/products/WishlistButton.tsx`**
- `hover:scale-110` → `hover:scale-105` (সূক্ষ্ম)

### কোন পরিবর্তন নেই
- Compare/Wishlist মোবাইলে always visible রাখা ঠিক আছে কারণ মোবাইলে hover সম্ভব নয়

