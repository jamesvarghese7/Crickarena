<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold">{{ matchInfo.isModifying ? 'Modify Match Lineup' : 'Set Match Lineup' }}</h2>
              <p class="text-blue-100 mt-1">
                {{ matchInfo.isModifying ? 'Update your team selection' : 'Select exactly 11 players' }} for {{ matchInfo.opponent }} match
              </p>
            </div>
            <button @click="closeModal" class="text-white hover:text-blue-200 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p class="text-slate-600 mt-4">Loading players...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Error Loading Players</h3>
            <p class="text-slate-600 mb-4">{{ error }}</p>
            <button @click="loadPlayers" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Try Again
            </button>
          </div>

          <!-- Player Selection -->
          <div v-else class="space-y-6">
            <!-- Selection Summary -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-slate-900">Players Selected</h3>
                  <p class="text-sm text-slate-600">Exactly 11 players required for lineup</p>
                </div>
                <div class="text-right">
                  <div :class="[
                    'text-2xl font-bold',
                    selectedPlayers.length === 11 ? 'text-green-600' : 
                    selectedPlayers.length > 11 ? 'text-red-600' : 'text-blue-600'
                  ]">
                    {{ selectedPlayers.length }}/11
                  </div>
                  <div v-if="selectedPlayers.length !== 11" class="text-xs text-slate-500">
                    {{ selectedPlayers.length > 11 ? 'Too many selected' : `${11 - selectedPlayers.length} more needed` }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Search and Filter -->
            <div class="bg-slate-50 rounded-2xl p-4">
              <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1">
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Search players by name or position..." 
                    class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select 
                  v-model="positionFilter" 
                  class="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Positions</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
              </div>
            </div>

            <!-- Players Grid -->
            <div class="grid gap-4">
              <div v-for="player in filteredPlayers" :key="player._id" 
                   :class="[
                     'border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer',
                     isPlayerSelected(player._id) 
                       ? 'border-blue-500 bg-blue-50 shadow-lg' 
                       : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                   ]"
                   @click="togglePlayer(player)">
                <div class="flex items-center gap-4">
                  <!-- Checkbox -->
                  <div :class="[
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors',
                    isPlayerSelected(player._id) 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-slate-300'
                  ]">
                    <svg v-if="isPlayerSelected(player._id)" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>

                  <!-- Player Info -->
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h4 class="text-lg font-bold text-slate-900 mb-1">
                          {{ player.fullName || player.name || `Player ${player._id}` }}
                        </h4>
                        <div class="flex items-center gap-3 text-sm text-slate-600">
                          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{{ player.position }}</span>
                          <span class="font-medium">Age: {{ player.age }}</span>
                          <span v-if="player.jerseyNumber" class="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                            Jersey #{{ player.jerseyNumber }}
                          </span>
                        </div>
                        <div class="flex items-center gap-4 text-xs text-slate-500 mt-2">
                          <span><strong>Batting:</strong> {{ player.battingStyle || 'N/A' }}</span>
                          <span><strong>Bowling:</strong> {{ player.bowlingStyle || 'N/A' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Players State -->
            <div v-if="filteredPlayers.length === 0" class="text-center py-12">
              <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">No Players Found</h3>
              <p class="text-slate-600">No players match your search criteria.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-200 p-6 bg-slate-50">
          <div class="flex items-center justify-between">
            <button @click="closeModal" 
                    class="px-6 py-3 border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button @click="submitRoster" 
                    :disabled="selectedPlayers.length !== 11 || submitting"
                    :class="[
                      'px-6 py-3 rounded-2xl font-semibold transition-all duration-200',
                      selectedPlayers.length === 11 && !submitting
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    ]">
              <span v-if="submitting" class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ matchInfo.isModifying ? 'Updating...' : 'Submitting...' }}
              </span>
              <span v-else>{{ matchInfo.isModifying ? 'Update Lineup' : 'Submit Lineup' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  matchInfo: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'roster-submitted', 'show-notification']);

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Reactive data
const loading = ref(false);
const error = ref('');
const players = ref([]);
const selectedPlayers = ref([]);
const submitting = ref(false);
const searchQuery = ref('');
const positionFilter = ref('');

// Computed
const isPlayerSelected = (playerId) => {
  return selectedPlayers.value.some(p => p._id === playerId);
};

