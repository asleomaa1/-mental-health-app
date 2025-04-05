import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Resource, Appointment } from "@shared/schema";
import { Link } from "wouter";
import {
  CalendarDays,
  MessageCircle,
  Phone,
  BookOpen,
  Activity,
  Brain,
  Heart,
  Smile
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { MoodTracker } from "@/components/mood-tracker";

export default function HomePage() {
  const { data: resources } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { user } = useAuth();
  const emergencyResource = resources?.find(r => r.category === "emergency");
  const upcomingAppointments = appointments?.filter(a => {
    const appointmentDate = new Date(a.date);
    return appointmentDate > new Date() && a.status !== 'cancelled';
  }).slice(0, 3);

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Personalized Greeting */}
        <div className="text-2xl font-bold">
          Welcome back, {user?.fullName || 'Student'}! 👋
        </div>

        {/* About Us Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Mental Health Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Welcome to Cardiff University's Mental Health Support platform. We're here to provide comprehensive mental health support services tailored specifically for students.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">24/7 Support</h3>
                  <p className="text-sm text-muted-foreground">Access to immediate support through our AI-powered chatbot</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Professional Help</h3>
                  <p className="text-sm text-muted-foreground">Book sessions with qualified counselors and therapists</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Resources</h3>
                  <p className="text-sm text-muted-foreground">Access a wide range of self-help materials and guides</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Personalized Care</h3>
                  <p className="text-sm text-muted-foreground">Track your wellbeing and get personalized support</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Tracker */}
        <MoodTracker />

        {/* Upcoming Appointments */}
        {upcomingAppointments && upcomingAppointments.length > 0 && (
          <div className="space-y-3">
            <div className="font-medium">Upcoming Sessions</div>
            {upcomingAppointments.map(appointment => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{appointment.type} Session</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), "PPp")}
                      </p>
                    </div>
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="font-medium mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/chat">
              <Button className="w-full h-24 flex flex-col items-center justify-center gap-2" variant="outline">
                <MessageCircle className="h-6 w-6" />
                <span>Chat Now</span>
              </Button>
            </Link>
            <Link href="/appointments">
              <Button className="w-full h-24 flex flex-col items-center justify-center gap-2" variant="outline">
                <CalendarDays className="h-6 w-6" />
                <span>Book Session</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Emergency Support */}
        {emergencyResource && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-destructive" />
                <div className="font-medium">24/7 Support</div>
              </div>
              <div className="text-sm whitespace-pre-line">
                {emergencyResource.content}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}