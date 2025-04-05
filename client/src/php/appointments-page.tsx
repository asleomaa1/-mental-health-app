import { Layout } from "@/components/layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Appointment, insertAppointmentSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const APPOINTMENT_TYPES = {
  counseling: "Counseling Session",
  therapy: "Therapy Session",
  group: "Group Session",
};

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { user } = useAuth();

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertAppointmentSchema.omit({ userId: true })),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      type: "counseling",
      notes: "",
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user) {
        throw new Error("Please log in to book appointments");
      }

      const formattedData = {
        ...data,
        date: format(new Date(data.date), "yyyy-MM-dd HH:mm:ss"),
      };

      const res = await apiRequest("POST", "/api/appointments", formattedData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to schedule appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setBookingSuccess(true);
      toast({
        title: "Appointment Scheduled ✅",
        description: "Your appointment has been booked successfully. You can view it on your home screen.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <h2 className="text-xl font-semibold">Please Log In</h2>
              <p className="text-muted-foreground">
                You need to be logged in to book appointments.
              </p>
              <Link href="/auth">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (bookingSuccess) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                Your appointment has been scheduled successfully.
              </p>
              <Button onClick={() => setBookingSuccess(false)} className="mt-4">
                Book Another Appointment
              </Button>
              <Link href="/">
                <Button variant="outline" className="mt-2 w-full">
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit((data) => createAppointmentMutation.mutate(data))}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd HH:mm:ss") : '')}
                            disabled={(date) =>
                              date < new Date() || date.getDay() === 0 || date.getDay() === 6
                            }
                            className="rounded-md border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Session</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a session type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(APPOINTMENT_TYPES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific concerns or requirements..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={createAppointmentMutation.isPending}
                  >
                    {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments?.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">
                            {appointment.type} Session
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.date), "PPP 'at' p")}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Notes: {appointment.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="capitalize"
                        >
                          {appointment.status}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}