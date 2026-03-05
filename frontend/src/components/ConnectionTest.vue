<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-black text-white mb-8">🔌 Connection Test</h1>
      
      <!-- API Test -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🌐</span> API Connection
        </h2>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-slate-300">Status:</span>
            <span :class="apiStatus.class">{{ apiStatus.text }}</span>
          </div>
          
          <div v-if="apiStatus.url" class="text-sm text-slate-400">
            URL: {{ apiStatus.url }}
          </div>
          
          <div v-if="apiStatus.error" class="text-sm text-red-400 bg-red-500/10 p-3 rounded">
            Error: {{ apiStatus.error }}
          </div>
          
          <button 
            @click="testAPI"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Test API Connection
          </button>
        </div>
      </div>

      <!-- WebSocket Test -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚡</span> WebSocket Connection
        </h2>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-slate-300">Status:</span>
            <span :class="wsStatus.class">{{ wsStatus.text }}</span>
          </div>
          
          <div v-if="wsStatus.socketId" class="text-sm text-slate-400">
            Socket ID: {{ wsStatus.socketId }}
          </div>
          
          <div v-if="wsStatus.error" class="text-sm text-red-400 bg-red-500/10 p-3 rounded">
            Error: {{ wsStatus.error }}
          </div>
          
          <div class="flex gap-3">
            <button 
              @click="testWebSocket"
              :disabled="wsStatus.connected"
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {{ wsStatus.connected ? 'Connected' : 'Connect WebSocket' }}
            </button>
            
            <button 
              v-if="wsStatus.connected"
              @click="disconnectWebSocket"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Environment Info -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-6">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚙️</span> Environment Configuration
        </h2>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">API Base:</span>
            <span class="text-white font-mono">{{ envInfo.apiBase }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Backend URL:</span>
            <span class="text-white font-mono">{{ envInfo.backendUrl }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Frontend URL:</span>
            <span class="text-white font-mono">{{ envInfo.frontendUrl }}</span>
          </div>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="testResults.length" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📋</span> Test Log
        </h2>
        
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="(result, idx) in testResults" 
            :key="idx"
            class="text-sm p-2 rounded"
            :class="result.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'"
          >
            <span class="font-mono">{{ result.timestamp }}</span> - {{ result.message }}
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h3 class="text-lg font-bold text-blue-400 mb-3">📝 Instructions</h3>
        <ol class="space-y-2 text-sm text-slate-300">
          <li>1. Make sure backend is running: <code class="bg-slate-700 px-2 py-1 rounded">cd backend && npm run dev</code></li>
          <li>2. Click "Test API Connection" to verify REST API</li>
          <li>3. Click "Connect WebSocket" to verify real-time connection</li>
          <li>4. If both are green, you're ready to use analytics!</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

// Status tracking
const apiStatus = ref({
  text: 'Not tested',
  class: 'text-slate-400',
  url: '',
  error: ''
});

const wsStatus = ref({
  text: 'Not connected',
  class: 'text-slate-400',
  connected: false,
  socketId: '',
  error: ''
});

const testResults = ref([]);
const socket = ref(null);

// Environment info
const envInfo = computed(() => {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
  const backendUrl = apiBase.replace('/api', '');
  
  return {
    apiBase,
    backendUrl,
    frontendUrl: window.location.origin
  };
});

// Add test result
const addResult = (message, success = true) => {
  const timestamp = new Date().toLocaleTimeString();
  testResults.value.unshift({ timestamp, message, success });
  if (testResults.value.length > 20) {
    testResults.value.pop();
  }
};

// Test API connection
const testAPI = async () => {
  apiStatus.value = {
    text: 'Testing...',
    class: 'text-yellow-400 animate-pulse',
    url: envInfo.value.backendUrl,
    error: ''
  };

  try {
    const response = await fetch(`${envInfo.value.backendUrl}/health`);
    const data = await response.json();

    if (data.ok) {
      apiStatus.value = {
        text: '✅ Connected',
        class: 'text-emerald-400 font-bold',
        url: envInfo.value.backendUrl,
        error: ''
      };
      addResult('API connection successful', true);
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    apiStatus.value = {
      text: '❌ Failed',
      class: 'text-red-400 font-bold',
      url: envInfo.value.backendUrl,
      error: error.message
    };
    addResult(`API connection failed: ${error.message}`, false);
  }
};

// Test WebSocket connection
const testWebSocket = () => {
  wsStatus.value = {
    text: 'Connecting...',
    class: 'text-yellow-400 animate-pulse',
    connected: false,
    socketId: '',
    error: ''
  };

  try {
    socket.value = io(envInfo.value.backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socket.value.on('connect', () => {
      wsStatus.value = {
        text: '✅ Connected',
        class: 'text-emerald-400 font-bold',
        connected: true,
        socketId: socket.value.id,
        error: ''
      };
      addResult(`WebSocket connected: ${socket.value.id}`, true);
    });

    socket.value.on('disconnect', () => {
      wsStatus.value = {
        text: 'Disconnected',
        class: 'text-slate-400',
        connected: false,
        socketId: '',
        error: ''
      };
      addResult('WebSocket disconnected', true);
    });

    socket.value.on('connect_error', (error) => {
      wsStatus.value = {
        text: '❌ Failed',
        class: 'text-red-400 font-bold',
        connected: false,
        socketId: '',
        error: error.message
      };
      addResult(`WebSocket connection failed: ${error.message}`, false);
    });
  } catch (error) {
    wsStatus.value = {
      text: '❌ Failed',
      class: 'text-red-400 font-bold',
      connected: false,
      socketId: '',
      error: error.message
    };
    addResult(`WebSocket error: ${error.message}`, false);
  }
};

// Disconnect WebSocket
const disconnectWebSocket = () => {
  if (socket.value) {
    socket.value.disconnect();
    socket.value = null;
  }
};

// Cleanup on unmount
onUnmounted(() => {
  disconnectWebSocket();
});
</script>
