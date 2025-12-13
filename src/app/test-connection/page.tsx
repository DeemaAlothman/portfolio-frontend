"use client";

import { useState } from "react";
import Button from "@/components/auth/Button";

export default function TestConnectionPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Test basic connection
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.com",
          password: "test",
        }),
      });

      const data = await response.json();

      setResult(`✅ الاتصال ناجح!\n\nStatus: ${response.status}\nAPI URL: ${apiUrl}\n\nResponse:\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ فشل الاتصال!\n\nError: ${error.message}\n\nتأكد من:\n1. تشغيل Backend API\n2. المنفذ الصحيح في .env.local\n3. تفعيل CORS في Backend`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">اختبار الاتصال بالـ API</h1>

        <div className="mb-6 p-4 rounded-lg border border-white/[0.145] bg-secondary">
          <p className="text-sm text-zinc-400 mb-2">
            <strong className="text-white">API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
          </p>
          <p className="text-sm text-zinc-400">
            <strong className="text-white">Test Endpoint:</strong> POST /auth/login
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={testConnection} loading={loading}>
            {loading ? "جاري الاختبار..." : "اختبار الاتصال"}
          </Button>
        </div>

        {result && (
          <div className="p-6 rounded-lg border border-white/[0.145] bg-secondary">
            <h3 className="text-lg font-semibold mb-4">النتيجة:</h3>
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 p-6 rounded-lg border border-white/[0.145] bg-secondary/50">
          <h3 className="text-lg font-semibold mb-4">خطوات استكشاف الأخطاء:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
            <li>تأكد من تشغيل Backend API على المنفذ الصحيح</li>
            <li>تحقق من ملف <code className="text-white">.env.local</code> وتأكد من صحة <code className="text-white">NEXT_PUBLIC_API_URL</code></li>
            <li>افتح Console في المتصفح (F12) لمزيد من التفاصيل</li>
            <li>تأكد من تفعيل CORS في Backend API</li>
            <li>جرّب الوصول مباشرة: <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login`} target="_blank" className="text-white underline">{process.env.NEXT_PUBLIC_API_URL}/auth/login</a></li>
          </ol>
        </div>

        <div className="mt-8 p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <h3 className="text-lg font-semibold mb-4 text-yellow-500">⚠️ إعداد CORS في Backend</h3>
          <p className="text-sm text-zinc-400 mb-4">
            تأكد من إضافة هذا الكود في Backend:
          </p>
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-black/50 p-4 rounded">
{`import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));`}
          </pre>
        </div>
      </div>
    </div>
  );
}
