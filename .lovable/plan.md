

## /cart পেইজ অডিট রিপোর্ট

### চিহ্নিত সমস্যা

#### সমস্যা ১: `formatPrice()` — ভাষা প্যারামিটার পাস হচ্ছে না (Moderate)
**ফাইল:** `src/pages/Cart.tsx` (line 97, 140, 145, 156)
- `formatPrice(item.price)` কল করা হচ্ছে কিন্তু `language` পাস হচ্ছে না
- ডিফল্ট `"bn"` — তাই ইংরেজি মোডেও বাংলা সংখ্যা (১,৫০০) দেখাচ্ছে
- **ফিক্স:** চারটি `formatPrice()` কলে `language` যোগ করা: `formatPrice(price, language)`

### যা ঠিক আছে
- ✅ সব টেক্সট `t.cart.*`, `t.common.*`, `t.checkout.*` দিয়ে দ্বিভাষিক
- ✅ PageSEO — সঠিক fallbackTitle (en/bn) সহ ব্যবহৃত
- ✅ fontClass — সব সেকশনে প্রয়োগ করা আছে
- ✅ Empty state — দ্বিভাষিক ও সুন্দর ডিজাইন
- ✅ কালার/কন্ট্রাস্ট — সব সঠিক
- ✅ aria-label — সব বাটনে আছে

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/Cart.tsx` | L97, L140, L145, L156: `formatPrice(x)` → `formatPrice(x, language)` |

