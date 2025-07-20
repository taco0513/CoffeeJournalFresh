"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, X, Trash2, Edit, Loader2 } from "lucide-react";

interface BulkActionToolbarProps {
  selectedCount: number;
  onBulkVerify: () => Promise<void>;
  onBulkUnverify: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkEdit: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  onBulkVerify,
  onBulkUnverify,
  onBulkDelete,
  onBulkEdit,
  onClearSelection,
  isLoading = false,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          {selectedCount}개 선택됨
        </Badge>
        <span className="text-sm text-amber-700">
          선택된 항목에 대해 일괄 작업을 수행할 수 있습니다.
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkVerify}
          disabled={isLoading}
          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          일괄 검증
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkUnverify}
          disabled={isLoading}
          className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          일괄 미검증
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkEdit}
          disabled={isLoading}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <Edit className="h-4 w-4 mr-2" />
          일괄 수정
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              일괄 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                선택된 {selectedCount}개의 커피가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={onBulkDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isLoading}
        >
          선택 해제
        </Button>
      </div>
    </div>
  );
}