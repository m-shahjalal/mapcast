"use client";

import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* 404 Number */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-slate-800 tracking-tight">
            404
          </h1>
          <div className="w-24 h-1 bg-slate-800 mx-auto rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-700">
            Page Not Found
          </h2>
          <p className="text-slate-500 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window?.history.back?.()}
            className="inline-flex cursor-pointer items-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            GO BACK
          </button>
        </div>
      </div>
    </div>
  );
}
