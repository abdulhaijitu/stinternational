

## বাটন ভিজিবিলিটি অডিট ও ফিক্স প্ল্যান

### চিহ্নিত সমস্যা

#### সমস্যা ১: About পেইজ CTA সেকশন — বাটন অদৃশ্য (Critical)
**ফাইল:** `src/pages/About.tsx` (line 457)
- সেকশনের ব্যাকগ্রাউন্ড `bg-primary` (orange)
- বাটন ভ্যারিয়েন্ট `hero` = `bg-primary text-primary-foreground` (orange bg)
- ফলাফল: **কমলা ব্যাকগ্রাউন্ডে কমলা বাটন — কোনো কন্ট্রাস্ট নেই**
- **ফিক্স:** `hero` বাটনকে `variant="default"` + `className="bg-white text-primary hover:bg-white/90"` দিয়ে প্রতিস্থাপন করা, এবং `hero-secondary` বাটনকে ঠিক রাখা

#### সমস্যা ২: DBProductCard গ্র্যাডিয়েন্ট ওভারলে — টেক্সট অদৃশ্য হয় (Moderate)
**ফাইল:** `src/components/products/DBProductCard.tsx` (line 323)
- হোভারে গ্র্যাডিয়েন্ট: `from-primary via-primary to-accent`
- Light mode-এ accent = `hsl(47 100% 96%)` (প্রায় সাদা)
- বাটনের টেক্সট `primary-foreground` (cream) — সাদার উপর cream অদৃশ্য
- **ফিক্স:** গ্র্যাডিয়েন্টে `to-accent` বদলে `to-primary/80` ব্যবহার করা

#### সমস্যা ৩: ডিসকাউন্ট ব্যাজ কন্ট্রাস্ট দুর্বল (Minor)
**ফাইল:** `src/components/products/DBProductCard.tsx` (line 120-127)
- `bg-accent text-accent-foreground` = হালকা হলুদ bg + অ্যাম্বার টেক্সট
- WCAG কন্ট্রাস্ট রেশিও ~2.5:1 (minimum 4.5:1 প্রয়োজন)
- **ফিক্স:** `bg-primary text-primary-foreground` ব্যবহার করা (orange bg + cream text)

#### সমস্যা ৪: ProductPage ডিসকাউন্ট টেক্সট — একই কন্ট্রাস্ট সমস্যা
**ফাইল:** `src/pages/ProductPage.tsx` (line 298)
- `bg-accent/10 text-accent-foreground` — প্রায় transparent bg + amber text
- **ফিক্স:** `bg-primary/10 text-primary font-semibold` ব্যবহার করা

#### সমস্যা ৫: Wishlist পেইজ — ডিসকাউন্ট ব্যাজ একই সমস্যা
**ফাইল:** `src/pages/Wishlist.tsx` (line 135)
- `bg-accent text-accent-foreground` — একই কন্ট্রাস্ট সমস্যা
- **ফিক্স:** `bg-primary text-primary-foreground` ব্যবহার করা

---

### বাস্তবায়ন পরিকল্পনা

| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/About.tsx` | CTA সেকশনে `hero` বাটনকে white bg + primary text দিয়ে প্রতিস্থাপন |
| `src/components/products/DBProductCard.tsx` | গ্র্যাডিয়েন্ট `to-accent` → `to-primary/80`; ব্যাজ `bg-accent` → `bg-primary` |
| `src/pages/ProductPage.tsx` | ডিসকাউন্ট ব্যাজে `bg-accent/10 text-accent-foreground` → `bg-primary/10 text-primary` |
| `src/pages/Wishlist.tsx` | ডিসকাউন্ট ব্যাজে `bg-accent text-accent-foreground` → `bg-primary text-primary-foreground` |

### যা ঠিক আছে (কোনো পদক্ষেপ নেই)
- ✅ Cart পেইজ — সব বাটন `variant="default"` বা `variant="outline"`, সঠিক কন্ট্রাস্ট
- ✅ Checkout পেইজ — সব বাটন সঠিক
- ✅ Products পেইজ — সার্চ, ফিল্টার বাটন সঠিক
- ✅ Contact পেইজ — ফর্ম সাবমিট বাটন সঠিক
- ✅ Account পেইজ — সব বাটন সঠিক
- ✅ RequestQuote পেইজ — সব বাটন সঠিক
- ✅ Footer — `text-primary-foreground` on `bg-primary` — পর্যাপ্ত কন্ট্রাস্ট
- ✅ Header — সব নেভিগেশন বাটন সঠিক
- ✅ HeroCta — `text-primary-contrast` (dark brown) on orange — ভালো কন্ট্রাস্ট
- ✅ NotFound পেইজ — সিম্পল লিঙ্ক, সঠিক
- ✅ AuthForm — সব বাটন `variant="default"`, সঠিক
- ✅ QuickRfqForm — সব বাটন সঠিক