// Filtered players based on search and position
const filteredPlayers = computed(() => {
  let filtered = players.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(player => 
      (player.fullName && player.fullName.toLowerCase().includes(query)) ||
      (player.name && player.name.toLowerCase().includes(query)) ||
      (player.position && player.position.toLowerCase().includes(query))
    );
  }
  
  // Apply position filter
  if (positionFilter.value) {
    filtered = filtered.filter(player => 
      player.position && player.position.toLowerCase() === positionFilter.value.toLowerCase()
    );
  }
  
  return filtered;
});

// Methods
async function loadPlayers() {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`${API}/coaches/club/players`, { withCredentials: true });
    players.value = response.data.players || [];
    
    // Temporary log to check data
    console.log('Players loaded:', players.value.length);
    if (players.value.length > 0) {
      console.log('First player:', players.value[0]);
    }
    
    if (players.value.length === 0) {
      error.value = 'No players found for your club. Make sure you have players registered.';
    }
  } catch (err) {
    console.error('Error loading players:', err);
    error.value = err.response?.data?.message || 'Failed to load players';
  } finally {
    loading.value = false;
  }
}

function togglePlayer(player) {
  const index = selectedPlayers.value.findIndex(p => p._id === player._id);
  
  if (index > -1) {
    // Remove player
    selectedPlayers.value.splice(index, 1);
  } else {
    // Add player (only if less than 11 selected)
    if (selectedPlayers.value.length < 11) {
      selectedPlayers.value.push(player);
    } else {
      // Show notification if trying to select more than 11 players
      emit('show-notification', 'error', 'Maximum Players Selected', 'You can only select exactly 11 players for your lineup.');
    }
  }
}

async function submitRoster() {
  // Strict validation: exactly 11 players must be selected
  if (selectedPlayers.value.length !== 11) {
    const needed = 11 - selectedPlayers.value.length;
    const message = needed > 0 
      ? `Please select ${needed} more player${needed === 1 ? '' : 's'} to complete your lineup. Exactly 11 players must be selected.`
      : `Please remove ${Math.abs(needed)} player${Math.abs(needed) === 1 ? '' : 's'}. Exactly 11 players must be selected.`;
      
    emit('show-notification', 'error', 'Invalid Selection', message);
    return;
  }

  submitting.value = true;
  
  try {
    const rosterData = {
      players: selectedPlayers.value.map(player => ({
        playerId: player._id,
        playerName: player.fullName || player.name || 'Unknown Player',
        position: player.position || player.preferredPosition || 'All-rounder',
        jerseyNumber: player.jerseyNumber || null
      }))
    };

    console.log('Submitting roster data:', rosterData);

    await axios.post(`${API}/matches/${props.matchInfo.matchId}/roster`, rosterData, { 
      withCredentials: true 
    });

    emit('roster-submitted', {
      matchId: props.matchInfo.matchId,
      roster: rosterData
    });
    
    // Show success notification with clear message about the 11-player rule
    emit('show-notification', 'success', 'Lineup Submitted!', 'Your team lineup with exactly 11 players has been successfully submitted.');
    
    closeModal();
  } catch (err) {
    console.error('Error submitting roster:', err);
    console.error('Error details:', err.response?.data);
    console.error('Request data:', rosterData);
    
    let errorMessage = 'Failed to submit roster';
    if (err.response?.data?.errors) {
      // Handle validation errors
      const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
      errorMessage = `Validation errors: ${errorMessages}`;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    // Emit notification instead of setting local error
    emit('show-notification', 'error', 'Submission Failed', errorMessage);
    error.value = errorMessage;
  } finally {
    submitting.value = false;
  }
}

function closeModal() {
  selectedPlayers.value = [];
  error.value = '';
  searchQuery.value = '';
  positionFilter.value = '';
  emit('close');
}

// Load existing roster if available
async function loadExistingRoster() {
  if (!props.matchInfo.matchId) return;
  
  try {
    const response = await axios.get(`${API}/matches/${props.matchInfo.matchId}/roster/my-team`, { withCredentials: true });
    if (response.data.hasRoster && response.data.roster) {
      // Pre-select players from existing roster
      const existingPlayerIds = response.data.roster.players.map(p => p.playerId);
      selectedPlayers.value = players.value.filter(player => existingPlayerIds.includes(player._id));
    }
  } catch (err) {
    console.error('Error loading existing roster:', err);
    // Don't show error as this is optional
  }
}

// Load players when modal opens
onMounted(() => {
  if (props.isOpen) {
    loadPlayers();
  }
});

// Watch for modal opening
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await loadPlayers();
    await loadExistingRoster();
  } else {
    selectedPlayers.value = [];
    error.value = '';
    searchQuery.value = '';
    positionFilter.value = '';
  }
});
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>