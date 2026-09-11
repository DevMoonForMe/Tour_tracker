"use client";

import { useState, useRef } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Download, Upload, CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';

export default function SettingsPage() {
  const { exportData, importData, fetchData, trips, members, expenses, contributions, isLoading } = useTripStore();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tour-split-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to export backup data.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    try {
      const text = await file.text();
      const success = await importData(text);
      if (success) {
        setStatusMessage({ type: 'success', text: 'Data imported and restored successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to import data. Please check JSON format.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Invalid JSON file selected.' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">App configuration and JSON database management</p>
      </header>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Database Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-slate-800">JSON Database Status</h2>
          </div>
          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Trips</span>
            <span className="text-xl font-bold text-slate-900">{trips.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Members</span>
            <span className="text-xl font-bold text-slate-900">{members.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Expenses</span>
            <span className="text-xl font-bold text-slate-900">{expenses.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Advances</span>
            <span className="text-xl font-bold text-slate-900">{contributions.length}</span>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Backup & Restore</h2>
        <p className="text-sm text-slate-600">
          All data is persisted in local JSON files in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary-700">/data</code> folder.
          You can download a complete backup or restore from an existing JSON file.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Data (JSON)
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Import Data (JSON)'}
          </button>
        </div>
      </div>
    </div>
  );
}
