import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-6">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
