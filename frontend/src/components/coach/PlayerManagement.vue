<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Player Management</h2>
      <div class="flex gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search players..."
          class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          @click="refreshPlayers"
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
      <p class="text-gray-600 mt-4">Loading players...</p>
    </div>

    <!-- No Players -->
    <div v-else-if="filteredPlayers.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-gray-500">No players found in your club</p>
    </div>

    <!-- Players List -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="player in filteredPlayers"
        :key="player._id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
        @click="viewPlayerDetails(player)"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span class="text-green-800 font-bold">{{ player.fullName.charAt(0) }}</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ player.fullName }}</h3>
            <p class="text-sm text-gray-600 capitalize">{{ player.preferredPosition }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p class="text-gray-500">Age</p>
            <p class="font-medium">{{ player.age }}</p>
          </div>
          <div>
            <p class="text-gray-500">Role</p>
            <p class="font-medium capitalize">{{ player.preferredPosition }}</p>
          </div>
          <div>
            <p class="text-gray-500">Attendance</p>
            <p class="font-medium">{{ player.attendanceRate || 0 }}%</p>
          </div>
          <div>
            <p class="text-gray-500">Matches</p>
            <p class="font-medium">{{ player.matchesPlayed || 0 }}</p>
          </div>
        </div>

        <div class="mt-3 flex gap-2">
          <span
            v-for="stat in getPlayerStats(player)"
            :key="stat.label"
            class="px-2 py-1 rounded-full text-xs"
            :class="stat.class"
          >
            {{ stat.label }}: {{ stat.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- Player Details Modal -->
    <div v-if="showPlayerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Player Details</h3>
            <button
              @click="showPlayerModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="selectedPlayer" class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-800 font-bold text-xl">{{ selectedPlayer.fullName.charAt(0) }}</span>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedPlayer.fullName }}</h2>
              <p class="text-gray-600 capitalize">{{ selectedPlayer.preferredPosition }}</p>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <div class="border border-gray-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Age</span>
                  <span class="font-medium">{{ selectedPlayer.age }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Batting Style</span>
                  <span class="font-medium capitalize">{{ selectedPlayer.battingStyle }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Bowling Style</span>
                  <span class="font-medium capitalize">{{ selectedPlayer.bowlingStyle }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Experience</span>
                  <span class="font-medium capitalize">{{ selectedPlayer.playingExperience }}</span>
                </div>
              </div>
            </div>

            <div class="border border-gray-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Statistics</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Matches Played</span>
                  <span class="font-medium">{{ selectedPlayer.statistics?.matchesPlayed || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Runs Scored</span>
                  <span class="font-medium">{{ selectedPlayer.statistics?.runsScored || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Wickets Taken</span>
                  <span class="font-medium">{{ selectedPlayer.statistics?.wicketsTaken || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Catches</span>
                  <span class="font-medium">{{ selectedPlayer.statistics?.catches || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl p-4 mb-6">
            <h4 class="font-semibold text-gray-900 mb-3">Recent Match Reports</h4>
            <div v-if="!selectedPlayer.matchReports || selectedPlayer.matchReports.length === 0" class="text-center py-4">
              <p class="text-gray-500">No match reports available</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="report in selectedPlayer.matchReports.slice(0, 5)"
                :key="report.id"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex justify-between text-sm">
                  <span class="font-medium">{{ report.matchName }}</span>
                  <span class="text-gray-500">{{ formatDate(report.date) }}</span>
                </div>
                <div class="mt-2 text-sm">
                  <p>{{ report.summary }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="showPlayerModal = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              @click="sendMessageToPlayer"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Send Message
            </button>
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
const players = ref([]);
const searchQuery = ref('');
const showPlayerModal = ref(false);
const selectedPlayer = ref(null);

const props = defineProps({
  coachData: {
    type: Object,
    required: true
  },
  clubData: {
    type: Object,
    required: true
  }
});

const filteredPlayers = computed(() => {
  if (!searchQuery.value) return players.value;
  
  const query = searchQuery.value.toLowerCase();
  return players.value.filter(player => 
    player.fullName.toLowerCase().includes(query) ||
    player.preferredPosition.toLowerCase().includes(query)
  );
});

const getPlayerStats = (player) => {
  const stats = [];
  
  if (player.statistics?.runsScored > 0) {
    stats.push({
      label: 'Runs',
      value: player.statistics.runsScored,
      class: 'bg-blue-100 text-blue-800'
    });
  }
  
  if (player.statistics?.wicketsTaken > 0) {
    stats.push({
      label: 'Wickets',
      value: player.statistics.wicketsTaken,
      class: 'bg-green-100 text-green-800'
    });
  }
  
  if (player.statistics?.catches > 0) {
    stats.push({
      label: 'Catches',
      value: player.statistics.catches,
      class: 'bg-purple-100 text-purple-800'
    });
  }
  
  return stats;
};

const loadPlayers = async () => {
  if (!props.coachData.currentClub) return;
  
  loading.value = true;
  try {
    // Get players from the club
    const response = await axios.get(`${API}/clubs/public/${props.coachData.currentClub._id}/players`);
    players.value = response.data.players || [];
  } catch (error) {
    console.error('Error loading players:', error);
  } finally {
    loading.value = false;
  }
};

const refreshPlayers = () => {
  loadPlayers();
};

const viewPlayerDetails = (player) => {
  selectedPlayer.value = player;
  showPlayerModal.value = true;
};

const sendMessageToPlayer = () => {
  // Implementation for sending message to player
  alert('Message feature will be implemented in the communication panel');
  showPlayerModal.value = false;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadPlayers();
});
</script>

<style scoped>
/* Custom styles */
</style>