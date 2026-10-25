import React from 'react';
import { Plus, Bell, Volume2, VolumeX, CheckSquare } from 'lucide-react';

interface TopNavProps {
  currentTab: 'tasks' | 'stats' | 'crud_guide' | 'notifications';
  setCurrentTab: (tab: 'tasks' | 'stats' | 'crud_guide' | 'notifications') => void;
  onOpenNewTaskModal: () => void;
  unreadNotificationsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewTaskModal,
  unreadNotificationsCount,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div 
          onClick={() => setCurrentTab('tasks')}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            To-Do List Intelligente
          </span>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentTab('tasks')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'tasks'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Mes Tâches
          </button>
          <button
            onClick={() => setCurrentTab('stats')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'stats'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Statistiques & Progrès
          </button>
          <button
            onClick={() => setCurrentTab('crud_guide')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'crud_guide'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Guide CRUD & Stockage
          </button>
          <button
            onClick={() => setCurrentTab('notifications')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'notifications'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Centre d'Alertes
          </button>
        </nav>

        {/* Zone 3: Primary Action + Utility Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
            aria-label={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Notifications Center Bell with real indicator */}
          <button
            onClick={() => setCurrentTab('notifications')}
            title="Notifications et rappels"
            aria-label="Voir les alertes et rappels"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono tabular-nums leading-none">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Primary CTA: Nouvelle tâche */}
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouvelle tâche</span>
          </button>
        </div>
      </div>
    </header>
  );
};
