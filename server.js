const express = require('express');
const si = require('systeminformation');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to return server/instance health and metrics
app.get('/api/stats', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const time = si.time();
    const os = await si.osInfo();
    
    // Calculate memory percentage
    const memoryUsedPercent = ((mem.active / mem.total) * 100).toFixed(1);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform,
        distro: os.distrib,
        release: os.release,
        uptime: time.uptime,
      },
      cpu: {
        load: cpu.currentLoad.toFixed(1),
        cores: cpu.cpus.length,
      },
      memory: {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2), // GB
        used: (mem.active / 1024 / 1024 / 1024).toFixed(2), // GB
        percent: memoryUsedPercent,
      },
      deployment: {
        environment: process.env.NODE_ENV || 'development',
        deployedAt: process.env.DEPLOYED_AT || new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system metrics',
      error: error.message,
    });
  }
});

// For status check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Fallback to serving the index.html for UI routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(` SSM Deployment Monitor App Live at http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);
});
