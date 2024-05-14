module.exports = {
    apps: [
      {
        name: "corsBypass",
        script: "./app.js",
        instances: 1,
        max_memory_restart: "100M",
        // Logging
        merge_logs: false,
        log_date_format: "YY-MM-DD HH:mm:ss Z",
        log_type: "json",
        // Env Specific Config
        env_production: {
          NODE_ENV: "production",
          exec_mode: "fork",
        },
        env_development: {
          NODE_ENV: "development",
          PORT: 443,
          watch: false,
          watch_delay: 3000,
          ignore_watch: [
            "./node_modules",
            "./app/views",
            "./public",
            "./.DS_Store",
            "./package.json",
            "./yarn.lock",
            "./samples",
            "./src",
            "./txt",
            "*.log"
          ],
        },
      },
    ],
  };