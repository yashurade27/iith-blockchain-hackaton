import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function CustomTabs({ tabs, activeTab, onChange, className }: CustomTabsProps) {
  return (
    <div className={cn("inline-flex h-12 items-center justify-start rounded-full bg-gray-100/50 p-1 text-gray-500", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "group flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            activeTab === tab.id
              ? "bg-white text-google-grey shadow-sm"
              : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
                "ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                activeTab === tab.id ? "bg-gray-100 text-google-grey" : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
