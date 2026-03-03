

## Language Switcher এনহ্যান্সমেন্ট

### বর্তমান অবস্থা
- **Desktop topbar** (L251): default variant — দুটো আলাদা বাটন, `bg-muted/50` ব্যাকগ্রাউন্ড
- **Mobile header** (L294): compact variant — সিঙ্গেল টগল বাটন
- **Mobile bottom nav**: আলাদাভাবে Globe আইকন ব্যবহার করে (LanguageSwitcher নয়)
- pill variant আছে কিন্তু কোথাও ব্যবহৃত নয়

### প্রস্তাবিত পরিবর্তন

**ফাইল:** `src/components/layout/LanguageSwitcher.tsx`

| ভেরিয়েন্ট | পরিবর্তন |
|---|---|
| **default** (desktop topbar) | shadcn `Toggle`-স্টাইল ডিজাইন — `rounded-md` border, active বাটনে `bg-primary text-primary-foreground` সাবটল স্লাইডিং ইন্ডিকেটর (framer-motion), Globe আইকন সরিয়ে ক্লিনার লুক, সাইজ ছোট করা |
| **compact** (mobile header) | shadcn Button ghost স্টাইল — `h-8 w-8` স্কয়ার বাটন, Globe আইকনের বদলে ভাষার কোড (`EN`/`বাং`) টেক্সট দিয়ে টগল, `border border-border rounded-md` |
| pill variant | অব্যবহৃত — সরিয়ে দেওয়া হবে কোড ক্লিনআপের জন্য |

### ডিজাইন ডিটেইল

**Desktop (default):**
```
┌──────────────┐
│ [EN] │ বাংলা │   ← active side gets bg-primary + text-primary-foreground
└──────────────┘      sliding motion.div indicator underneath
```
- `h-8` height, `text-xs` font, `rounded-md`, `border border-border`
- invertColors মোডে: `border-white/20`, active = `bg-white/20 text-white`

**Mobile (compact):**
```
┌────┐
│ বাং │   ← shows opposite language, tap to toggle
└────┘
```
- `h-8 px-2.5 rounded-md border border-border text-xs font-medium`
- AnimatePresence দিয়ে টেক্সট সুইচ অ্যানিমেশন বজায়

### বাস্তবায়ন

| ফাইল | কাজ |
|---|---|
| `src/components/layout/LanguageSwitcher.tsx` | সম্পূর্ণ রিডিজাইন — default ও compact ভেরিয়েন্ট এনহ্যান্স, pill সরানো, shadcn টোকেন ব্যবহার |

