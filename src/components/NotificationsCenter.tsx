import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Trash2,
  Calendar,
  Send
} from 'lucide-react';
import { Task, NotificationItem } from '../types/todo';
import { 
  getBrowserNotificationPermission, 
  requestBrowserNotificationPermission, 
  triggerSystemNotification,
  NotificationPermissionStatus 
} from '../utils/notifications';
import { soundEngine } from '../utils/sound';
import { formatDueDate, isTaskOverdue, isDueToday } from '../utils/date';

interface NotificationsCenterProps {
  tasks: Task[];
  notifications: NotificationItem[];
  onClearNotifications: () => void;
  onMarkNotificationRead: (id: string) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onPostponeDay: (taskId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  tasks,
  notifications,
  onClearNotifications,
  onMarkNotificationRead,
  onToggleCompleteTask,
  onPostponeDay,
  soundEnabled,
  onToggleSound,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
  };

  const handleSendTest = () => {
    soundEngine.playNotificationBell();
    triggerSystemNotification('⏰ Test de rappel intelligent', {
      body: 'Le système de notifications est pleinement opérationnel. Ne manquez plus aucune échéance !',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const overdueTasks = tasks.filter(t => !t.completed && isTaskOverdue(t.dueDate, t.dueTime, t.completed));
  const todayTasks = tasks.filter(t => !t.completed && isDueToday(t.dueDate) && !isTaskOverdue(t.dueDate, t.dueTime, t.completed));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Centre de Notifications & Rappels
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Gérez les alertes sonores et notifications push pour ne jamais oublier une échéance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSendTest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>{testSent ? 'Alerte envoyée !' : 'Tester une notification'}</span>
            </button>
            <button
              onClick={onToggleSound}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Sons activés' : 'Sons coupés'}</span>
            </button>
          </div>
        </div>

        {/* Browser Permission Status */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Autorisation Système du Navigateur
            </div>
            <div className="text-sm text-slate-800">
              {permission === 'granted' && (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Autorisé : Vous recevez les alertes en direct même lorsque l'onglet est en arrière-plan.
                </span>
              )}
              {permission === 'default' && (
                <span className="text-slate-600">
                  Non configuré : Autorisez les notifications pour recevoir des rappels sur votre bureau.
                </span>
              )}
              {permission === 'denied' && (
                <span className="text-rose-700 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Bloqué par le navigateur : Vous pouvez réactiver les alertes dans les paramètres du site.
                </span>
              )}
              {permission === 'unsupported' && (
                <span className="text-slate-500">
                  L'API Notifications n'est pas prise en charge sur ce navigateur (alertes in-app actives).
                </span>
              )}
            </div>
          </div>

          {permission !== 'granted' && permission !== 'unsupported' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors shrink-0 cursor-pointer"
            >
              Activer les notifications
            </button>
          )}
        </div>
      </div>

      {/* Alertes Actives : Tâches Urgentes & En Retard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Retards critiques */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Tâches en retard ({overdueTasks.length})
              </h3>
            </div>
          </div>

          {overdueTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Aucune tâche en retard ! Vous êtes parfaitement à jour.
            </div>
          ) : (
            <div className="space-y-2">
              {overdueTasks.map(task => {
                const dateInfo = formatDueDate(task.dueDate, task.dueTime);
                return (
                  <div key={task.id} className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-rose-950 truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-rose-600">
                        {dateInfo.text} · {task.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onPostponeDay(task.id)}
                        title="Reporter de 1 jour"
                        className="px-2 py-1 text-[11px] font-medium bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded"
                      >
                        +1 jour
                      </button>
                      <button
                        onClick={() => onToggleCompleteTask(task.id)}
                        title="Marquer comme fait"
                        className="px-2 py-1 text-[11px] font-medium bg-rose-600 text-white hover:bg-rose-700 rounded"
                      >
                        Fait
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Échéances du jour */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                À terminer aujourd'hui ({todayTasks.length})
              </h3>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Aucune autre tâche prévue pour aujourd'hui.
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <div key={task.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-indigo-950 truncate">
                      {task.title}
                    </div>
                    <div className="text-[11px] text-indigo-600">
                      {task.dueTime ? `Pour ${task.dueTime}` : 'Avant la fin de journée'} · {task.priority === 'high' ? 'Urgent' : 'Normal'}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleCompleteTask(task.id)}
                    className="px-2 py-1 text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded shrink-0"
                  >
                    Fait
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Historique des notifications */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Historique des alertes ({notifications.length})
            </h3>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tout effacer</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            L'historique des notifications est vide pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div key={n.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-800">{n.title}</div>
                  <div className="text-slate-600 mt-0.5">{n.message}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                    {new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => onMarkNotificationRead(n.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                  >
                    Marquer lu
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
