import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Plus, 
  Filter, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Task, Category, ViewFilter, SortOption, CrudLogEntry, NotificationItem } from './types/todo';
import { 
  loadTasks, 
  saveTasks, 
  loadCategories, 
  saveCategories, 
  loadCrudLogs, 
  logCrudOperation,
  loadNotifications,
  saveNotifications,
  exportTasksAsJSON,
  importTasksFromJSON,
  getInitialTasks,
  DEFAULT_CATEGORIES
} from './utils/storage';
import { soundEngine } from './utils/sound';
import { triggerSystemNotification } from './utils/notifications';
import { getTodayDateString, isTaskOverdue, isDueToday, isDueWithinDays, formatDueDate } from './utils/date';

import { TopNav } from './components/TopNav';
import { SmartFilters } from './components/SmartFilters';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { NotificationsCenter } from './components/NotificationsCenter';
import { CrudLearnModal } from './components/CrudLearnModal';
import { StatsView } from './components/StatsView';

export default function App() {
  // State
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [crudLogs, setCrudLogs] = useState<CrudLogEntry[]>(() => loadCrudLogs());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadNotifications());

  const [currentTab, setCurrentTab] = useState<'tasks' | 'stats' | 'crud_guide' | 'notifications'>('tasks');
  const [activeFilter, setActiveFilter] = useState<ViewFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate_asc');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [quickInput, setQuickInput] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Undo delete notification state
  const [undoItem, setUndoItem] = useState<{ task: Task; timerId: ReturnType<typeof setTimeout> } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Synchronize tasks to localStorage & state
  const updateTasksAndPersist = (newTasks: Task[], actionType: CrudLogEntry['action'], summary: string, details?: Record<string, unknown>) => {
    setTasks(newTasks);
    saveTasks(newTasks);
    logCrudOperation(actionType, 'Task', summary, details);
    setCrudLogs(loadCrudLogs());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts if typing in input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape' && isTaskModalOpen) {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen]);

  // Periodic Notification Engine (checks overdue tasks & triggers notifications)
  useEffect(() => {
    const checkDeadlines = () => {
      const currentTasks = loadTasks();
      const now = new Date();
      let hasNewNotification = false;
      const updatedNotifications: NotificationItem[] = [...loadNotifications()];

      currentTasks.forEach(task => {
        if (task.completed) return;

        // Check if task is overdue
        if (isTaskOverdue(task.dueDate, task.dueTime, task.completed)) {
          const notifId = `notif-overdue-${task.id}-${task.dueDate}`;
          const alreadyNotified = updatedNotifications.some(n => n.id === notifId);
          if (!alreadyNotified) {
            const newItem: NotificationItem = {
              id: notifId,
              taskId: task.id,
              title: `⚠️ Échéance dépassée : ${task.title}`,
              message: `Cette tâche était prévue pour le ${task.dueDate} et est désormais en retard.`,
              type: 'overdue',
              timestamp: now.toISOString(),
              read: false,
            };
            updatedNotifications.unshift(newItem);
            hasNewNotification = true;
            triggerSystemNotification(newItem.title, { body: newItem.message });
          }
        }
      });

      if (hasNewNotification) {
        saveNotifications(updatedNotifications);
        setNotifications(updatedNotifications);
      }
    };

    // Run check on mount and every 45 seconds
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 45000);
    return () => clearInterval(interval);
  }, []);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description?.toLowerCase().includes(q) ?? false;
          const matchesCat = task.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat) return false;
        }

        // Category filter
        if (selectedCategory && task.category !== selectedCategory) {
          return false;
        }

        // View Smart Filter
        switch (activeFilter) {
          case 'today':
            return isDueToday(task.dueDate);
          case 'upcoming':
            return isDueWithinDays(task.dueDate, 7);
          case 'overdue':
            return !task.completed && isTaskOverdue(task.dueDate, task.dueTime, task.completed);
          case 'high_priority':
            return task.priority === 'high';
          case 'completed':
            return task.completed;
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'dueDate_asc':
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            const timeA = `${a.dueDate}T${a.dueTime || '23:59'}`;
            const timeB = `${b.dueDate}T${b.dueTime || '23:59'}`;
            return timeA.localeCompare(timeB);
          case 'dueDate_desc':
            const tA = `${a.dueDate}T${a.dueTime || '00:00'}`;
            const tB = `${b.dueDate}T${b.dueTime || '00:00'}`;
            return tB.localeCompare(tA);
          case 'priority_desc': {
            const weights = { high: 3, medium: 2, low: 1 };
            return weights[b.priority] - weights[a.priority];
          }
          case 'title_asc':
            return a.title.localeCompare(b.title);
          case 'createdAt_desc':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [tasks, searchQuery, selectedCategory, activeFilter, sortBy]);

  // Counts for smart filters
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter(t => isDueToday(t.dueDate)).length,
      upcoming: tasks.filter(t => isDueWithinDays(t.dueDate, 7)).length,
      overdue: tasks.filter(t => !t.completed && isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      completed: tasks.filter(t => t.completed).length,
    };
  }, [tasks]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return map;
  }, [tasks]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Handlers for CRUD Operations
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();

    if (existingId) {
      // UPDATE Operation
      const updated = tasks.map(t => {
        if (t.id === existingId) {
          return {
            ...t,
            ...taskData,
            updatedAt: now,
          };
        }
        return t;
      });
      updateTasksAndPersist(updated, 'UPDATE', `Mise à jour tâche #${existingId}`, {
        title: taskData.title,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      });
    } else {
      // CREATE Operation
      const newTask: Task = {
        ...taskData,
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newTask, ...tasks];
      updateTasksAndPersist(updated, 'CREATE', `Création tâche : "${newTask.title}"`, {
        id: newTask.id,
        category: newTask.category,
        priority: newTask.priority,
      });
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const now = new Date().toISOString();
    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: quickInput.trim(),
      dueDate: getTodayDateString(),
      priority: 'medium',
      category: selectedCategory || (categories[0]?.name ?? 'Général'),
      completed: false,
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newTask, ...tasks];
    updateTasksAndPersist(updated, 'CREATE', `Ajout rapide : "${newTask.title}"`, {
      id: newTask.id,
    });
    setQuickInput('');
  };

  const handleToggleComplete = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const newCompleted = !target.completed;
    if (newCompleted && soundEnabled) {
      soundEngine.playCompletionChime();
    }

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    updateTasksAndPersist(
      updated,
      'UPDATE',
      `${newCompleted ? 'Tâche accomplie' : 'Tâche rouverte'} : "${target.title}"`,
      { completed: newCompleted }
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    if (soundEnabled) {
      soundEngine.playDeleteSound();
    }

    // Cancel existing undo if any
    if (undoItem) {
      clearTimeout(undoItem.timerId);
    }

    const updated = tasks.filter(t => t.id !== taskId);
    updateTasksAndPersist(updated, 'DELETE', `Suppression tâche : "${target.title}"`, { id: taskId });

    // Set 6-second undo toast
    const timerId = setTimeout(() => {
      setUndoItem(null);
    }, 6000);

    setUndoItem({ task: target, timerId });
  };

  const handleUndoDelete = () => {
    if (!undoItem) return;
    clearTimeout(undoItem.timerId);
    const restored = [undoItem.task, ...tasks];
    updateTasksAndPersist(restored, 'CREATE', `Annulation suppression : "${undoItem.task.title}"`, {
      id: undoItem.task.id,
    });
    setUndoItem(null);
  };

  const handlePostponeDay = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const currentDue = target.dueDate ? new Date(target.dueDate + 'T00:00:00') : new Date();
    currentDue.setDate(currentDue.getDate() + 1);

    const year = currentDue.getFullYear();
    const month = String(currentDue.getMonth() + 1).padStart(2, '0');
    const day = String(currentDue.getDate()).padStart(2, '0');
    const newDueDate = `${year}-${month}-${day}`;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          dueDate: newDueDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    updateTasksAndPersist(
      updated,
      'UPDATE',
      `Tâche reportée au ${newDueDate} : "${target.title}"`,
      { newDueDate }
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextSubtasks = t.subtasks.map(s => {
          if (s.id === subtaskId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...t, subtasks: nextSubtasks, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    updateTasksAndPersist(updated, 'UPDATE', `Mise à jour sous-tâche pour #${taskId}`);
  };

  const handleAddSubtask = (taskId: string, subtaskTitle: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextSubtasks = [
          ...(t.subtasks || []),
          {
            id: 'st-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            title: subtaskTitle,
            completed: false,
          },
        ];
        return { ...t, subtasks: nextSubtasks, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    updateTasksAndPersist(updated, 'UPDATE', `Ajout sous-tâche pour #${taskId}`, { title: subtaskTitle });
  };

  const handleAddCategory = (name: string) => {
    const colors = ['#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6', '#10B981'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name,
      color: randomColor,
    };
    const nextCats = [...categories, newCat];
    setCategories(nextCats);
    saveCategories(nextCats);
    logCrudOperation('CREATE', 'Category', `Nouvelle catégorie créée : "${name}"`);
    setCrudLogs(loadCrudLogs());
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
  };

  const handleResetData = () => {
    const initial = getInitialTasks();
    setTasks(initial);
    saveTasks(initial);
    setCategories(DEFAULT_CATEGORIES);
    saveCategories(DEFAULT_CATEGORIES);
    logCrudOperation('CREATE', 'System', 'Réinitialisation complète du jeu de données');
    setCrudLogs(loadCrudLogs());
  };

  const handleImportJSON = (fileContent: string) => {
    const res = importTasksFromJSON(fileContent);
    if (res.success && res.tasks) {
      setTasks(res.tasks);
      saveTasks(res.tasks);
      if (res.categories) {
        setCategories(res.categories);
        saveCategories(res.categories);
      }
      logCrudOperation('CREATE', 'Import', `Import de ${res.tasks.length} tâches`);
      setCrudLogs(loadCrudLogs());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar adhering to 3-zone contract */}
      <TopNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Undo Toast Notification */}
        {undoItem && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
            <span className="text-xs text-slate-200">
              Tâche <strong>"{undoItem.task.title}"</strong> supprimée.
            </span>
            <button
              onClick={handleUndoDelete}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Annuler</span>
            </button>
            <button
              onClick={() => {
                clearTimeout(undoItem.timerId);
                setUndoItem(null);
              }}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Mes Tâches */}
        {currentTab === 'tasks' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Smart Filters & Categories */}
            <SmartFilters
              currentFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categories}
              counts={counts}
              categoryCounts={categoryCounts}
              onOpenCrudGuide={() => setCurrentTab('crud_guide')}
              onOpenStats={() => setCurrentTab('stats')}
            />

            {/* Task Area */}
            <section className="flex-1 min-w-0 w-full space-y-4">
              {/* Controls bar: Search & Sort */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une tâche, description ou tag... (Tapez /)"
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2 shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="dueDate_asc">Échéance : Plus proche d'abord</option>
                    <option value="dueDate_desc">Échéance : Plus éloignée</option>
                    <option value="priority_desc">Priorité : Haute en premier</option>
                    <option value="title_asc">Titre : Ordre alphabétique</option>
                    <option value="createdAt_desc">Date d'ajout récente</option>
                  </select>
                </div>
              </div>

              {/* Quick Add Bar */}
              <form onSubmit={handleQuickAdd} className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex items-center gap-2">
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="+ Ajouter rapidement une tâche pour aujourd'hui... (Appuyez sur Entrée)"
                  className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!quickInput.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors cursor-pointer shrink-0"
                >
                  Ajouter
                </button>
              </form>

              {/* Active Filter Title & Header */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="text-xs font-semibold text-slate-500">
                  {selectedCategory ? (
                    <span>
                      Catégorie : <strong className="text-slate-800">{selectedCategory}</strong>
                    </span>
                  ) : (
                    <span>
                      Affichage : <strong className="text-slate-800">
                        {activeFilter === 'all' && 'Toutes les tâches'}
                        {activeFilter === 'today' && "Tâches d'aujourd'hui"}
                        {activeFilter === 'upcoming' && 'Tâches à venir (7 jours)'}
                        {activeFilter === 'overdue' && 'Tâches en retard'}
                        {activeFilter === 'high_priority' && 'Tâches prioritaires'}
                        {activeFilter === 'completed' && 'Tâches terminées'}
                      </strong>
                    </span>
                  )}
                  <span className="ml-2 font-mono tabular-nums text-slate-400">
                    ({filteredTasks.length} {filteredTasks.length > 1 ? 'tâches' : 'tâche'})
                  </span>
                </div>
              </div>

              {/* Task Items List */}
              {filteredTasks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Aucune tâche dans cette vue
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? 'Aucun résultat ne correspond à votre recherche.'
                      : 'Toutes les tâches de cette section sont terminées ou aucune tâche n’a été créée.'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer une tâche</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsTaskModalOpen(true);
                      }}
                      onPostponeDay={handlePostponeDay}
                      onToggleSubtask={handleToggleSubtask}
                      onAddSubtask={handleAddSubtask}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 2: Statistiques & Progrès */}
        {currentTab === 'stats' && (
          <StatsView
            tasks={tasks}
            categories={categories}
            onGoToTasks={() => setCurrentTab('tasks')}
          />
        )}

        {/* Tab 3: Guide CRUD & Stockage */}
        {currentTab === 'crud_guide' && (
          <CrudLearnModal
            tasks={tasks}
            categories={categories}
            crudLogs={crudLogs}
            onExport={() => exportTasksAsJSON(tasks, categories)}
            onImport={handleImportJSON}
            onResetData={handleResetData}
            onClearLogs={() => {
              localStorage.removeItem('todolist_intelligente_crud_logs_v1');
              setCrudLogs([]);
            }}
          />
        )}

        {/* Tab 4: Centre d'Alertes */}
        {currentTab === 'notifications' && (
          <NotificationsCenter
            tasks={tasks}
            notifications={notifications}
            onClearNotifications={() => {
              saveNotifications([]);
              setNotifications([]);
            }}
            onMarkNotificationRead={(id) => {
              const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
              saveNotifications(updated);
              setNotifications(updated);
            }}
            onToggleCompleteTask={handleToggleComplete}
            onPostponeDay={handlePostponeDay}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
