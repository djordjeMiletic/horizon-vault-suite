import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ open, onOpenChange, children, className }: ModalProps) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div 
        className={cn(
          "relative bg-card border border-border rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto",
          "w-[92vw] max-w-lg md:max-w-2xl",
          "p-4 md:p-6 lg:p-8",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 h-8 w-8 p-0"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <div className={cn("mb-6 pr-8", className)}>
    {children}
  </div>
);

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalTitle = ({ children, className }: ModalTitleProps) => (
  <h2 className={cn("text-lg font-semibold", className)}>
    {children}
  </h2>
);

interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalDescription = ({ children, className }: ModalDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground mt-2", className)}>
    {children}
  </p>
);

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent = ({ children, className }: ModalContentProps) => (
  <div className={cn("", className)}>
    {children}
  </div>
);

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={cn("flex justify-end gap-3 mt-6", className)}>
    {children}
  </div>
);