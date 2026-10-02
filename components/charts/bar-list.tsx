import { cn } from "@/lib/utils"

export interface BarItem {
  label: string
  value: number
  /** tailwind bg-* class for the fill */
  color: string
  /** optional display value override */
  display?: string
}

// Simple horizontal bar list for distributions and comparisons.
export function BarList({
  items,
  max,
  className,
}: {
  items: BarItem[]
  max?: number
  className?: string
}) {
  const ceiling = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums">{item.display ?? item.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-[width] duration-700 ease-out", item.color)}
              style={{ width: `${(item.value / ceiling) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
