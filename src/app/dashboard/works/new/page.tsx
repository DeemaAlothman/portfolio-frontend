"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import WorkForm from "@/components/works/WorkForm";

function NewWorkContent() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard/works"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors font-medium mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l7-7-7-7" />
            </svg>
            رجوع لقائمة الأعمال
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">إضافة عمل جديد</h1>
          <p className="text-foreground/60">أضف عمل جديد إلى البورتفوليو</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-border p-6">
          <WorkForm mode="create" />
        </div>
      </div>
    </div>
  );
}

export default function NewWorkPage() {
  return (
    <ProtectedRoute>
      <NewWorkContent />
    </ProtectedRoute>
  );
}
