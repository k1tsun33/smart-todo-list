import { Task, Category, CrudLogEntry, NotificationItem } from '../types/todo';
import { getTodayDateString } from './date';

const TASKS_STORAGE_KEY = 'todolist_intelligente_tasks_v1';
const CATEGORIES_STORAGE_KEY = 'todolist_intelligente_categories_v1';
const CRUD_LOGS_STORAGE_KEY = 'todolist_intelligente_crud_logs_v1';
const NOTIFICATIONS_STORAGE_KEY = 'todolist_intelligente_notifications_v1';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-etudes', name: 'Études & Dev', color: '#4F46E5' }, // Indigo
  { id: 'cat-travail', name: 'Travail', color: '#0284C7' },     // Sky
  { id: 'cat-perso', name: 'Personnel', color: '#10B981' },     // Emerald
  { id: 'cat-projet', name: 'Projet SQLite', color: '#F59E0B' }, // Amber
  { id: 'cat-sante', name: 'Santé & Forme', color: '#EC4899' },  // Pink
];

export function getInitialTasks(): Task[] {
  const today = new Date();
  
  // Format dates relative to today
  const formatOffset = (days: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const yesterdayStr = formatOffset(-1);
  const todayStr = formatOffset(0);
  const tomorrowStr = formatOffset(1);
  const nextWeekStr = formatOffset(4);

  return [
    {
      id: 'task-1',
      title: 'Maîtriser les opérations CRUD et le stockage SQLite',
      description: 'Comprendre comment fonctionnent Create, Read, Update et Delete avec une base de données relationnelle et une API REST.',
      dueDate: todayStr,
      dueTime: '17:00',
      priority: 'high',
      category: 'Études & Dev',
      completed: false,
      subtasks: [
        { id: 'st-1', title: 'Comprendre l’instruction SQL INSERT (Create)', completed: true },
        { id: 'st-2', title: 'Comprendre l’instruction SQL SELECT (Read)', completed: true },
        { id: 'st-3', title: 'Comprendre l’instruction SQL UPDATE (Update)', completed: false },
        { id: 'st-4', title: 'Comprendre l’instruction SQL DELETE (Delete)', completed: false },
      ],
      reminderMinutesBefore: 60,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Corriger le rapport d’avancement de projet',
      description: 'Envoyer la version finale avec les graphiques de suivi et les retours de l’équipe.',
      dueDate: yesterdayStr,
      dueTime: '18:00',
      priority: 'high',
      category: 'Travail',
      completed: false,
      subtasks: [
        { id: 'st-5', title: 'Vérifier les chiffres du Q3', completed: true },
        { id: 'st-6', title: 'Exporter le fichier PDF', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Configurer les alertes de notifications du navigateur',
      description: 'Tester l’autorisation Notification API et les rappels sonores pour ne rien manquer.',
      dueDate: todayStr,
      dueTime: '14:30',
      priority: 'medium',
      category: 'Projet SQLite',
      completed: true,
      completedAt: new Date().toISOString(),
      subtasks: [
        { id: 'st-7', title: 'Demander la permission utilisateur', completed: true },
        { id: 'st-8', title: 'Créer le carillon sonore avec Web Audio', completed: true },
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Acheter les provisions pour la semaine',
      description: 'Légumes frais, fruits de saison, thé vert et snacks sains.',
      dueDate: tomorrowStr,
      dueTime: '11:00',
      priority: 'low',
      category: 'Personnel',
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Séance d’entraînement cardio & étirements',
      description: '45 minutes de fractionné suivi de 15 minutes de récupération.',
      dueDate: nextWeekStr,
      priority: 'medium',
      category: 'Santé & Forme',
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// ---------------- LOCALSTORAGE OPERATIONS ----------------

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return getInitialTasks();
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getInitialTasks();
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return getInitialTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadCrudLogs(): CrudLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CRUD_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logCrudOperation(action: CrudLogEntry['action'], entity: string, summary: string, details?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = loadCrudLogs();
    const newEntry: CrudLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      action,
      entity,
      summary,
      details,
    };
    // Keep last 40 logs
    const updated = [newEntry, ...logs].slice(0, 40);
    localStorage.setItem(CRUD_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to log CRUD action', err);
  }
}

export function loadNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(items: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
}

// ---------------- EXPORT & IMPORT ----------------

export function exportTasksAsJSON(tasks: Task[], categories: Category[]): void {
  const exportData = {
    app: 'To-Do List Intelligente',
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalTasks: tasks.length,
    categories,
    tasks,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todolist-backup-${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importTasksFromJSON(jsonString: string): { success: boolean; message: string; tasks?: Task[]; categories?: Category[] } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (!Array.isArray(parsed.tasks) && !Array.isArray(parsed))) {
      return { success: false, message: 'Format de fichier JSON invalide. Une liste de tâches est requise.' };
    }

    const tasks: Task[] = Array.isArray(parsed) ? parsed : parsed.tasks;
    const categories: Category[] | undefined = Array.isArray(parsed.categories) ? parsed.categories : undefined;

    // Basic validation
    const validTasks = tasks.filter(t => t && typeof t.title === 'string' && typeof t.id === 'string');
    if (validTasks.length === 0) {
      return { success: false, message: 'Aucune tâche valide trouvée dans ce fichier.' };
    }

    return {
      success: true,
      message: `${validTasks.length} tâche(s) importée(s) avec succès.`,
      tasks: validTasks,
      categories,
    };
  } catch (err) {
    return { success: false, message: 'Erreur d’analyse JSON : ' + (err instanceof Error ? err.message : 'Fichier corrompu') };
  }
}
