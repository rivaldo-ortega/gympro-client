import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";

// Extended schema with additional validations
const classFormSchema = z.object({
  name: z.string().min(2, { message: "Class name must be at least 2 characters" }),
  description: z.string().optional(),
  trainerId: z.number({ message: "Please select a trainer" }),
  room: z.string().min(1, { message: "Room is required" }),
  capacity: z.coerce.number().positive({ message: "Capacity must be a positive number" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Valid time format (HH:MM) is required" }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Valid time format (HH:MM) is required" }),
  daysOfWeek: z.array(z.string()).min(1, { message: "At least one day must be selected" }),
  isActive: z.boolean().default(true),
}).refine(data => {
  // Ensure start time is before end time
  const [startHour, startMinute] = data.startTime.split(':').map(Number);
  const [endHour, endMinute] = data.endTime.split(':').map(Number);
  
  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    return false;
  }
  
  return true;
}, {
  message: "Start time must be before end time",
  path: ["endTime"],
});

type FormValues = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const daysOfWeek = [
  { id: "Monday", label: "Monday" },
  { id: "Tuesday", label: "Tuesday" },
  { id: "Wednesday", label: "Wednesday" },
  { id: "Thursday", label: "Thursday" },
  { id: "Friday", label: "Friday" },
  { id: "Saturday", label: "Saturday" },
  { id: "Sunday", label: "Sunday" },
];

// Helper to format time for input fields
const formatTimeForInput = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

export function ClassForm({ initialData, onSuccess, onCancel }: ClassFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  // Fetch trainers for the dropdown
  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery({
    queryKey: ['/api/trainers'],
  });

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    trainerId: initialData?.trainerId || undefined,
    room: initialData?.room || "",
    capacity: initialData?.capacity || 10,
    startTime: initialData?.startTime ? formatTimeForInput(initialData.startTime) : "08:00",
    endTime: initialData?.endTime ? formatTimeForInput(initialData.endTime) : "09:00",
    daysOfWeek: initialData?.daysOfWeek || [],
    isActive: initialData?.isActive ?? true,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // Format times to HH:MM:SS for API
      const formattedValues = {
        ...values,
        startTime: `${values.startTime}:00`,
        endTime: `${values.endTime}:00`,
      };

      if (isEditing) {
        await apiRequest("PATCH", `/api/classes/${initialData.id}`, formattedValues);
        toast({
          title: "Class updated",
          description: "Class has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/classes", formattedValues);
        toast({
          title: "Class created",
          description: "New class has been added successfully.",
        });
      }
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes/today'] });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} class. Please try again.`,
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
                <FormLabel>Class Name</FormLabel>
                <FormControl>
                  <Input placeholder="Class Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="trainerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trainer</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                  disabled={isLoadingTrainers}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trainer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {trainers.map((trainer: any) => (
                      <SelectItem key={trainer.id} value={trainer.id.toString()}>
                        {`${trainer.firstName} ${trainer.lastName}`}
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
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <FormControl>
                  <Input placeholder="Room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
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
                    placeholder="Description of the class"
                    className="h-24 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2 space-y-3">
            <FormLabel className="block">Days of Week</FormLabel>
            {daysOfWeek.map((day) => (
              <FormField
                key={day.id}
                control={form.control}
                name="daysOfWeek"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={day.id}
                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(day.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, day.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== day.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {day.label}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
            <FormMessage>
              {form.formState.errors.daysOfWeek?.message}
            </FormMessage>
          </div>
          
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
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Class" : "Add Class"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
