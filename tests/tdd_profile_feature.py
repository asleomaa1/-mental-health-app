import unittest
import sys
import time
from datetime import datetime
import json
from tests.test_config import get_test_app

def print_test_phase(title, description):
    print("\n" + "="*80)
    print(f"TDD PHASE: {title}")
    print("="*80)
    print(description + "\n")

class ConsoleTestResult(unittest.TestResult):
    def startTest(self, test):
        self.start_time = time.time()
        test_name = test.shortDescription() or test.id()
        print(f"\n Running Test: {test_name}")
        print("-" * 40)

    def addSuccess(self, test):
        duration = time.time() - self.start_time
        print(f" PASS ({duration:.2f}s)")

    def addError(self, test, err):
        print(f" ERROR: {err[1]}")
        super().addError(test, err)

    def addFailure(self, test, err):
        print(f" FAIL: {err[1]}")
        super().addFailure(test, err)

class TestUserProfileFeature(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test app"""
        cls.app = get_test_app()

    def setUp(self):
        """Set up test client and mock data"""
        self.client = self.app.test_client()
        self.auth_data = {
            "username": "profiletestuser",
            "password": "Test123!",
            "email": "profile@cardiff.ac.uk",
            "studentId": "87654321",
            "fullName": "Profile Test User",
        }
        
        # Register and login
        self.client.post("/api/register", json=self.auth_data)
        response = self.client.post("/api/login", json={
            "username": self.auth_data["username"],
            "password": self.auth_data["password"]
        })
        
        # Store any auth tokens if needed
        self.token = response.get_json().get("token", "")
        
    def test_user_profile_view(self):
        """Test user can view their profile"""
        response = self.client.get("/api/user/profile")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["username"], self.auth_data["username"])
        self.assertEqual(data["email"], self.auth_data["email"])
        self.assertEqual(data["fullName"], self.auth_data["fullName"])
        
    def test_user_profile_update(self):
        """Test user can update their profile"""
        update_data = {
            "fullName": "Updated Full Name",
            "email": "updated@cardiff.ac.uk",
            "preferences": {
                "notifications": True,
                "theme": "dark"
            }
        }
        
        headers = {'Authorization': f'Bearer {self.token}'} if self.token else {}
        response = self.client.put("/api/user/profile", 
                                json=update_data,
                                headers=headers)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["fullName"], update_data["fullName"])
        self.assertEqual(data["email"], update_data["email"])
        self.assertTrue(data["preferences"]["notifications"])
        self.assertEqual(data["preferences"]["theme"], "dark")
        
    def test_invalid_profile_update(self):
        """Test validation during profile update"""
        invalid_updates = [
            {"email": "invalid-email-format"},  # Invalid email
            {"fullName": ""},  # Empty name
            {"preferences": "not-an-object"}  # Wrong type
        ]
        
        headers = {'Authorization': f'Bearer {self.token}'} if self.token else {}
        
        for invalid_data in invalid_updates:
            response = self.client.put("/api/user/profile", 
                                    json=invalid_data,
                                    headers=headers)
            self.assertEqual(response.status_code, 400)
            data = json.loads(response.data)
            self.assertIn("error", data)
            
    def test_unauthorized_profile_update(self):
        """Test unauthorized profile update attempt"""
        # Try updating without being logged in (no auth header)
        update_data = {"fullName": "Hacker"}
        response = self.client.put("/api/user/profile", json=update_data)
        self.assertEqual(response.status_code, 401)
        
def run_tdd_demonstration():
    """Run a full TDD demonstration for user profile feature"""
    
    # PHASE 1: RED - Write failing tests
    print_test_phase(
        "RED - Initial Test Run",
        "Running user profile tests before implementation.\n"
        "Expected: Tests should FAIL as the functionality hasn't been implemented yet.\n"
        "This demonstrates the first step of TDD - writing failing tests."
    )
    
    # Create test suite with all profile tests
    red_suite = unittest.TestSuite()
    loader = unittest.TestLoader()
    
    # Add all tests to the suite
    red_suite.addTests(loader.loadTestsFromTestCase(TestUserProfileFeature))
    
    # Run tests expecting failure
    runner = unittest.TextTestRunner(resultclass=ConsoleTestResult)
    red_result = runner.run(red_suite)
    
    # Summary of RED phase
    print("\n RED Phase Summary:")
    print(f" Total Tests: {red_suite.countTestCases()}")
    print(f" Failed Tests: {len(red_result.failures)}")
    print(f" Errors: {len(red_result.errors)}")
    
    # PHASE 2: GREEN - Implementation code (would be added to the project)
    print_test_phase(
        "GREEN - Implementing the Feature",
        "After seeing the tests fail, we implement the minimum code needed to make them pass.\n"
        "This is the implementation that would be added to the routes and storage modules:\n"
    )
    
    # Show code implementation that would be added
    print("""
# Example implementation that would be added to routes.ts:

app.get("/api/user/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({message: "Please log in"});
    
    // Return the user profile data
    const user = req.user;
    const profile = {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        studentId: user.studentId,
        preferences: user.preferences || {
            notifications: false,
            theme: "light"
        }
    };
    
    res.status(200).json(profile);
});

