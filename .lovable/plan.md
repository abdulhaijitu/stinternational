

## সমস্যা

তিনটি পরপর সেকশন একই `bg-primary` (গাঢ় নেভি) কালার ব্যবহার করছে:

1. **Stats/Indicators** — `bg-primary` 
2. **Footer Trust Bar** — `bg-primary` (Footer এর অংশ)
3. **Footer Main** — `bg-primary`

ফলে তিনটি সেকশন মিশে যাচ্ছে, কোন ভিজুয়াল সেপারেশন নেই।

## সমাধান

**Stats সেকশনের ব্যাকগ্রাউন্ড পরিবর্তন** — এটিকে `bg-muted` (লাইট গ্রে) করে টেক্সট কালার `text-foreground` করা হবে। এতে Footer এর গাঢ় ব্লক থেকে আলাদা দেখাবে এবং ভিজুয়াল ব্রেক তৈরি হবে।

| সেকশন | বর্তমান | নতুন |
|---|---|---|
| Stats/Indicators | `bg-primary text-primary-foreground` | `bg-muted text-foreground` |
| Footer Trust Bar | `bg-primary` | অপরিবর্তিত |
| Footer | `bg-primary` | অপরিবর্তিত |

### পরিবর্তন

| ফাইল | কাজ |
|---|---|
| `src/pages/Index.tsx` | L420: Stats section — `bg-primary text-primary-foreground` → `bg-muted text-foreground`; stat value কালার `text-white` → `text-primary font-bold` |

