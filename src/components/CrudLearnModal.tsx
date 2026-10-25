import React, { useState } from 'react';
import { 
  Database, 
  Terminal, 
  Code, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Copy, 
  Layers, 
  FileText 
} from 'lucide-react';
import { Task, Category, CrudLogEntry } from '../types/todo';

interface CrudLearnModalProps {
  tasks: Task[];
  categories: Category[];
  crudLogs: CrudLogEntry[];
  onExport: () => void;
  onImport: (fileContent: string) => void;
  onResetData: () => void;
  onClearLogs: () => void;
}

export const CrudLearnModal: React.FC<CrudLearnModalProps> = ({
  tasks,
  categories,
  crudLogs,
  onExport,
  onImport,
  onResetData,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'live_logs' | 'database_view' | 'sql_guide'>('live_logs');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const rawJson = JSON.stringify({ total: tasks.length, tasks }, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.onerror = () => {
      setImportError('Erreur de lecture du fichier sélectionné.');
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Database className="w-4 h-4" />
              <span>Module Pédagogique Débutant</span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Guide Pratique : CRUD & Stockage des Données
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Comprenez concrètement le cycle de vie des données (<strong>C</strong>reate, <strong>R</strong>ead, <strong>U</strong>pdate, <strong>D</strong>elete) et visualisez le pont entre le code JavaScript et une base SQLite/Flask.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter JSON</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importer JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>

            <button
              onClick={onResetData}
              title="Réinitialiser avec les données d'exemple"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {importError && (
          <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800 text-rose-200 text-xs rounded-lg">
            {importError}
          </div>
        )}

        {/* 4 CRUD Concept Badges (Clean tabular style) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-emerald-400 font-mono">CREATE</div>
            <div className="text-xs text-slate-300 mt-0.5">Ajout d'une tâche</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">SQL: INSERT INTO tasks</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-sky-400 font-mono">READ</div>
            <div className="text-xs text-slate-300 mt-0.5">Affichage & Filtres</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">SQL: SELECT * FROM tasks</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-amber-400 font-mono">UPDATE</div>
            <div className="text-xs text-slate-300 mt-0.5">Édition / Checkbox</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">SQL: UPDATE tasks SET...</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-rose-400 font-mono">DELETE</div>
            <div className="text-xs text-slate-300 mt-0.5">Suppression</div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">SQL: DELETE FROM tasks</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('live_logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'live_logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Journal CRUD en Temps Réel ({crudLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database_view')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'database_view'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Inspecteur JSON Local ({tasks.length} entrées)</span>
        </button>

        <button
          onClick={() => setActiveTab('sql_guide')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sql_guide'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Équivalent Python Flask & SQLite</span>
        </button>
      </div>

      {/* Tab 1: Live CRUD Logs */}
      {activeTab === 'live_logs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Flux d'opérations déclenchées par vos actions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque clic sur l'application (ajout, cochage, report, suppression) produit une requête CRUD tracée ci-dessous.
              </p>
            </div>
            {crudLogs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Vider le journal
              </button>
            )}
          </div>

          {crudLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Aucune action enregistrée pour le moment. Cochez une tâche ou créez-en une pour voir le CRUD en action !
            </div>
          ) : (
            <div className="divide-y divide-slate-100 font-mono text-xs max-h-96 overflow-y-auto pr-1">
              {crudLogs.map((log) => {
                const getActionColor = () => {
                  switch (log.action) {
                    case 'CREATE': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
                    case 'READ': return 'text-sky-700 bg-sky-50 border-sky-200';
                    case 'UPDATE': return 'text-amber-700 bg-amber-50 border-amber-200';
                    case 'DELETE': return 'text-rose-700 bg-rose-50 border-rose-200';
                  }
                };

                return (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getActionColor()}`}>
                        {log.action}
                      </span>
                      <div className="min-w-0 font-sans">
                        <span className="text-xs font-semibold text-slate-800">{log.summary}</span>
                        {log.details && (
                          <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                            {JSON.stringify(log.details)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono tabular-nums">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Database JSON Inspector */}
      {activeTab === 'database_view' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Structure des données brutes stockées (localStorage / JSON)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                C'est exactement cette représentation qui est sauvegardée et persistée entre les rechargements de page.
              </p>
            </div>
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier JSON'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
            <code>{rawJson}</code>
          </pre>
        </div>
      )}

      {/* Tab 3: Python Flask & SQLite Guide */}
      {activeTab === 'sql_guide' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Comment transposer ce projet en Python Flask avec SQLite ?
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Dans un projet backend, le stockage ne se fait plus dans le navigateur (`localStorage`), mais sur un serveur dans un fichier de base de données relationnelle <code>todo.db</code>. Voici les 4 requêtes clés :
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Table Schema */}
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-indigo-400 font-sans mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>1. Schéma de la table SQLite</span>
              </div>
              <code className="text-emerald-400 block">
                CREATE TABLE IF NOT EXISTS tasks (<br/>
                &nbsp;&nbsp;id INTEGER PRIMARY KEY AUTOINCREMENT,<br/>
                &nbsp;&nbsp;title TEXT NOT NULL,<br/>
                &nbsp;&nbsp;description TEXT,<br/>
                &nbsp;&nbsp;due_date TEXT NOT NULL,<br/>
                &nbsp;&nbsp;priority TEXT CHECK(priority IN ('high', 'medium', 'low')),<br/>
                &nbsp;&nbsp;category TEXT DEFAULT 'Général',<br/>
                &nbsp;&nbsp;completed INTEGER DEFAULT 0<br/>
                );
              </code>
            </div>

            {/* Flask Routes */}
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-indigo-400 font-sans flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                <span>2. Routes Python Flask correspondant aux 4 actions CRUD</span>
              </div>

              <div>
                <span className="text-amber-400"># CREATE (POST /api/tasks)</span>
                <p className="text-slate-300">
                  cursor.execute("INSERT INTO tasks (title, due_date, priority) VALUES (?, ?, ?)", (title, due_date, priority))
                </p>
              </div>

              <div>
                <span className="text-sky-400"># READ (GET /api/tasks)</span>
                <p className="text-slate-300">
                  cursor.execute("SELECT * FROM tasks ORDER BY due_date ASC")
                </p>
              </div>

              <div>
                <span className="text-indigo-400"># UPDATE (PUT /api/tasks/&lt;id&gt;)</span>
                <p className="text-slate-300">
                  cursor.execute("UPDATE tasks SET completed = 1 WHERE id = ?", (task_id,))
                </p>
              </div>

              <div>
                <span className="text-rose-400"># DELETE (DELETE /api/tasks/&lt;id&gt;)</span>
                <p className="text-slate-300">
                  cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
