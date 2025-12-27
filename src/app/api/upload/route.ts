import { NextRequest, NextResponse } from 'next/server';

// ⚙️ إعدادات مهمة لرفع الملفات الكبيرة
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // الحد الأقصى لحجم الملف
    },
    responseLimit: false,
  },
};

// ⏱️ تحديد الوقت الأقصى للـ request (10 دقائق)
export const maxDuration = 600; // 600 ثانية = 10 دقائق

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // هنا يتم رفع الملف للـ Backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch(`${backendUrl}/api/media/upload`, {
      method: 'POST',
      body: uploadFormData,
      // timeout أطول للملفات الكبيرة
      signal: AbortSignal.timeout(600000), // 10 دقائق
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
