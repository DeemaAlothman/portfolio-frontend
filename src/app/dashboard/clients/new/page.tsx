"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ClientForm from "@/components/clients/ClientForm";

function NewClientContent() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">إضافة عميل جديد</h1>
          <p className="text-foreground/60">أضف عميل أو شركة جديدة إلى القائمة</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-border p-6">
          <ClientForm mode="create" />
        </div>
      </div>
    </div>
  );
}

export default function NewClientPage() {
  return (
    <ProtectedRoute>
      <NewClientContent />
    </ProtectedRoute>
  );
}
