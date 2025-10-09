<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Performance Tracker</h2>
      <div class="flex gap-3">
        <select
          v-model="selectedPlayer"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select Player</option>
          <option
            v-for="player in players"
            :key="player._id"
            :value="player._id"
          >
            {{ player.fullName }}
          </option>
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

    <!-- No Player Selected -->
    <div v-else-if="!selectedPlayer" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-gray-500">Select a player to view performance data</p>
    </div>

    <!-- Performance Data -->
    <div v-else-if="playerPerformance" class="space-y-6">
      <!-- Player Header -->
      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <span class="text-green-800 font-bold text-xl">{{ playerPerformance.name.charAt(0) }}</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ playerPerformance.name }}</h3>
          <p class="text-gray-600 capitalize">{{ playerPerformance.position }}</p>
        </div>
        <div class="ml-auto text-right">
          <p class="text-sm text-gray-500">Last Updated</p>
          <p class="font-medium">{{ formatDate(playerPerformance.lastUpdated) }}</p>
        </div>
      </div>

      <!-- Overall Stats -->
      <div class="grid md:grid-cols-4 gap-4">
        <div class="bg-blue-50 rounded-xl p-4">
          <p class="text-sm text-blue-800">Overall Progress</p>
          <p class="text-2xl font-bold text-blue-900">{{ playerPerformance.overallProgress }}%</p>
        </div>
        <div class="bg-green-50 rounded-xl p-4">
          <p class="text-sm text-green-800">Attendance Rate</p>
          <p class="text-2xl font-bold text-green-900">{{ playerPerformance.attendanceRate }}%</p>
        </div>
        <div class="bg-purple-50 rounded-xl p-4">
          <p class="text-sm text-purple-800">Sessions Completed</p>
          <p class="text-2xl font-bold text-purple-900">{{ playerPerformance.sessionsCompleted }}/{{ playerPerformance.totalSessions }}</p>
        </div>
        <div class="bg-yellow-50 rounded-xl p-4">
          <p class="text-sm text-yellow-800">Performance Rating</p>
          <p class="text-2xl font-bold text-yellow-900">{{ playerPerformance.performanceRating }}/10</p>
        </div>
      </div>

      <!-- Skills Progress -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4">Skill Development</h3>
        <div class="space-y-4">
          <div
            v-for="skill in playerPerformance.skills"
            :key="skill.name"
            class="space-y-2"
          >
            <div class="flex justify-between">
              <span class="font-medium">{{ skill.name }}</span>
              <span class="font-bold text-green-600">{{ skill.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full"
                :style="{ width: skill.progress + '%' }"
              ></div>
            </div>
            <p v-if="skill.notes" class="text-sm text-gray-600">{{ skill.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Sessions -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4">Recent Training Sessions</h3>
        <div v-if="playerPerformance.recentSessions.length === 0" class="text-center py-4">
          <p class="text-gray-500">No recent sessions recorded</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="session in playerPerformance.recentSessions"
            :key="session.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div>
              <p class="font-medium">{{ session.focusArea }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(session.date) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span
                :class="{
                  'bg-green-100 text-green-800': session.attended,
                  'bg-red-100 text-red-800': !session.attended
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ session.attended ? 'Attended' : 'Missed' }}
              </span>
              <button
                @click="addFeedback(session)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                Add Feedback
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Performance Button -->
      <div class="flex justify-end">
        <button
          @click="showUpdateModal = true"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Update Performance
        </button>
      </div>
    </div>

    <!-- Update Performance Modal -->
    <div v-if="showUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Update Performance</h3>
            <button
              @click="showUpdateModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="updatePerformance" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Overall Progress (%)</label>
            <input
              v-model.number="updateForm.overallProgress"
              type="number"
              min="0"
              max="100"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Attendance Rate (%)</label>
            <input
              v-model.number="updateForm.attendanceRate"
              type="number"
              min="0"
              max="100"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Performance Rating (1-10)</label>
            <input
              v-model.number="updateForm.performanceRating"
              type="number"
              min="1"
              max="10"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="updateForm.notes"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any observations or feedback..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="showUpdateModal = false"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="updating">Updating...</span>
              <span v-else>Update Performance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(false);
const updating = ref(false);
const players = ref([]);
const selectedPlayer = ref('');
const playerPerformance = ref(null);
const showUpdateModal = ref(false);

const updateForm = ref({
  overallProgress: 0,
  attendanceRate: 0,
  performanceRating: 5,
  notes: ''
});

const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

const loadPlayers = async () => {
  if (!props.coachData.currentClub) return;
  
  try {
    // Get players from the club
    const response = await axios.get(`${API}/clubs/public/${props.coachData.currentClub._id}/players`);
    players.value = response.data.players || [];
  } catch (error) {
    console.error('Error loading players:', error);
    players.value = [];
  }
};

const loadPerformanceData = async () => {
  if (!selectedPlayer.value) return;
  
  loading.value = true;
  try {
    // Fetch actual performance data for the selected player
    // This would typically involve calling an API endpoint to get player performance data
    // For now, we'll initialize with empty data
    const player = players.value.find(p => p._id === selectedPlayer.value);
    if (player) {
      playerPerformance.value = {
        name: player.fullName,
        position: player.preferredPosition || 'Not specified',
        overallProgress: player.statistics?.overallProgress || 0,
        attendanceRate: player.statistics?.attendanceRate || 0,
        sessionsCompleted: player.statistics?.sessionsCompleted || 0,
        totalSessions: player.statistics?.totalSessions || 0,
        performanceRating: player.statistics?.performanceRating || 0,
        lastUpdated: player.lastUpdated || new Date().toISOString(),
        skills: player.skills || [],
        recentSessions: player.recentSessions || []
      };
    }
  } catch (error) {
    console.error('Error loading performance data:', error);
    playerPerformance.value = null;
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadPerformanceData();
};

const updatePerformance = async () => {
  updating.value = true;
  try {
    // In a real implementation, this would update the player's performance data
    alert('Performance updated successfully');
    showUpdateModal.value = false;
    await loadPerformanceData();
  } catch (error) {
    console.error('Error updating performance:', error);
    alert('Failed to update performance');
  } finally {
    updating.value = false;
  }
};

const addFeedback = (session) => {
  // Implementation for adding feedback to a session
  alert(`Add feedback for session: ${session.focusArea}`);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

watch(selectedPlayer, () => {
  loadPerformanceData();
});

onMounted(() => {
  loadPlayers();
});
</script>

<style scoped>
/* Custom styles */
</style>