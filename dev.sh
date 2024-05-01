#!/bin/bash
pm2 kill 
pm2 stop all
npx kill-port 5000
npx kill-port 8081
pm2 start ecosystem.config.js
# pm2 monit
pm2 logs SoccerMASS

# $SHELL  # to prevent console. from closing 
