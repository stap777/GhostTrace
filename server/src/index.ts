import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`[GhostTrace Server] Operational on port ${PORT}`);
  console.log(`[GhostTrace Server] Health check available at http://localhost:${PORT}/api/health`);
  console.log(`[GhostTrace Server] Auth endpoint available at http://localhost:${PORT}/api/auth/login`);
});
