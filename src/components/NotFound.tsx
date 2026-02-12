import { Link } from 'react-router';
import { AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
      <h2 className="text-2xl mb-2">Page Not Found</h2>
      <p className="text-slate-600 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
}
