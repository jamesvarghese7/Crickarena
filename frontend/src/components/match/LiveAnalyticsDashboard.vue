<template>
  <div class="space-y-6">
    <!-- Connection Status -->
    <div v-if="!isConnected" class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
      <div class="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
      <span class="text-yellow-200 text-sm">Connecting to live analytics...</span>
    </div>

    <div v-else class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        <span class="text-emerald-200 text-sm font-medium">Live Analytics Active</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <span>👥 {{ viewersCount }} watching</span>
      </div>
    </div>

    <!-- No Data Message -->
    <div v-if="isConnected && !hasAnyData" class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
        <span class="text-3xl">📊</span>
      </div>
      <h3 class="text-lg font-bold text-white mb-2">Waiting for Match Data</h3>
      <p class="text-slate-400 text-sm mb-3">
        Analytics will be available once the match starts and balls are bowled.
      </p>
      <div class="bg-slate-700/30 rounded-lg p-4 text-left text-xs text-slate-400 max-w-md mx-auto">
        <p class="font-semibold text-slate-300 mb-2">📋 How it works:</p>
        <ul class="space-y-1 list-disc list-inside">
          <li>Admin starts the match</li>
          <li>Admin enters ball-by-ball data</li>
          <li>Analytics calculate automatically</li>
          <li>Real-time updates appear here</li>
        </ul>
      </div>
    </div>

    <!-- Win Probability Gauge -->
    <div v-if="winProbability" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">📊</span> Win Probability
        </h3>
        <span v-if="matchPhase" class="px-3 py-1 rounded-full text-xs font-bold uppercase"
          :class="[
            matchPhase === 'powerplay' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
            matchPhase === 'middle' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
            'bg-red-500/20 text-red-400 border border-red-500/40'
          ]">
          {{ matchPhase }}
        </span>
      </div>
      
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="text-center flex-1">
            <div class="text-3xl font-black text-white mb-1">{{ winProbability.batting }}%</div>
            <div class="text-xs text-slate-400">Batting Team</div>
          </div>
          <div class="text-2xl text-slate-600">vs</div>
          <div class="text-center flex-1">
            <div class="text-3xl font-black text-white mb-1">{{ winProbability.bowling }}%</div>
            <div class="text-xs text-slate-400">Bowling Team</div>
          </div>
        </div>

        <!-- Probability Bar -->
        <div class="relative h-8 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            class="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out"
            :style="{ width: winProbability.batting + '%' }"
          ></div>
          <div 
            class="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-600 transition-all duration-1000 ease-out"
            :style="{ width: winProbability.bowling + '%' }"
          ></div>
        </div>
        
        <!-- Pressure Index (if chasing) -->
        <div v-if="pressureIndex !== null" class="mt-4 pt-4 border-t border-slate-700/50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-slate-400 uppercase tracking-wide">Pressure Index</span>
            <span class="text-sm font-bold"
              :class="[
                pressureLevel === 'low' ? 'text-emerald-400' :
                pressureLevel === 'moderate' ? 'text-yellow-400' :
                pressureLevel === 'high' ? 'text-orange-400' : 'text-red-400'
              ]">
              {{ pressureIndex }}/100 ({{ pressureLevel }})
            </span>
          </div>
          <div class="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div class="h-full transition-all duration-700"
              :class="[
                pressureLevel === 'low' ? 'bg-emerald-500' :
                pressureLevel === 'moderate' ? 'bg-yellow-500' :
                pressureLevel === 'high' ? 'bg-orange-500' : 'bg-red-500'
              ]"
              :style="{ width: pressureIndex + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Partnership Momentum -->
    <div v-if="partnershipMomentum && partnershipMomentum.runs > 0" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🤝</span> Current Partnership
        </h3>
      </div>
      
      <div class="p-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-3xl font-black text-white">{{ partnershipMomentum.runs }}</div>
            <div class="text-xs text-slate-400 mt-1">runs ({{ partnershipMomentum.balls }} balls)</div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-blue-400">{{ partnershipMomentum.runRate }}</div>
            <div class="text-xs text-slate-400 mt-1">per over</div>
          </div>
        </div>
        
        <div class="bg-slate-700/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <span class="text-sm text-slate-300">{{ partnershipMomentum.message }}</span>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase"
            :class="[
              partnershipMomentum.momentum === 'explosive' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              partnershipMomentum.momentum === 'strong' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              partnershipMomentum.momentum === 'developing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
              'bg-orange-500/20 text-orange-400 border border-orange-500/40'
            ]">
            {{ partnershipMomentum.momentum }}
          </span>
        </div>
      </div>
    </div>

    <!-- Momentum Indicator -->
    <div v-if="momentum" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">⚡</span> Match Momentum
        </h3>
      </div>
      
      <div class="p-6">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div 
            :class="[
              'px-6 py-3 rounded-xl font-bold text-lg flex-1 text-center',
              momentum.trend === 'surging' ? 'bg-emerald-600/20 text-emerald-300 border-2 border-emerald-500/50' :
              momentum.trend === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              momentum.trend === 'negative' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              momentum.trend === 'struggling' ? 'bg-red-600/20 text-red-300 border-2 border-red-500/50' :
              'bg-slate-700/50 text-slate-400 border border-slate-600/30'
            ]"
          >
            {{ momentum.trend === 'surging' ? '🔥 Surging' : 
               momentum.trend === 'positive' ? '↗️ Positive' : 
               momentum.trend === 'negative' ? '↘️ Negative' : 
               momentum.trend === 'struggling' ? '📉 Struggling' : '→ Neutral' }}
          </div>
          <div class="text-3xl font-black text-white">{{ momentum.value }}</div>
        </div>
        <div class="text-center text-sm text-slate-400">{{ momentum.description || 'Match flow indicator' }}</div>
      </div>
    </div>

    <!-- Score Prediction -->
    <div v-if="finalScorePrediction" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🎯</span> Projected Final Score
        </h3>
      </div>
      
      <div class="p-6">
        <div class="text-center mb-4">
          <div class="text-5xl font-black text-white mb-2">{{ finalScorePrediction.predicted }}</div>
          <div class="text-sm text-slate-400">
            Range: {{ finalScorePrediction.range.min }} - {{ finalScorePrediction.range.max }}
          </div>
        </div>
        
        <!-- Prediction confidence bar -->
        <div class="bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            :style="{ width: '75%' }"
          ></div>
        </div>
        <div class="text-xs text-center text-slate-500 mt-2">75% Confidence</div>
      </div>
    </div>

    <!-- Run Rate Comparison -->
    <div v-if="currentRunRate && currentRunRate !== '0.00'" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">📈</span> Run Rate Analysis
        </h3>
      </div>
      
      <div class="p-6 grid grid-cols-2 gap-4">
        <div class="bg-slate-700/30 rounded-xl p-4 text-center">
          <div class="text-xs text-slate-400 mb-2">Current Run Rate</div>
          <div class="text-3xl font-black text-emerald-400">{{ currentRunRate }}</div>
        </div>
        <div v-if="requiredRunRate" class="bg-slate-700/30 rounded-xl p-4 text-center">
          <div class="text-xs text-slate-400 mb-2">Required Run Rate</div>
          <div class="text-3xl font-black text-amber-400">{{ requiredRunRate }}</div>
        </div>
      </div>
    </div>

    <!-- Innings Comparison (2nd innings only) -->
    <div v-if="inningsComparison && inningsComparison.currentOvers !== '0.0'" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">⚖️</span> Innings Comparison
          <span class="text-xs font-normal text-slate-500 ml-auto">At {{ inningsComparison.currentOvers }} overs</span>
        </h3>
      </div>
      
      <div class="p-6">
        <!-- Score Comparison -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- First Innings -->
          <div class="bg-slate-700/30 rounded-xl p-4 border-2 border-slate-600/50">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs text-slate-400">1st Innings</div>
              <div class="text-xs font-bold text-blue-400">{{ inningsComparison.firstInnings.teamName }}</div>
            </div>
            <div class="text-2xl font-black text-white mb-1">{{ inningsComparison.firstInnings.runs }}/{{ inningsComparison.firstInnings.wickets }}</div>
            <div class="text-xs text-slate-500">RR: {{ inningsComparison.firstInnings.runRate }}</div>
            <div class="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-600/30">
              Final: {{ inningsComparison.firstInnings.total }}/{{ inningsComparison.firstInnings.totalWickets }}
            </div>
          </div>
          
          <!-- Second Innings -->
          <div class="bg-slate-700/30 rounded-xl p-4 border-2 border-emerald-500/30">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs text-slate-400">2nd Innings</div>
              <div class="text-xs font-bold text-emerald-400">{{ inningsComparison.secondInnings.teamName }}</div>
            </div>
            <div class="text-2xl font-black text-white mb-1">{{ inningsComparison.secondInnings.runs }}/{{ inningsComparison.secondInnings.wickets }}</div>
            <div class="text-xs text-slate-500">RR: {{ inningsComparison.secondInnings.runRate }}</div>
            <div class="text-xs text-emerald-400/60 mt-2 pt-2 border-t border-slate-600/30">
              Currently batting
            </div>
          </div>
        </div>

        <!-- Comparison Status -->
        <div class="bg-slate-700/20 rounded-xl p-4">
          <div class="text-center">
            <div 
              :class="[
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm',
                inningsComparison.comparison.status === 'ahead' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                inningsComparison.comparison.status === 'behind' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-slate-600/30 text-slate-400 border border-slate-500/30'
              ]"
            >
              <span v-if="inningsComparison.comparison.status === 'ahead'">↗️</span>
              <span v-else-if="inningsComparison.comparison.status === 'behind'">↘️</span>
              <span v-else>→</span>
              
              <span class="font-bold">{{ inningsComparison.comparison.chasingTeam }}</span>
              
              <span v-if="inningsComparison.comparison.runDifference !== 0">
                {{ Math.abs(inningsComparison.comparison.runDifference) }} runs 
                {{ inningsComparison.comparison.status === 'ahead' ? 'ahead' : 'behind' }}
              </span>
              <span v-else>level with {{ inningsComparison.comparison.firstBattingTeam }}</span>
            </div>
            
            <div class="text-xs text-slate-500 mt-2">
              {{ Math.abs(inningsComparison.comparison.wicketDifference) }} 
              {{ inningsComparison.comparison.wicketDifference > 0 ? 'more' : inningsComparison.comparison.wicketDifference < 0 ? 'fewer' : 'same' }} 
              wicket{{ Math.abs(inningsComparison.comparison.wicketDifference) !== 1 ? 's' : '' }} in hand
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scoring Heatmap -->
    <div v-if="heatmap" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🔥</span> Scoring Pattern
        </h3>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-emerald-400">{{ heatmap.boundaries }}</div>
            <div class="text-xs text-slate-400 mt-1">Boundaries</div>
          </div>
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-blue-400">{{ heatmap.singles }}</div>
            <div class="text-xs text-slate-400 mt-1">Singles/Twos</div>
          </div>
          <div class="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-slate-400">{{ heatmap.dots }}</div>
            <div class="text-xs text-slate-400 mt-1">Dot Balls</div>
          </div>
        </div>
        
        <div class="text-center">
          <div class="text-sm text-slate-400">Boundary Percentage</div>
          <div class="text-3xl font-black text-white mt-1">{{ heatmap.boundaryPercentage }}%</div>
        </div>
      </div>
    </div>

    <!-- AI Insights (Enhanced) -->
    <div v-if="insights && insights.length" class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      <div class="px-5 py-3 bg-slate-900/50 border-b border-slate-700/50 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span class="text-lg">🤖</span> AI Insights
        </h3>
        <span class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-bold">ENHANCED</span>
      </div>
      
      <div class="divide-y divide-slate-700/30">
        <div 
          v-for="(insight, idx) in insights.slice(0, 8)" 
          :key="idx"
          class="px-5 py-4 flex items-start gap-3 hover:bg-slate-700/20 transition-colors"
        >
          <!-- Priority Indicator -->
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ insight.icon || '💡' }}</span>
            <span 
              :class="[
                'w-1 h-8 rounded-full',
                insight.priority === 'urgent' ? 'bg-red-500 animate-pulse' :
                insight.priority === 'high' ? 'bg-orange-500' :
                insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              ]"
            ></span>
          </div>
          
          <!-- Message -->
          <div class="flex-1">
            <p class="text-sm text-slate-200 font-medium">{{ insight.message }}</p>
            <span v-if="insight.priority" class="text-xs text-slate-500 uppercase mt-1 inline-block">{{ insight.priority }}</span>
          </div>
          
          <!-- Type Badge -->
          <span 
            :class="[
              'px-2 py-1 rounded text-xs font-bold flex-shrink-0',
              insight.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
              insight.type === 'negative' ? 'bg-red-500/20 text-red-400' :
              insight.type === 'critical' ? 'bg-red-600/30 text-red-300' :
              insight.type === 'milestone' ? 'bg-purple-500/20 text-purple-400' :
              insight.type === 'momentum' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            ]"
          >
            {{ insight.type }}
          </span>
        </div>
        
        <!-- Show more indicator if there are more insights -->
        <div v-if="insights.length > 8" class="px-5 py-3 text-center text-xs text-slate-500 bg-slate-900/30">
          + {{ insights.length - 8 }} more insights
        </div>
      </div>
    </div>

    <!-- Last Update Time -->
    <div class="text-center text-xs text-slate-500">
      Last updated: {{ lastUpdateTime }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';

const props = defineProps({
  matchId: { type: String, required: true }
});

// WebSocket connection
const socket = ref(null);
const isConnected = ref(false);

// Analytics data
const winProbability = ref(null);
const momentum = ref(null);
const finalScorePrediction = ref(null);
const insights = ref([]);
const heatmap = ref(null);
const currentRunRate = ref('0.00');
const requiredRunRate = ref(null);
const viewersCount = ref(0);
const lastUpdateTime = ref('--:--');
const inningsComparison = ref(null);
// Enhanced features
const pressureIndex = ref(null);
const pressureLevel = ref(null);
const matchPhase = ref(null);
const partnershipMomentum = ref(null);

// Computed property to check if we have any analytics data
const hasAnyData = computed(() => {
  return winProbability.value || 
         momentum.value || 
         finalScorePrediction.value || 
         (insights.value && insights.value.length > 0) ||
         heatmap.value ||
         (currentRunRate.value && currentRunRate.value !== '0.00');
});

// Initialize WebSocket connection
const initializeWebSocket = () => {
  // Use VITE_API_BASE and remove /api suffix for WebSocket connection
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
  const backendUrl = apiBase.replace('/api', '');
  
  socket.value = io(backendUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.value.on('connect', () => {
    console.log('✅ Connected to analytics server');
    isConnected.value = true;
    socket.value.emit('join-match', props.matchId);
  });

  socket.value.on('disconnect', () => {
    console.log('❌ Disconnected from analytics server');
    isConnected.value = false;
  });

  socket.value.on('match-joined', (data) => {
    console.log('📺 Joined match room:', data);
    fetchInitialAnalytics();
  });

  socket.value.on('analytics-update', (data) => {
    console.log('📊 Analytics update received:', data);
    updateAnalytics(data.analytics);
  });

  socket.value.on('match-update', (data) => {
    console.log('🔄 Match update received');
    fetchInitialAnalytics();
  });

  socket.value.on('ball-update', () => {
    fetchInitialAnalytics();
  });

  socket.value.on('wicket', () => {
    fetchInitialAnalytics();
  });

  socket.value.on('boundary', () => {
    fetchInitialAnalytics();
  });
};

// Fetch initial analytics data
const fetchInitialAnalytics = async () => {
  try {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    const backendUrl = apiBase.replace('/api', '');
    console.log('🔍 Fetching analytics from:', `${backendUrl}/api/live-analytics/${props.matchId}`);
    
    const response = await fetch(`${backendUrl}/api/live-analytics/${props.matchId}`);
    
    console.log('📡 Analytics response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Don't show error for matches without innings data yet (expected state)
      if (response.status === 400) {
        console.log('ℹ️ Match data not ready:', errorData.message || 'No balls bowled yet');
        console.log('📊 This is normal - analytics will appear once admin enters ball data');
        // Clear any existing data
        winProbability.value = null;
        momentum.value = null;
        finalScorePrediction.value = null;
        insights.value = [];
        heatmap.value = null;
        currentRunRate.value = '0.00';
        requiredRunRate.value = null;
        return;
      }
      
      // Only log actual errors (404, 500, etc.)
      console.warn('⚠️ Analytics fetch error:', errorData.message || response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Analytics data received:', data);

    if (data.success && data.analytics) {
      console.log('📊 Updating analytics display');
      updateAnalytics(data.analytics);
    } else {
      console.warn('⚠️ No analytics in response:', data);
    }
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
  }
};

// Update analytics data
const updateAnalytics = (analytics) => {
  winProbability.value = analytics.winProbability;
  momentum.value = analytics.momentum;
  finalScorePrediction.value = analytics.finalScorePrediction;
  insights.value = analytics.insights || [];
  heatmap.value = analytics.heatmap;
  currentRunRate.value = analytics.currentRunRate || '0.00';
  requiredRunRate.value = analytics.requiredRunRate;
  viewersCount.value = analytics.viewersCount || 0;
  inningsComparison.value = analytics.inningsComparison || null;
  
  // Enhanced features
  pressureIndex.value = analytics.pressureIndex || null;
  pressureLevel.value = analytics.pressureLevel || null;
  matchPhase.value = analytics.matchPhase || null;
  partnershipMomentum.value = analytics.partnershipMomentum || null;
  
  const now = new Date();
  lastUpdateTime.value = now.toLocaleTimeString();
};

// Lifecycle hooks
onMounted(() => {
  initializeWebSocket();
  
  // Fetch analytics every 10 seconds as fallback
  const interval = setInterval(() => {
    if (isConnected.value) {
      fetchInitialAnalytics();
    }
  }, 10000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});

onUnmounted(() => {
  if (socket.value) {
    socket.value.emit('leave-match', props.matchId);
    socket.value.disconnect();
  }
});

// Watch for match ID changes
watch(() => props.matchId, (newId, oldId) => {
  if (oldId && socket.value) {
    socket.value.emit('leave-match', oldId);
  }
  if (newId && socket.value) {
    socket.value.emit('join-match', newId);
    fetchInitialAnalytics();
  }
});
</script>
