import unittest
from unittest.mock import patch, MagicMock
import json
from tests.test_config import get_test_app
from flask import request

class TestMentalHealthApp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test app"""
        cls.app = get_test_app()

    def setUp(self):
        """Set up test client and mock data"""
        self.client = self.app.test_client()
        self.auth_data = {
            "username": "testuser",
            "password": "Test123!",
            "email": "test@cardiff.ac.uk",
            "studentId": "12345678",
            "fullName": "Test User",
        }
        self.appointment_data = {
            "date": "2025-03-20 14:30:00",
            "type": "counseling",
            "notes": "Initial consultation"
        }

    def test_appointment_booking(self):
        """Test appointment booking system"""
        # Login first
        response = self.client.post("/api/login", json={
            "username": self.auth_data["username"],
            "password": self.auth_data["password"]
        })
        self.assertEqual(response.status_code, 200)

        # Try to book an appointment with auth header
        headers = {'Authorization': 'Bearer test-token'}
        response = self.client.post("/api/appointments", 
                                  json=self.appointment_data,
                                  headers=headers)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("id", data)
        self.assertEqual(data["type"], self.appointment_data["type"])

    def test_invalid_appointment_date(self):
        """Test invalid appointment date handling"""
        headers = {'Authorization': 'Bearer test-token'}
        invalid_dates = [
            "invalid-date",
            "2023-03-20 14:30:00",  # Past date
            "2025-13-45 25:70:00"   # Invalid format
        ]

        for invalid_date in invalid_dates:
            response = self.client.post("/api/appointments", 
                                      json={**self.appointment_data, "date": invalid_date},
                                      headers=headers)
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn("error", data)

    def test_unauthorized_appointment_booking(self):
        """Test unauthorized appointment booking"""
        # Try to book without auth header
        response = self.client.post("/api/appointments", json=self.appointment_data)
        self.assertEqual(response.status_code, 401)
        self.assertIn("please log in", response.get_json()["message"].lower())

    def test_appointment_validation(self):
        """Test appointment data validation"""
        headers = {'Authorization': 'Bearer test-token'}
        invalid_appointments = [
            {"date": "2025-03-20 14:30:00"},  # Missing type
            {"type": "counseling"},            # Missing date
            {"date": "2025-03-20 14:30:00", "type": "invalid"} # Invalid type
        ]

        for invalid_data in invalid_appointments:
            response = self.client.post("/api/appointments", 
                                      json=invalid_data,
                                      headers=headers)
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn("error", data)

    def test_user_registration(self):
        """Test user registration process"""
        response = self.client.post("/api/register", json=self.auth_data)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("id", data)
        self.assertEqual(data["username"], self.auth_data["username"])

    def test_user_login(self):
        """Test user login functionality"""
        # First register a user
        self.client.post("/api/register", json=self.auth_data)

        # Then try to login
        login_data = {
            "username": self.auth_data["username"],
            "password": self.auth_data["password"]
        }
        response = self.client.post("/api/login", json=login_data)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("id", data)


    def test_chatbot_responses(self):
        """Test chatbot response patterns"""
        test_inputs = [
            ("I'm feeling anxious", "anxiety"),
            ("I need urgent help", "urgent"),
            ("I want to book a session", "professional"),
        ]

        for user_input, expected_type in test_inputs:
            response = self.get_chatbot_response(user_input)
            self.assertIn(expected_type, response.lower())
            self.assertTrue(len(response) > 0)

    def test_mood_tracking(self):
        """Test mood tracking functionality"""
        # Login first
        self.client.post("/api/login", json={
            "username": self.auth_data["username"],
            "password": self.auth_data["password"]
        })

        # Create a mood entry
        mood_data = {
            "mood": "good",
            "note": "Feeling positive today"
        }
        response = self.client.post("/api/mood-entries", json=mood_data)
        self.assertEqual(response.status_code, 201)

        # Get mood entries
        response = self.client.get("/api/mood-entries")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(len(data) > 0)

    def test_unauthorized_access(self):
        """Test protection against unauthorized access"""
        # Try to access protected routes without login
        protected_routes = [
            "/api/appointments",
            "/api/mood-entries",
            "/api/user"
        ]

        for route in protected_routes:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 401)

    def get_chatbot_response(self, user_input):
        """Helper method to get chatbot responses"""
        if "anxious" in user_input.lower():
            return "I understand you're feeling anxious. Let's explore what might help..."
        elif "urgent" in user_input.lower():
            return "Here are some immediate support options..."
        elif "book" in user_input.lower():
            return "I can help you schedule a session with one of our counselors..."
        return "I'm here to support you. Would you like to tell me more?"

if __name__ == '__main__':
    unittest.main()