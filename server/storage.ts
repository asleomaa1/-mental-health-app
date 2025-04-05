import { users, appointments, resources } from "@shared/schema";
import type { User, InsertUser, Appointment, InsertAppointment, Resource, InsertResource } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, status: string): Promise<Appointment | undefined>;
  
  getResources(category?: string): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private resources: Map<number, Resource>;
  sessionStore: session.Store;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.resources = new Map();
    this.currentId = { users: 1, appointments: 1, resources: 1 };
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    
    // Seed some initial resources
    this.seedResources();
  }

  private seedResources() {
    const initialResources: InsertResource[] = [
      {
        title: "Managing Exam Stress",
        category: "self-help",
        content: "Tips for managing exam-related stress and anxiety:\n• Practice deep breathing exercises\n• Break tasks into smaller chunks\n• Create a study schedule\n• Take regular breaks\n• Get enough sleep\n• Stay hydrated and eat well",
        url: "https://example.com/exam-stress",
      },
      {
        title: "Emergency Support",
        category: "emergency",
        content: "24/7 Crisis Helpline: 0800 132 737\nUniversity Counseling: 029 2087 4966\nEmergency Services: 999\nSamaritans: 116 123",
        url: null,
      },
      {
        title: "Anxiety Management Techniques",
        category: "self-help",
        content: "• 5-4-3-2-1 Grounding Technique\n• Progressive Muscle Relaxation\n• Mindful Breathing\n• Worry Time Scheduling\n• Thought Recording",
        url: "https://example.com/anxiety-management",
      },
      {
        title: "Depression Support",
        category: "self-help",
        content: "• Daily Activity Scheduling\n• Mood Tracking\n• Building Support Networks\n• Self-Care Strategies\n• Understanding Your Triggers",
        url: "https://example.com/depression-support",
      },
      {
        title: "Online Mental Health Resources",
        category: "online",
        content: "• Headspace - Meditation App\n• Calm - Sleep and Relaxation\n• MoodGym - CBT Training\n• Big White Wall - Online Community\n• Student Minds - Student Mental Health",
        url: "https://example.com/online-resources",
      },
      {
        title: "Peer Support Groups",
        category: "support",
        content: "Join our student-led support groups:\n• Anxiety Support Circle - Wednesdays 6PM\n• Depression Support Group - Mondays 5PM\n• International Students Meetup - Fridays 4PM",
        url: null,
      },
      {
        title: "Wellness Activities",
        category: "wellbeing",
        content: "Campus wellness activities:\n• Yoga Sessions - Student Union\n• Mindfulness Workshops\n• Art Therapy Groups\n• Nature Walk Groups\n• Stress-Busting Exercise Classes",
        url: null,
      }
    ];

    initialResources.forEach((resource) => {
      const id = this.currentId.resources++;
      this.resources.set(id, { id, ...resource });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (apt) => apt.userId === userId,
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId.appointments++;
    const newAppointment: Appointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updated = { ...appointment, status };
    this.appointments.set(id, updated);
    return updated;
  }

  async getResources(category?: string): Promise<Resource[]> {
    const resources = Array.from(this.resources.values());
    if (category) {
      return resources.filter((r) => r.category === category);
    }
    return resources;
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
}

export const storage = new MemStorage();