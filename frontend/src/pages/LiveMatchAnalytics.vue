<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="$router.back()"
          class="text-slate-400 hover:text-white transition-colors mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        
        <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div v-if="match" class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-black text-white mb-2">Live Match Analytics</h1>
              <div class="flex items-center gap-4 text-sm text-slate-400">
                <span>{{ match.homeClub?.name }} vs {{ match.awayClub?.name }}</span>
                <span>•</span>
                <span>{{ match.venue }}</span>
                <span>•</span>
                <span :class="getStatusClass(match.status)">{{ match.status }}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-slate-400 mb-1">Tournament</div>
              <div class="text-lg font-bold text-white">{{ match.tournament?.name }}</div>
            </div>
          </div>
          <div v-else class="animate-pulse">
            <div class="h-8 bg-slate-700/50 rounded w-64 mb-2"></div>
            <div class="h-4 bg-slate-700/50 rounded w-96"></div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Live Match Center -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span class="text-2xl">🏏</span> Live Match Center
            </h2>
            <LiveMatchCenter v-if="match" :match="match" :rosters="rosters" />
            <div v-else class="text-center py-12 text-slate-500">
              Loading match data...
            </div>
          </div>
        </div>

        <!-- Right Column: Analytics Dashboard -->
        <div class="lg:col-span-1">
          <div class="sticky top-4">
            <LiveAnalyticsDashboard v-if="matchId" :matchId="matchId" />
          </div>
        </div>
      </div>

      <!-- Additional Analytics Sections -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Over-by-Over Run Rate Chart -->
        <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Run Rate Progression
          </h3>
          <div class="h-64 flex items-center justify-center text-slate-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📈</div>
              <div class="text-sm">Chart visualization coming soon</div>
              <div class="text-xs text-slate-600 mt-1">Install recharts for charts</div>
            </div>
          </div>
        </div>

        <!-- Manhattan/Worm Chart -->
        <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📉</span> Score Comparison
          </h3>
          <div class="h-64 flex items-center justify-center text-slate-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📉</div>
              <div class="text-sm">Worm chart visualization</div>
              <div class="text-xs text-slate-600 mt-1">Comparing innings progression</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import LiveMatchCenter from '../components/match/LiveMatchCenter.vue';
import LiveAnalyticsDashboard from '../components/match/LiveAnalyticsDashboard.vue';

const route = useRoute();
const matchId = ref(route.params.id);
const match = ref(null);
const rosters = ref(null);
const loading = ref(true);

// Fetch match data
const fetchMatchData = async () => {
  try {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    const backendUrl = apiBase.replace('/api', '');
    const response = await fetch(`${backendUrl}/api/matches/${matchId.value}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch match');
    }
    
    const data = await response.json();

    // Backend returns match directly, not wrapped in success object
    match.value = data;
    
    // Transform match data for LiveMatchCenter component
    if (match.value.innings) {
      match.value.innings = match.value.innings.map(innings => ({
        ...innings,
        totalRuns: innings.runs,
        totalWickets: innings.wickets,
        totalBalls: innings.balls
      }));
    }

    // Set teams data
    match.value.teams = {
      home: {
        id: match.value.homeClub._id,
        name: match.value.homeClub.name || match.value.homeClub.clubName
      },
      away: {
        id: match.value.awayClub._id,
        name: match.value.awayClub.name || match.value.awayClub.clubName
      }
    };
  } catch (error) {
    console.error('Error fetching match:', error);
  } finally {
    loading.value = false;
  }
};

// Get status badge class
const getStatusClass = (status) => {
  const classes = {
    'Live': 'text-red-400 font-bold animate-pulse',
    'Completed': 'text-emerald-400',
    'Scheduled': 'text-blue-400',
    'Cancelled': 'text-slate-500',
    'Abandoned': 'text-amber-400'
  };
  return classes[status] || 'text-slate-400';
};

// Auto-refresh match data
let refreshInterval;

onMounted(() => {
  fetchMatchData();
  
  // Refresh every 5 seconds for live matches
  refreshInterval = setInterval(() => {
    if (match.value?.status === 'Live') {
      fetchMatchData();
    }
  }, 5000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
