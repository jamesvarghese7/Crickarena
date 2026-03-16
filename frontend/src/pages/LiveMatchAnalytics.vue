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
          <div v-if="runRatePoints.length > 1" class="h-64">
            <svg viewBox="0 0 560 256" class="w-full h-full">
              <line x1="36" y1="220" x2="536" y2="220" stroke="rgba(148,163,184,0.35)" stroke-width="1" />
              <line x1="36" y1="32" x2="36" y2="220" stroke="rgba(148,163,184,0.35)" stroke-width="1" />
              <line x1="36" y1="157" x2="536" y2="157" stroke="rgba(71,85,105,0.5)" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="36" y1="94" x2="536" y2="94" stroke="rgba(71,85,105,0.5)" stroke-width="1" stroke-dasharray="4 4" />

              <polyline
                :points="runRatePolyline"
                fill="none"
                stroke="#22d3ee"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <circle
                v-for="(pt, idx) in runRatePoints"
                :key="`rr-${idx}`"
                :cx="pt.cx"
                :cy="pt.cy"
                r="3"
                fill="#22d3ee"
              />

              <text x="40" y="22" fill="#94a3b8" font-size="11">Run Rate</text>
              <text x="470" y="22" fill="#e2e8f0" font-size="11">Current: {{ latestRunRate }}</text>
              <text x="486" y="244" fill="#94a3b8" font-size="11">Overs</text>
            </svg>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-slate-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📈</div>
              <div class="text-sm">Waiting for over-by-over data</div>
              <div class="text-xs text-slate-600 mt-1">Chart appears after at least 2 overs</div>
            </div>
          </div>
        </div>

        <!-- Manhattan/Worm Chart -->
        <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📉</span> Score Comparison
          </h3>
          <div v-if="firstWormPoints.length > 1 || secondWormPoints.length > 1" class="h-64">
            <svg viewBox="0 0 560 256" class="w-full h-full">
              <line x1="36" y1="220" x2="536" y2="220" stroke="rgba(148,163,184,0.35)" stroke-width="1" />
              <line x1="36" y1="32" x2="36" y2="220" stroke="rgba(148,163,184,0.35)" stroke-width="1" />

              <polyline
                v-if="firstWormPolyline"
                :points="firstWormPolyline"
                fill="none"
                stroke="#60a5fa"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                v-if="secondWormPolyline"
                :points="secondWormPolyline"
                fill="none"
                stroke="#34d399"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <text x="40" y="22" fill="#60a5fa" font-size="11">1st Innings</text>
              <text x="150" y="22" fill="#34d399" font-size="11">2nd Innings</text>
              <text x="480" y="244" fill="#94a3b8" font-size="11">Overs</text>
            </svg>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-slate-500">
            <div class="text-center">
              <div class="text-4xl mb-2">📉</div>
              <div class="text-sm">Waiting for innings progression data</div>
              <div class="text-xs text-slate-600 mt-1">Worm chart appears after overs are recorded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import LiveMatchCenter from '../components/match/LiveMatchCenter.vue';
import LiveAnalyticsDashboard from '../components/match/LiveAnalyticsDashboard.vue';

const route = useRoute();
const matchId = ref(route.params.id);
const match = ref(null);
const rosters = ref(null);
const loading = ref(true);

const CHART_W = 560;
const CHART_H = 256;
const CHART_PAD = 36;

const legalBallsInOver = (over) => {
  if (!over?.balls?.length) return 6;
  return over.balls.filter(
    b => b?.extras !== 'wide' && b?.extras !== 'no-ball'
  ).length || 6;
};

const activeInnings = computed(() => {
  if (!match.value?.innings?.length) return null;
  for (let i = match.value.innings.length - 1; i >= 0; i -= 1) {
    const innings = match.value.innings[i];
    if ((innings?.balls || 0) > 0) return innings;
  }
  return null;
});

const buildRunRateSeries = (innings) => {
  if (!innings?.overs?.length) return [];

  const points = [];
  let cumulativeRuns = 0;
  let cumulativeBalls = 0;

  innings.overs.forEach((over) => {
    cumulativeRuns += over.totalRuns || 0;
    cumulativeBalls += legalBallsInOver(over);

    if (cumulativeBalls > 0) {
      points.push({
        balls: cumulativeBalls,
        value: Number((cumulativeRuns / cumulativeBalls * 6).toFixed(2))
      });
    }
  });

  return points;
};

const buildWormSeries = (innings) => {
  if (!innings?.overs?.length) return [];

  const points = [{ balls: 0, value: 0 }];
  let cumulativeRuns = 0;
  let cumulativeBalls = 0;

  innings.overs.forEach((over) => {
    cumulativeRuns += over.totalRuns || 0;
    cumulativeBalls += legalBallsInOver(over);
    points.push({ balls: cumulativeBalls, value: cumulativeRuns });
  });

  return points;
};

const mapToChartPoints = (series, maxX, maxY) => {
  if (!series.length || maxX <= 0 || maxY <= 0) return [];
  return series.map((pt) => {
    const cx = CHART_PAD + (pt.balls / maxX) * (CHART_W - CHART_PAD * 2);
    const cy = CHART_H - CHART_PAD - (pt.value / maxY) * (CHART_H - CHART_PAD * 2);
    return { ...pt, cx: Number(cx.toFixed(2)), cy: Number(cy.toFixed(2)) };
  });
};

const toPolyline = points => points.map(pt => `${pt.cx},${pt.cy}`).join(' ');

const runRateSeries = computed(() => buildRunRateSeries(activeInnings.value));
const latestRunRate = computed(() => {
  const last = runRateSeries.value[runRateSeries.value.length - 1];
  return last ? last.value.toFixed(2) : '0.00';
});

const runRateMaxX = computed(() => {
  const last = runRateSeries.value[runRateSeries.value.length - 1];
  return last?.balls || 1;
});
const runRateMaxY = computed(() => {
  const maxVal = Math.max(...runRateSeries.value.map(p => p.value), 0);
  return Math.max(6, Math.ceil(maxVal + 2));
});
const runRatePoints = computed(() => mapToChartPoints(runRateSeries.value, runRateMaxX.value, runRateMaxY.value));
const runRatePolyline = computed(() => toPolyline(runRatePoints.value));

const firstWormSeries = computed(() => buildWormSeries(match.value?.innings?.[0]));
const secondWormSeries = computed(() => buildWormSeries(match.value?.innings?.[1]));
const wormMaxX = computed(() => {
  const firstLast = firstWormSeries.value[firstWormSeries.value.length - 1]?.balls || 0;
  const secondLast = secondWormSeries.value[secondWormSeries.value.length - 1]?.balls || 0;
  return Math.max(firstLast, secondLast, 1);
});
const wormMaxY = computed(() => {
  const firstMax = Math.max(...firstWormSeries.value.map(p => p.value), 0);
  const secondMax = Math.max(...secondWormSeries.value.map(p => p.value), 0);
  return Math.max(firstMax, secondMax, 10);
});

const firstWormPoints = computed(() => mapToChartPoints(firstWormSeries.value, wormMaxX.value, wormMaxY.value));
const secondWormPoints = computed(() => mapToChartPoints(secondWormSeries.value, wormMaxX.value, wormMaxY.value));
const firstWormPolyline = computed(() => toPolyline(firstWormPoints.value));
const secondWormPolyline = computed(() => toPolyline(secondWormPoints.value));

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
