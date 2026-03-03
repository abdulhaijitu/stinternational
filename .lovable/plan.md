

## সম্পূর্ণ অডিট রিপোর্ট ও ফিক্স প্ল্যান

### চিহ্নিত সমস্যা

#### সমস্যা ১: `hover:text-accent` — লাইট ব্যাকগ্রাউন্ডে টেক্সট অদৃশ্য (Critical)

Light mode-এ `--accent: 47 100% 96%` = প্রায় সাদা। তাই যেকোনো সাদা/ধূসর ব্যাকগ্রাউন্ডে `hover:text-accent` বা `text-accent` ব্যবহার করলে হোভারে টেক্সট অদৃশ্য হয়ে যায়।

**প্রভাবিত ফাইল ও লাইন:**

| ফাইল | লাইন | সমস্যা | ফিক্স |
|---|---|---|---|
| `src/pages/Index.tsx` | 284 | Category card "পণ্য দেখুন" লিঙ্ক `group-hover:text-accent` — হোভারে অদৃশ্য | `group-hover:text-primary/70` |
| `src/pages/Index.tsx` | 372 | "সব পণ্য দেখুন" লিঙ্ক `hover:text-accent` — হোভারে অদৃশ্য | `hover:text-primary/70` |
| `src/pages/Contact.tsx` | 306 | ফোন নম্বর লিঙ্ক `hover:text-accent` — হোভারে অদৃশ্য | `hover:text-primary/70` |
| `src/pages/RequestQuote.tsx` | 735 | ফোন নম্বর লিঙ্ক `hover:text-accent` — হোভারে অদৃশ্য | `hover:text-primary/70` |

**দ্রষ্টব্য:** Header top bar ও Footer-এ `hover:text-accent` ঠিক আছে কারণ সেখানে ব্যাকগ্রাউন্ড `bg-primary` (orange) — cream/white হোভার সেখানে দৃশ্যমান।

#### সমস্যা ২: Index Stats সেকশনে `text-accent` — Light mode-এ দুর্বল (Moderate)

| ফাইল | লাইন | সমস্যা | ফিক্স |
|---|---|---|---|
| `src/pages/Index.tsx` | 428 | Stats values `text-accent` (near-white) on `bg-primary` (orange) — কন্ট্রাস্ট দুর্বল | `text-white` ব্যবহার করা |

#### সমস্যা ৩: NotFound পেইজ — দ্বিভাষিক নয় (Minor)

| ফাইল | সমস্যা | ফিক্স |
|---|---|---|
| `src/pages/NotFound.tsx` | "Oops! Page not found" ও "Return to Home" শুধু ইংরেজিতে | ভাষা অনুযায়ী বাংলা/ইংরেজি দেখানো |

#### সমস্যা ৪: About পেইজ — `text-accent` আইকন লাইট ব্যাকগ্রাউন্ডে দুর্বল (Minor)

| ফাইল | লাইন | সমস্যা | ফিক্স |
|---|---|---|---|
| `src/pages/About.tsx` | 299 | Feature icon `text-accent` (near-white) on card bg — অদৃশ্য | `text-primary` |

---

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/Index.tsx` | L284: `group-hover:text-accent` → `group-hover:text-primary/70`; L372: `hover:text-accent` → `hover:text-primary/70`; L428: `text-accent` → `text-white` |
| `src/pages/Contact.tsx` | L306: `hover:text-accent` → `hover:text-primary/70` |
| `src/pages/RequestQuote.tsx` | L735: `hover:text-accent` → `hover:text-primary/70` |
| `src/pages/About.tsx` | L299: `text-accent` → `text-primary` |
| `src/pages/NotFound.tsx` | 404 টেক্সট দ্বিভাষিক করা (`useLanguage` হুক ব্যবহার করে) |

### যা ঠিক আছে (কোনো পদক্ষেপ নেই)
- ✅ Header top bar — `hover:text-accent` on `bg-primary` — ঠিক আছে (cream on orange = দৃশ্যমান)
- ✅ Footer — `hover:text-accent` ও `text-accent` on `bg-primary` — ঠিক আছে
- ✅ HeroSlider — dark gradient bg তে `hover:text-accent` — ঠিক আছে
- ✅ Cart, Checkout, Products, Orders, Account — সব ঠিক
- ✅ Button variants — সব সঠিক কন্ট্রাস্ট
- ✅ Admin পেইজ — `hover:text-accent-foreground` ব্যবহৃত (amber, ঠিক আছে)
- ✅ SEO — সব পেইজে PageSEO/BilingualSEO আছে
- ✅ DBProductCard — আগের ফিক্সে ঠিক করা হয়েছে

