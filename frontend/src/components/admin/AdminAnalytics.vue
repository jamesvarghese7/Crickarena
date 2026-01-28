<template>
  <div class="min-h-screen">
    <!-- Premium Header -->
    <div class="relative overflow-hidden rounded-2xl mb-8">
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
      <div class="relative px-8 py-10">
        <div class="flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Live Analytics
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p class="text-emerald-100 text-sm">Real-time insights into your platform's performance</p>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <div class="text-right">
              <p class="text-emerald-100 text-xs">Last Updated</p>
              <p class="text-white font-semibold">{{ lastUpdated }}</p>
            </div>
            <button @click="fetchAnalytics" class="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm">
              <svg class="w-5 h-5 text-white" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4"></div>
      <p class="text-slate-400 font-medium">Loading analytics...</p>
    </div>

    <template v-else>
      <!-- Stats Overview Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div v-for="stat in statsCards" :key="stat.label" 
             class="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
          <div class="flex items-start justify-between mb-3">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', stat.gradient]">
              <component :is="stat.icon" class="w-6 h-6 text-white" />
            </div>
            <span v-if="stat.change" :class="['text-xs font-semibold px-2 py-1 rounded-full', stat.change > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
              {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
            </span>
          </div>
          <p class="text-3xl font-bold text-white mb-1">{{ stat.value?.toLocaleString() || 0 }}</p>
          <p class="text-sm text-slate-400">{{ stat.label }}</p>
          <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      <!-- Revenue Summary -->
      <div class="grid lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">User Growth</h3>
                <p class="text-sm text-slate-400">Last 6 months trend</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500"></span><span class="text-xs text-slate-400">Players</span></div>
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500"></span><span class="text-xs text-slate-400">Clubs</span></div>
              <div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-500"></span><span class="text-xs text-slate-400">Coaches</span></div>
            </div>
          </div>
          <div class="h-72">
            <canvas ref="growthChartRef"></canvas>
          </div>
        </div>

        <!-- Tournament Status -->
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Tournaments</h3>
              <p class="text-sm text-slate-400">By status</p>
            </div>
          </div>
          <div class="h-56">
            <canvas ref="tournamentChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- Payment Analytics Section -->
      <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 mb-8 overflow-hidden">
        <div class="p-6 border-b border-slate-700/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Payment Collection</h3>
                <p class="text-sm text-slate-400">Tournament entry fee analytics</p>
              </div>
            </div>
            <div class="flex items-center gap-6 text-sm">
              <div class="text-center">
                <p class="text-2xl font-bold text-emerald-400">₹{{ totalCollected.toLocaleString() }}</p>
                <p class="text-slate-400">Collected</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-amber-400">₹{{ totalPending.toLocaleString() }}</p>
                <p class="text-slate-400">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tournamentPayments.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-slate-400">No tournaments with entry fees found</p>
        </div>

        <div v-else class="divide-y divide-slate-700/50">
          <div v-for="tournament in tournamentPayments" :key="tournament.tournamentId" class="hover:bg-slate-800/30 transition-colors">
            <div class="p-5 cursor-pointer" @click="toggleTournamentDetails(tournament.tournamentId)">
              <div class="flex items-center justify-between gap-6">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h4 class="font-semibold text-white truncate">{{ tournament.tournamentName }}</h4>
                    <span :class="['px-2 py-0.5 rounded-lg text-xs font-medium capitalize',
                      tournament.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      tournament.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400']">{{ tournament.status }}</span>
                  </div>
                  <div class="flex items-center gap-6 text-sm text-slate-400">
                    <span>Entry: ₹{{ tournament.entryFee }}</span>
                    <span>{{ tournament.totalTeams }} teams</span>
                    <span>{{ formatDate(tournament.startDate) }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-8">
                  <div class="text-right">
                    <p class="text-lg font-bold text-emerald-400">₹{{ tournament.totalCollected.toLocaleString() }}</p>
                    <p class="text-xs text-slate-400">{{ tournament.paidCount }} paid</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-amber-400">₹{{ tournament.pendingAmount.toLocaleString() }}</p>
                    <p class="text-xs text-slate-400">{{ tournament.pendingCount }} pending</p>
                  </div>
                  <div class="w-32">
                    <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500" :style="{ width: `${getPaymentPercentage(tournament)}%` }"></div>
                    </div>
                    <p class="text-xs text-slate-400 mt-1 text-center">{{ getPaymentPercentage(tournament) }}%</p>
                  </div>
                  <svg class="w-5 h-5 text-slate-400 transition-transform" :class="{ 'rotate-180': expandedTournaments.includes(tournament.tournamentId) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Team Details -->
            <div v-if="expandedTournaments.includes(tournament.tournamentId)" class="px-5 pb-5 pt-2 bg-slate-900/30">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="team in tournament.teamPayments" :key="team.clubId"
                     class="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                  <div class="flex items-center gap-3">
                    <div :class="['w-3 h-3 rounded-full', team.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500']"></div>
                    <span class="text-sm text-white font-medium truncate">{{ team.clubName }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span :class="['px-2 py-1 rounded-lg text-xs font-medium',
                      team.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400']">
                      {{ team.paymentStatus }}
                    </span>
                    <span class="text-sm font-semibold text-white">₹{{ team.paymentAmount?.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Geographic & Activity Row -->
      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <!-- Geographic Distribution -->
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Geographic Distribution</h3>
              <p class="text-sm text-slate-400">Top 10 districts</p>
            </div>
          </div>
          <div class="h-72">
            <canvas ref="geoChartRef"></canvas>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Recent Activity</h3>
              <p class="text-sm text-slate-400">Latest platform events</p>
            </div>
          </div>
          
          <div v-if="recentActivity.length === 0" class="text-center py-8 text-slate-500">
            No recent activity
          </div>
          <div v-else class="space-y-3 max-h-72 overflow-y-auto pr-2">
            <div v-for="(activity, i) in recentActivity" :key="i" 
                 class="flex items-center gap-4 p-3 bg-slate-900/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center',
                activity.type === 'player' ? 'bg-emerald-500/20' :
                activity.type === 'club' ? 'bg-blue-500/20' : 'bg-purple-500/20']">
                <svg v-if="activity.type === 'player'" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <svg v-else-if="activity.type === 'club'" class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <svg v-else class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ activity.name }}</p>
                <p class="text-xs text-slate-400 capitalize">{{ activity.type }}</p>
              </div>
              <div class="text-right">
                <span :class="['px-2 py-1 rounded-lg text-xs font-medium capitalize',
                  activity.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  activity.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400']">{{ activity.status }}</span>
                <p class="text-xs text-slate-500 mt-1">{{ formatDate(activity.date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(true);
const overview = ref({});
const growth = ref({ labels: [], datasets: {} });
const tournaments = ref({ byStatus: {} });
const geographic = ref({ clubs: [], players: [] });
const recentActivity = ref([]);
const tournamentPayments = ref([]);
const expandedTournaments = ref([]);
const lastUpdated = ref('');

const growthChartRef = ref(null);
const tournamentChartRef = ref(null);
const geoChartRef = ref(null);

let growthChart = null;
let tournamentChart = null;
let geoChart = null;

// Computed stats cards
const statsCards = computed(() => [
  { label: 'Players', value: overview.value.players?.total, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', icon: 'user-group-icon' },
  { label: 'Clubs', value: overview.value.clubs?.approved, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', icon: 'building-icon' },
  { label: 'Tournaments', value: overview.value.tournaments?.total, gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', icon: 'trophy-icon' },
  { label: 'Coaches', value: overview.value.coaches?.total, gradient: 'bg-gradient-to-br from-purple-500 to-pink-600', icon: 'academic-icon' },
  { label: 'Sponsors', value: overview.value.sponsors?.total, gradient: 'bg-gradient-to-br from-rose-500 to-red-600', icon: 'briefcase-icon' },
  { label: 'Matches', value: overview.value.matches?.total, gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600', icon: 'play-icon' }
]);

const totalCollected = computed(() => tournamentPayments.value.reduce((sum, t) => sum + (t.totalCollected || 0), 0));
const totalPending = computed(() => tournamentPayments.value.reduce((sum, t) => sum + (t.pendingAmount || 0), 0));

function getPaymentPercentage(tournament) {
  if (!tournament.totalExpected) return 0;
  return Math.round((tournament.totalCollected / tournament.totalExpected) * 100);
}

function toggleTournamentDetails(id) {
  const idx = expandedTournaments.value.indexOf(id);
  if (idx > -1) expandedTournaments.value.splice(idx, 1);
  else expandedTournaments.value.push(id);
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetchAnalytics() {
  loading.value = true;
  try {
    const [overviewRes, growthRes, tournamentsRes, geoRes, activityRes, paymentsRes] = await Promise.all([
      fetch(`${API_URL}/analytics/overview`, { credentials: 'include' }),
      fetch(`${API_URL}/analytics/growth`, { credentials: 'include' }),
      fetch(`${API_URL}/analytics/tournaments`, { credentials: 'include' }),
      fetch(`${API_URL}/analytics/geographic`, { credentials: 'include' }),
      fetch(`${API_URL}/analytics/recent-activity`, { credentials: 'include' }),
      fetch(`${API_URL}/analytics/tournament-payments`, { credentials: 'include' })
    ]);

    if (overviewRes.ok) overview.value = await overviewRes.json();
    if (growthRes.ok) growth.value = await growthRes.json();
    if (tournamentsRes.ok) tournaments.value = await tournamentsRes.json();
    if (geoRes.ok) geographic.value = await geoRes.json();
    if (activityRes.ok) recentActivity.value = await activityRes.json();
    if (paymentsRes.ok) tournamentPayments.value = await paymentsRes.json();
    
    lastUpdated.value = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  } finally {
    loading.value = false;
    await nextTick();
    renderCharts();
  }
}

function renderCharts() {
  // User Growth Chart
  if (growthChartRef.value) {
    if (growthChart) growthChart.destroy();
    growthChart = new Chart(growthChartRef.value, {
      type: 'line',
      data: {
        labels: growth.value.labels || [],
        datasets: [
          { label: 'Players', data: growth.value.datasets?.players || [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
          { label: 'Clubs', data: growth.value.datasets?.clubs || [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 },
          { label: 'Coaches', data: growth.value.datasets?.coaches || [], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' }, beginAtZero: true }
        }
      }
    });
  }

  // Tournament Status Chart
  if (tournamentChartRef.value) {
    if (tournamentChart) tournamentChart.destroy();
    const statusData = tournaments.value.byStatus || {};
    tournamentChart = new Chart(tournamentChartRef.value, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusData).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{ data: Object.values(statusData), backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, usePointStyle: true } } },
        cutout: '65%'
      }
    });
  }

  // Geographic Chart
  if (geoChartRef.value) {
    if (geoChart) geoChart.destroy();
    const geoData = geographic.value.clubs || [];
    geoChart = new Chart(geoChartRef.value, {
      type: 'bar',
      data: {
        labels: geoData.map(d => d.district),
        datasets: [{ label: 'Clubs', data: geoData.map(d => d.count), backgroundColor: 'rgba(16, 185, 129, 0.7)', borderRadius: 8, barThickness: 24 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' }, beginAtZero: true }
        }
      }
    });
  }
}

onMounted(() => fetchAnalytics());
onUnmounted(() => {
  if (growthChart) growthChart.destroy();
  if (tournamentChart) tournamentChart.destroy();
  if (geoChart) geoChart.destroy();
});
</script>

<style scoped>
/* Custom scrollbar for activity list */
.max-h-72::-webkit-scrollbar {
  width: 4px;
}
.max-h-72::-webkit-scrollbar-track {
  background: transparent;
}
.max-h-72::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 2px;
}
</style>