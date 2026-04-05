// PM2 Ecosystem Config — Single Source of Truth für alle Prozesse
// Starten: pm2 start ecosystem.config.js
// Stoppen:  pm2 stop ecosystem.config.js
// Neustart: pm2 restart ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'schafkopf-dev',
      script: 'server/index.js',
      cwd: '/home/vscode/schafkopf-tracker',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      // Automatisch neustarten wenn der Prozess crashed
      autorestart: true,
      // Max. Memory bevor Neustart
      max_memory_restart: '300M',
    },
    {
      name: 'schafkopf-prod',
      script: 'server/index.js',
      cwd: '/home/vscode/schafkopf-tracker',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};
