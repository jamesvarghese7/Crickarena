<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">🏏 Fixture Generation Wizard</h2>
            <p class="text-indigo-100 text-sm mt-1">{{ tournament?.name }}</p>
          </div>
          <button @click="close" class="p-2 rounded-full hover:bg-white/20 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Progress Steps -->
        <div class="flex items-center mt-6 gap-2">
          <div v-for="(step, idx) in steps" :key="idx" 
               class="flex items-center"
               :class="{ 'flex-1': idx < steps.length - 1 }">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                 :class="currentStep >= idx ? 'bg-white text-indigo-600' : 'bg-indigo-500/50 text-white'">
              {{ idx + 1 }}
            </div>
            <div v-if="idx < steps.length - 1" 
                 class="flex-1 h-1 mx-2 rounded transition-all"
                 :class="currentStep > idx ? 'bg-white' : 'bg-indigo-500/50'"></div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-indigo-100">
          <span v-for="(step, idx) in steps" :key="idx" class="flex-1 text-center">{{ step.name }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Step 1: Format Selection -->
        <div v-if="currentStep === 0" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Tournament Format</h3>
            <span class="text-sm text-gray-500">Format was set during tournament creation</span>
          </div>
          
          <!-- Current format banner -->
          <div class="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ tournamentFormat?.icon || '🏆' }}</span>
              <div>
                <div class="font-bold text-lg">{{ tournamentFormat?.label || tournament?.format }}</div>
                <div class="text-indigo-100 text-sm">{{ tournamentFormat?.description }}</div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="format in formats" :key="format.value"
                    class="p-4 rounded-xl border-2 text-left transition-all"
                    :class="isTournamentFormat(format.value) 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' 
                      : 'border-gray-200 opacity-40 cursor-not-allowed'">
              <div class="flex items-center justify-between mb-2">
                <span class="text-2xl">{{ format.icon }}</span>
                <span v-if="isTournamentFormat(format.value)" class="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full font-medium">
                  Selected
                </span>
                <span v-else class="px-2 py-0.5 bg-gray-300 text-gray-600 text-xs rounded-full">
                  Not Available
                </span>
              </div>
              <div class="font-semibold" :class="isTournamentFormat(format.value) ? 'text-gray-900' : 'text-gray-500'">{{ format.label }}</div>
              <div class="text-xs mt-1" :class="isTournamentFormat(format.value) ? 'text-gray-600' : 'text-gray-400'">{{ format.description }}</div>
            </div>
          </div>
          
          <!-- Format-specific options -->
          <div v-if="config.format === 'super-league'" class="bg-indigo-50 rounded-xl p-4 space-y-3">
            <h4 class="font-semibold text-indigo-900">Super League Options</h4>
            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="config.doubleRoundRobin" class="w-5 h-5 rounded text-indigo-600">
              <span>Double Round Robin (each team plays twice)</span>
            </label>
            <div class="flex items-center gap-3">
              <label class="text-sm">Top teams for playoffs:</label>
              <select v-model.number="config.topTeamsQualify" class="px-3 py-1 border rounded-lg">
                <option :value="2">2</option>
                <option :value="4">4</option>
                <option :value="6">6</option>
              </select>
            </div>
          </div>

          <div v-if="config.format === 'groups+super8'" class="bg-purple-50 rounded-xl p-4 space-y-3">
            <h4 class="font-semibold text-purple-900">Groups + Super 8 Options</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">Number of Groups</label>
                <select v-model.number="config.groupCount" class="w-full px-3 py-2 border rounded-lg mt-1">
                  <option :value="2">2 Groups</option>
                  <option :value="4">4 Groups</option>
                </select>
              </div>
              <div>
                <label class="text-sm text-gray-600">Teams per Group Qualify</label>
                <select v-model.number="config.teamsQualifyPerGroup" class="w-full px-3 py-2 border rounded-lg mt-1">
                  <option :value="2">Top 2</option>
                  <option :value="3">Top 3</option>
                  <option :value="4">Top 4</option>
                </select>
              </div>
            </div>
            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="config.carryForwardPoints" class="w-5 h-5 rounded text-purple-600">
              <span>Carry forward points to Super Round</span>
            </label>
          </div>
        </div>

        <!-- Step 2: Team Seeding -->
        <div v-if="currentStep === 1" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Team Seeding</h3>
          <p class="text-gray-600 text-sm">Drag teams to reorder seeding. Higher seeds get favorable draws.</p>
          
          <div class="bg-gray-50 rounded-xl p-4">
            <div v-for="(team, idx) in orderedTeams" :key="team._id"
                 class="flex items-center gap-4 p-3 bg-white rounded-lg mb-2 shadow-sm cursor-move hover:shadow-md transition"
                 draggable="true"
                 @dragstart="dragStart(idx)"
                 @dragover.prevent
                 @drop="drop(idx)">
              <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <div class="font-semibold">{{ team.clubName || team.name }}</div>
                <div class="text-xs text-gray-500">{{ team.district }}</div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
              </svg>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button @click="shuffleTeams" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              🔀 Shuffle
            </button>
            <button @click="resetTeamOrder" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              ↩️ Reset Order
            </button>
          </div>
        </div>

        <!-- Step 3: Schedule Configuration -->
        <div v-if="currentStep === 2" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Schedule Configuration</h3>
          
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rest Days</label>
              <select v-model.number="config.restDaysMin" class="w-full px-3 py-2 border rounded-lg">
                <option :value="0">No rest (back-to-back allowed)</option>
                <option :value="1">1 day rest</option>
                <option :value="2">2 days rest</option>
                <option :value="3">3 days rest</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Max Parallel Matches</label>
              <select v-model.number="config.maxParallelMatches" class="w-full px-3 py-2 border rounded-lg">
                <option :value="1">1 (No parallel)</option>
                <option :value="2">2 matches</option>
                <option :value="3">3 matches</option>
                <option :value="4">4 matches</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Match Time Slots</label>
            <div class="flex flex-wrap gap-2">
              <span v-for="(slot, idx) in config.timeSlots" :key="idx"
                    class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full flex items-center gap-2">
                {{ slot }}
                <button @click="removeTimeSlot(idx)" class="hover:text-red-600">×</button>
              </span>
              <input type="time" v-model="newTimeSlot" @keyup.enter="addTimeSlot"
                     class="px-3 py-1 border rounded-lg text-sm" placeholder="Add time">
              <button @click="addTimeSlot" class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">Add</button>
            </div>
          </div>
          
          <div class="space-y-3">
            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="config.prioritizeWeekends" class="w-5 h-5 rounded text-indigo-600">
              <span>Prioritize Weekend Matches</span>
            </label>
            <label class="flex items-center gap-3">
              <input type="checkbox" v-model="config.allowParallelMatches" class="w-5 h-5 rounded text-indigo-600">
              <span>Allow Parallel Matches (multiple games same time)</span>
            </label>
          </div>
        </div>

        <!-- Step 4: Cricket Rules -->
        <div v-if="currentStep === 3" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Cricket Rules Configuration</h3>
          
          <div class="space-y-4">
            <div class="bg-green-50 rounded-xl p-4">
              <h4 class="font-semibold text-green-900 mb-3">Match Rules</h4>
              <div class="space-y-3">
                <label class="flex items-center gap-3">
                  <input type="checkbox" v-model="config.superOverEnabled" class="w-5 h-5 rounded text-green-600">
                  <span>Super Over for tied matches</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" v-model="config.dlsEnabled" class="w-5 h-5 rounded text-green-600">
                  <span>DLS (Duckworth-Lewis-Stern) for rain interruptions</span>
                </label>
                <label class="flex items-center gap-3">
                  <input type="checkbox" v-model="config.freeHitOnNoBall" class="w-5 h-5 rounded text-green-600">
                  <span>Free hit on no-ball</span>
                </label>
              </div>
            </div>
            
            <div class="bg-blue-50 rounded-xl p-4">
              <h4 class="font-semibold text-blue-900 mb-3">Points System</h4>
              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="text-xs text-gray-600">Win</label>
                  <input type="number" v-model.number="config.pointsPerWin" 
                         class="w-full px-2 py-1 border rounded mt-1" min="0">
                </div>
                <div>
                  <label class="text-xs text-gray-600">Tie</label>
                  <input type="number" v-model.number="config.pointsPerTie"
                         class="w-full px-2 py-1 border rounded mt-1" min="0">
                </div>
                <div>
                  <label class="text-xs text-gray-600">No Result</label>
                  <input type="number" v-model.number="config.pointsPerNoResult"
                         class="w-full px-2 py-1 border rounded mt-1" min="0">
                </div>
                <div>
                  <label class="text-xs text-gray-600">Loss</label>
                  <input type="number" v-model.number="config.pointsPerLoss"
                         class="w-full px-2 py-1 border rounded mt-1" min="0">
                </div>
              </div>
            </div>
            
            <div class="bg-amber-50 rounded-xl p-4">
              <h4 class="font-semibold text-amber-900 mb-3">Tie-Breaker Order</h4>
              <p class="text-sm text-gray-600 mb-2">When teams are equal on points:</p>
              <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li>Net Run Rate (NRR)</li>
                <li>Head-to-Head</li>
                <li>Most Wins</li>
                <li>Lot (draw of lots)</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Step 5: Preview & Generate -->
        <div v-if="currentStep === 4" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Preview & Generate</h3>
          
          <!-- Preview Summary -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
            <h4 class="font-semibold text-gray-900 mb-4">📊 Generation Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-white rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-indigo-600">{{ previewStats.teamCount }}</div>
                <div class="text-xs text-gray-500">Teams</div>
              </div>
              <div class="bg-white rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-purple-600">{{ previewStats.matchCount }}</div>
                <div class="text-xs text-gray-500">Matches</div>
              </div>
              <div class="bg-white rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-pink-600">{{ previewStats.days }}</div>
                <div class="text-xs text-gray-500">Days</div>
              </div>
              <div class="bg-white rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-green-600">{{ selectedFormat?.label }}</div>
                <div class="text-xs text-gray-500">Format</div>
              </div>
            </div>
          </div>
          
          <!-- Warnings -->
          <div v-if="previewStats.warnings.length" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 class="font-semibold text-amber-900 mb-2">⚠️ Warnings</h4>
            <ul class="text-sm text-amber-800 space-y-1">
              <li v-for="(warning, idx) in previewStats.warnings" :key="idx">{{ warning }}</li>
            </ul>
          </div>
          
          <!-- Config Summary -->
          <div class="bg-gray-50 rounded-xl p-4">
            <h4 class="font-semibold text-gray-900 mb-3">Configuration</h4>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><span class="text-gray-500">Format:</span> {{ selectedFormat?.label }}</div>
              <div><span class="text-gray-500">Double RR:</span> {{ config.doubleRoundRobin ? 'Yes' : 'No' }}</div>
              <div><span class="text-gray-500">Rest Days:</span> {{ config.restDaysMin }} day(s)</div>
              <div><span class="text-gray-500">Super Over:</span> {{ config.superOverEnabled ? 'Enabled' : 'Disabled' }}</div>
              <div><span class="text-gray-500">DLS:</span> {{ config.dlsEnabled ? 'Enabled' : 'Disabled' }}</div>
              <div><span class="text-gray-500">Points:</span> W{{ config.pointsPerWin }}/T{{ config.pointsPerTie }}/L{{ config.pointsPerLoss }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-gray-50 border-t flex justify-between">
        <button v-if="currentStep > 0" @click="prevStep"
                class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
          ← Back
        </button>
        <div v-else></div>
        
        <button v-if="currentStep < steps.length - 1" @click="nextStep"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Next →
        </button>
        <button v-else @click="generateFixtures" :disabled="generating"
                class="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 disabled:opacity-50">
          <svg v-if="generating" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>{{ generating ? 'Generating...' : '🚀 Generate Fixtures' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import api from '../../utils/api';

const props = defineProps({
  show: Boolean,
  tournament: Object,
  teams: Array
});

const emit = defineEmits(['close', 'generated']);

const currentStep = ref(0);
const generating = ref(false);
const draggedIdx = ref(null);
const newTimeSlot = ref('');

const steps = [
  { name: 'Format' },
  { name: 'Seeding' },
  { name: 'Schedule' },
  { name: 'Rules' },
  { name: 'Generate' }
];

const formats = [
  { value: 'league', label: 'League', icon: '🏆', description: 'Round-robin, all teams play each other' },
  { value: 'knockout', label: 'Knockout', icon: '⚔️', description: 'Single elimination bracket' },
  { value: 'groups+knockouts', label: 'Groups + KO', icon: '🎯', description: 'Group stage then knockouts' },
  { value: 'super-league', label: 'Super League', icon: '🌟', description: 'IPL-style with playoffs' },
  { value: 'groups+super8', label: 'Super 8', icon: '🏅', description: 'ICC World Cup style' }
];

const config = ref({
  format: props.tournament?.format || 'league',
  doubleRoundRobin: props.tournament?.doubleRoundRobin || false,
  topTeamsQualify: 4,
  groupCount: 4,
  teamsQualifyPerGroup: 2,
  carryForwardPoints: true,
  restDaysMin: props.tournament?.restDaysMin || 1,
  maxParallelMatches: props.tournament?.maxParallelMatches || 1,
  allowParallelMatches: props.tournament?.allowParallelMatches || false,
  prioritizeWeekends: false,
  timeSlots: props.tournament?.matchTimeSlots?.length ? [...props.tournament.matchTimeSlots] : ['09:00', '14:00', '18:00'],
  superOverEnabled: true,
  dlsEnabled: true,
  freeHitOnNoBall: true,
  pointsPerWin: 2,
  pointsPerTie: 1,
  pointsPerNoResult: 1,
  pointsPerLoss: 0
});

const orderedTeams = ref([...(props.teams || [])]);

watch(() => props.teams, (newTeams) => {
  orderedTeams.value = [...(newTeams || [])];
}, { immediate: true });

// Watch for tournament changes to sync format with config
watch(() => props.tournament?.format, (newFormat) => {
  if (newFormat) {
    config.value.format = newFormat;
  }
}, { immediate: true });

// Computed to get the tournament's format details
const tournamentFormat = computed(() => {
  const format = props.tournament?.format;
  return formats.find(f => f.value === format) || null;
});

// Helper to check if a format matches the tournament's format
function isTournamentFormat(formatValue) {
  return props.tournament?.format === formatValue;
}

const selectedFormat = computed(() => formats.find(f => f.value === config.value.format));

const previewStats = computed(() => {
  const teamCount = orderedTeams.value.length;
  let matchCount = 0;
  const warnings = [];

  // Calculate matches based on format
  switch (config.value.format) {
    case 'league':
    case 'round-robin':
      matchCount = (teamCount * (teamCount - 1)) / 2;
      if (config.value.doubleRoundRobin) matchCount *= 2;
      break;
    case 'knockout':
      matchCount = teamCount - 1;
      break;
    case 'super-league':
      matchCount = teamCount * (teamCount - 1);
      matchCount += 4; // Playoffs
      break;
    case 'groups+knockouts':
    case 'groups+super8':
      const groups = config.value.groupCount;
      const perGroup = Math.ceil(teamCount / groups);
      matchCount = groups * (perGroup * (perGroup - 1)) / 2;
      if (config.value.format === 'groups+super8') matchCount += 10; // Super round + knockouts
      else matchCount += (groups * config.value.teamsQualifyPerGroup) - 1;
      break;
  }

  // Calculate days
  const start = new Date(props.tournament?.startDate);
  const end = new Date(props.tournament?.endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Warnings
  const slotsPerDay = config.value.timeSlots.length * (config.value.allowParallelMatches ? config.value.maxParallelMatches : 1);
  const capacity = days * slotsPerDay;
  
  if (matchCount > capacity) {
    warnings.push(`Need ${matchCount} matches but only ${capacity} slots available. Consider extending dates or adding more time slots.`);
  }

  if (teamCount < 4 && config.value.format === 'super-league') {
    warnings.push('Super League requires at least 4 teams for playoffs.');
  }

  return { teamCount, matchCount, days, warnings };
});

function nextStep() {
  if (currentStep.value < steps.length - 1) currentStep.value++;
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--;
}

function close() {
  emit('close');
}

function dragStart(idx) {
  draggedIdx.value = idx;
}

function drop(idx) {
  if (draggedIdx.value !== null && draggedIdx.value !== idx) {
    const item = orderedTeams.value.splice(draggedIdx.value, 1)[0];
    orderedTeams.value.splice(idx, 0, item);
  }
  draggedIdx.value = null;
}

function shuffleTeams() {
  orderedTeams.value = orderedTeams.value.sort(() => Math.random() - 0.5);
}

function resetTeamOrder() {
  orderedTeams.value = [...(props.teams || [])];
}

function addTimeSlot() {
  if (newTimeSlot.value && !config.value.timeSlots.includes(newTimeSlot.value)) {
    config.value.timeSlots.push(newTimeSlot.value);
    config.value.timeSlots.sort();
    newTimeSlot.value = '';
  }
}

function removeTimeSlot(idx) {
  config.value.timeSlots.splice(idx, 1);
}

async function generateFixtures() {
  generating.value = true;
  
  try {
    const seeds = {};
    orderedTeams.value.forEach((team, idx) => {
      seeds[team._id] = idx + 1;
    });

    const payload = {
      format: config.value.format,
      doubleRoundRobin: config.value.doubleRoundRobin,
      topTeamsQualify: config.value.topTeamsQualify,
      groupCount: config.value.groupCount,
      teamsQualifyPerGroup: config.value.teamsQualifyPerGroup,
      carryForwardPoints: config.value.carryForwardPoints,
      seeds,
      slotTimes: config.value.timeSlots,
      prioritizeWeekends: config.value.prioritizeWeekends,
      respectRoundOrder: true
    };

    const response = await api.post(
      `/admin/tournaments/${props.tournament._id}/fixtures/generate-v3`,
      payload
    );

    if (response.data.success) {
      emit('generated', response.data);
      close();
    }
  } catch (error) {
    console.error('Error generating fixtures:', error);
    alert(error.response?.data?.message || 'Failed to generate fixtures');
  } finally {
    generating.value = false;
  }
}
</script>
