import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  studentId: text("student_id").notNull(),
  fullName: text("full_name").notNull(),
  isInternational: boolean("is_international").default(false),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), 
  type: text("type").notNull(),
  status: text("status").default("pending"),
  notes: text("notes"),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  url: text("url"),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mood: text("mood").notNull(),
  note: text("note"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("Invalid email address"),
  studentId: z.string().min(8, "Student ID must be at least 8 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ id: true })
  .extend({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Invalid date format"),
    type: z.enum(["counseling", "therapy", "group"], {
      required_error: "Please select a session type",
    }),
    notes: z.string().optional(),
  });

export const insertMoodEntrySchema = createInsertSchema(moodEntries)
  .omit({ id: true, timestamp: true })
  .extend({
    mood: z.enum([
      "great",
      "good",
      "okay",
      "down",
      "awful"
    ], {
      required_error: "Please select a mood",
    }),
    note: z.string().optional(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;