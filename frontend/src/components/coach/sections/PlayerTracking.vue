<template>
  <div class="bg-white rounded-xl shadow-sm p-4 border border-emerald-100">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-bold text-slate-800">Players</h2>
      <div class="flex gap-2">
        <select 
          v-model="selectedProgram"
          class="block pl-2 pr-8 py-1.5 text-xs border-emerald-200 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-lg"
        >
          <option value="">All Programs</option>
          <option 
            v-for="program in trainingPrograms" 
            :key="program._id" 
            :value="program._id"
          >
            {{ program.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      <p class="text-slate-500 mt-3 text-sm">Loading players...</p>
    </div>

    <!-- Players List -->
    <div v-else-if="filteredPlayers.length > 0" class="space-y-3">
      <div 
        v-for="player in filteredPlayers" 
        :key="player._id"
        class="border border-emerald-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-sm font-bold text-slate-800">{{ player.name }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ player.preferredPosition || player.role || 'Player' }}</p>
          </div>
          <span 
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium',
              player.experienceLevel === 'advanced' || player.experienceLevel === 'professional' 
                ? 'bg-cyan-100 text-cyan-700' 
                : player.experienceLevel === 'intermediate' 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'bg-emerald-100 text-emerald-700'
            ]"
          >
            {{ player.experienceLevel || 'Beginner' }}
          </span>
        </div>

        <div class="mt-3" v-if="player.overallProgress !== undefined">
          <div class="flex justify-between mb-1">
            <span class="text-xs font-medium text-slate-600">Overall Progress</span>
            <span class="text-xs font-medium text-slate-600">{{ player.overallProgress || 0 }}%</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5">
            <div 
              class="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" 
              :style="{ width: (player.overallProgress || 0) + '%' }">
            </div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div class="flex items-center text-slate-500" v-if="player.attendanceRate !== undefined">
            <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Attendance: {{ player.attendanceRate || 0 }}%
          </div>
          <div class="flex items-center text-slate-500" v-if="player.sessionsCompleted !== undefined">
            <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Sessions: {{ player.sessionsCompleted || 0 }}/{{ player.totalSessions || 0 }}
          </div>
          <div class="flex items-center text-slate-500" v-if="player.battingStyle">
            <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
            </svg>
            {{ player.battingStyle }}
          </div>
          <div class="flex items-center text-slate-500" v-if="player.bowlingStyle">
            <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            {{ player.bowlingStyle }}
          </div>
        </div>

        <div class="mt-3 flex gap-2">
          <button 
            @click="viewPlayerDetails(player)"
            class="inline-flex items-center px-2.5 py-1 border border-emerald-200 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            View Details
          </button>
          <button 
            @click="updateProgress(player)"
            class="inline-flex items-center px-2.5 py-1 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            Update Progress
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-10">
      <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-slate-800 mb-1">No players found</h3>
      <p class="text-slate-500 text-xs">There are no players in your club yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const router = useRouter();

// Define props
const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

// Reactive data
const players = ref([]);
const trainingPrograms = ref([]);
const selectedProgram = ref('');
const loading = ref(false);

// Computed properties
const filteredPlayers = computed(() => {
  if (!selectedProgram.value) {
    return players.value;
  }
  return players.value.filter(player => player.programId === selectedProgram.value);
});

// Fetch player data from API
onMounted(async () => {
  await Promise.all([
    fetchPlayers(),
    fetchTrainingPrograms()
  ]);
});

async function fetchPlayers() {
  try {
    loading.value = true;
    const response = await axios.get(`${API}/coaches/club/players`, { withCredentials: true });
    players.value = response.data.players || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    // If coach is not associated with a club, show empty state
    if (error.response?.status === 400 && error.response?.data?.message?.includes('not associated')) {
      players.value = [];
    } else {
      players.value = [];
    }
  } finally {
    loading.value = false;
  }
}

async function fetchTrainingPrograms() {
  try {
    // Use the training programs from the coach data or fetch from API
    if (props.coachData?.trainingPrograms) {
      trainingPrograms.value = props.coachData.trainingPrograms;
    } else {
      const response = await axios.get(`${API}/coaches/training-programs`, { withCredentials: true });
      trainingPrograms.value = response.data.trainingPrograms || [];
    }
  } catch (error) {
    console.error('Error fetching training programs:', error);
    trainingPrograms.value = [];
  }
}

function viewPlayerDetails(player) {
  // Navigate to the player details page
  router.push({ name: 'coach-panel-player-details', params: { playerId: player._id } });
}

function updateProgress(player) {
  // In a real implementation, this would open a modal to update progress
  alert(`Updating progress for: ${player.name}`);
}
</script>