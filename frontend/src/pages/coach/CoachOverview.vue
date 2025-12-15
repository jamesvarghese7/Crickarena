<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-800">Coach Dashboard</h1>
          <p class="text-slate-500 text-sm">Overview of your coaching activities</p>
        </div>
        <div v-if="clubData" class="flex items-center gap-2">
          <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800 text-sm">{{ clubData.clubName || clubData.name }}</h3>
            <p class="text-xs text-slate-500">{{ clubData.city }}, {{ clubData.district }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
      <div class="flex flex-col items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-3"></div>
        <p class="text-slate-500 text-sm">Loading dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-red-800 mb-1">Error Loading Data</h3>
            <p class="text-red-700 text-sm">{{ error }}</p>
            <button 
              @click="loadData"
              class="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Club Assigned -->
    <div v-else-if="!clubData" class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-amber-800 mb-1">No Club Assigned</h3>
            <p class="text-amber-700 text-sm">
              You are not currently assigned to any club. Apply to a club to start coaching.
            </p>
            <RouterLink 
              :to="{ name: 'clubs' }"
              class="mt-3 inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Browse Clubs
              <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-5">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-emerald-100 text-xs">Upcoming Matches</p>
              <p class="text-2xl font-bold mt-1">{{ upcomingMatches.length }}</p>
            </div>
            <div class="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4 text-white shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-teal-100 text-xs">Registered Players</p>
              <p class="text-2xl font-bold mt-1">{{ players.length }}</p>
            </div>
            <div class="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-cyan-100 text-xs">Active Tournaments</p>
              <p class="text-2xl font-bold mt-1">{{ registeredTournaments.filter(t => t.status === 'active').length }}</p>
            </div>
            <div class="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Coach Functions Overview -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
        <h2 class="text-base font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <RouterLink 
            :to="{ name: 'coach-panel-matches' }"
            class="border border-emerald-100 rounded-lg p-3 hover:shadow-sm hover:border-emerald-300 transition-all group text-center"
          >
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-emerald-500 transition-colors">
              <svg class="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 class="font-medium text-slate-800 text-xs mt-2">Matches</h3>
          </RouterLink>
          
          <RouterLink 
            :to="{ name: 'coach-panel-players' }"
            class="border border-emerald-100 rounded-lg p-3 hover:shadow-sm hover:border-emerald-300 transition-all group text-center"
          >
            <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-teal-500 transition-colors">
              <svg class="w-5 h-5 text-teal-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              </svg>
            </div>
            <h3 class="font-medium text-slate-800 text-xs mt-2">Players</h3>
          </RouterLink>
          
          <RouterLink 
            :to="{ name: 'coach-panel-sessions' }"
            class="border border-emerald-100 rounded-lg p-3 hover:shadow-sm hover:border-emerald-300 transition-all group text-center"
          >
            <div class="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-cyan-500 transition-colors">
              <svg class="w-5 h-5 text-cyan-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-medium text-slate-800 text-xs mt-2">Sessions</h3>
          </RouterLink>
          
          <RouterLink 
            :to="{ name: 'coach-panel-analytics' }"
            class="border border-emerald-100 rounded-lg p-3 hover:shadow-sm hover:border-emerald-300 transition-all group text-center"
          >
            <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-emerald-500 transition-colors">
              <svg class="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="font-medium text-slate-800 text-xs mt-2">Analytics</h3>
          </RouterLink>
          
          <RouterLink 
            :to="{ name: 'coach-panel-profile' }"
            class="border border-emerald-100 rounded-lg p-3 hover:shadow-sm hover:border-emerald-300 transition-all group text-center"
          >
            <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-teal-500 transition-colors">
              <svg class="w-5 h-5 text-teal-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h3 class="font-medium text-slate-800 text-xs mt-2">Profile</h3>
          </RouterLink>
        </div>
      </div>

      <!-- Upcoming Matches Preview -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-800">Upcoming Matches</h2>
          <RouterLink 
            :to="{ name: 'coach-panel-matches' }"
            class="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center"
          >
            View All
            <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </div>

        <div v-if="upcomingMatches.length === 0" class="text-center py-6">
          <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-slate-800 mb-1">No Upcoming Matches</h3>
          <p class="text-slate-500 text-xs">Your club's matches will appear here</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="match in upcomingMatches.slice(0, 3)" 
            :key="match._id"
            class="border border-emerald-100 rounded-lg p-3 hover:shadow-sm transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="text-center">
                  <div class="font-semibold text-slate-800 text-xs">{{ formatDate(match.date) }}</div>
                  <div class="text-[10px] text-slate-500">{{ formatTime(match.time) }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex flex-col items-center">
                    <div class="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span class="text-emerald-600 font-bold text-[10px]">
                        {{ match.homeClub.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-[10px] font-medium text-slate-700 max-w-[60px] truncate mt-0.5">
                      {{ match.homeClub.name }}
                    </div>
                  </div>
                  <div class="text-slate-400 font-bold text-[10px]">VS</div>
                  <div class="flex flex-col items-center">
                    <div class="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                      <span class="text-teal-600 font-bold text-[10px]">
                        {{ match.awayClub.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-[10px] font-medium text-slate-700 max-w-[60px] truncate mt-0.5">
                      {{ match.awayClub.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] font-medium text-slate-700">{{ match.tournament.name }}</div>
                <div class="text-[10px] text-slate-500">{{ match.venue }}</div>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 mt-1">
                  {{ match.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
        <h2 class="text-base font-bold text-slate-800 mb-4">Recent Activity</h2>
        <div v-if="activities.length === 0" class="text-center py-6">
          <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-slate-800 mb-1">No Recent Activity</h3>
          <p class="text-slate-500 text-xs">Your coaching activities will appear here</p>
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="activity in activities.slice(0, 5)" 
            :key="activity.id"
            class="flex items-start gap-3 p-3 border border-emerald-100 rounded-lg"
          >
            <div class="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-800 text-xs">{{ activity.message }}</p>
              <p class="text-[10px] text-slate-500">{{ formatActivityDate(activity.date) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const loading = ref(false);
const error = ref(null);
const clubData = ref(null);
const matches = ref([]);
const tournaments = ref([]);
const players = ref([]);
const activities = ref([]);

// Load data on component mount
onMounted(() => {
  loadData();
});

// Load all required data
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    
    // Get coach data to find the club
    const coachResponse = await axios.get(`${API}/coaches/profile`, { withCredentials: true });
    const coach = coachResponse.data.coach;
    
    if (!coach.currentClub) {
      clubData.value = null;
      matches.value = [];
      tournaments.value = [];
      players.value = [];
      activities.value = [];
      loading.value = false;
      return;
    }
    
    clubData.value = coach.currentClub;
    
    // Load matches for the club using the coach-specific endpoint
    try {
      const matchesResponse = await axios.get(`${API}/coaches/club/matches`, { withCredentials: true });
      matches.value = matchesResponse.data.matches || [];
    } catch (matchError) {
      if (matchError.response?.status === 400 && matchError.response?.data?.message?.includes('not associated')) {
        matches.value = [];
      } else {
        console.error('Error loading matches:', matchError);
        matches.value = [];
      }
    }
    
    // Load tournaments for the club
    try {
      const tournamentsResponse = await axios.get(`${API}/clubs/my-club/tournaments`, { withCredentials: true });
      tournaments.value = tournamentsResponse.data.tournaments || [];
    } catch (tournamentError) {
      if (tournamentError.response?.status === 403 || tournamentError.response?.status === 400) {
        tournaments.value = [];
      } else {
        console.error('Error loading tournaments:', tournamentError);
        tournaments.value = [];
      }
    }
    
    // Load players for the club
    try {
      const playersResponse = await axios.get(`${API}/coaches/club/players`, { withCredentials: true });
      players.value = playersResponse.data.players || [];
    } catch (playerError) {
      if (playerError.response?.status === 400 && playerError.response?.data?.message?.includes('not associated')) {
        players.value = [];
      } else {
        console.error('Error loading players:', playerError);
        players.value = [];
      }
    }
    
    // Load recent activities (mock data for now)
    activities.value = [
      { id: 1, message: "Training session scheduled for tomorrow", date: new Date(Date.now() - 86400000) },
      { id: 2, message: "Player performance report generated", date: new Date(Date.now() - 172800000) },
      { id: 3, message: "Match result updated", date: new Date(Date.now() - 259200000) }
    ];
  } catch (err) {
    console.error('Error loading data:', err);
    if (err.response?.status === 403) {
      error.value = 'Access denied. You must be associated with a club to view dashboard.';
    } else if (err.response?.status === 404) {
      error.value = 'No club found for your profile.';
    } else {
      error.value = err.response?.data?.message || 'Failed to load dashboard. Please try again.';
    }
    matches.value = [];
    tournaments.value = [];
    players.value = [];
    activities.value = [];
  } finally {
    loading.value = false;
  }
}

// Computed properties for filtering matches
const upcomingMatches = computed(() => {
  return matches.value
    .filter(match => {
      const matchDate = new Date(match.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchDate >= today && match.status === 'Scheduled';
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const recentMatches = computed(() => {
  return matches.value
    .filter(match => {
      const matchDate = new Date(match.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return matchDate < today || match.status === 'Completed';
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// Computed property for registered tournaments
const registeredTournaments = computed(() => {
  return tournaments.value;
});

// Helper functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(timeString) {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
}

function formatActivityDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function isWinner(match) {
  if (!match.result || !match.result.winner) return false;
  return match.result.winner._id === clubData.value._id;
}
</script>