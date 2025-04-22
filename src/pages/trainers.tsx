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
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrainerForm } from "@/components/trainers/trainer-form";
import { PencilIcon, Trash2Icon, UserCog } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getStatusColor, formatDate, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Trainers() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // Fetch all trainers
  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery({
    queryKey: ['/api/trainers'],
  });

  const columns = [
    {
      header: "Trainer",
      accessorKey: (trainer: any) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {/* Comentado para usar siempre iniciales */}
            {/* <AvatarImage src={trainer.avatarUrl} alt={`${trainer.firstName} ${trainer.lastName}`} /> */}
            <AvatarFallback>{getInitials(`${trainer.firstName} ${trainer.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{trainer.firstName} {trainer.lastName}</div>
            <div className="text-sm text-gray-500">{trainer.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Specialization",
      accessorKey: (trainer: any) => (
        <div className="flex flex-wrap gap-1">
          {trainer.specialization.slice(0, 3).map((spec: string) => (
            <Badge key={spec} variant="outline" className="text-xs">
              {spec}
            </Badge>
          ))}
          {trainer.specialization.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{trainer.specialization.length - 3} more
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: (trainer: any) => (
        <Badge className={getStatusColor(trainer.status)}>
          {trainer.status === "active" ? "Active" : trainer.status === "on_leave" ? "On Leave" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Hire Date",
      accessorKey: (trainer: any) => (
        <span className="text-sm text-gray-500">
          {trainer.hireDate ? formatDate(trainer.hireDate) : "N/A"}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: (trainer: any) => (
        <span className="text-sm text-gray-500">
          {trainer.phone || "No phone"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (trainer: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(trainer);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(trainer);
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedTrainer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsFormOpen(true);
  };

  const handleDelete = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTrainer(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTrainer) return;

    try {
      await apiRequest("DELETE", `/api/trainers/${selectedTrainer.id}`, undefined);
      toast({
        title: "Trainer deleted",
        description: "Trainer has been removed successfully",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trainer",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedTrainer(null);
    }
  };

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Trainers"
        description="Manage your gym trainers"
        actions={
          <Button onClick={handleAdd}>
            <UserCog className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
        }
      />

      <Card className="mt-6">
        <DataTable
          columns={columns}
          data={trainers}
          searchKey="firstName"
          isLoading={isLoadingTrainers}
        />
      </Card>

      {/* Trainer form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTrainer ? "Edit Trainer" : "Add New Trainer"}
            </DialogTitle>
          </DialogHeader>
          <TrainerForm
            initialData={selectedTrainer}
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
              This will permanently delete {selectedTrainer?.firstName} {selectedTrainer?.lastName} 
              from the trainers list and all associated classes will be affected.
              This action cannot be undone.
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
