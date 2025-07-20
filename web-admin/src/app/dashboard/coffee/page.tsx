"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Search, Check, X, Edit, Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type Coffee = Database["public"]["Tables"]["coffee_catalog"]["Row"];

export default function CoffeeCatalogPage() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("coffee_catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoffees(data || []);
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

  const filteredCoffees = coffees.filter(
    (coffee) =>
      coffee.coffee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coffee.roastery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coffee.origin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">커피 카탈로그</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="커피 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>커피 목록 ({filteredCoffees.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>커피명</TableHead>
                <TableHead>로스터리</TableHead>
                <TableHead>원산지</TableHead>
                <TableHead>품종</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoffees.map((coffee) => (
                <TableRow key={coffee.id}>
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
    </div>
  );
}