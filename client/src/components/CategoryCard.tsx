import { Link } from "react-router-dom";
import { Gauge, FileText, Wrench, TrafficCone, Truck, Beer, ArrowRight } from "lucide-react";
import type { OffenseCategory } from "../types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gauge: Gauge,
  "file-text": FileText,
  wrench: Wrench,
  "traffic-cone": TrafficCone,
  truck: Truck,
  beer: Beer,
};

interface CategoryCardProps {
  category: OffenseCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || FileText;

  return (
    <Link
      to={`/category/${category.id}`}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">{category.name}</h3>
        <p className="text-sm text-gray-500 truncate">{category.description}</p>
        <span className="text-xs text-gray-400">{category.count} offenses</span>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-gray-300" />
    </Link>
  );
}
