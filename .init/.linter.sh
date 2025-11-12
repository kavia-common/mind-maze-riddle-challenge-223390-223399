#!/bin/bash
cd /home/kavia/workspace/code-generation/mind-maze-riddle-challenge-223390-223399/mind_maze_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

