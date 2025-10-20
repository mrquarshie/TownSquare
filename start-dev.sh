#!/bin/bash

echo "Starting TownSquare Development Environment..."
echo

echo "Installing server dependencies..."
npm install

echo "Installing client dependencies..."
cd townsquare-frontend
npm install
cd ..

echo "Starting development servers..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo

npm run dev
