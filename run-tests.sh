#!/usr/bin/env bash
set -e

echo "====================================================="
echo "        TaskForge Automated Test Suite Runner         "
echo "====================================================="
echo "Running all Unit & Integration tests for TaskForge..."
echo ""

# Run Maven tests
./mvnw clean test

echo ""
echo "====================================================="
echo " SUCCESS: All Unit and Integration Tests Passed!     "
echo "====================================================="
