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
import { Search, Shield, ShieldOff, Award, User, Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "오류",
        description: "사용자 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModerator = async (user: UserProfile) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_moderator: !user.is_moderator })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: `${user.username}의 모더레이터 권한이 ${
          user.is_moderator ? "해제" : "부여"
        }되었습니다.`,
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "권한 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerified = async (user: UserProfile) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_verified: !user.is_verified })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "성공",
        description: `${user.username}의 인증 상태가 변경되었습니다.`,
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "오류",
        description: "인증 상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h2 className="text-3xl font-bold tracking-tight">사용자 관리</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="사용자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">인증된 사용자</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">모더레이터</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_moderator).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 레벨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0
                ? (users.reduce((sum, u) => sum + u.level, 0) / users.length).toFixed(1)
                : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자명</TableHead>
                <TableHead>레벨</TableHead>
                <TableHead>테이스팅</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      {user.display_name && (
                        <div className="text-sm text-muted-foreground">
                          {user.display_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Lv.{user.level}</Badge>
                  </TableCell>
                  <TableCell>{user.total_tastings}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.is_verified && (
                        <Badge variant="default">인증됨</Badge>
                      )}
                      {user.is_moderator && (
                        <Badge variant="secondary">모더레이터</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVerified(user)}
                      >
                        {user.is_verified ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Award className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleModerator(user)}
                      >
                        {user.is_moderator ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}