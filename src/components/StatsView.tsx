import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, Target, Calendar, CheckSquare } from 'lucide-react';
import { Task, Category } from '../types/todo';
import { isTaskOverdue, isDueToday } from '../utils/date';

interface StatsViewProps {
  tasks: Task[];
  categories: Category[];
  onGoToTasks: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  tasks,
  categories,
  onGoToTasks,
}) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const overdue = tasks.filter(t => !t.completed && isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length;
  const todayDue = tasks.filter(t => !t.completed && isDueToday(t.dueDate)).length;

  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const highPriorityDone = tasks.filter(t => t.priority === 'high' && t.completed).length;

  const medPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  // Subtasks global count
  const allSubtasks = tasks.flatMap(t => t.subtasks || []);
  const completedSubtasks = allSubtasks.filter(s => s.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Banner Metric Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Statistiques & Performance
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Suivi en temps réel de votre productivité et de l'état d'avancement de vos tâches.
            </p>
          </div>
          <button
            onClick={onGoToTasks}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            Retour aux tâches
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-indigo-900">Taux de complétion global</span>
            <span className="text-indigo-700 font-mono tabular-nums text-sm font-bold">
              {completionRate}% ({completed} / {total})
            </span>
          </div>
          <div className="w-full bg-indigo-200/60 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* 4 KPI Grid (Clean unboxed metrics) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Tâches totales</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono tabular-nums">
              {total}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Terminées</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono tabular-nums">
              {completed}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>En retard</span>
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2 font-mono tabular-nums">
              {overdue}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pour aujourd'hui</span>
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2 font-mono tabular-nums">
              {todayDue}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Priorities + Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Répartition par Niveau de Priorité
          </h3>
          <div className="space-y-3 text-xs">
            {/* High */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Haute priorité ({highPriorityDone}/{highPriority} faites)
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {highPriority > 0 ? Math.round((highPriorityDone / highPriority) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{ width: `${highPriority > 0 ? (highPriorityDone / highPriority) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Moyenne priorité ({medPriority} tâches)
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {total > 0 ? Math.round((medPriority / total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${total > 0 ? (medPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Basse priorité ({lowPriority} tâches)
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {total > 0 ? Math.round((lowPriority / total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full"
                  style={{ width: `${total > 0 ? (lowPriority / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Répartition par Catégorie
          </h3>
          <div className="space-y-2.5 text-xs">
            {categories.map(cat => {
              const catTasks = tasks.filter(t => t.category === cat.name);
              const catDone = catTasks.filter(t => t.completed).length;
              return (
                <div key={cat.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-slate-800">{cat.name}</span>
                  </div>
                  <div className="font-mono tabular-nums text-slate-500">
                    {catDone} / {catTasks.length} terminée{catTasks.length > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtasks metric card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Sous-tâches & Étapes validées</div>
            <div className="text-xs text-slate-500">
              Découpage granulaire des objectifs en micro-étapes.
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-indigo-600 font-mono tabular-nums">
            {completedSubtasks} / {allSubtasks.length}
          </div>
          <div className="text-[11px] text-slate-400">étapes accomplies</div>
        </div>
      </div>
    </div>
  );
};
