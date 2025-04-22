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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { trainerImageUrls } from "@/lib/utils";

// Specialization options
const specializations = [
  { id: "Yoga", label: "Yoga" },
  { id: "Pilates", label: "Pilates" },
  { id: "HIIT", label: "HIIT" },
  { id: "Spinning", label: "Spinning" },
  { id: "Cardio", label: "Cardio" },
  { id: "Strength Training", label: "Strength Training" },
  { id: "Functional Fitness", label: "Functional Fitness" },
  { id: "CrossFit", label: "CrossFit" },
  { id: "Olympic Lifting", label: "Olympic Lifting" },
  { id: "Stretching", label: "Stretching" },
  { id: "Zumba", label: "Zumba" },
  { id: "Boxing", label: "Boxing" },
];

// Extended schema with additional validations
const trainerFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  specialization: z.array(z.string()).min(1, { message: "At least one specialization must be selected" }),
  bio: z.string().optional(),
  status: z.string(),
  avatarUrl: z.string().optional(),
  hireDate: z.date().optional(),
});

type FormValues = z.infer<typeof trainerFormSchema>;

interface TrainerFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TrainerForm({ initialData, onSuccess, onCancel }: TrainerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    specialization: initialData?.specialization || [],
    bio: initialData?.bio || "",
    status: initialData?.status || "active",
    avatarUrl: initialData?.avatarUrl || trainerImageUrls[Math.floor(Math.random() * trainerImageUrls.length)],
    hireDate: initialData?.hireDate ? new Date(initialData.hireDate) : new Date(),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/trainers/${initialData.id}`, values);
        toast({
          title: "Trainer updated",
          description: "Trainer has been updated successfully.",
        });
      } else {
        await apiRequest("POST", "/api/trainers", values);
        toast({
          title: "Trainer created",
          description: "New trainer has been added successfully.",
        });
      }
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} trainer. Please try again.`,
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hire Date</FormLabel>
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Trainer biography" 
                    className="h-32 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2 space-y-3">
            <FormLabel className="block">Specializations</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {specializations.map((specialization) => (
                <FormField
                  key={specialization.id}
                  control={form.control}
                  name="specialization"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={specialization.id}
                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(specialization.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, specialization.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== specialization.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {specialization.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage>
              {form.formState.errors.specialization?.message}
            </FormMessage>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Trainer" : "Add Trainer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
