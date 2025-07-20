"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search, Filter, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { createClient } from "@/lib/supabase/client";

interface CoffeeFilterBarProps {
  onSearchChange: (search: string) => void;
  onStatusFilter: (status: string) => void;
  onRoasterFilter: (roaster: string) => void;
  onDateRangeFilter: (dateRange: DateRange | undefined) => void;
  onClearFilters: () => void;
}

export function CoffeeFilterBar({
  onSearchChange,
  onStatusFilter,
  onRoasterFilter,
  onDateRangeFilter,
  onClearFilters,
}: CoffeeFilterBarProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [roaster, setRoaster] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [roasters, setRoasters] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    fetchRoasters();
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (search) count++;
    if (status !== "all") count++;
    if (roaster !== "all") count++;
    if (dateRange?.from || dateRange?.to) count++;
    setActiveFilters(count);
  }, [search, status, roaster, dateRange]);

  const fetchRoasters = async () => {
    try {
      const { data } = await supabase
        .from("coffee_catalog")
        .select("roastery")
        .not("roastery", "is", null);

      if (data) {
        const uniqueRoasters = Array.from(
          new Set(data.map((item) => item.roastery))
        ).sort();
        setRoasters(uniqueRoasters);
      }
    } catch (error) {
      console.error("Error fetching roasters:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusFilter(value);
  };

  const handleRoasterChange = (value: string) => {
    setRoaster(value);
    onRoasterFilter(value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeFilter(range);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setRoaster("all");
    setDateRange(undefined);
    onClearFilters();
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">필터</span>
          {activeFilters > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {activeFilters}개 적용됨
            </span>
          )}
        </div>
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            필터 초기화
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="커피명, 로스터리, 원산지 검색..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="검증 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="verified">검증됨</SelectItem>
            <SelectItem value="pending">검토 중</SelectItem>
          </SelectContent>
        </Select>

        {/* Roaster Filter */}
        <Select value={roaster} onValueChange={handleRoasterChange}>
          <SelectTrigger>
            <SelectValue placeholder="로스터리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 로스터리</SelectItem>
            {roasters.map((roasterName) => (
              <SelectItem key={roasterName} value={roasterName}>
                {roasterName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
          placeholder="등록일 범위"
          className="w-full"
        />
      </div>
    </div>
  );
}