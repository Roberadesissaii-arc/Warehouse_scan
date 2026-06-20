import { cn } from "@/lib/utils";

export type FilterOption<T extends string> = {
  id: T;
  label: string;
  count: number;
};

export function FilterBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: FilterOption<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="filter-bar" role="tablist" aria-label="Filter">
      <div className="filter-bar-track">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn("filter-pill", active && "filter-pill--active")}
              onClick={() => onChange(option.id)}
            >
              <span>{option.label}</span>
              <span className="filter-pill-count">{option.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
