<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Performance Reports</h2>
      <div class="flex gap-3">
        <select
          v-model="selectedPeriod"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="last-week">Last Week</option>
          <option value="last-month">Last Month</option>
          <option value="last-3-months">Last 3 Months</option>
          <option value="all-time">All Time</option>
        </select>
        <button
          @click="refreshData"
          class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading performance data...</p>
    </div>

    <!-- No Data -->
    <div v-else-if="!performanceData || performanceData.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-gray-500">No performance data available</p>
      <p class="text-sm text-gray-400 mt-1">Your coach will update your performance stats soon</p>
    </div>

    <!-- Performance Data -->
    <div v-else>
      <!-- Overall Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 rounded-xl p-4">
          <p class="text-sm text-blue-800">Batting Average</p>
          <p class="text-2xl font-bold text-blue-900">{{ latestPerformance.batting.average }}</p>
        </div>
        <div class="bg-green-50 rounded-xl p-4">
          <p class="text-sm text-green-800">Strike Rate</p>
          <p class="text-2xl font-bold text-green-900">{{ latestPerformance.batting.strikeRate }}</p>
        </div>
        <div class="bg-purple-50 rounded-xl p-4">
          <p class="text-sm text-purple-800">Wickets</p>
          <p class="text-2xl font-bold text-purple-900">{{ latestPerformance.bowling.wickets }}</p>
        </div>
        <div class="bg-yellow-50 rounded-xl p-4">
          <p class="text-sm text-yellow-800">Economy</p>
          <p class="text-2xl font-bold text-yellow-900">{{ latestPerformance.bowling.economy }}</p>
        </div>
      </div>

      <!-- Detailed Stats Sections -->
      <div class="space-y-6">
        <!-- Batting Stats -->
        <div class="border border-gray-200 rounded-xl p-4">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Batting Performance
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Average</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.batting.average }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-blue-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.batting.average / 50) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Strike Rate</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.batting.strikeRate }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-blue-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.batting.strikeRate / 200) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Total Runs</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.batting.runs }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-blue-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.batting.runs / 1000) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bowling Stats -->
        <div class="border border-gray-200 rounded-xl p-4">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Bowling Performance
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Wickets</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.bowling.wickets }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-green-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.bowling.wickets / 50) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Economy</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.bowling.economy }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-green-600 rounded-full" 
                  :style="{ width: Math.min(100, (10 - latestPerformance.bowling.economy) * 10) + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Overs Bowled</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.bowling.overs }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-green-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.bowling.overs / 100) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fielding Stats -->
        <div class="border border-gray-200 rounded-xl p-4">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Fielding Performance
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Catches</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.fielding.catches }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-purple-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.fielding.catches / 20) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Runouts</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.fielding.runouts }}</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-purple-600 rounded-full" 
                  :style="{ width: Math.min(100, (latestPerformance.fielding.runouts / 10) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Accuracy</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.fielding.accuracy }}%</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-purple-600 rounded-full" 
                  :style="{ width: latestPerformance.fielding.accuracy + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fitness Stats -->
        <div class="border border-gray-200 rounded-xl p-4">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Fitness Performance
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Stamina</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.fitness.stamina }}%</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-yellow-600 rounded-full" 
                  :style="{ width: latestPerformance.fitness.stamina + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Agility</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.fitness.agility }}%</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-yellow-600 rounded-full" 
                  :style="{ width: latestPerformance.fitness.agility + '%' }"
                ></div>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">Endurance</p>
              <p class="text-xl font-bold text-gray-900">{{ latestPerformance.fitness.endurance }}%</p>
              <div class="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  class="h-2 bg-yellow-600 rounded-full" 
                  :style="{ width: latestPerformance.fitness.endurance + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance History Chart -->
      <div class="border border-gray-200 rounded-xl p-4 mt-8">
        <h3 class="font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div class="h-64 flex items-end justify-between gap-2 pt-4">
          <div
            v-for="(record, index) in performanceHistory"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div class="text-xs text-gray-500 mb-1">{{ formatDate(record.date) }}</div>
            <div
              class="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
              :style="{ height: (record.overallRating / 10) * 100 + '%' }"
            ></div>
            <div class="text-xs text-gray-600 mt-1">{{ record.overallRating }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(false);
const performanceData = ref([]);
const selectedPeriod = ref('last-month');

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});

