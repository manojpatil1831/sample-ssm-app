// Elements
const cpuPercent = document.getElementById('cpu-percent');
const cpuProgress = document.getElementById('cpu-progress');
const cpuCores = document.getElementById('cpu-cores');
const cpuState = document.getElementById('cpu-state');

const memUsed = document.getElementById('mem-used');
const memTotal = document.getElementById('mem-total');
const memProgress = document.getElementById('mem-progress');
const memPercent = document.getElementById('mem-percent');
const memPressure = document.getElementById('mem-pressure');

const sysPlatform = document.getElementById('sys-platform');
const sysDistro = document.getElementById('sys-distro');
const sysRelease = document.getElementById('sys-release');
const sysUptime = document.getElementById('sys-uptime');
const appVersion = document.getElementById('app-version');
const envBadge = document.getElementById('env-badge');

const refreshBtn = document.getElementById('refresh-btn');
const terminalOutput = document.getElementById('terminal-output');

// Utility to format seconds into readable uptime
function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

// Write to simulated terminal console
function logToTerminal(message, type = 'normal') {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  
  const timestamp = new Date().toLocaleTimeString();
  let content = '';

  if (type === 'command') {
    content = `<span class="cmd-prompt">root@ec2-ssm-agent:~#</span> ${message}`;
  } else {
    let typeClass = '';
    if (type === 'success') typeClass = 'text-success';
    if (type === 'warning') typeClass = 'text-warning';
    if (type === 'danger') typeClass = 'text-danger';
    if (type === 'muted') typeClass = 'text-muted';
    content = `<span class="text-muted">[${timestamp}]</span> <span class="${typeClass}">${message}</span>`;
  }

  line.innerHTML = content;
  terminalOutput.appendChild(line);
  
  // Keep scroll at bottom
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Fetch stats function
async function updateMetrics() {
  const refreshIcon = refreshBtn.querySelector('svg');
  refreshIcon.classList.add('spinning');
  
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    // Update CPU
    const loadVal = parseFloat(data.cpu.load);
    cpuPercent.textContent = Math.round(loadVal);
    // stroke-dasharray handles progress (0 to 100)
    cpuProgress.setAttribute('stroke-dasharray', `${loadVal}, 100`);
    cpuCores.textContent = data.cpu.cores;
    
    if (loadVal > 60) {
      cpuState.textContent = 'High';
      cpuState.className = 'text-danger';
    } else if (loadVal > 15) {
      cpuState.textContent = 'Active';
      cpuState.className = 'badge-active';
    } else {
      cpuState.textContent = 'Idle';
      cpuState.className = 'text-muted';
    }

    // Update Memory
    memUsed.textContent = `${data.memory.used} GB`;
    memTotal.textContent = `${data.memory.total} GB`;
    memPercent.textContent = Math.round(data.memory.percent);
    memProgress.style.width = `${data.memory.percent}%`;

    const memPercentVal = parseFloat(data.memory.percent);
    if (memPercentVal > 85) {
      memPressure.textContent = 'Critical';
      memPressure.className = 'text-danger';
    } else if (memPercentVal > 70) {
      memPressure.textContent = 'Warning';
      memPressure.className = 'text-warning';
    } else {
      memPressure.textContent = 'Normal';
      memPressure.className = 'status-ok';
    }

    // Update system info
    sysPlatform.textContent = data.system.platform;
    sysDistro.textContent = data.system.distro;
    sysRelease.textContent = data.system.release;
    sysUptime.textContent = formatDuration(data.system.uptime);
    
    // Update app detail
    appVersion.textContent = data.deployment.version;
    envBadge.textContent = data.deployment.environment.toUpperCase();

  } catch (error) {
    console.error('Error loading metrics:', error);
    logToTerminal(`Failed to poll server diagnostics: ${error.message}`, 'danger');
  } finally {
    // Small timeout to give smooth visual feedback
    setTimeout(() => {
      refreshIcon.classList.remove('spinning');
    }, 4000);
  }
}

// Simulate SSM deployment events randomly for aesthetic demonstration
function simulateDeploymentEvents() {
  const events = [
    { cmd: 'aws ssm send-command --document-name "AWS-RunShellScript"', type: 'command', delay: 1000 },
    { cmd: 'Invoking document commands on EC2 targets...', type: 'muted', delay: 2000 },
    { cmd: 'set -e && cd /root/Workflow-and-Workers/deployments/docker', type: 'command', delay: 3500 },
    { cmd: 'Logging in to AWS ECR at registry: 839792743414.dkr.ecr.us-east-1.amazonaws.com', type: 'muted', delay: 5000 },
    { cmd: 'Login Succeeded!', type: 'success', delay: 6500 },
    { cmd: 'git fetch --all && git pull origin main', type: 'command', delay: 8500 },
    { cmd: 'From github.com/organization/Workflow-and-Workers\n   * branch            main       -> FETCH_HEAD\n   Already up to date.', type: 'muted', delay: 10500 },
    { cmd: 'docker compose down', type: 'command', delay: 12000 },
    { cmd: 'Removing network docker_default\nRemoving container docker-web-1 ... Done', type: 'muted', delay: 13500 },
    { cmd: 'docker compose pull', type: 'command', delay: 15000 },
    { cmd: '839792743414.dkr.ecr.us-east-1.amazonaws.com/ssm-demo-app:latest Pulling\nDigest: sha256:4a0ef45...\nStatus: Downloaded newer image', type: 'muted', delay: 17000 },
    { cmd: 'docker compose up -d --remove-orphans', type: 'command', delay: 18500 },
    { cmd: 'Creating container docker-web-1 ... Started', type: 'success', delay: 20000 },
    { cmd: 'docker system prune -af', type: 'command', delay: 22000 },
    { cmd: 'Total reclaimed space: 1.42 GB', type: 'success', delay: 24500 },
    { cmd: 'SSM dispatch status: SUCCESS', type: 'success', delay: 26000 }
  ];

  events.forEach(evt => {
    setTimeout(() => {
      logToTerminal(evt.cmd, evt.type);
    }, evt.delay);
  });
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  // Pull initial metrics
  updateMetrics();
  
  // Set interval for metrics (every 5 seconds)
  setInterval(updateMetrics, 5000);
  
  // Configure refresh click
  refreshBtn.addEventListener('click', () => {
    logToTerminal('Manual diagnostics refresh requested...', 'muted');
    updateMetrics();
  });

  // Run the SSM simulation script sequence
  simulateDeploymentEvents();
});
