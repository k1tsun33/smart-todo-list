import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Task, PriorityLevel } from '../types/todo';
import { formatDueDate } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onPostponeDay: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, subtaskTitle: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onPostponeDay,
  onToggleSubtask,
  onAddSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState<string>('');
  const [isAddingSubtask, setIsAddingSubtask] = useState<boolean>(false);

  const dateInfo = formatDueDate(task.dueDate, task.dueTime);
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    onAddSubtask(task.id, newSubtaskInput.trim());
    setNewSubtaskInput('');
    setIsAddingSubtask(false);
  };

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return {
          textColor: 'text-rose-700',
          indicatorColor: 'bg-rose-500',
          label: 'Haute priorité',
        };
      case 'medium':
        return {
          textColor: 'text-amber-700',
          indicatorColor: 'bg-amber-500',
          label: 'Priorité moyenne',
        };
      case 'low':
      default:
        return {
          textColor: 'text-slate-600',
          indicatorColor: 'bg-slate-400',
          label: 'Priorité basse',
        };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <div
      className={`group relative bg-white border rounded-xl transition-all ${
        task.completed 
          ? 'border-slate-200 bg-slate-50/60 opacity-75' 
          : dateInfo.isOverdue 
            ? 'border-rose-200 shadow-sm hover:border-rose-300' 
            : 'border-slate-200/90 shadow-sm hover:border-indigo-200 hover:shadow'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Checkbox Button */}
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
            aria-label={task.completed ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              task.completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 text-transparent'
            }`}
          >
            <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
          </button>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3
                onClick={() => onToggleComplete(task.id)}
                className={`text-base font-semibold leading-snug cursor-pointer select-none transition-colors ${
                  task.completed
                    ? 'line-through text-slate-400'
                    : 'text-slate-900 group-hover:text-indigo-950'
                }`}
              >
                {task.title}
              </h3>

              {/* Action Buttons (visible on hover or focus) */}
              <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!task.completed && (
                  <button
                    onClick={() => onPostponeDay(task.id)}
                    title="Reporter de 1 jour"
                    aria-label="Reporter de 1 jour"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onEdit(task)}
                  title="Modifier la tâche"
                  aria-label="Modifier la tâche"
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  title="Supprimer la tâche"
                  aria-label="Supprimer la tâche"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description (if provided) */}
            {task.description && (
              <p className={`mt-1.5 text-sm leading-relaxed ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                {task.description}
              </p>
            )}

            {/* Metadata Line - ZERO-PILL DISCIPLINE (Natural text with typographic separators) */}
            <div className="mt-2.5 flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-500">
              {/* Due Date & Overdue status */}
              <span className={`inline-flex items-center gap-1 ${
                dateInfo.isOverdue && !task.completed ? 'text-rose-600 font-medium' : ''
              }`}>
                {dateInfo.isOverdue && !task.completed ? (
                  <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span>{dateInfo.text}</span>
              </span>

              <span aria-hidden="true" className="text-slate-300">·</span>

              {/* Priority */}
              <span className={`inline-flex items-center gap-1.5 ${priorityStyle.textColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.indicatorColor}`} />
                <span>{priorityStyle.label}</span>
              </span>

              <span aria-hidden="true" className="text-slate-300">·</span>

              {/* Category */}
              <span className="text-slate-600 font-medium">
                {task.category}
              </span>

              {/* Subtasks summary counter */}
              {totalSubtasks > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors font-mono tabular-nums"
                  >
                    <span>{completedSubtasks}/{totalSubtasks} sous-tâches</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </>
              )}

              {/* Reminder indication if present */}
              {task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore >= 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Rappel {task.reminderMinutesBefore === 0 ? 'à l’heure' : `${task.reminderMinutesBefore}m avant`}</span>
                  </span>
                </>
              )}
            </div>

            {/* Subtasks Progress Bar (when has subtasks) */}
            {totalSubtasks > 0 && (
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            )}

            {/* Expandable Subtasks Checklist */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2.5 text-sm pl-1">
                    <input
                      type="checkbox"
                      id={`st-${subtask.id}`}
                      checked={subtask.completed}
                      onChange={() => onToggleSubtask(task.id, subtask.id)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor={`st-${subtask.id}`}
                      className={`cursor-pointer select-none ${
                        subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {subtask.title}
                    </label>
                  </div>
                ))}

                {/* Inline Add Subtask */}
                {isAddingSubtask ? (
                  <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 mt-2 pt-1">
                    <input
                      type="text"
                      value={newSubtaskInput}
                      onChange={(e) => setNewSubtaskInput(e.target.value)}
                      placeholder="Nom de l’étape..."
                      autoFocus
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubtask(false)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Annuler
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingSubtask(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium pt-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ajouter une sous-tâche</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
