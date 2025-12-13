import React from 'react';
import { FileHistoryEntry, Language } from '../types';
import { Clock, FileText, Trash2, Download } from 'lucide-react';

interface FileHistoryProps {
  history: FileHistoryEntry[];
  onLoadFile: (entry: FileHistoryEntry) => void;
  onRemoveFile: (id: string) => void;
  onClearHistory: () => void;
  lang: Language;
  t: any;
}

export const FileHistory: React.FC<FileHistoryProps> = ({
  history,
  onLoadFile,
  onRemoveFile,
  onClearHistory,
  lang,
  t
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const locale = lang === 'de' ? 'de-DE' : lang === 'es' ? 'es-ES' : 'en-US';

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <FileText size={48} className="mb-4 opacity-50" />
        <p className="text-sm">{t.history.empty}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {t.history.title}
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1"
          >
            <Trash2 size={12} />
            {t.history.clear_all}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onLoadFile(entry)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {entry.fileName}
                </h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(entry.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock size={10} />
                <span>{formatDate(entry.timestamp)}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {t.history.records}: <span className="font-bold text-slate-700 dark:text-slate-300">{entry.recordCount}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {t.history.total_cost}: <span className="font-bold text-slate-700 dark:text-slate-300">€{entry.totalCost.toLocaleString()}</span>
              </div>
              {entry.fileSize && (
                <div className="text-slate-500 dark:text-slate-400">
                  {t.history.size}: <span className="font-bold text-slate-700 dark:text-slate-300">{formatFileSize(entry.fileSize)}</span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300">
                <Download size={10} />
                {t.history.load}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
