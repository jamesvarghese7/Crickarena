<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Player Management</h2>
        <p class="text-slate-400">View and manage all registered players</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-blue-400 text-lg">{{ stats.total || 0 }}</div>
          <div class="text-slate-400 text-xs">Total</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-emerald-400 text-lg">{{ stats.active || 0 }}</div>
          <div class="text-slate-400 text-xs">Active</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-amber-400 text-lg">{{ stats.withClubs || 0 }}</div>
          <div class="text-slate-400 text-xs">In Clubs</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-purple-400 text-lg">{{ stats.pendingApplications || 0 }}</div>
          <div class="text-slate-400 text-xs">Pending</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name, email..."
            class="admin-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
          <select
            v-model="filters.status"
            class="admin-select"
            @change="fetchPlayers"
          >
            <option value="">Active Players</option>
            <option value="all">All Players</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">District</label>
          <input
            v-model="filters.district"
            type="text"
            placeholder="Filter by district"
            class="admin-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Club</label>
          <select
            v-model="filters.club"
            class="admin-select"
            @change="fetchPlayers"
          >
            <option value="">All Clubs</option>
            <option value="none">No Club</option>
            <option v-for="club in clubs" :key="club.id" :value="club.id">
              {{ club.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="admin-empty-state">
      <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      <p class="text-slate-400 mt-3">Loading players...</p>
    </div>

    <!-- Players Table -->
    <div v-else class="admin-card overflow-hidden">
      <div class="overflow-x-auto admin-scrollbar">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Contact</th>
              <th>Cricket Info</th>
              <th>Club</th>
              <th>Status</th>
              <th>Registered</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.id">
              <td>
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-9 w-9">
                    <img
                      v-if="player.hasProfilePhoto"
                      class="h-9 w-9 rounded-full object-cover"
                      :src="`/api/admin/players/${player.id}/photo`"
                      :alt="player.fullName"
                      @error="handleImageError"
                    />
                    <div v-else class="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-slate-700 flex items-center justify-center">
                      <span class="text-xs font-medium text-emerald-400">
                        {{ getInitials(player.fullName) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-white">{{ player.fullName }}</div>
                    <div class="text-xs text-slate-400">{{ player.age }} years, {{ player.gender }}</div>
                  </div>
                </div>
              </td>
              
              <td>
                <div class="text-sm text-slate-200">{{ player.email }}</div>
                <div class="text-xs text-slate-400">{{ player.phone }}</div>
                <div class="text-xs text-slate-500">{{ player.address?.district }}, {{ player.address?.state }}</div>
              </td>
              
              <td>
                <div class="text-sm text-slate-200">{{ formatPosition(player.preferredPosition) }}</div>
                <div class="text-xs text-slate-400">{{ formatStyle(player.battingStyle) }}</div>
                <div class="text-xs text-slate-500">{{ player.playingExperience }} experience</div>
              </td>
              
              <td>
                <div v-if="player.currentClub" class="text-sm">
                  <div class="font-medium text-slate-200">{{ player.currentClub.name }}</div>
                  <div class="text-slate-400 text-xs">{{ player.currentClub.district }}</div>
                </div>
                <div v-else class="text-sm text-slate-500">No club</div>
                <div v-if="player.pendingApplications > 0" class="text-xs text-amber-400 mt-0.5">
                  {{ player.pendingApplications }} pending
                </div>
              </td>
              
              <td>
                <span class="admin-badge" :class="player.isActive ? 'approved' : 'rejected'">
                  {{ player.isActive ? 'Active' : 'Inactive' }}
                </span>
                <div v-if="!player.profileCompleted" class="text-xs text-amber-400 mt-1">
                  Profile incomplete
                </div>
              </td>
              
              <td class="text-sm text-slate-400">
                {{ formatDate(player.registeredAt) }}
              </td>
              
              <td class="text-right">
                <button
                  @click="viewPlayer(player)"
                  class="admin-btn-ghost text-xs py-1.5 px-3"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="players.length === 0">
              <td colspan="7" class="text-center py-8 text-slate-400">
                No players found matching your criteria
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-4 py-3 border-t border-slate-700/50">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} results
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="admin-btn-ghost text-xs py-1.5 px-3"
            >
              Previous
            </button>
            <button
              v-for="page in getVisiblePages()"
              :key="page"
              @click="changePage(page)"
              :class="[
                'text-xs py-1.5 px-3 rounded-lg transition-colors',
                page === pagination.page
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'admin-btn-ghost'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="admin-btn-ghost text-xs py-1.5 px-3"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Details Modal -->
    <div v-if="selectedPlayer" class="admin-modal-overlay" @click.self="closeModal">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <div class="admin-modal-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Player Details</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="admin-modal-body max-h-[70vh]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Profile Photo and Basic Info -->
            <div class="space-y-4">
              <div class="text-center">
                <img
                  v-if="selectedPlayer.hasProfilePhoto"
                  class="mx-auto h-28 w-28 rounded-full object-cover border-2 border-slate-700"
                  :src="`/api/admin/players/${selectedPlayer.id}/photo`"
                  :alt="selectedPlayer.fullName"
                />
                <div v-else class="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-slate-700 flex items-center justify-center">
                  <span class="text-2xl font-medium text-emerald-400">
                    {{ getInitials(selectedPlayer.fullName) }}
                  </span>
                </div>
                <h4 class="mt-3 text-lg font-semibold text-white">{{ selectedPlayer.fullName }}</h4>
                <p class="text-slate-400 text-sm">{{ selectedPlayer.age }} years, {{ selectedPlayer.gender }}</p>
              </div>
              
              <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h5 class="font-medium text-white text-sm mb-2">Contact Information</h5>
                <p class="text-sm text-slate-300">{{ selectedPlayer.email }}</p>
                <p class="text-sm text-slate-400">{{ selectedPlayer.phone }}</p>
                <p class="text-sm text-slate-400 mt-2">
                  {{ selectedPlayer.address?.street }}, {{ selectedPlayer.address?.city }}<br>
                  {{ selectedPlayer.address?.district }}, {{ selectedPlayer.address?.state }} - {{ selectedPlayer.address?.pincode }}
                </p>
              </div>
            </div>
            
            <!-- Cricket Information -->
            <div class="space-y-4">
              <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h5 class="font-medium text-white text-sm mb-2">Cricket Profile</h5>
                <div class="space-y-2 text-sm">
                  <div><span class="text-slate-400">Position:</span> <span class="text-slate-200">{{ formatPosition(selectedPlayer.preferredPosition) }}</span></div>
                  <div><span class="text-slate-400">Batting:</span> <span class="text-slate-200">{{ formatStyle(selectedPlayer.battingStyle) }}</span></div>
                  <div><span class="text-slate-400">Bowling:</span> <span class="text-slate-200">{{ formatStyle(selectedPlayer.bowlingStyle) }}</span></div>
                  <div><span class="text-slate-400">Experience:</span> <span class="text-slate-200">{{ selectedPlayer.playingExperience }}</span></div>
                </div>
              </div>
              
              <div v-if="selectedPlayer.statistics" class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h5 class="font-medium text-white text-sm mb-2">Statistics</h5>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div><span class="text-slate-400">Matches:</span> <span class="text-slate-200">{{ selectedPlayer.statistics.matchesPlayed || 0 }}</span></div>
                  <div><span class="text-slate-400">Runs:</span> <span class="text-slate-200">{{ selectedPlayer.statistics.runsScored || 0 }}</span></div>
                  <div><span class="text-slate-400">Wickets:</span> <span class="text-slate-200">{{ selectedPlayer.statistics.wicketsTaken || 0 }}</span></div>
                  <div><span class="text-slate-400">Catches:</span> <span class="text-slate-200">{{ selectedPlayer.statistics.catches || 0 }}</span></div>
                </div>
              </div>
              
              <div v-if="selectedPlayer.currentClub" class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h5 class="font-medium text-white text-sm mb-2">Current Club</h5>
                <p class="text-sm text-slate-200">{{ selectedPlayer.currentClub.name }}</p>
                <p class="text-xs text-slate-400">{{ selectedPlayer.currentClub.district }}, {{ selectedPlayer.currentClub.city }}</p>
                <p class="text-xs text-slate-500 mt-1">Joined: {{ formatDate(selectedPlayer.joinedClubAt) }}</p>
              </div>
            </div>
            
            <!-- Applications and History -->
            <div class="space-y-4">
              <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h5 class="font-medium text-white text-sm mb-2">Account Status</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">Status:</span>
                    <span :class="selectedPlayer.isActive ? 'text-emerald-400' : 'text-red-400'">
                      {{ selectedPlayer.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Profile:</span>
                    <span :class="selectedPlayer.profileCompleted ? 'text-emerald-400' : 'text-amber-400'">
                      {{ selectedPlayer.profileCompleted ? 'Complete' : 'Incomplete' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Registered:</span>
                    <span class="text-slate-200">{{ formatDate(selectedPlayer.registeredAt) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Documents:</span>
                    <span class="text-slate-200">{{ selectedPlayer.documentsCount || 0 }} uploaded</span>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedPlayer.applications && selectedPlayer.applications.length > 0" class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h5 class="font-medium text-white text-sm mb-2">Club Applications</h5>
                <div class="space-y-2">
                  <div v-for="application in selectedPlayer.applications.slice(0, 3)" :key="application.id" class="text-sm">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-medium text-slate-200">{{ application.club.name }}</p>
                        <p class="text-xs text-slate-400">{{ application.club.district }}</p>
                      </div>
                      <span class="admin-badge" :class="application.status">
                        {{ application.status }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">Applied: {{ formatDate(application.appliedAt) }}</p>
                  </div>
                  <div v-if="selectedPlayer.applications.length > 3" class="text-xs text-slate-500">
                    +{{ selectedPlayer.applications.length - 3 }} more applications
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="admin-modal-footer">
          <button @click="closeModal" class="admin-btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../utils/api.js'

const loading = ref(false)
const players = ref([])
const clubs = ref([])
const stats = ref({})
const selectedPlayer = ref(null)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const filters = reactive({
  search: '',
  status: '',
  district: '',
  club: ''
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchPlayers()
  }, 500)
}

const fetchPlayers = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.district) params.append('district', filters.district)
    if (filters.club) params.append('club', filters.club)
    
    const response = await api.get(`/admin/players?${params.toString()}`)
    players.value = response.data.players
    pagination.value = response.data.pagination
  } catch (error) {
    console.error('Error fetching players:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await api.get('/admin/players/stats')
    stats.value = response.data.stats
  } catch (error) {
    console.error('Error fetching player stats:', error)
  }
}

const fetchClubs = async () => {
  try {
    const response = await api.get('/admin/clubs?status=approved')
    clubs.value = response.data.clubs.map(club => ({
      id: club.id,
      name: club.clubName
    }))
  } catch (error) {
    console.error('Error fetching clubs:', error)
  }
}

const viewPlayer = async (player) => {
  try {
    const response = await api.get(`/admin/players/${player.id}`)
    selectedPlayer.value = response.data.player
  } catch (error) {
    console.error('Error fetching player details:', error)
  }
}

const closeModal = () => {
  selectedPlayer.value = null
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    fetchPlayers()
  }
}

const getVisiblePages = () => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (current >= total - 3) {
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    }
  }
  
  return pages
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatPosition = (position) => {
  const positions = {
    'batsman': 'Batsman',
    'bowler': 'Bowler',
    'all-rounder': 'All-rounder',
    'wicket-keeper': 'Wicket-keeper',
    'fielder': 'Fielder'
  }
  return positions[position] || position
}

const formatStyle = (style) => {
  const styles = {
    'right-handed': 'Right-handed',
    'left-handed': 'Left-handed',
    'right-arm-fast': 'Right-arm Fast',
    'left-arm-fast': 'Left-arm Fast',
    'right-arm-medium': 'Right-arm Medium',
    'left-arm-medium': 'Left-arm Medium',
    'right-arm-spin': 'Right-arm Spin',
    'left-arm-spin': 'Left-arm Spin',
    'wicket-keeper': 'Wicket-keeper',
    'none': 'None'
  }
  return styles[style] || style
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  Promise.all([
    fetchPlayers(),
    fetchStats(),
    fetchClubs()
  ])
})
</script>