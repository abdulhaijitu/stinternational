

## ফুটার ব্যাকগ্রাউন্ড সাদা করা ও এলিমেন্ট অ্যাডজাস্ট

### পরিবর্তন

**ফাইল:** `src/components/layout/Footer.tsx`

| এলিমেন্ট | বর্তমান | নতুন |
|---|---|---|
| **Footer wrapper** | `bg-primary text-primary-foreground` | `bg-background text-foreground border-t border-border` |
| **Trust Bar border** | `border-primary-foreground/10` | `border-border` |
| **Trust Bar text** | `text-primary-foreground/80` | `text-muted-foreground` |
| **Trust Bar icons** | `text-accent` | `text-primary` |
| **Logo** | `brightness-0 invert` (সাদা করার জন্য) | ফিল্টার সরানো — অরিজিনাল লোগো দেখাবে |
| **Company text** | `text-primary-foreground/70`, `/60` | `text-foreground`, `text-muted-foreground` |
| **Social icons** | `bg-primary-foreground/10` hover `bg-accent` | `bg-muted` hover `bg-primary hover:text-primary-foreground` |
| **Headings** | ডিফল্ট (white) | `text-foreground` |
| **Links** | `text-primary-foreground/60` hover `text-accent` | `text-muted-foreground` hover `text-primary` |
| **Contact icons** | `text-accent` | `text-primary` |
| **Contact text** | `text-primary-foreground/70` | `text-muted-foreground` |
| **Separator** | `bg-primary-foreground/10` | `bg-border` |
| **Payment badges** | `bg-primary-foreground/10 text-primary-foreground/70` | `bg-muted text-muted-foreground` |
| **Payment label** | `text-primary-foreground/40` | `text-muted-foreground/60` |
| **Copyright** | `text-primary-foreground/50` | `text-muted-foreground` |
| **Credit link** | `text-primary-foreground/70` hover `text-accent` | `text-foreground` hover `text-primary` |

### বাস্তবায়ন
একটি ফাইল পরিবর্তন: `src/components/layout/Footer.tsx` — সব `primary-foreground` রেফারেন্স সরিয়ে `foreground`/`muted-foreground`/`primary` দিয়ে প্রতিস্থাপন।

