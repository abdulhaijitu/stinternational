

## Product Card সিম্পলিফিকেশন — shadcn স্ট্যান্ডার্ড

### সমস্যা
বর্তমান `DBProductCard` অতিরিক্ত জটিল:
- `framer-motion` দিয়ে `motion.article`, `motion.div`, `whileHover`, `whileTap`
- Gradient glow overlay, animated border glow, shine effect — ৩টি অতিরিক্ত decorative div
- Desktop/Mobile আলাদা বাটন লেআউট (দুইবার রেন্ডার)
- `group/btn`, `group/cart` নেস্টেড গ্রুপ হোভার ইফেক্ট

### পরিবর্তন — `src/components/products/DBProductCard.tsx`

| বিষয় | সরানো হবে | রাখা/যোগ হবে |
|---|---|---|
| **Wrapper** | `motion.article` + `whileHover` | সাধারণ `<article>` with `hover:shadow-md` |
| **Decorative divs** | gradient glow, border glow, shine overlay (৩টি div) | সব সরানো |
| **Image hover** | `group-hover:scale-105 group-hover:brightness-105` | শুধু `group-hover:scale-105` |
| **CTA বাটন** | Mobile/Desktop আলাদা ব্লক + motion wrapping | একটি unified ব্লক — View + Cart পাশাপাশি |
| **RFQ Link** | Hidden on mobile | রাখা হবে, যেমন আছে |
| **Import** | `framer-motion` import | সরানো |

### ফলাফল
- ক্লিন shadcn-style কার্ড: `border rounded-lg bg-card hover:shadow-md`
- কোন framer-motion ডিপেন্ডেন্সি নেই
- কোন decorative overlay নেই
- সিম্পল, রেসপন্সিভ বাটন লেআউট

