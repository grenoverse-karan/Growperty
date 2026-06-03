module.exports = {
  apps: [
    {
      name: 'growperty-web',
      cwd: '/Users/karannagar/Documents/Projects/Growperty/apps/web',
      script: 'node_modules/.bin/vite',
      args: '--host :: --port 3000',
      watch: false,
      restart_delay: 2000,
    },
    {
      name: 'growperty-api',
      cwd: '/Users/karannagar/Documents/Projects/Growperty/apps/api',
      script: 'src/main.js',
      interpreter: 'node',
      watch: false,
      restart_delay: 2000,
      env: { NODE_ENV: 'development' },
    },
  ],
};
