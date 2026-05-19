module.exports = {
  apps: [{
    name: 'blog',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: 'C:/Projects/blog',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
    },
    watch: false,
    autorestart: true,
    max_restarts: 10,
  }],
};
