#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Ensure node/npm are in PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
echo -e "${PURPLE}Starting AutoML Studio Services...${NC}\n"

# 1. Start Python ML Engine (Port 8000)
echo -e "${BLUE}1/3 Starting Python ML Engine (FastAPI) on port 8000...${NC}"
source venv/bin/activate
cd analytics_engine
uvicorn main:app --port 8000 --reload &
PID_PYTHON=$!
cd ..

# 2. Start Express Backend (Port 5001)
echo -e "${BLUE}2/3 Starting Express API on port 5001...${NC}"
cd backend
node server.js &
PID_NODE=$!
cd ..

# 3. Start React Frontend (Port 5173)
echo -e "${BLUE}3/3 Starting React Frontend on port 5173...${NC}"
cd frontend
npm run dev -- --host &
PID_REACT=$!
cd ..

echo -e "\n${GREEN}✅ All services started successfully!${NC}"
echo -e "---------------------------------------------------"
echo -e "Frontend (App):   ${GREEN}http://localhost:5173${NC}"
echo -e "Backend API:      ${BLUE}http://localhost:5001${NC}"
echo -e "ML Engine API:    ${PURPLE}http://localhost:8000${NC}"
echo -e "---------------------------------------------------"
echo -e "Press [CTRL+C] at any time to stop all services.\n"

# Trap CTRL+C (SIGINT) to kill all background processes cleanly
trap "echo -e '\n${PURPLE}Stopping all services...${NC}'; kill $PID_PYTHON $PID_NODE $PID_REACT 2>/dev/null; exit 0" SIGINT

# Keep the script running to hold the trap
wait
