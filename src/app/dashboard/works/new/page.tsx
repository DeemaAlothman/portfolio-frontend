"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import WorkForm from "@/components/works/WorkForm";

function NewWorkContent() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
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
