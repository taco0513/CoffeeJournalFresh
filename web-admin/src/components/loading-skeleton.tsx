"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TableLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table header */}
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className="h-4 bg-gray-100 rounded animate-pulse"
                  style={{
                    animationDelay: `${(rowIndex * 8 + colIndex) * 50}ms`
                  }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FilterBarLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
        <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}