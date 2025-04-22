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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Categories for announcements
const announcementCategories = [
  { value: "operational", label: "Operational" },
  { value: "classes", label: "Classes" },
  { value: "promotion", label: "Promotion" },
  { value: "maintenance", label: "Maintenance" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

// Extended schema with additional validations
const announcementFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  content: z.string().min(5, { message: "Content must be at least 5 characters" }),
  category: z.string(),
  publishDate: z.date(),
  expiryDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof announcementFormSchema>;

interface AnnouncementFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({ initialData, onSuccess, onCancel }: AnnouncementFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    category: initialData?.category || "operational",
    publishDate: initialData?.publishDate ? new Date(initialData.publishDate) : new Date(),
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate) : undefined,
    isActive: initialData?.isActive ?? true,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    // Enviar los objetos Date directamente, sin convertir a ISO string
    const formData = {
      ...values,
      // Dejar las fechas como objetos Date, que es lo que espera el backend
      publishDate: values.publishDate,
      // Solo incluir expiryDate si existe
      ...(values.expiryDate && { expiryDate: values.expiryDate }),
      createdBy: 1, // Default to admin user
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/announcements/${initialData.id}`, formData);
        toast({
          title: "Announcement updated",
          description: "Announcement has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/announcements", formData);
        toast({
          title: "Announcement created",
          description: "New announcement has been added successfully.",
        });
      }
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} announcement. Please try again.`,
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
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Announcement Title" {...field} />
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
                    {announcementCategories.map((category) => (
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                <FormLabel>Active Status</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="publishDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Publish Date</FormLabel>
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
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date (Optional)</FormLabel>
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
                        date < new Date() || date < (form.getValues().publishDate || new Date())
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
            name="content"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Announcement content" 
                    className="h-32 resize-none"
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
            {isSubmitting ? "Saving..." : isEditing ? "Update Announcement" : "Add Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
