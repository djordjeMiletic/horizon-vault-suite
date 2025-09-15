import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableCardProps {
  children: React.ReactNode;
  className?: string;
}

// Desktop table wrapper
const ResponsiveTableDesktop = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("hidden md:block overflow-x-auto", className)} {...props}>
      {children}
    </div>
  )
);
ResponsiveTableDesktop.displayName = "ResponsiveTableDesktop";

// Mobile cards wrapper
const ResponsiveTableMobile = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("block md:hidden space-y-3", className)} {...props}>
      {children}
    </div>
  )
);
ResponsiveTableMobile.displayName = "ResponsiveTableMobile";

// Mobile card component
const ResponsiveTableCard = React.forwardRef<HTMLDivElement, ResponsiveTableCardProps>(
  ({ className, children, ...props }, ref) => (
    <Card ref={ref} className={cn("p-4", className)} {...props}>
      <CardContent className="p-0 space-y-2">
        {children}
      </CardContent>
    </Card>
  )
);
ResponsiveTableCard.displayName = "ResponsiveTableCard";

// Field component for mobile cards
interface ResponsiveTableFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTableField = React.forwardRef<HTMLDivElement, ResponsiveTableFieldProps>(
  ({ label, children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex justify-between items-center py-1", className)} {...props}>
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <div className="text-sm">{children}</div>
    </div>
  )
);
ResponsiveTableField.displayName = "ResponsiveTableField";

export {
  ResponsiveTableDesktop,
  ResponsiveTableMobile,
  ResponsiveTableCard,
  ResponsiveTableField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};