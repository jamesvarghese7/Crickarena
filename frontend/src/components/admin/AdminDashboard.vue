<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p class="text-slate-400 mt-1">Welcome back! Here's what's happening in CrickArena.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-xs text-slate-500">Last updated</p>
          <p class="text-sm font-medium text-slate-300">{{ formatDate(new Date()) }}</p>
        </div>
        <button @click="refreshData" class="admin-btn-ghost p-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Pending Clubs -->
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Clubs</p>
            <p class="text-2xl font-bold text-amber-400 mt-1">{{ stats.pending }}</p>
            <p class="text-xs text-slate-500 mt-1">Requires attention</p>
          </div>
          <div class="admin-stat-icon pending">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Approved Clubs -->
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Clubs</p>
            <p class="text-2xl font-bold text-emerald-400 mt-1">{{ stats.approved }}</p>
            <p class="text-xs text-slate-500 mt-1">Active</p>
          </div>
          <div class="admin-stat-icon approved">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Active Tournaments -->
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tournaments</p>
            <p class="text-2xl font-bold text-blue-400 mt-1">{{ activeTournaments }}</p>
            <p class="text-xs text-slate-500 mt-1">Ongoing</p>
          </div>
          <div class="admin-stat-icon total">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Live Matches -->
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Matches</p>
            <p class="text-2xl font-bold text-red-400 mt-1">{{ liveMatches }}</p>
            <p class="text-xs text-slate-500 mt-1">In progress</p>
          </div>
          <div class="admin-stat-icon rejected">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Club Registrations -->
      <div class="admin-card overflow-hidden">
        <div class="p-5 border-b border-slate-700/50">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-white">Recent Club Registrations</h3>
            <button @click="props.setActiveTab('clubs')" class="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
              View all
            </button>
          </div>
        </div>
        <div class="p-5">
          <div v-if="recentClubs.length === 0" class="admin-empty-state py-8">
            <div class="admin-empty-icon w-12 h-12 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <p class="text-slate-400 text-sm">No recent registrations</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="club in recentClubs" :key="club.id" class="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-semibold text-sm">{{ club.clubName?.charAt(0)?.toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-medium text-white text-sm">{{ club.clubName }}</p>
                  <p class="text-xs text-slate-400">{{ club.district }}</p>
                </div>
              </div>
              <span class="admin-badge" :class="club.status">
                {{ club.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Tournaments -->
      <div class="admin-card overflow-hidden">
        <div class="p-5 border-b border-slate-700/50">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-white">Active Tournaments</h3>
            <button @click="props.setActiveTab('tournaments')" class="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
              View all
            </button>
          </div>
        </div>
        <div class="p-5">
          <div v-if="activeTournamentsList.length === 0" class="admin-empty-state py-8">
            <div class="admin-empty-icon w-12 h-12 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-slate-400 text-sm">No active tournaments</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="tournament in activeTournamentsList" :key="tournament._id" class="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-white text-sm">{{ tournament.name }}</p>
                  <p class="text-xs text-slate-400">{{ tournament.format }} • {{ formatDate(tournament.startDate) }}</p>
                </div>
              </div>
              <span class="admin-badge ongoing">
                {{ tournament.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="admin-card p-5">
      <h3 class="text-base font-semibold text-white mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button @click="props.setActiveTab('clubs')" class="quick-action-card group">
          <div class="action-icon pending">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div class="text-left">
            <p class="font-medium text-white text-sm group-hover:text-amber-400 transition-colors">Review Club Applications</p>
            <p class="text-xs text-slate-400">Approve or reject pending clubs</p>
          </div>
        </button>

        <button @click="props.setActiveTab('tournaments')" class="quick-action-card group">
          <div class="action-icon total">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div class="text-left">
            <p class="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">Create Tournament</p>
            <p class="text-xs text-slate-400">Set up new cricket tournaments</p>
          </div>
        </button>

        <button @click="props.setActiveTab('matches')" class="quick-action-card group">
          <div class="action-icon active">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011-1V4z"></path>
            </svg>
          </div>
          <div class="text-left">
            <p class="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">Manage Matches</p>
            <p class="text-xs text-slate-400">Update scores and match details</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api.js'

const props = defineProps({
  setActiveTab: {
    type: Function,
    required: true
  }
})

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

const recentClubs = ref([])
const activeTournamentsList = ref([])
const activeTournaments = ref(0)
const liveMatches = ref(0)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const refreshData = async () => {
  try {
    // Fetch admin stats
    const statsResponse = await api.get('/admin/stats')
    stats.value = statsResponse.data.stats

    // Fetch recent clubs
    const clubsResponse = await api.get('/admin/clubs?status=pending&_limit=5')
    recentClubs.value = clubsResponse.data.clubs.slice(0, 5)

    // Fetch active tournaments
    const tournamentsResponse = await api.get('/admin/tournaments?status=ongoing')
    activeTournamentsList.value = tournamentsResponse.data.slice(0, 5)
    activeTournaments.value = tournamentsResponse.data.length

    // Fetch live matches (this would need to be implemented in backend)
    // For now, we'll use a placeholder
    liveMatches.value = 0

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.quick-action-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.quick-action-card:hover {
  background: rgba(51, 65, 85, 0.5);
  border-color: rgba(148, 163, 184, 0.2);
  transform: translateY(-1px);
}

.action-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.action-icon.total {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.action-icon.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
</style>