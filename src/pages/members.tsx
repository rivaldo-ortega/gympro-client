import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { MemberForm } from "@/components/members/member-form";
import { MemberFilter } from "@/components/members/member-filter";
import { PencilIcon, Trash2Icon, EyeIcon, UserPlus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getStatusColor, formatDate, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/hooks/use-translation";

export default function Members() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [filters, setFilters] = useState<{ status?: string; planId?: number }>({});

  // Fetch all members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery<any[]>({
    queryKey: ['/api/members'],
  });

  // Fetch all membership plans for the filter
  const { data: plans = [] } = useQuery<any[]>({
    queryKey: ['/api/membership-plans'],
  });

  // Filter members based on selected filters
  const filteredMembers = (members as any[]).filter((member: any) => {
    let matchesStatus = true;
    let matchesPlan = true;

    if (filters.status) {
      matchesStatus = member.status === filters.status;
    }

    if (filters.planId) {
      matchesPlan = member.planId === filters.planId;
    }

    return matchesStatus && matchesPlan;
  });

  const columns = [
    {
      header: t('name'),
      accessorKey: (member: any) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {/* Comentado para usar siempre iniciales */}
            {/* <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} /> */}
            <AvatarFallback>{getInitials(`${member.firstName} ${member.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.firstName} {member.lastName}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('membership'),
      accessorKey: (member: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{member.plan?.name || t('unknown')}</div>
          <div className="text-sm text-gray-500">{member.plan?.durationType || ""}</div>
        </div>
      ),
    },
    {
      header: t('status'),
      accessorKey: (member: any) => (
        <Badge className={getStatusColor(member.status)}>
          {t(`status${member.status.charAt(0).toUpperCase() + member.status.slice(1)}`)}
        </Badge>
      ),
    },
    {
      header: t('joinDate'),
      accessorKey: (member: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(member.joinDate)}
        </span>
      ),
    },
    {
      header: t('actions'),
      accessorKey: (member: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(member);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleView(member);
            }}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(member);
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleView = (member: any) => {
    // Redirigir a la página de perfil del miembro usando wouter
    setLocation(`/members/${member.id}`);
  };

  const handleDelete = (member: any) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMember(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;

    try {
      await apiRequest("DELETE", `/api/members/${selectedMember.id}`, undefined);
      toast({
        title: t('memberDeleted'),
        description: t('memberDeletedDescription'),
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToDeleteMember'),
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleFilterChange = (newFilters: { status?: string; planId?: number }) => {
    setFilters(newFilters);
  };

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={t('members')}
        description={t('membersDescription')}
        actions={
          <Button onClick={handleAdd}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('addMember')}
          </Button>
        }
      />

      <div className="mt-6">
        <MemberFilter 
          onFilterChange={handleFilterChange} 
          plans={plans as any[]} 
        />
      </div>

      <Card className="mt-6">
        <DataTable
          columns={columns}
          data={filteredMembers}
          searchKey={['firstName', 'lastName', 'email'].join(',')}
          isLoading={isLoadingMembers}
          onRowClick={handleView}
        />
      </Card>

      {/* Member form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? t('editMember') : t('addNewMember')}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            initialData={selectedMember}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmationDescription').replace('{name}', 
                selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
