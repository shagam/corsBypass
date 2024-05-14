module.exports = {
    apps: [
      {
        name: "corsBypass",
        script: "./app.js",
        instances: 2,
        max_memory_restart: "120M",
        // Logging
        out_file: "./out.log",
        error_file: "./error.log",
        merge_logs: true,
        log_date_format: "DD-MM HH:mm:ss Z",
        log_type: "json",
        // Env Specific Config
        env_production: {
          NODE_ENV: "production",
          PORT: 443,
          exec_mode: "cluster_mode",
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