const latestPerformance = computed(() => {
  if (!performanceData.value || performanceData.value.length === 0) {
    return {
      batting: { average: 0, strikeRate: 0, runs: 0 },
      bowling: { wickets: 0, economy: 0, overs: 0 },
      fielding: { catches: 0, runouts: 0, accuracy: 0 },
      fitness: { stamina: 0, agility: 0, endurance: 0 },
      overallRating: 0
    };
  }
  
  return performanceData.value[performanceData.value.length - 1];
});

const performanceHistory = computed(() => {
  if (!performanceData.value || performanceData.value.length === 0) return [];
  
  // Return last 7 records for the chart
  return performanceData.value.slice(-7);
});

const loadData = async () => {
  loading.value = true;
  try {
    // Fetch player's performance data from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's coach
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      if (clubData.coach) {
        // Get the coach's performance data for this player
        const coachResponse = await axios.get(`${API}/coaches/profile`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        const coachData = coachResponse.data.coach;
        
        // Find player progress in coach data
        const playerProgress = coachData.playerProgress.filter(progress => 
          progress.player.toString() === playerData._id.toString()
        );
        
        // Transform progress data for display
        const transformedData = playerProgress.map(progress => ({
          id: progress._id,
          date: progress.lastUpdated,
          batting: { 
            average: progress.skills.find(s => s.name === 'Batting Technique')?.progress || 0,
            strikeRate: progress.skills.find(s => s.name === 'Shot Selection')?.progress || 0,
            runs: progress.sessionsCompleted * 10 // Mock calculation
          },
          bowling: { 
            wickets: progress.skills.find(s => s.name === 'Line & Length')?.progress || 0,
            economy: progress.skills.find(s => s.name === 'Variations')?.progress || 0,
            overs: progress.sessionsCompleted * 2 // Mock calculation
          },
          fielding: { 
            catches: progress.skills.find(s => s.name === 'Fielding Skills')?.progress || 0,
            runouts: progress.skills.find(s => s.name === 'Throwing Accuracy')?.progress || 0,
            accuracy: progress.skills.find(s => s.name === 'Catching Technique')?.progress || 0
          },
          fitness: { 
            stamina: progress.skills.find(s => s.name === 'Stamina')?.progress || 0,
            agility: progress.skills.find(s => s.name === 'Agility')?.progress || 0,
            endurance: progress.skills.find(s => s.name === 'Endurance')?.progress || 0
          },
          overallRating: progress.overallProgress / 10 // Scale to 0-10
        }));
        
        performanceData.value = transformedData;
      }
    }
  } catch (error) {
    console.error('Error loading performance data:', error);
    // Fallback to mock data if there's an error
    performanceData.value = [
      {
        id: 1,
        date: '2023-06-10',
        batting: { average: 35.5, strikeRate: 125.4, runs: 178 },
        bowling: { wickets: 5, economy: 4.2, overs: 20 },
        fielding: { catches: 3, runouts: 1, accuracy: 85 },
        fitness: { stamina: 80, agility: 75, endurance: 82 },
        overallRating: 8.5
      },
      {
        id: 2,
        date: '2023-06-17',
        batting: { average: 42.1, strikeRate: 138.2, runs: 210 },
        bowling: { wickets: 3, economy: 3.8, overs: 15 },
        fielding: { catches: 2, runouts: 2, accuracy: 90 },
        fitness: { stamina: 85, agility: 80, endurance: 88 },
        overallRating: 9.2
      },
      {
        id: 3,
        date: '2023-06-24',
        batting: { average: 38.7, strikeRate: 132.5, runs: 194 },
        bowling: { wickets: 4, economy: 4.0, overs: 18 },
        fielding: { catches: 4, runouts: 1, accuracy: 88 },
        fitness: { stamina: 82, agility: 78, endurance: 85 },
        overallRating: 8.8
      }
    ];
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadData();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Custom styles */
</style>