import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  totalItems?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
  totalItems,
  className
}: PaginationProps) {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Logic for ellipses
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pageNumbers.push(i);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(currentPage - 1);
      pageNumbers.push(currentPage);
      pageNumbers.push(currentPage + 1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }
  }

  const limits = [8, 16, 32, 64];

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4", className)}>
      <div className="flex items-center gap-4 order-2 sm:order-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Show</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-lg text-sm font-bold text-google-grey py-1 px-2 focus:outline-none focus:ring-2 focus:ring-google-blue cursor-pointer"
          >
            {limits.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">per page</span>
        </div>
        
        {totalItems !== undefined && (
          <div className="text-sm text-gray-500 hidden md:block">
            Total: <span className="font-bold text-google-grey">{totalItems}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-xl border-gray-200 hover:border-google-blue hover:text-google-blue disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <div key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-9 w-9 rounded-xl border-gray-200 font-bold transition-all duration-200",
                  isActive 
                    ? "bg-google-blue text-white border-google-blue shadow-md hover:bg-google-blue/90" 
                    : "bg-white text-gray-600 hover:border-google-blue hover:text-google-blue"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-xl border-gray-200 hover:border-google-blue hover:text-google-blue disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
