"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Check, X, Edit, Loader2, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import type { Database } from "@/types/supabase";
import { BulkActionToolbar } from "@/components/bulk-action-toolbar";
import { CoffeeFilterBar } from "@/components/coffee-filter-bar";
import { BulkEditDialog, BulkUpdateData } from "@/components/bulk-edit-dialog";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { TableLoadingSkeleton, FilterBarLoadingSkeleton } from "@/components/loading-skeleton";

type Coffee = Database["public"]["Tables"]["coffee_catalog"]["Row"];

export default function CoffeeCatalogPage() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [allCoffees, setAllCoffees] = useState<Coffee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roasterFilter, setRoasterFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [selectedCoffeeIds, setSelectedCoffeeIds] = useState<Set<string>>(new Set());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const supabase = createClient();
  const { execute: executeOptimistic } = useOptimisticUpdate();
  
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchCoffees();
  }, [currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
    fetchCoffees();
  }, [searchQuery, statusFilter, roasterFilter, dateRangeFilter]);

  const fetchCoffees = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("coffee_catalog")
        .select("*", { count: "exact" });

      // Apply filters
      if (searchQuery) {
        query = query.or(
          `coffee_name.ilike.%${searchQuery}%,roastery.ilike.%${searchQuery}%,origin.ilike.%${searchQuery}%`
        );
      }

      if (statusFilter === "verified") {
        query = query.eq("verified_by_moderator", true);
      } else if (statusFilter === "pending") {
        query = query.eq("verified_by_moderator", false);
      }

      if (roasterFilter !== "all") {
        query = query.eq("roastery", roasterFilter);
      }

      if (dateRangeFilter?.from) {
        query = query.gte("created_at", dateRangeFilter.from.toISOString());
      }
      if (dateRangeFilter?.to) {
        const toDate = new Date(dateRangeFilter.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", toDate.toISOString());
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to).order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      
      setCoffees(data || []);
      setTotalCount(count || 0);
      
      // Also fetch all coffees for bulk operations (without pagination)
      const { data: allData } = await supabase
        .from("coffee_catalog")
        .select("*")
        .order("created_at", { ascending: false });
      setAllCoffees(allData || []);
      
    } catch (error: any) {
      toast({
        title: "오류",
        description: "커피 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (coffee: Coffee) => {
    try {
      const { error } = await supabase
        .from("coffee_catalog")
        .update({ verified_by_moderator: true })
        .eq("id", coffee.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: `${coffee.coffee_name}이(가) 검증되었습니다.`,
      });
      
      fetchCoffees();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "커피 검증에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (coffee: Coffee) => {
    setSelectedCoffee(coffee);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCoffee) return;

    try {
      const { error } = await supabase
        .from("coffee_catalog")
        .update({
          roastery: selectedCoffee.roastery,
          coffee_name: selectedCoffee.coffee_name,
          origin: selectedCoffee.origin,
          region: selectedCoffee.region,
          variety: selectedCoffee.variety,
          process: selectedCoffee.process,
          altitude: selectedCoffee.altitude,
          harvest_year: selectedCoffee.harvest_year,
        })
        .eq("id", selectedCoffee.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "커피 정보가 업데이트되었습니다.",
      });
      
      setIsEditDialogOpen(false);
      fetchCoffees();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "커피 정보 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (coffee: Coffee) => {
    if (!confirm(`정말로 "${coffee.coffee_name}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("coffee_catalog")
        .delete()
        .eq("id", coffee.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "커피가 삭제되었습니다.",
      });
      
      fetchCoffees();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "커피 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Bulk operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = new Set(coffees.map(coffee => coffee.id));
      setSelectedCoffeeIds(currentPageIds);
    } else {
      setSelectedCoffeeIds(new Set());
    }
  };

  const handleSelectCoffee = (coffeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedCoffeeIds);
    if (checked) {
      newSelected.add(coffeeId);
    } else {
      newSelected.delete(coffeeId);
    }
    setSelectedCoffeeIds(newSelected);
  };

  const handleBulkVerify = async () => {
    const selectedIds = Array.from(selectedCoffeeIds);
    const originalCoffees = [...coffees];
    
    await executeOptimistic(
      // Optimistic update
      () => {
        setIsBulkLoading(true);
        setCoffees(prev => prev.map(coffee => 
          selectedCoffeeIds.has(coffee.id) 
            ? { ...coffee, verified_by_moderator: true }
            : coffee
        ));
      },
      // Actual API call
      async () => {
        const { error } = await supabase
          .from("coffee_catalog")
          .update({ verified_by_moderator: true })
          .in("id", selectedIds);

        if (error) throw error;
        return true;
      },
      // Revert function
      () => {
        setCoffees(originalCoffees);
      },
      // Config
      {
        onSuccess: () => {
          toast({
            title: "성공",
            description: `${selectedCoffeeIds.size}개 커피가 검증되었습니다.`,
          });
          setSelectedCoffeeIds(new Set());
          fetchCoffees(); // Refresh to ensure consistency
        },
        onError: (error: Error) => {
          toast({
            title: "오류",
            description: "일괄 검증에 실패했습니다.",
            variant: "destructive",
          });
        },
        onFinally: () => {
          setIsBulkLoading(false);
        }
      }
    );
  };

  const handleBulkUnverify = async () => {
    setIsBulkLoading(true);
    try {
      const { error } = await supabase
        .from("coffee_catalog")
        .update({ verified_by_moderator: false })
        .in("id", Array.from(selectedCoffeeIds));

      if (error) throw error;

      toast({
        title: "성공",
        description: `${selectedCoffeeIds.size}개 커피가 미검증 상태로 변경되었습니다.`,
      });
      
      setSelectedCoffeeIds(new Set());
      fetchCoffees();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "일괄 미검증 처리에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkLoading(true);
    try {
      const { error } = await supabase
        .from("coffee_catalog")
        .delete()
        .in("id", Array.from(selectedCoffeeIds));

      if (error) throw error;

      toast({
        title: "성공",
        description: `${selectedCoffeeIds.size}개 커피가 삭제되었습니다.`,
      });
      
      setSelectedCoffeeIds(new Set());
      fetchCoffees();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "일괄 삭제에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkEdit = () => {
    setIsBulkEditDialogOpen(true);
  };

  const handleBulkSave = async (updates: BulkUpdateData) => {
    setIsBulkLoading(true);
    try {
      const { error } = await supabase
        .from("coffee_catalog")
        .update(updates)
        .in("id", Array.from(selectedCoffeeIds));

      if (error) throw error;

      toast({
        title: "성공",
        description: `${selectedCoffeeIds.size}개 커피 정보가 업데이트되었습니다.`,
      });
      
      setIsBulkEditDialogOpen(false);
      setSelectedCoffeeIds(new Set());
      fetchCoffees();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "일괄 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCoffeeIds(new Set());
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRoasterFilter("all");
    setDateRangeFilter(undefined);
  };

  const handleRefresh = () => {
    fetchCoffees();
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // Check if all current page items are selected
  const isAllCurrentPageSelected = coffees.length > 0 && 
    coffees.every(coffee => selectedCoffeeIds.has(coffee.id));
  
  // Check if some current page items are selected
  const isSomeCurrentPageSelected = coffees.some(coffee => selectedCoffeeIds.has(coffee.id));

  if (isLoading && coffees.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">커피 카탈로그</h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              새로고침
            </Button>
          </div>
        </div>
        
        <FilterBarLoadingSkeleton />
        <div className="mt-4">
          <TableLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">커피 카탈로그</h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <CoffeeFilterBar
        onSearchChange={setSearchQuery}
        onStatusFilter={setStatusFilter}
        onRoasterFilter={setRoasterFilter}
        onDateRangeFilter={setDateRangeFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedCoffeeIds.size}
        onBulkVerify={handleBulkVerify}
        onBulkUnverify={handleBulkUnverify}
        onBulkDelete={handleBulkDelete}
        onBulkEdit={handleBulkEdit}
        onClearSelection={handleClearSelection}
        isLoading={isBulkLoading}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              커피 목록 ({totalCount.toLocaleString()}개)
              {selectedCoffeeIds.size > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  • {selectedCoffeeIds.size}개 선택됨
                </span>
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              페이지 {currentPage} / {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="전체 선택"
                    className={isSomeCurrentPageSelected && !isAllCurrentPageSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                  />
                </TableHead>
                <TableHead>커피명</TableHead>
                <TableHead>로스터리</TableHead>
                <TableHead>원산지</TableHead>
                <TableHead>품종</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coffees.map((coffee) => (
                <TableRow 
                  key={coffee.id}
                  className={selectedCoffeeIds.has(coffee.id) ? 'bg-blue-50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedCoffeeIds.has(coffee.id)}
                      onCheckedChange={(checked: boolean) => handleSelectCoffee(coffee.id, checked)}
                      aria-label={`${coffee.coffee_name} 선택`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{coffee.coffee_name}</TableCell>
                  <TableCell>{coffee.roastery}</TableCell>
                  <TableCell>{coffee.origin || "-"}</TableCell>
                  <TableCell>{coffee.variety || "-"}</TableCell>
                  <TableCell>
                    {coffee.verified_by_moderator ? (
                      <Badge variant="default">검증됨</Badge>
                    ) : (
                      <Badge variant="secondary">대기중</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(coffee.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {!coffee.verified_by_moderator && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(coffee)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(coffee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(coffee)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => hasPrevPage && setCurrentPage(p => p - 1)}
                      className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => hasNextPage && setCurrentPage(p => p + 1)}
                      className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>커피 정보 수정</DialogTitle>
            <DialogDescription>
              커피 정보를 수정한 후 저장 버튼을 클릭하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedCoffee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roastery">로스터리</Label>
                  <Input
                    id="roastery"
                    value={selectedCoffee.roastery}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, roastery: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coffee_name">커피명</Label>
                  <Input
                    id="coffee_name"
                    value={selectedCoffee.coffee_name}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, coffee_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">원산지</Label>
                  <Input
                    id="origin"
                    value={selectedCoffee.origin || ""}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, origin: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">지역</Label>
                  <Input
                    id="region"
                    value={selectedCoffee.region || ""}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, region: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variety">품종</Label>
                  <Input
                    id="variety"
                    value={selectedCoffee.variety || ""}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, variety: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="process">가공방식</Label>
                  <Input
                    id="process"
                    value={selectedCoffee.process || ""}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, process: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="altitude">고도</Label>
                  <Input
                    id="altitude"
                    value={selectedCoffee.altitude || ""}
                    onChange={(e) =>
                      setSelectedCoffee({ ...selectedCoffee, altitude: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harvest_year">수확년도</Label>
                  <Input
                    id="harvest_year"
                    type="number"
                    value={selectedCoffee.harvest_year || ""}
                    onChange={(e) =>
                      setSelectedCoffee({
                        ...selectedCoffee,
                        harvest_year: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveEdit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        open={isBulkEditDialogOpen}
        onOpenChange={setIsBulkEditDialogOpen}
        selectedCount={selectedCoffeeIds.size}
        onSave={handleBulkSave}
        isLoading={isBulkLoading}
      />
    </div>
  );
}