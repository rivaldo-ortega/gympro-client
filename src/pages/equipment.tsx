import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { PencilIcon, Trash2Icon, Dumbbell, Grid, List } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Equipment() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch all equipment
  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/equipment'],
  });

  const columns = [
    {
      header: "Equipment",
      accessorKey: (item: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md bg-gray-200 mr-3 overflow-hidden">
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-500">{item.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Quantity",
      accessorKey: (item: any) => item.quantity,
    },
    {
      header: "Condition",
      accessorKey: (item: any) => (
        <Badge className={getStatusColor(item.condition)}>
          {item.condition.replace('_', ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Badge>
      ),
    },
    {
      header: "Purchase Date",
      accessorKey: (item: any) => (
        <span className="text-sm text-gray-500">
          {item.purchaseDate ? formatDate(item.purchaseDate) : "N/A"}
        </span>
      ),
    },
    {
      header: "Purchase Price",
      accessorKey: (item: any) => (
        <span className="text-sm text-gray-700">
          {item.purchasePrice ? formatCurrency(item.purchasePrice) : "N/A"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (item: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedEquipment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedEquipment(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedEquipment(item);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEquipment(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEquipment) return;

    try {
      await apiRequest("DELETE", `/api/equipment/${selectedEquipment.id}`, undefined);
      toast({
        title: "Equipment deleted",
        description: "Equipment has been removed successfully",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedEquipment(null);
    }
  };

  // Get unique categories for filtering
  const categories = Array.from(new Set(equipment.map((item: any) => item.category)));

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Equipment Inventory"
        description="Manage your gym equipment"
        actions={
          <div className="flex space-x-2">
            <div className="bg-gray-100 rounded-md p-1 flex">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAdd}>
              <Dumbbell className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Equipment</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category as string} value={category as string}>
              {category as string}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          {viewMode === "list" ? (
            <Card>
              <DataTable
                columns={columns}
                data={equipment}
                searchKey="name"
                isLoading={isLoadingEquipment}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {isLoadingEquipment ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                equipment.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="h-48 bg-gray-200 relative">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Badge 
                        className={`absolute top-2 right-2 ${getStatusColor(item.condition)}`}
                      >
                        {item.condition.replace('_', ' ').split(' ').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">{item.category}</span>
                        <span className="text-sm font-medium">Qty: {item.quantity}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                      )}
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(item)}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category as string} value={category as string}>
            {viewMode === "list" ? (
              <Card>
                <DataTable
                  columns={columns}
                  data={equipment.filter((item: any) => item.category === category)}
                  searchKey="name"
                  isLoading={isLoadingEquipment}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {equipment
                  .filter((item: any) => item.category === category)
                  .map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="h-48 bg-gray-200 relative">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Badge 
                          className={`absolute top-2 right-2 ${getStatusColor(item.condition)}`}
                        >
                          {item.condition.replace('_', ' ').split(' ').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">{item.category}</span>
                          <span className="text-sm font-medium">Qty: {item.quantity}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                        )}
                        <div className="flex justify-end space-x-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2Icon className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Equipment form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEquipment ? "Edit Equipment" : "Add New Equipment"}
            </DialogTitle>
          </DialogHeader>
          <EquipmentForm
            initialData={selectedEquipment}
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
              This will permanently delete {selectedEquipment?.name} from the equipment inventory.
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
