import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, Tag, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Task, PriorityLevel, Category } from '../types/todo';
import { getTodayDateString } from '../utils/date';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  editingTask?: Task | null;
  categories: Category[];
  onAddCategory: (categoryName: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  categories,
  onAddCategory,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | undefined>(undefined);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate || getTodayDateString());
      setDueTime(editingTask.dueTime || '');
      setPriority(editingTask.priority || 'medium');
      setCategory(editingTask.category || (categories[0]?.name ?? 'Général'));
      setReminderMinutesBefore(editingTask.reminderMinutesBefore);
      setSubtasks(editingTask.subtasks ? [...editingTask.subtasks] : []);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setDueTime('');
      setPriority('medium');
      setCategory(categories[0]?.name || 'Études & Dev');
      setReminderMinutesBefore(undefined);
      setSubtasks([]);
    }
    setSubtaskInput('');
    setIsCreatingCat(false);
  }, [editingTask, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: 'st-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: subtaskInput.trim(),
        completed: false,
      },
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    onAddCategory(newCatInput.trim());
    setCategory(newCatInput.trim());
    setNewCatInput('');
    setIsCreatingCat(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        dueTime: dueTime.trim() || undefined,
        priority,
        category: category || 'Général',
        completed: editingTask ? editingTask.completed : false,
        subtasks,
        reminderMinutesBefore,
      },
      editingTask ? editingTask.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {editingTask ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Titre de la tâche <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser les requêtes SQL et CRUD..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Détails & Notes (Optionnel)
            </label>
            <textarea
              id="task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez des détails, liens ou notes pour cette tâche..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-due-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Date limite
              </label>
              <input
                id="task-due-date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label htmlFor="task-due-time" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Heure limite (Optionnel)
              </label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Flag className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Priorité
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'low'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Basse
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'medium'
                      ? 'bg-white text-amber-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Moyenne
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    priority === 'high'
                      ? 'bg-white text-rose-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Haute
                </button>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label htmlFor="task-cat" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                <Tag className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Catégorie
              </label>
              {isCreatingCat ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Nom catégorie..."
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCat(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <select
                    id="task-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCat(true)}
                    title="Ajouter une nouvelle catégorie"
                    className="px-2.5 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg text-xs"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification Reminder Interval */}
          <div>
            <label htmlFor="task-reminder" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Rappel & Alerte de notification
            </label>
            <select
              id="task-reminder"
              value={reminderMinutesBefore === undefined ? 'none' : reminderMinutesBefore}
              onChange={(e) => {
                const val = e.target.value;
                setReminderMinutesBefore(val === 'none' ? undefined : Number(val));
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="none">Aucun rappel spécifique</option>
              <option value="0">À l'heure exacte de l'échéance</option>
              <option value="15">15 minutes avant</option>
              <option value="60">1 heure avant</option>
              <option value="1440">1 jour avant (24 heures)</option>
            </select>
          </div>

          {/* Subtasks Builder */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Sous-tâches / Étapes ({subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg text-xs">
                  <span className="truncate text-slate-700">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-600"
                    aria-label="Supprimer cette sous-tâche"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Ajouter une sous-tâche..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingTask ? 'Enregistrer les modifications' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
