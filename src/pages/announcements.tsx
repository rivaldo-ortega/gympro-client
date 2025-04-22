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
import { Badge } from "@/components/ui/badge";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { Bell, PencilIcon, Trash2Icon, AlertTriangle, Tag, Megaphone, CalendarDays } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Announcements() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  // Fetch all announcements
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['/api/announcements'],
  });

  // Separate active and expired announcements
  const activeAnnouncements = announcements.filter((ann: any) => ann.isActive);
  const inactiveAnnouncements = announcements.filter((ann: any) => !ann.isActive);

  const handleAdd = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;

    try {
      await apiRequest("DELETE", `/api/announcements/${selectedAnnouncement.id}`, undefined);
      toast({
        title: "Announcement deleted",
        description: "Announcement has been removed successfully",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'promotion':
        return <Tag className="h-5 w-5 text-green-400" />;
      case 'maintenance':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'classes':
        return <Megaphone className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-primary-400" />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'operational':
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-100",
          titleColor: "text-yellow-800",
          contentColor: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
        };
      case 'promotion':
        return {
          bg: "bg-green-50",
          border: "border-green-100",
          titleColor: "text-green-800",
          contentColor: "text-green-700",
          badge: "bg-green-100 text-green-800",
        };
      case 'maintenance':
        return {
          bg: "bg-red-50",
          border: "border-red-100",
          titleColor: "text-red-800",
          contentColor: "text-red-700",
          badge: "bg-red-100 text-red-800",
        };
      case 'classes':
        return {
          bg: "bg-blue-50",
          border: "border-blue-100",
          titleColor: "text-blue-800",
          contentColor: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
        };
      case 'event':
        return {
          bg: "bg-purple-50",
          border: "border-purple-100",
          titleColor: "text-purple-800",
          contentColor: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
        };
      default:
        return {
          bg: "bg-primary-50",
          border: "border-primary-100",
          titleColor: "text-primary-800",
          contentColor: "text-primary-700",
          badge: "bg-primary-100 text-primary-800",
        };
    }
  };

  const renderAnnouncementList = (announcements: any[]) => {
    if (isLoadingAnnouncements) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 p-6 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="mt-4 flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (announcements.length === 0) {
      return (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no announcements in this category.
          </p>
          <div className="mt-6">
            <Button onClick={handleAdd}>
              Create new announcement
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {announcements.map((announcement: any) => {
          const style = getCategoryStyle(announcement.category);
          return (
            <div 
              key={announcement.id} 
              className={`${style.bg} border ${style.border} rounded-lg shadow-sm overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getCategoryIcon(announcement.category)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${style.titleColor}`}>
                        {announcement.title}
                      </h3>
                      <Badge className={style.badge}>
                        {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                      </Badge>
                    </div>
                    <div className={`mt-2 ${style.contentColor}`}>
                      <p>{announcement.content}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        <span>
                          Published: {formatDate(announcement.publishDate)}
                          {announcement.expiryDate && ` • Expires: ${formatDate(announcement.expiryDate)}`}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(announcement)}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(announcement)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Announcements"
        description="Manage gym announcements and notifications"
        actions={
          <Button onClick={handleAdd}>
            <Bell className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        }
      />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">Active Announcements</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {renderAnnouncementList(activeAnnouncements)}
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-6">
          {renderAnnouncementList(inactiveAnnouncements)}
        </TabsContent>
      </Tabs>

      {/* Announcement form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAnnouncement ? "Edit Announcement" : "Create New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            initialData={selectedAnnouncement}
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
              This will permanently delete the announcement "{selectedAnnouncement?.title}".
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
