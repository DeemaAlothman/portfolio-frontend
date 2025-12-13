"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ClientForm from "@/components/clients/ClientForm";
import { clientsAPI, Client } from "@/lib/services/clientsAPI";

function EditClientContent() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await clientsAPI.getById(id);
      setClient(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل بيانات العميل");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/60">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-error/10 border-2 border-error/20 rounded-lg text-error">
          {error || "العميل غير موجود"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">تعديل بيانات العميل</h1>
          <p className="text-foreground/60">تعديل بيانات: {client.name}</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-border p-6">
          <ClientForm client={client} mode="edit" />
        </div>
      </div>
    </div>
  );
}

export default function EditClientPage() {
  return (
    <ProtectedRoute>
      <EditClientContent />
    </ProtectedRoute>
  );
}
