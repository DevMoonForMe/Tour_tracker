import { useTripStore } from '../store/useTripStore';

export function Settings() {
  const { exportData } = useTripStore();

  const handleExport = () => {
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
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">App configuration and data management</p>
      </header>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-medium text-slate-800">Data Management</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Export Data (JSON)
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
            Import Data
          </button>
        </div>
      </div>
    </div>
  );
}
