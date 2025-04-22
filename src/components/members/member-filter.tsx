import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface MemberFilterProps {
  onFilterChange: (filters: { status?: string; planId?: number }) => void;
  plans: any[];
}

export function MemberFilter({ onFilterChange, plans }: MemberFilterProps) {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [planFilter, setPlanFilter] = useState<number | undefined>(undefined);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? undefined : value;
    setStatusFilter(newStatus);
    onFilterChange({ status: newStatus, planId: planFilter });
  };

  const handlePlanChange = (value: string) => {
    const newPlanId = value === "all" ? undefined : parseInt(value);
    setPlanFilter(newPlanId);
    onFilterChange({ status: statusFilter, planId: newPlanId });
  };

  const resetFilters = () => {
    setStatusFilter(undefined);
    setPlanFilter(undefined);
    onFilterChange({ status: undefined, planId: undefined });
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={toggleFilterVisibility}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {(statusFilter || planFilter) && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
              {(statusFilter ? 1 : 0) + (planFilter ? 1 : 0)}
            </span>
          )}
        </Button>

        {(statusFilter || planFilter) && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-sm text-gray-500"
            size="sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {isFilterVisible && (
        <div className="p-4 border rounded-md bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={statusFilter || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Membership Plan</label>
              <Select
                value={planFilter?.toString() || "all"}
                onValueChange={handlePlanChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
