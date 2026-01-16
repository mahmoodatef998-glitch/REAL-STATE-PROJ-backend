module.exports = {
  apps: [
    {
      name: 'alrabie-backend',
      script: 'start-server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3050
      },
      watch: false,
      max_memory_restart: '300M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      time: true
    }
  ]
};
