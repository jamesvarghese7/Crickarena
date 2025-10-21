<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Player Goal Setting</h2>
      <button 
        @click="showSetGoalModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Set New Goal
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading player goals...</p>
    </div>

    <!-- Goals List -->
    <div v-else-if="playerGoals.length > 0" class="space-y-4">
      <div 
        v-for="goal in playerGoals" 
        :key="goal._id"
        class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ goal.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ goal.description }}</p>
          </div>
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
              goal.status === 'missed' ? 'bg-red-100 text-red-800' :
              goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            ]"
          >
            {{ formatGoalStatus(goal.status) }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Target: {{ goal.targetValue }} {{ goal.targetType }}
          </div>
          <div class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Deadline: {{ formatDate(goal.deadline) }}
          </div>
          <div class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            {{ getPlayerName(goal.player) }}
          </div>
        </div>

        <div class="mt-4">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">Progress</span>
            <span class="text-sm font-medium text-gray-700">{{ goal.currentValue || 0 }}/{{ goal.targetValue }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full bg-blue-600" 
              :style="{ width: calculateProgress(goal) + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No goals set</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by setting goals for your players.</p>
      <div class="mt-6">
        <button 
          @click="showSetGoalModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Set First Goal
        </button>
      </div>
    </div>

    <!-- Set Goal Modal -->
    <div v-if="showSetGoalModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Set Player Goal</h3>
            <button 
              @click="closeGoalModal"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="setGoal" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Player</label>
              <select 
                v-model="goalForm.playerId"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a player</option>
                <option 
                  v-for="player in clubPlayers" 
                  :key="player._id" 
                  :value="player._id"
                >
                  {{ player.name }} ({{ player.preferredPosition }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Goal Title</label>
              <input 
                v-model="goalForm.title"
                type="text" 
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Improve Batting Average"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                v-model="goalForm.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Detailed description of the goal"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Target Type</label>
                <select 
                  v-model="goalForm.targetType"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="skill">Skill Improvement</option>
                  <option value="attendance">Attendance Rate</option>
                  <option value="sessions">Sessions Completed</option>
                  <option value="performance">Performance Metric</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Target Value</label>
                <input 
                  v-model.number="goalForm.targetValue"
                  type="number" 
                  required
                  min="1"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Deadline</label>
              <input 
                v-model="goalForm.deadline"
                type="date" 
                required
                :min="today"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                @click="closeGoalModal"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="isSavingGoal"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {{ isSavingGoal ? 'Setting Goal...' : 'Set Goal' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Define props
const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

// Reactive data
const playerGoals = ref([]);
const clubPlayers = ref([]);
const showSetGoalModal = ref(false);
const isSavingGoal = ref(false);
const loading = ref(false);

const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

const goalForm = ref({
  playerId: '',
  title: '',
  description: '',
  targetType: 'skill',
  targetValue: 0,
  deadline: ''
});

// Fetch player goals and club players
onMounted(async () => {
  await Promise.all([
    fetchPlayerGoals(),
    fetchClubPlayers()
  ]);
});

async function fetchPlayerGoals() {
  try {
    loading.value = true;
    const response = await axios.get(`${API}/coaches/goals`, { withCredentials: true });
    playerGoals.value = response.data.goals || [];
  } catch (error) {
    console.error('Error fetching player goals:', error);
    playerGoals.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchClubPlayers() {
  try {
    const response = await axios.get(`${API}/coaches/club/players`, { withCredentials: true });
    clubPlayers.value = response.data.players || [];
  } catch (error) {
    console.error('Error fetching club players:', error);
    clubPlayers.value = [];
  }
}

function getPlayerName(playerId) {
  const player = clubPlayers.value.find(p => p._id === playerId);
  return player ? player.name : 'Unknown Player';
}

function formatGoalStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'achieved': 'Achieved',
    'missed': 'Missed'
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function calculateProgress(goal) {
  if (!goal.targetValue) return 0;
  const progress = (goal.currentValue || 0) / goal.targetValue * 100;
  return Math.min(100, Math.max(0, progress));
}

function closeGoalModal() {
  showSetGoalModal.value = false;
  resetGoalForm();
}

function resetGoalForm() {
  goalForm.value = {
    playerId: '',
    title: '',
    description: '',
    targetType: 'skill',
    targetValue: 0,
    deadline: ''
  };
}

async function setGoal() {
  if (!goalForm.value.playerId || !goalForm.value.title || !goalForm.value.targetValue || !goalForm.value.deadline) {
    if (typeof window.$notify !== 'undefined') {
      window.$notify.error('Error', 'Please fill in all required fields');
    } else {
      alert('Please fill in all required fields');
    }
    return;
  }

  isSavingGoal.value = true;
  try {
    const response = await axios.post(`${API}/coaches/goals`, goalForm.value, { withCredentials: true });
    if (typeof window.$notify !== 'undefined') {
      window.$notify.success('Success', 'Goal set successfully');
    } else {
      alert('Goal set successfully');
    }
    
    // Add the new goal to the list immediately
    if (response.data && response.data.goal) {
      playerGoals.value.unshift(response.data.goal);
    }
    
    closeGoalModal();
  } catch (error) {
    console.error('Error setting goal:', error);
    if (typeof window.$notify !== 'undefined') {
      window.$notify.error('Error', 'Failed to set goal. Please try again.');
    } else {
      alert('Failed to set goal. Please try again.');
    }
  } finally {
    isSavingGoal.value = false;
  }
}
</script>