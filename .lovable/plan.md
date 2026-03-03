

## /checkout পেইজ অডিট রিপোর্ট

### চিহ্নিত সমস্যা

#### সমস্যা ১: হার্ডকোডেড ইংরেজি স্ট্রিং (Minor)
**ফাইল:** `src/pages/Checkout.tsx` (line 311)

| লাইন | টেক্সট | সমস্যা |
|---|---|---|
| 311 | `"Operated by ST International, Dhaka, Bangladesh"` | হার্ডকোডেড ইংরেজি — বাংলা মোডেও ইংরেজি দেখায় |

**ফিক্স:** `language` চেক দিয়ে দ্বিভাষিক করা — `"পরিচালিত: ST International, ঢাকা, বাংলাদেশ"` / `"Operated by ST International, Dhaka, Bangladesh"`

### যা ঠিক আছে
- ✅ সব ফর্ম লেবেল, ভ্যালিডেশন, প্লেসহোল্ডার — `t.checkout.*` বা `language` চেক দিয়ে দ্বিভাষিক
- ✅ `formatPrice()` — সব কলে `language` পাস করা আছে (L573, L577, L586, L594, L601, L602, L608)
- ✅ BilingualSEO — `noIndex={true}` সহ সঠিকভাবে ব্যবহৃত
- ✅ fontClass — সব সেকশনে প্রয়োগ করা আছে
- ✅ Payment method, bank info, notes — সব দ্বিভাষিক
- ✅ Order confirmation — সব `t.checkout.*` দিয়ে দ্বিভাষিক
- ✅ Guest checkout flow — সঠিকভাবে কাজ করছে
- ✅ কালার/কন্ট্রাস্ট — সব সঠিক

### বাস্তবায়ন পরিকল্পনা

| ফাইল | কাজ |
|---|---|
| `src/pages/Checkout.tsx` | L311: হার্ডকোডেড স্ট্রিং → `language` চেক দিয়ে দ্বিভাষিক |

