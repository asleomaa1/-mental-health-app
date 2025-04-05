import unittest
import sys
import time
from datetime import datetime
from tests.test_app import TestMentalHealthApp
from tests.test_security import TestSecurityFeatures
from tests.show_unauthorized_access_test import TestUnauthorizedAccess
from tests.show_sql_injection_test import TestSQLInjectionPrevention
# This would import TDD tests
from tests.tdd_profile_feature import TestUserProfileFeature

def run_tdd_demonstration():
    """Run a demonstration of Test-Driven Development"""
    print("\n" + "="*80)
    print(" TEST-DRIVEN DEVELOPMENT DEMONSTRATION")
    print("="*80)
    print(" Running test-driven development demonstration for profile feature.")
    print(" This shows the TDD cycle: RED (failing tests) → GREEN (implementation) → REFACTOR")
    print("="*80)
    
    # Import and run the TDD demonstration
    from tests.tdd_profile_feature import run_tdd_demonstration
    run_tdd_demonstration()

def run_security_demonstration():
    """Run security testing demonstrations"""
    print("\n" + "="*80)
    print(" SECURITY TESTING DEMONSTRATION")
    print("="*80)
    
    # SQL Injection Prevention
    print("\n Running SQL Injection Prevention Tests")
    print(" --------------------------------------")
    from tests.show_sql_injection_test import run_sql_injection_tests
    run_sql_injection_tests()
    
    # Unauthorized Access Prevention
    print("\n Running Unauthorized Access Prevention Tests")
    print(" -------------------------------------------")
    from tests.show_unauthorized_access_test import run_unauthorized_access_tests
    run_unauthorized_access_tests()

def run_test_suite():
    """Run the test suite and generate a detailed report"""
    # Start timing
    start_time = time.time()

    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add test cases
    suite.addTests(loader.loadTestsFromTestCase(TestMentalHealthApp))
    suite.addTests(loader.loadTestsFromTestCase(TestSecurityFeatures))
    suite.addTests(loader.loadTestsFromTestCase(TestUnauthorizedAccess))
    suite.addTests(loader.loadTestsFromTestCase(TestSQLInjectionPrevention))
    suite.addTests(loader.loadTestsFromTestCase(TestUserProfileFeature))

    # Create test runner
    runner = unittest.TextTestRunner(verbosity=2)

    # Run tests
    result = runner.run(suite)

    # Calculate timing
    duration = time.time() - start_time

    # Generate report
    print("\n=== Test Execution Report ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Duration: {duration:.2f} seconds")
    print(f"Tests Run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success Rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun) * 100:.2f}%")

    # Print security test results separately
    print("\n=== Security Test Results ===")
    security_tests = [test for test in result.failures + result.errors 
                     if 'TestSecurity' in str(test[0]) or 'Unauthorized' in str(test[0]) or 'SQL' in str(test[0])]
    if not security_tests:
        print("All security tests passed successfully!")
    else:
        print("Security test failures/errors:")
        for test in security_tests:
            print(f"- {test[0]}")
    
    print("\n=== TDD Test Results ===")
    tdd_tests = [test for test in result.failures + result.errors 
                if 'TestUserProfile' in str(test[0])]
    if not tdd_tests:
        print("All TDD-developed features passed successfully!")
    else:
        print("TDD test failures/errors:")
        for test in tdd_tests:
            print(f"- {test[0]}")

    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'tdd':
            sys.exit(run_tdd_demonstration())
        elif sys.argv[1] == 'security':
            sys.exit(run_security_demonstration())
        elif sys.argv[1] == 'unauthorized':
            from tests.show_unauthorized_access_test import run_unauthorized_access_tests
            sys.exit(run_unauthorized_access_tests())
        elif sys.argv[1] == 'sql_injection':
            from tests.show_sql_injection_test import run_sql_injection_tests
            sys.exit(run_sql_injection_tests())
        else:
            print(f"Unknown command: {sys.argv[1]}")
            print("Available commands: tdd, security, unauthorized, sql_injection")
            sys.exit(1)
    else:
        # Run all tests by default
        sys.exit(run_test_suite())