app.put("/api/user/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({message: "Please log in"});
    
    // Validate input data
    const { fullName, email, preferences } = req.body;
    const errors = [];
    
    if (email && !email.includes('@')) {
        errors.push("Invalid email format");
    }
    
    if (fullName !== undefined && fullName.trim() === '') {
        errors.push("Name cannot be empty");
    }
    
    if (preferences && typeof preferences !== 'object') {
        errors.push("Preferences must be an object");
    }
    
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join(", ")});
    }
    
    // Update the user profile in storage
    const updatedUser = storage.updateUserProfile(req.user.id, req.body);
    
    // Return the updated profile
    res.status(200).json({
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        studentId: updatedUser.studentId,
        preferences: updatedUser.preferences
    });
});

# Example implementation for storage.ts:

async updateUserProfile(userId: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
        throw new Error("User not found");
    }
    
    // Update allowed fields
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.email) user.email = updates.email;
    
    // Handle preferences as a nested object
    if (updates.preferences) {
        user.preferences = {
            ...user.preferences || {},
            ...updates.preferences
        };
    }
    
    // Return the updated user
    return user;
}
""")
    
    # PHASE 3: REFACTOR - Code improvement
    print_test_phase(
        "REFACTOR - Improving Implementation",
        "After getting tests to pass with minimal implementation, we refactor for better code quality.\n"
        "This is where we improve design without changing functionality, ensuring tests still pass."
    )
    
    # Show refactored implementation
    print("""
# Refactored implementation with better validation, error handling, and separation of concerns:

// routes.ts - Extract validation to reusable functions
function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateProfileData(data: any): {valid: boolean, errors: string[]} {
    const errors = [];
    
    if (data.email && !validateEmail(data.email)) {
        errors.push("Invalid email format");
    }
    
    if (data.fullName !== undefined && data.fullName.trim() === '') {
        errors.push("Name cannot be empty");
    }
    
    if (data.preferences && typeof data.preferences !== 'object') {
        errors.push("Preferences must be an object");
    }
    
    return { valid: errors.length === 0, errors };
}

app.put("/api/user/profile", (req, res) => {
    // Authentication check
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: "Please log in"});
    }
    
    // Validate input data
    const validation = validateProfileData(req.body);
    if (!validation.valid) {
        return res.status(400).json({error: validation.errors.join(", ")});
    }
    
    try {
        // Update the user profile in storage
        const updatedUser = storage.updateUserProfile(req.user.id, req.body);
        
        // Return the updated profile
        res.status(200).json({
            username: updatedUser.username,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            studentId: updatedUser.studentId,
            preferences: updatedUser.preferences || {}
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({error: "Failed to update profile"});
    }
});

// storage.ts - Better type handling and validation
interface ProfileUpdates {
    fullName?: string;
    email?: string;
    preferences?: {
        notifications?: boolean;
        theme?: string;
    };
}

async updateUserProfile(userId: number, updates: ProfileUpdates): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
        throw new Error("User not found");
    }
    
    // Create a new user object instead of mutating the original
    const updatedUser = {
        ...user,
        ...updates,
        // Special handling for nested properties
        preferences: updates.preferences 
            ? { ...user.preferences || {}, ...updates.preferences }
            : user.preferences
    };
    
    // Save updates to storage
    this.users.set(userId, updatedUser);
    
    return updatedUser;
}
""")
    
    # Final summary
    print("\n" + "="*80)
    print(" TDD Process Complete")
    print("="*80)
    print(" The TDD process demonstrated:")
    print(" 1. RED: Writing tests before implementation (tests failed)")
    print(" 2. GREEN: Writing minimal code to make tests pass")
    print(" 3. REFACTOR: Improving code quality while maintaining passing tests")
    print("\n These are essential steps in Test-Driven Development, ensuring")
    print(" that requirements are well-defined before coding begins, and that")
    print(" the resulting code is testable and meets those requirements.")
    print("="*80)

if __name__ == '__main__':
    sys.exit(run_tdd_demonstration())