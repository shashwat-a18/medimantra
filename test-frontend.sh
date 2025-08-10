#!/bin/bash
# Comprehensive frontend test runner for MediMantra
cd "$(dirname "$0")/client"
echo "Installing frontend dependencies..."
npm install

echo "Running frontend tests..."
npx cypress run
