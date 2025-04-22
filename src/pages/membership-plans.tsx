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
import { Badge } from "@/components/ui/badge";
import { PlanForm } from "@/components/plans/plan-form";
import { Check, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/hooks/use-translation";

export default function MembershipPlans() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Fetch all membership plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/membership-plans'],
  });

  const handleAdd = () => {
    setSelectedPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleDelete = (plan: any) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPlan(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;

    try {
      await apiRequest("DELETE", `/api/membership-plans/${selectedPlan.id}`, undefined);
      toast({
        title: t('planDeleted'),
        description: t('planDeletedDescription'),
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/membership-plans'] });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToDeletePlan'),
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  const getDurationText = (plan: any) => {
    switch (plan.durationType) {
      case "daily": return `${plan.duration} day${plan.duration > 1 ? 's' : ''}`;
      case "weekly": return `${plan.duration} week${plan.duration > 1 ? 's' : ''}`;
      case "monthly": return `${plan.duration / 30} month${plan.duration > 30 ? 's' : ''}`;
      case "quarterly": return `${plan.duration / 90} quarter${plan.duration > 90 ? 's' : ''}`;
      case "annual": return `${plan.duration / 365} year${plan.duration > 365 ? 's' : ''}`;
      default: return `${plan.duration} days`;
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={t('membershipPlansTitle')}
          description={t('membershipPlansDescription')}
          actions={
            <Button onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('add')} {t('plan')}
            </Button>
          }
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={t('membershipPlansTitle')}
        description={t('membershipPlansDescription')}
        actions={
          <Button onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('add')} {t('plan')}
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id} className={`${!plan.isActive ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "outline"}>
                  {plan.isActive ? t('statusActive') : t('statusInactive')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-1 mb-4">
                <p className="text-gray-600">{plan.description}</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(plan.price)}
                  <span className="text-base font-normal text-gray-500 ml-1">
                    / {getDurationText(plan)}
                  </span>
                </p>
              </div>
              
              <div className="mb-5">
                <h4 className="font-medium mb-2">{t('features')}</h4>
                <ul className="space-y-1">
                  {plan.features && plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {(!plan.features || plan.features.length === 0) && (
                    <li className="text-gray-500">{t('noFeaturesListed')}</li>
                  )}
                </ul>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(plan)}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('edit')}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(plan)}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>{t('noPlansFound')}</p>
          </div>
        )}
      </div>

      {/* Plan form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? t('editMembershipPlan') : t('addNewMembershipPlan')}
            </DialogTitle>
          </DialogHeader>
          <PlanForm
            initialData={selectedPlan}
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
              {t('deletePlanConfirmation', { name: selectedPlan?.name })}
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
