"use client";

import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
}: ConfirmModalProps) {
  // منع scroll للصفحة لما الـ modal مفتوح
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // إغلاق لما نضغط Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "⚠️",
      iconBg: "bg-error/10",
      iconColor: "text-error",
      confirmBtn: "bg-error hover:bg-error/90 text-white",
    },
    warning: {
      icon: "⚡",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      icon: "ℹ️",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      confirmBtn: "bg-primary hover:bg-primary/90 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <span className="text-4xl">{styles.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
          <p className="text-foreground/70 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-8 pb-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-border text-foreground hover:bg-accent transition-all font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-xl transition-all font-medium ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
