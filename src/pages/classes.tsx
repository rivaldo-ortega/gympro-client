import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassForm } from "@/components/classes/class-form";
import { PencilIcon, Trash2Icon, PlusCircle, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatTime, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Classes() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all classes
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/classes'],
  });

  // Filter classes for Today's Classes tab
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = classes.filter((gymClass: any) => 
    gymClass.daysOfWeek.includes(today) && gymClass.isActive
  );

  const columns = [
    {
      header: "Class",
      accessorKey: (gymClass: any) => (
        <div>
          <div className="font-medium">{gymClass.name}</div>
          {gymClass.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">{gymClass.description}</div>
          )}
        </div>
      ),
    },
    {
      header: "Time",
      accessorKey: (gymClass: any) => (
        <div className="text-sm">
          {formatTime(gymClass.startTime)} - {formatTime(gymClass.endTime)}
        </div>
      ),
    },
    {
      header: "Days",
      accessorKey: (gymClass: any) => (
        <div className="flex flex-wrap gap-1">
          {gymClass.daysOfWeek.map((day: string) => (
            <Badge key={day} variant="outline" className="text-xs">
              {day.slice(0, 3)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Trainer",
      accessorKey: (gymClass: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={gymClass.trainer?.avatarUrl} alt={`${gymClass.trainer?.firstName} ${gymClass.trainer?.lastName}`} />
            <AvatarFallback>{gymClass.trainer?.firstName?.[0] || "T"}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            {gymClass.trainer?.firstName} {gymClass.trainer?.lastName}
          </div>
        </div>
      ),
    },
    {
      header: "Room",
      accessorKey: (gymClass: any) => gymClass.room,
    },
    {
      header: "Capacity",
      accessorKey: (gymClass: any) => gymClass.capacity,
    },
    {
      header: "Status",
      accessorKey: (gymClass: any) => (
        <Badge className={getStatusColor(gymClass.isActive ? "active" : "inactive")}>
          {gymClass.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: (gymClass: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(gymClass);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(gymClass);
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const todayColumns = [
    ...columns.slice(0, 1), // Class name
    ...columns.slice(1, 2), // Time
    ...columns.slice(3, 5), // Trainer and Room
    {
      header: "Bookings",
      accessorKey: (gymClass: any) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-gray-400" />
          <span>0/{gymClass.capacity}</span>
        </div>
      ),
    },
    columns[7], // Actions
  ];

  const handleAdd = () => {
    setSelectedClass(null);
    setIsFormOpen(true);
  };

  const handleEdit = (gymClass: any) => {
    setSelectedClass(gymClass);
    setIsFormOpen(true);
  };

  const handleDelete = (gymClass: any) => {
    setSelectedClass(gymClass);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClass(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;

    try {
      await apiRequest("DELETE", `/api/classes/${selectedClass.id}`, undefined);
      toast({
        title: "Class deleted",
        description: "Class has been removed successfully",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes/today'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
    }
  };

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Class Schedule"
        description="Manage your gym classes and schedule"
        actions={
          <Button onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        }
      />

      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Classes</TabsTrigger>
          <TabsTrigger value="today">Today's Classes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <DataTable
              columns={columns}
              data={classes}
              searchKey="name"
              isLoading={isLoadingClasses}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="today">
          <Card>
            <DataTable
              columns={todayColumns}
              data={todayClasses}
              searchKey="name"
              isLoading={isLoadingClasses}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Class form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClass ? "Edit Class" : "Add New Class"}
            </DialogTitle>
          </DialogHeader>
          <ClassForm
            initialData={selectedClass}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{selectedClass?.name}" class
              and all associated bookings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
