

## /about পেইজ অডিট রিপোর্ট

### চিহ্নিত সমস্যা

#### সমস্যা ১: Vision কার্ডের আইকন ব্যাকগ্রাউন্ড অদৃশ্য (Minor)
**ফাইল:** `src/pages/About.tsx` (line 194)
- `bg-accent` ব্যবহৃত — Light mode-এ `--accent: 47 100% 96%` (প্রায় সাদা)
- সাদা কার্ড ব্যাকগ্রাউন্ডে আইকন কন্টেইনার কার্যত অদৃশ্য
- **ফিক্স:** `bg-accent text-accent-foreground` → `bg-primary/10 text-primary` (Mission কার্ডের সাথে সামঞ্জস্যপূর্ণ স্টাইল)

### যা ঠিক আছে
- ✅ সব টেক্সট `t.about.*` দিয়ে দ্বিভাষিক — কোনো হার্ডকোডেড স্ট্রিং নেই
- ✅ Trust আইকন `text-primary` — আগের অডিটে ফিক্স করা হয়েছে
- ✅ Timeline year `text-primary` — আগের অডিটে ফিক্স করা হয়েছে
- ✅ CTA সেকশন — `bg-primary` এ `text-primary-foreground` সঠিক
- ✅ Hero সেকশন — `hero-gradient` এ `text-primary-foreground` সঠিক
- ✅ PageSEO — সঠিকভাবে ব্যবহৃত
- ✅ `fontClass` — সব সেকশনে প্রয়োগ করা আছে

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/About.tsx` | L194: Vision কার্ডের আইকন `bg-accent text-accent-foreground` → `bg-primary/10 text-primary` |

