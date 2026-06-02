# Day 1 – AI Resume Analyzer Troubleshooting Notes

## Biggest Lesson

Do not guess.

When an application is broken, do not immediately start changing code. Start isolating the problem layer by layer.

Application not working
↓
Is frontend running?
↓
Is backend running?
↓
Is database connected?
↓
Does frontend reach backend?
↓
Does file upload work?
↓
Does OpenAI work?
↓
Does Adzuna work?
↓
Find exact failure point

Result: The application was not broken. The OpenAI API account had no available quota.

## Key Commands Learned

- pwd – show current directory
- ls -la – list files including hidden files
- cat package.json – inspect project configuration
- npm run – show available npm scripts
- git status – inspect repository state
- git remote -v – view connected remote repository
- lsof -i :3001 – identify which process is using a port
- kill -9 <PID> – terminate a process
- docker ps – view running containers
- docker stop <container> – stop a container
- docker logs <container> – inspect container logs

## Browser Debugging

- Used Developer Tools (F12)
- Investigated Console and Network tabs
- Found HTTP 500 Internal Server Error
- Confirmed frontend was successfully reaching backend

## Backend Investigation

- Verified backend server startup
- Verified PostgreSQL connection
- Read backend logs instead of guessing
- Identified OpenAI 429 quota error as root cause

## Git Lessons

- Verified .env was not tracked by Git
- Investigated tracked files using git ls-files
- Learned node_modules should not be committed to repositories

## Docker Preparation

Image = blueprint
Container = running instance

## Rule Going Forward

1. Verify frontend
2. Verify backend
3. Verify database
4. Verify API integrations
5. Read logs
6. Follow evidence
7. Do not guess

The goal is not to memorize commands. The goal is to think like an engineer.