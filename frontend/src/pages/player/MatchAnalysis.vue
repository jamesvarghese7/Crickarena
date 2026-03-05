<template>
  <div class="space-y-6">
    <!-- Header with Career Stats Summary -->
    <div class="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl shadow-xl p-6 text-white">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold mb-1">Match Analysis</h1>
          <p class="text-green-100">Review your match performance and statistics</p>
        </div>
        <div class="flex gap-4">
          <div class="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-bold">{{ careerStats?.totalMatches || 0 }}</p>
            <p class="text-xs text-green-100">Matches</p>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-bold">{{ careerStats?.batting?.runs || 0 }}</p>
            <p class="text-xs text-green-100">Runs</p>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p class="text-2xl font-bold">{{ careerStats?.bowling?.wickets || 0 }}</p>
            <p class="text-xs text-green-100">Wickets</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Career Stats Cards -->
    <div v-if="careerStats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Batting Average -->
      <div class="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-500">Batting Avg</p>
            <p class="text-xl font-bold text-gray-900">{{ careerStats.batting?.average || '-' }}</p>
          </div>
        </div>
      </div>
      <!-- Strike Rate -->
      <div class="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-500">Strike Rate</p>
            <p class="text-xl font-bold text-gray-900">{{ careerStats.batting?.strikeRate || '-' }}</p>
          </div>
        </div>
      </div>
      <!-- Bowling Economy -->
      <div class="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-500">Economy</p>
            <p class="text-xl font-bold text-gray-900">{{ careerStats.bowling?.economyRate || '-' }}</p>
          </div>
        </div>
      </div>
      <!-- Best Figures -->
      <div class="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-500">Best Bowling</p>
            <p class="text-xl font-bold text-gray-900">{{ careerStats.bowling?.bestFigures || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Match List -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Match History</h2>
          <span class="text-sm text-gray-500">{{ matches.length }} matches</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p class="mt-2 text-gray-600">Loading matches...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="matches.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
        <p class="text-gray-500">Your match performance data will appear here once you participate in matches.</p>
      </div>

      <!-- Match Cards -->
      <div v-else class="divide-y divide-gray-100">
        <div 
          v-for="match in matches" 
          :key="match._id"
          @click="selectMatch(match)"
          class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ match.homeClub?.clubName || match.homeClub?.name }} vs {{ match.awayClub?.clubName || match.awayClub?.name }}
                </span>
                <span v-if="match.isManOfMatch" class="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  ⭐ MoM
                </span>
              </div>
              <p class="text-xs text-gray-500">
                {{ match.tournament?.name }} • {{ formatDate(match.date) }}
              </p>
            </div>
            
            <!-- Performance Summary -->
            <div class="flex items-center gap-4">
              <div v-if="match.batting" class="text-center">
                <p class="text-lg font-bold text-blue-600">{{ match.batting.runs }}</p>
                <p class="text-xs text-gray-500">{{ match.batting.balls }}b</p>
              </div>
              <div v-if="match.bowling" class="text-center">
                <p class="text-lg font-bold text-purple-600">{{ match.bowling.wickets }}/{{ match.bowling.runs }}</p>
                <p class="text-xs text-gray-500">{{ match.bowling.overs }}ov</p>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Detail Modal -->
    <div v-if="selectedMatch" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="selectedMatch = null">
      <div class="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold">
                {{ matchDetail?.match?.homeClub?.clubName || matchDetail?.match?.homeClub?.name }} vs 
                {{ matchDetail?.match?.awayClub?.clubName || matchDetail?.match?.awayClub?.name }}
              </h3>
              <p class="text-green-100 text-sm">
                {{ matchDetail?.match?.tournament?.name }} • {{ formatDate(matchDetail?.match?.date) }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="matchDetail?.isManOfMatch" class="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                ⭐ Player of the Match
              </div>
              <button @click="selectedMatch = null" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Performance Rating -->
        <div class="p-4 border-b border-gray-100 bg-gray-50">
          <div class="flex items-center justify-center gap-4">
            <span class="text-sm text-gray-600">Performance Rating:</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                  :style="{ width: `${(matchDetail?.performanceRating || 0) * 10}%` }"
                ></div>
              </div>
              <span class="text-lg font-bold text-green-600">{{ matchDetail?.performanceRating || '-' }}/10</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button 
              @click="activeTab = 'batting'"
              :class="['flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors', 
                activeTab === 'batting' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              🏏 Batting
            </button>
            <button 
              @click="activeTab = 'bowling'"
              :class="['flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors', 
                activeTab === 'bowling' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              🎯 Bowling
            </button>
            <button 
              @click="activeTab = 'fielding'"
              :class="['flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors', 
                activeTab === 'fielding' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
            >
              🧤 Fielding
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Batting Tab -->
          <div v-if="activeTab === 'batting'">
            <div v-if="matchDetail?.batting" class="space-y-6">
              <!-- Main Stats -->
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-xl">
                  <p class="text-3xl font-bold text-blue-600">{{ matchDetail.batting.runs }}</p>
                  <p class="text-sm text-gray-600">Runs</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-xl">
                  <p class="text-3xl font-bold text-gray-700">{{ matchDetail.batting.balls }}</p>
                  <p class="text-sm text-gray-600">Balls</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-xl">
                  <p class="text-3xl font-bold text-green-600">{{ matchDetail.batting.strikeRate }}</p>
                  <p class="text-sm text-gray-600">Strike Rate</p>
                </div>
              </div>

              <!-- Boundaries -->
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-gray-600">Fours</span>
                  <span class="text-xl font-bold text-gray-900">{{ matchDetail.batting.fours }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-gray-600">Sixes</span>
                  <span class="text-xl font-bold text-gray-900">{{ matchDetail.batting.sixes }}</span>
                </div>
              </div>

              <!-- Scoring Breakdown Chart -->
              <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-4">Scoring Breakdown</h4>
                <div class="flex items-end justify-center gap-2 h-32">
                  <div class="flex flex-col items-center">
                    <div 
                      class="w-12 bg-blue-400 rounded-t transition-all" 
                      :style="{ height: `${Math.min(100, (matchDetail.batting.runs - (matchDetail.batting.fours * 4) - (matchDetail.batting.sixes * 6)) / matchDetail.batting.runs * 100)}%` }"
                    ></div>
                    <span class="text-xs text-gray-500 mt-1">Singles</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div 
                      class="w-12 bg-green-400 rounded-t transition-all" 
                      :style="{ height: `${Math.min(100, (matchDetail.batting.fours * 4) / matchDetail.batting.runs * 100)}%` }"
                    ></div>
                    <span class="text-xs text-gray-500 mt-1">Fours</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div 
                      class="w-12 bg-purple-400 rounded-t transition-all" 
                      :style="{ height: `${Math.min(100, (matchDetail.batting.sixes * 6) / matchDetail.batting.runs * 100)}%` }"
                    ></div>
                    <span class="text-xs text-gray-500 mt-1">Sixes</span>
                  </div>
                </div>
              </div>

              <!-- Dismissal -->
              <div class="bg-red-50 rounded-xl p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Dismissal</h4>
                <p class="text-gray-800">
                  {{ matchDetail.batting.dismissal?.how || 'Not Out' }}
                  <span v-if="matchDetail.batting.dismissal?.bowler" class="text-gray-500">
                    - {{ matchDetail.batting.dismissal.bowler }}
                  </span>
                </p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>Did not bat in this match</p>
            </div>
          </div>

          <!-- Bowling Tab -->
          <div v-if="activeTab === 'bowling'">
            <div v-if="matchDetail?.bowling" class="space-y-6">
              <!-- Main Stats -->
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-purple-50 rounded-xl">
                  <p class="text-3xl font-bold text-purple-600">{{ matchDetail.bowling.wickets }}/{{ matchDetail.bowling.runs }}</p>
                  <p class="text-sm text-gray-600">Figures</p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-xl">
                  <p class="text-3xl font-bold text-gray-700">{{ matchDetail.bowling.overs }}</p>
                  <p class="text-sm text-gray-600">Overs</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-xl">
                  <p class="text-3xl font-bold text-green-600">{{ matchDetail.bowling.economy }}</p>
                  <p class="text-sm text-gray-600">Economy</p>
                </div>
              </div>

              <!-- Additional Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-gray-600">Maidens</span>
                  <span class="text-xl font-bold text-gray-900">{{ matchDetail.bowling.maidens }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-gray-600">Dot Balls</span>
                  <span class="text-xl font-bold text-gray-900">{{ matchDetail.bowling.dotBalls || '-' }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>Did not bowl in this match</p>
            </div>
          </div>

          <!-- Fielding Tab -->
          <div v-if="activeTab === 'fielding'">
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-yellow-50 rounded-xl">
                  <p class="text-3xl font-bold text-yellow-600">{{ matchDetail?.fielding?.catches || 0 }}</p>
                  <p class="text-sm text-gray-600">Catches</p>
                </div>
                <div class="text-center p-4 bg-orange-50 rounded-xl">
                  <p class="text-3xl font-bold text-orange-600">{{ matchDetail?.fielding?.runOuts || 0 }}</p>
                  <p class="text-sm text-gray-600">Run Outs</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-xl">
                  <p class="text-3xl font-bold text-red-600">{{ matchDetail?.fielding?.stumpings || 0 }}</p>
                  <p class="text-sm text-gray-600">Stumpings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(true);
const matches = ref([]);
const careerStats = ref(null);
const selectedMatch = ref(null);
const matchDetail = ref(null);
const activeTab = ref('batting');

onMounted(async () => {
  await Promise.all([loadMatches(), loadCareerStats()]);
});

async function loadMatches() {
  loading.value = true;
  try {
    const response = await axios.get(`${API}/match-analysis/my-matches`, { withCredentials: true });
    matches.value = response.data.matches || [];
  } catch (error) {
    console.error('Error loading matches:', error);
  } finally {
    loading.value = false;
  }
}

async function loadCareerStats() {
  try {
    const response = await axios.get(`${API}/match-analysis/career-stats`, { withCredentials: true });
    careerStats.value = response.data;
  } catch (error) {
    console.error('Error loading career stats:', error);
  }
}

async function selectMatch(match) {
  selectedMatch.value = match;
  activeTab.value = 'batting';
  
  try {
    const response = await axios.get(`${API}/match-analysis/match/${match._id}`, { withCredentials: true });
    matchDetail.value = response.data;
  } catch (error) {
    console.error('Error loading match detail:', error);
    matchDetail.value = null;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'TBD';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>
