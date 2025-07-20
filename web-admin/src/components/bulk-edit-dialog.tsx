"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSave: (updates: BulkUpdateData) => Promise<void>;
  isLoading?: boolean;
}

export interface BulkUpdateData {
  roastery?: string;
  origin?: string;
  region?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  harvest_year?: number;
  [key: string]: string | number | undefined;
}

interface FieldUpdate {
  enabled: boolean;
  value: string | number;
}

export function BulkEditDialog({
  open,
  onOpenChange,
  selectedCount,
  onSave,
  isLoading = false,
}: BulkEditDialogProps) {
  const [fields, setFields] = useState<Record<string, FieldUpdate>>({
    roastery: { enabled: false, value: "" },
    origin: { enabled: false, value: "" },
    region: { enabled: false, value: "" },
    variety: { enabled: false, value: "" },
    process: { enabled: false, value: "" },
    altitude: { enabled: false, value: "" },
    harvest_year: { enabled: false, value: new Date().getFullYear() },
  });

  const handleFieldToggle = (fieldName: string, checked: boolean) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], enabled: checked }
    }));
  };

  const handleFieldChange = (fieldName: string, value: string | number) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value }
    }));
  };

  const handleSave = async () => {
    const updates: BulkUpdateData = {};
    
    Object.entries(fields).forEach(([key, field]) => {
      if (field.enabled && field.value !== "") {
        if (key === "harvest_year") {
          (updates as any)[key] = Number(field.value);
        } else {
          (updates as any)[key] = String(field.value);
        }
      }
    });

    await onSave(updates);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      // Reset fields
      setFields({
        roastery: { enabled: false, value: "" },
        origin: { enabled: false, value: "" },
        region: { enabled: false, value: "" },
        variety: { enabled: false, value: "" },
        process: { enabled: false, value: "" },
        altitude: { enabled: false, value: "" },
        harvest_year: { enabled: false, value: new Date().getFullYear() },
      });
    }
  };

  const enabledCount = Object.values(fields).filter(field => field.enabled).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>일괄 수정</DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="mr-2">
              {selectedCount}개 선택됨
            </Badge>
            선택된 커피들의 정보를 일괄로 수정할 수 있습니다. 
            수정하고 싶은 필드만 체크하고 값을 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
          {/* Roastery */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="roastery"
              checked={fields.roastery.enabled}
              onCheckedChange={(checked) => handleFieldToggle("roastery", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="roastery-input">로스터리</Label>
              <Input
                id="roastery-input"
                value={fields.roastery.value as string}
                onChange={(e) => handleFieldChange("roastery", e.target.value)}
                disabled={!fields.roastery.enabled}
                placeholder="로스터리명 입력"
              />
            </div>
          </div>

          {/* Origin */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="origin"
              checked={fields.origin.enabled}
              onCheckedChange={(checked) => handleFieldToggle("origin", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="origin-input">원산지</Label>
              <Input
                id="origin-input"
                value={fields.origin.value as string}
                onChange={(e) => handleFieldChange("origin", e.target.value)}
                disabled={!fields.origin.enabled}
                placeholder="원산지 입력"
              />
            </div>
          </div>

          {/* Region */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="region"
              checked={fields.region.enabled}
              onCheckedChange={(checked) => handleFieldToggle("region", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="region-input">지역</Label>
              <Input
                id="region-input"
                value={fields.region.value as string}
                onChange={(e) => handleFieldChange("region", e.target.value)}
                disabled={!fields.region.enabled}
                placeholder="지역 입력"
              />
            </div>
          </div>

          {/* Variety */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="variety"
              checked={fields.variety.enabled}
              onCheckedChange={(checked) => handleFieldToggle("variety", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="variety-input">품종</Label>
              <Input
                id="variety-input"
                value={fields.variety.value as string}
                onChange={(e) => handleFieldChange("variety", e.target.value)}
                disabled={!fields.variety.enabled}
                placeholder="품종 입력"
              />
            </div>
          </div>

          {/* Process */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="process"
              checked={fields.process.enabled}
              onCheckedChange={(checked) => handleFieldToggle("process", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="process-input">가공방식</Label>
              <Input
                id="process-input"
                value={fields.process.value as string}
                onChange={(e) => handleFieldChange("process", e.target.value)}
                disabled={!fields.process.enabled}
                placeholder="가공방식 입력"
              />
            </div>
          </div>

          {/* Altitude */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="altitude"
              checked={fields.altitude.enabled}
              onCheckedChange={(checked) => handleFieldToggle("altitude", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="altitude-input">고도</Label>
              <Input
                id="altitude-input"
                value={fields.altitude.value as string}
                onChange={(e) => handleFieldChange("altitude", e.target.value)}
                disabled={!fields.altitude.enabled}
                placeholder="고도 입력 (예: 1200-1400m)"
              />
            </div>
          </div>

          {/* Harvest Year */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="harvest_year"
              checked={fields.harvest_year.enabled}
              onCheckedChange={(checked) => handleFieldToggle("harvest_year", checked as boolean)}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="harvest_year-input">수확년도</Label>
              <Input
                id="harvest_year-input"
                type="number"
                min="2010"
                max={new Date().getFullYear() + 1}
                value={fields.harvest_year.value as number}
                onChange={(e) => handleFieldChange("harvest_year", parseInt(e.target.value) || new Date().getFullYear())}
                disabled={!fields.harvest_year.enabled}
                placeholder="수확년도"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {enabledCount > 0 ? (
                `${enabledCount}개 필드가 수정됩니다`
              ) : (
                "수정할 필드를 선택하세요"
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                취소
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={enabledCount === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    수정 중...
                  </>
                ) : (
                  `${selectedCount}개 항목 수정`
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}