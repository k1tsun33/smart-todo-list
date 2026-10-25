import React from 'react';
import { 
  Inbox, 
  Sun, 
  Clock, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Folder, 
  Database,
  BarChart2
} from 'lucide-react';
import { ViewFilter, Category } from '../types/todo';

interface SmartFiltersProps {
  currentFilter: ViewFilter;
  onSelectFilter: (filter: ViewFilter) => void;
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
  categories: Category[];
  counts: {
    all: number;
    today: number;
    upcoming: number;
    overdue: number;
    highPriority: number;
    completed: number;
  };
  categoryCounts: Record<string, number>;
  onOpenCrudGuide: () => void;
  onOpenStats: () => void;
}

export const SmartFilters: React.FC<SmartFiltersProps> = ({
  currentFilter,
  onSelectFilter,
  selectedCategory,
  onSelectCategory,
  categories,
  counts,
  categoryCounts,
  onOpenCrudGuide,
  onOpenStats,
}) => {
  const filterItems = [
    {
      id: 'all' as ViewFilter,
      label: 'Toutes les tâches',
      icon: Inbox,
      count: counts.all,
    },
    {
      id: 'today' as ViewFilter,
      label: "Aujourd'hui",
      icon: Sun,
      count: counts.today,
      highlight: counts.today > 0,
    },
    {
      id: 'upcoming' as ViewFilter,
      label: 'À venir (7 jours)',
      icon: Clock,
      count: counts.upcoming,
    },
    {
      id: 'overdue' as ViewFilter,
      label: 'En retard',
      icon: AlertTriangle,
      count: counts.overdue,
      danger: counts.overdue > 0,
    },
    {
      id: 'high_priority' as ViewFilter,
      label: 'Haute priorité',
      icon: Flame,
      count: counts.highPriority,
    },
    {
      id: 'completed' as ViewFilter,
      label: 'Terminées',
      icon: CheckCircle2,
      count: counts.completed,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Vues Intelligentes */}
      <div>
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Vues Intelligentes
        </h3>
        <nav className="space-y-1">
          {filterItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentFilter === item.id && selectedCategory === null;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFilter(item.id);
                  onSelectCategory(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      item.danger
                        ? 'text-rose-600'
                        : isActive
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    item.danger
                      ? 'text-rose-600 font-bold'
                      : isActive
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Catégories / Projets */}
      <div>
        <div className="px-3 flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Catégories
          </h3>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <nav className="space-y-1">
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.name;
            const catCount = categoryCounts[cat.name] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isCatActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    isCatActive ? 'text-indigo-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {catCount}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Carte Pédagogique Débutant : "À apprendre : CRUD & Stockage" */}
      <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Apprentissage CRUD & Données</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Découvrez en temps réel les requêtes CRUD (Create, Read, Update, Delete) et inspectez le stockage JSON/SQLite.
        </p>
        <div className="pt-1 flex flex-col gap-1.5">
          <button
            onClick={onOpenCrudGuide}
            className="w-full text-center px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors cursor-pointer"
          >
            Ouvrir la Console CRUD
          </button>
          <button
            onClick={onOpenStats}
            className="w-full text-center px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Voir les Métriques</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
