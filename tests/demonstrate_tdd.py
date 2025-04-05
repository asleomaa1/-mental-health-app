import unittest
import sys
import time
from datetime import datetime
from tests.test_app import TestMentalHealthApp

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

def run_tdd_demonstration():
    """Run a TDD demonstration focusing on the appointment booking feature"""

    # Phase 1: Red Phase
    print_test_phase(
        "RED - Initial Test Run",
        "Running appointment booking tests before implementation.\n"
        "Expected: Tests should FAIL as the functionality hasn't been implemented.\n"
        "This demonstrates the first step of TDD - writing failing tests."
    )

    # Create test suite with appointment-related tests
    suite = unittest.TestSuite()
    loader = unittest.TestLoader()
    appointment_tests = [
        'test_appointment_booking',
        'test_invalid_appointment_date',
        'test_unauthorized_appointment_booking',
        'test_appointment_validation'
    ]

    for test in appointment_tests:
        suite.addTest(loader.loadTestsFromName(
            f'tests.test_app.TestMentalHealthApp.{test}'
        ))

    # Run tests
    runner = unittest.TextTestRunner(resultclass=ConsoleTestResult)
    result = runner.run(suite)

    # Print summary
    print("\n" + "="*80)
    print(" TDD Demonstration Summary")
    print("="*80)
    print(f"Total Tests: {suite.countTestCases()}")
    print(f" Failed Tests: {len(result.failures)}")
    print(f" Errors: {len(result.errors)}")

    if suite.countTestCases() > 0:
        success_rate = ((suite.countTestCases() - len(result.failures) - len(result.errors)) / suite.countTestCases()) * 100
        print(f"Success Rate: {success_rate:.2f}%")

    if len(result.failures) + len(result.errors) > 0:
        print("\n Perfect! Tests are failing as expected in the RED phase.")
        print("\n Next Steps in TDD Process:")
        print("1.  Implement the appointment booking functionality")
        print("2.  Run tests again (expecting them to pass in the Green phase)")
        print("3.  Refactor code while maintaining test coverage")
    else:
        print("\n Unexpected: All tests passed in RED phase!")
        print("Tests should fail before implementation in TDD.")

    print("="*80)

if __name__ == '__main__':
    sys.exit(run_tdd_demonstration())