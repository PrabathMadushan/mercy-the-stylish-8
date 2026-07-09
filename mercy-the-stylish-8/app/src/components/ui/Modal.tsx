import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-brand bg-white p-5 shadow-brand">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg italic text-plum">{title}</h3>
          <button onClick={onClose} className="text-plum" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="mb-4 text-sm text-gray-600">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}
