import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Coffee, Users, Package, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkAdminAccess();
  
  if (!isAdmin) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Coffee className="h-8 w-8 text-coffee-500 mr-3" />
              <h1 className="text-xl font-semibold">Coffee Journal Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <form action={handleSignOut}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    대시보드
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/coffee">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    커피 카탈로그
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/users">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    사용자 관리
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}