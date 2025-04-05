import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAppointmentSchema, insertMoodEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Resources
  app.get("/api/resources", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const resources = await storage.getResources(category);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please log in to view appointments" });
      }
      const appointments = await storage.getAppointments(req.user.id);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please log in to book appointments" });
      }

      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      console.log('Creating appointment with data:', appointmentData);
      const appointment = await storage.createAppointment(appointmentData);

      res.status(201).json(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid appointment data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Mood Entries
  app.get("/api/mood-entries", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please log in to view mood entries" });
      }
      const entries = await storage.getMoodEntries(req.user.id);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood-entries", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Please log in to track moods" });
      }

      const moodData = insertMoodEntrySchema.parse({
        ...req.body,
        userId: req.user.id
      });

      console.log('Creating mood entry with data:', moodData);
      const entry = await storage.createMoodEntry(moodData);

      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating mood entry:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid mood entry data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}