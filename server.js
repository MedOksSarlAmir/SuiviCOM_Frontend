// server.js
const { exec } = require("child_process");

// Lancer next start sur le port 3000
const cmd = "npx next start -p 3000";

const child = exec(cmd, { cwd: __dirname });

child.stdout.on("data", (data) => {
  console.log(data.toString());
});

child.stderr.on("data", (data) => {
  console.error(data.toString());
});

child.on("exit", (code) => {
  console.log(`Next.js exited with code ${code}`);
});
