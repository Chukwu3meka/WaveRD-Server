module.exports = {
  apps: [
    {
      name: "SoccerMASS",
      script: "./dist/index.js",
      watch: true,
      ignore_watch: ["node_modules", ".git"],
      watch_options: {
        followSymlinks: false,
      },
    },
    {
      name: "Compiler",
      script: "./start-tsc.sh",
    },
    {
      name: "Gateway",
      script: "../gateway/index.js",
      // "instances"  : 4,
    },
  ],
};
