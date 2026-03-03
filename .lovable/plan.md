

## /categories ও CategoryPage অডিট রিপোর্ট

### চিহ্নিত সমস্যা

#### সমস্যা ১: CategoryPage — হার্ডকোডেড ইংরেজি টেক্সট (Moderate)
**ফাইল:** `src/pages/CategoryPage.tsx`

| লাইন | সমস্যা | ফিক্স |
|---|---|---|
| 204 | `"Parent Category"` ব্যাজ — হার্ডকোডেড | `language === "bn" ? "প্যারেন্ট ক্যাটাগরি" : "Parent Category"` |
| 211 | `"sub-categories"` — হার্ডকোডেড | `language === "bn" ? "সাব-ক্যাটাগরি" : "sub-categories"` |
| 229 | `"Browse Sub-Categories"` — হার্ডকোডেড | `language === "bn" ? "সাব-ক্যাটাগরি ব্রাউজ করুন" : "Browse Sub-Categories"` |
| 233 | `"No sub-categories found..."` — হার্ডকোডেড | দ্বিভাষিক করা |

#### সমস্যা ২: Categories পেইজ — `useMemo` দিয়ে `setState` কল (Minor)
**ফাইল:** `src/pages/Categories.tsx` (line 65-69)
- `useMemo` এর ভিতরে `setExpandedParents` কল করা হচ্ছে — এটি React anti-pattern
- **ফিক্স:** `useEffect` ব্যবহার করা

### যা ঠিক আছে
- ✅ Categories.tsx — সব হেডার, ব্যাজ, এরর মেসেজ দ্বিভাষিক
- ✅ Categories.tsx — কন্ট্রাস্ট ও বাটন ভিজিবিলিটি সঠিক
- ✅ CategoryPage — breadcrumb, product grid, SEO সব ঠিক
- ✅ PageSEO / CategorySEO — সঠিকভাবে ব্যবহৃত

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/CategoryPage.tsx` | ৪টি হার্ডকোডেড ইংরেজি স্ট্রিং দ্বিভাষিক করা |
| `src/pages/Categories.tsx` | `useMemo` → `useEffect` পরিবর্তন (line 65-69) |

