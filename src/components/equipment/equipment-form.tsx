import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { gymEquipmentImageUrls } from "@/lib/utils";

// Categories for equipment
const equipmentCategories = [
  { value: "Cardio", label: "Cardio Equipment" },
  { value: "Strength", label: "Strength Equipment" },
  { value: "Weights", label: "Free Weights" },
  { value: "Accessories", label: "Accessories" },
  { value: "Functional", label: "Functional Training" },
  { value: "Machines", label: "Machines" },
];

// Condition options
const equipmentConditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "maintenance_required", label: "Maintenance Required" },
];

// Extended schema with additional validations
const equipmentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  category: z.string(),
  purchaseDate: z.date().optional(),
  purchasePrice: z.coerce.number().optional(),
  condition: z.string(),
  maintenanceDate: z.date().optional(),
  notes: z.string().optional(),
  quantity: z.coerce.number().int().positive({ message: "Quantity must be a positive integer" }),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EquipmentForm({ initialData, onSuccess, onCancel }: EquipmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  // Convert price from cents to dollars for editing
  const priceInDollars = initialData?.purchasePrice ? initialData.purchasePrice / 100 : "";

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "Weights",
    purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : undefined,
    purchasePrice: priceInDollars,
    condition: initialData?.condition || "good",
    maintenanceDate: initialData?.maintenanceDate ? new Date(initialData.maintenanceDate) : undefined,
    notes: initialData?.notes || "",
    quantity: initialData?.quantity || 1,
    imageUrl: initialData?.imageUrl || gymEquipmentImageUrls[Math.floor(Math.random() * gymEquipmentImageUrls.length)],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    // Convert price to cents for API if provided
    const formData = {
      ...values,
      purchasePrice: values.purchasePrice ? Math.round(values.purchasePrice * 100) : undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/equipment/${initialData.id}`, formData);
        toast({
          title: "Equipment updated",
          description: "Equipment has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/equipment", formData);
        toast({
          title: "Equipment created",
          description: "New equipment has been added successfully.",
        });
      }
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} equipment. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Name</FormLabel>
                <FormControl>
                  <Input placeholder="Equipment Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipmentCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipmentConditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Enter price in dollars (will be stored in cents)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maintenanceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Maintenance Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description of the equipment" 
                    className="h-24 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Additional notes" 
                    className="h-24 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Equipment" : "Add Equipment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
