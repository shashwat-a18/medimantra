#!/bin/bash
# Comprehensive backend test runner for MediMantra
cd "$(dirname "$0")/server"
echo "Installing backend dependencies..."
npm install

echo "Running backend tests..."
npm test
