<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Club Matches & Tournaments</h1>
          <p class="text-gray-600 mt-1">View matches and tournaments for your club</p>
        </div>
        <div v-if="clubData" class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">{{ clubData.clubName || clubData.name }}</h3>
            <p class="text-sm text-gray-600">{{ clubData.city }}, {{ clubData.district }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-lg p-8">
      <div class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-gray-600">Loading matches and tournaments...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-2xl shadow-lg p-6">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
            <p class="text-red-700">{{ error }}</p>
            <button 
              @click="loadData"
              class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Club Assigned -->
    <div v-else-if="!clubData" class="bg-white rounded-2xl shadow-lg p-6">
      <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">No Club Assigned</h3>
            <p class="text-yellow-700">
              You are not currently assigned to any club. Matches and tournaments will appear here once you are associated with a club.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Upcoming Matches -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Upcoming Matches</h2>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {{ upcomingMatches.length }} matches
          </span>
        </div>

        <div v-if="upcomingMatches.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Upcoming Matches</h3>
          <p class="text-gray-600">There are no upcoming matches scheduled for your club.</p>
        </div>

        <div v-else class="grid gap-4">
          <div 
            v-for="match in upcomingMatches" 
            :key="match._id"
            class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="font-bold text-gray-900">{{ formatDate(match.date) }}</div>
                  <div class="text-sm text-gray-600">{{ formatTime(match.time) }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <span class="text-gray-600 font-bold text-sm">
                        {{ match.homeClub.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-gray-900 max-w-[80px] truncate">
                      {{ match.homeClub.name }}
                    </div>
                  </div>
                  <div class="text-gray-400 font-bold">VS</div>
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <span class="text-gray-600 font-bold text-sm">
                        {{ match.awayClub.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-gray-900 max-w-[80px] truncate">
                      {{ match.awayClub.name }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ match.tournament.name }}</div>
                <div class="text-sm text-gray-600">{{ match.venue }}</div>
                <div class="mt-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ match.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Matches -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Recent Matches</h2>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {{ recentMatches.length }} matches
          </span>
        </div>

        <div v-if="recentMatches.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Recent Matches</h3>
          <p class="text-gray-600">Your club hasn't played any matches yet.</p>
        </div>

        <div v-else class="grid gap-4">
          <div 
            v-for="match in recentMatches" 
            :key="match._id"
            class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="font-bold text-gray-900">{{ formatDate(match.date) }}</div>
                  <div class="text-sm text-gray-600">{{ formatTime(match.time) }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <span class="text-gray-600 font-bold text-sm">
                        {{ match.homeClub.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-gray-900 max-w-[80px] truncate">
                      {{ match.homeClub.name }}
                    </div>
                    <div v-if="match.score && match.score.home" class="text-xs text-gray-600">
                      {{ match.score.home.runs }}/{{ match.score.home.wickets }}
                    </div>
                  </div>
                  <div class="text-gray-400 font-bold">VS</div>
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <span class="text-gray-600 font-bold text-sm">
                        {{ match.awayClub.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-gray-900 max-w-[80px] truncate">
                      {{ match.awayClub.name }}
                    </div>
                    <div v-if="match.score && match.score.away" class="text-xs text-gray-600">
                      {{ match.score.away.runs }}/{{ match.score.away.wickets }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ match.tournament.name }}</div>
                <div class="text-sm text-gray-600">{{ match.venue }}</div>
                <div v-if="match.result && match.result.winner" class="mt-2">
                  <span 
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      isWinner(match) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ isWinner(match) ? 'Won' : 'Lost' }}
                  </span>
                </div>
                <div v-else-if="match.result && match.result.isTie" class="mt-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Tie
                  </span>
                </div>
                <div v-else class="mt-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ match.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Registered Tournaments -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Registered Tournaments</h2>
          <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {{ registeredTournaments.length }} tournaments
          </span>
        </div>

        <div v-if="registeredTournaments.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No Registered Tournaments</h3>
          <p class="text-gray-600">Your club hasn't registered for any tournaments yet.</p>
        </div>

        <div v-else class="grid gap-4">
          <div 
            v-for="tournament in registeredTournaments" 
            :key="tournament._id"
            class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-gray-900">{{ tournament.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ tournament.description }}</p>
                <div class="flex items-center gap-4 mt-3 text-sm">
                  <div class="flex items-center text-gray-600">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDate(tournament.startDate) }} - {{ formatDate(tournament.endDate) }}
                  </div>
                  <div class="flex items-center text-gray-600">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    {{ tournament.maxTeams }} teams
                  </div>
                </div>
              </div>
              <div class="text-right">
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    tournament.applicationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    tournament.applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ tournament.applicationStatus }}
                </span>
                <div class="text-sm text-gray-600 mt-2">{{ tournament.format }}</div>
              </div>
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
      return;
    }
    
    clubData.value = coach.currentClub;
    
    // Load matches for the club
    const matchesResponse = await axios.get(`${API}/clubs/matches`, { withCredentials: true });
    matches.value = matchesResponse.data.matches || [];
    
    // Load tournaments for the club
    const tournamentsResponse = await axios.get(`${API}/clubs/my-club/tournaments`, { withCredentials: true });
    tournaments.value = tournamentsResponse.data.tournaments || [];
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = err.response?.data?.message || 'Failed to load matches and tournaments. Please try again.';
    matches.value = [];
    tournaments.value = [];
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
    year: 'numeric',
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

function isWinner(match) {
  if (!match.result || !match.result.winner) return false;
  return match.result.winner._id === clubData.value._id;
}
</script>