"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({
  children,
  pendingText,
  style,
  onClick,
}: {
  children: React.ReactNode;
  pendingText?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      style={{
        ...style,
        opacity: pending ? 0.7 : style?.opacity,
        cursor: pending ? "default" : style?.cursor,
      }}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {pendingText ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
