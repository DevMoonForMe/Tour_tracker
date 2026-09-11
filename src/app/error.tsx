"use client";

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-red-200">
      <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
