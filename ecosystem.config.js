module.exports = {
  apps: [
    {
      name: 'schafkopf-prod',
      script: './server/index.js',
      env: { NODE_ENV: 'production', PORT: 3002 },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/prod-error.log',
      out_file: './logs/prod-out.log',
    },
    {
      name: 'schafkopf-dev',
      script: './server/index.js',
      env: { NODE_ENV: 'development', PORT: 3001 },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/dev-error.log',
      out_file: './logs/dev-out.log',
    },
  ],
};
