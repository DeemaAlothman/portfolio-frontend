"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { mediaAPI, Media, MediaType } from "@/lib/services/mediaAPI";
import Button from "@/components/auth/Button";

interface MediaManagerProps {
  workId: string;
}

export default function MediaManager({ workId }: MediaManagerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [uploadType, setUploadType] = useState<MediaType>("IMAGE");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPrimary, setIsPrimary] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    altText: "",
    sortOrder: "0",
    isPrimary: false,
  });

  useEffect(() => {
    loadMedia();
  }, [workId]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaAPI.getMediaForWork(workId);
      setMedia(data);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الملفات");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("يرجى اختيار ملف");
      return;
    }

    setUploading(true);
    setError("");

    try {
      if (uploadType === "IMAGE") {
        await mediaAPI.uploadImage({
          workId,
          file,
          altText: altText || undefined,
          sortOrder: parseInt(sortOrder),
          isPrimary,
        });
      } else {
        await mediaAPI.uploadVideo({
          workId,
          file,
          altText: altText || undefined,
          sortOrder: parseInt(sortOrder),
        });
      }

      // Reset form
      setFile(null);
      setPreviewUrl("");
      setAltText("");
      setSortOrder("0");
      setIsPrimary(false);
      setShowUploadForm(false);

      // Reload media
      await loadMedia();
    } catch (err: any) {
      setError(err.message || "فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const handleStartEdit = (mediaItem: Media) => {
    setEditingId(mediaItem.id);
    setEditData({
      altText: mediaItem.altText || "",
      sortOrder: mediaItem.sortOrder.toString(),
      isPrimary: mediaItem.isPrimary,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await mediaAPI.update(id, {
        altText: editData.altText || undefined,
        sortOrder: parseInt(editData.sortOrder),
        isPrimary: editData.isPrimary,
      });

      setEditingId(null);
      await loadMedia();
    } catch (err: any) {
      setError(err.message || "فشل تحديث الملف");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف؟")) return;

    try {
      await mediaAPI.delete(id);
      await loadMedia();
    } catch (err: any) {
      setError(err.message || "فشل حذف الملف");
    }
  };

  const getFileTypeIcon = (type: MediaType) => {
    return type === "IMAGE" ? "🖼️" : "🎥";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-error/10 border-2 border-error/20 text-error">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="pb-6 border-b-2 border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">إضافة ملف جديد</h3>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-hover transition-all text-sm font-semibold"
          >
            {showUploadForm ? "❌ إخفاء النموذج" : "+ إضافة قسم جديد"}
          </button>
        </div>

        {showUploadForm && (
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
            {/* File Type Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نوع الملف *
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as MediaType)}
                className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="IMAGE">صورة 🖼️</option>
                <option value="VIDEO">فيديو 🎥</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                اختر الملف *
              </label>
              <input
                type="file"
                accept={uploadType === "IMAGE" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                {uploadType === "IMAGE" ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg border-2 border-border"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-w-xs h-auto rounded-lg border-2 border-border"
                  />
                )}
              </div>
            )}

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نص بديل (Alt Text)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="وصف الملف"
                className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ترتيب العرض
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Is Primary (Images only) */}
            {uploadType === "IMAGE" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="isPrimary" className="text-sm font-medium text-foreground">
                  صورة رئيسية
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                onClick={handleUpload}
                loading={uploading}
                variant="primary"
              >
                رفع الملف
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setFile(null);
                  setPreviewUrl("");
                  setAltText("");
                  setSortOrder("0");
                  setIsPrimary(false);
                }}
                className="px-6 py-3 rounded-full border-2 border-border text-foreground hover:bg-accent transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media List */}
      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">
          الملفات المرفوعة ({media.length})
        </h3>

        {media.length === 0 ? (
          <div className="text-center py-12 text-foreground/60">
            <p>لا توجد ملفات مرفوعة</p>
            <p className="text-sm mt-2">ابدأ بإضافة صور أو فيديوهات للعمل</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border-2 border-border bg-white hover:shadow-md transition-all"
              >
                {/* Media Preview */}
                <div className="mb-3">
                  {item.fileType === "IMAGE" ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                      alt={item.altText || ""}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}${item.fileUrl}`}
                      controls
                      className="w-full h-48 rounded-lg"
                    />
                  )}
                </div>

                {/* Media Info */}
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.altText}
                      onChange={(e) =>
                        setEditData({ ...editData, altText: e.target.value })
                      }
                      placeholder="نص بديل"
                      className="w-full px-3 py-2 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
                    />
                    <input
                      type="number"
                      value={editData.sortOrder}
                      onChange={(e) =>
                        setEditData({ ...editData, sortOrder: e.target.value })
                      }
                      placeholder="ترتيب العرض"
                      className="w-full px-3 py-2 rounded-lg bg-input-bg text-foreground border-2 border-border focus:border-primary focus:outline-none"
                    />
                    {item.fileType === "IMAGE" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`edit-primary-${item.id}`}
                          checked={editData.isPrimary}
                          onChange={(e) =>
                            setEditData({ ...editData, isPrimary: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-2 border-border text-primary"
                        />
                        <label
                          htmlFor={`edit-primary-${item.id}`}
                          className="text-sm text-foreground"
                        >
                          صورة رئيسية
                        </label>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-border text-foreground hover:bg-accent transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getFileTypeIcon(item.fileType)}</span>
                        <span className="text-sm font-medium text-foreground">
                          {item.fileType === "IMAGE" ? "صورة" : "فيديو"}
                        </span>
                      </div>
                      {item.isPrimary && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          رئيسية
                        </span>
                      )}
                    </div>

                    {item.altText && (
                      <p className="text-sm text-foreground/80 mb-2">{item.altText}</p>
                    )}

                    <p className="text-xs text-foreground/60 mb-3">
                      الترتيب: {item.sortOrder}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary/10 transition-all text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 px-4 py-2 rounded-lg border-2 border-error text-error hover:bg-error/10 transition-all text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
