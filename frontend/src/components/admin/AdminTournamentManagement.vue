<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Tournament Management</h1>
        <p class="text-slate-400 mt-1">Create, manage and oversee cricket tournaments</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="showCreateModal = true" class="admin-btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Tournament
        </button>
        <button @click="refreshTournaments" class="admin-btn-ghost">
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tournaments</p>
            <p class="text-2xl font-bold text-white mt-1">{{ tournaments.length }}</p>
          </div>
          <div class="admin-stat-icon total">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</p>
            <p class="text-2xl font-bold text-emerald-400 mt-1">{{ activeTournaments }}</p>
          </div>
          <div class="admin-stat-icon active">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming</p>
            <p class="text-2xl font-bold text-blue-400 mt-1">{{ upcomingTournaments }}</p>
          </div>
          <div class="admin-stat-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
            <p class="text-2xl font-bold text-slate-400 mt-1">{{ completedTournaments }}</p>
          </div>
          <div class="admin-stat-icon" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">Status:</label>
          <select v-model="selectedStatus" @change="filterTournaments" class="admin-select w-auto min-w-32">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">Format:</label>
          <select v-model="selectedFormat" @change="filterTournaments" class="admin-select w-auto min-w-36">
            <option value="">All Formats</option>
            <option value="league">League</option>
            <option value="knockout">Knockout</option>
            <option value="league+playoff">League + Playoff</option>
            <option value="round-robin">Round Robin</option>
          </select>
        </div>

        <div class="flex-1 min-w-64">
          <input v-model="searchQuery" @input="debounceSearch" type="text" placeholder="Search tournaments..."
                 class="admin-input">
        </div>
      </div>
    </div>

    <!-- Tournaments List -->
    <div class="admin-card overflow-hidden">
      <div class="p-5 border-b border-slate-700/50">
        <h3 class="text-base font-semibold text-white">
          Tournaments
          <span class="text-sm font-normal text-slate-400 ml-2">({{ filteredTournaments.length }} tournaments)</span>
        </h3>
      </div>

      <div class="divide-y divide-slate-700/50">
        <div v-if="loading" class="admin-empty-state">
          <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p class="text-slate-400 mt-3">Loading tournaments...</p>
        </div>

        <div v-else-if="filteredTournaments.length === 0" class="admin-empty-state">
          <div class="admin-empty-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-slate-400 mt-3">No tournaments found</p>
        </div>

        <div v-else v-for="tournament in filteredTournaments" :key="tournament._id" class="p-5 hover:bg-slate-800/30 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="min-w-0">
                  <h4 class="text-base font-semibold text-white truncate">{{ tournament.name }}</h4>
                  <p class="text-sm text-slate-400">{{ tournament.district }} • {{ tournament.format }}</p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Duration</p>
                  <p class="text-sm font-medium text-slate-300 mt-0.5">{{ formatDate(tournament.startDate) }} - {{ formatDate(tournament.endDate) }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Teams</p>
                  <p class="text-sm font-medium text-slate-300 mt-0.5">{{ tournament.participants?.length || 0 }} / {{ tournament.maxTeams }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Entry Fee</p>
                  <p class="text-sm font-medium text-slate-300 mt-0.5">₹{{ tournament.entryFee || 0 }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 flex-wrap">
                <span class="admin-badge" :class="tournament.status">
                  {{ tournament.status }}
                </span>

                <div class="flex items-center gap-2">
                  <button @click="viewTournamentDetails(tournament)" class="admin-btn-ghost text-xs py-1.5 px-3">
                    View Details
                  </button>

                  <button v-if="tournament.status === 'open'" @click="closeRegistrations(tournament)"
                          class="admin-btn-secondary text-xs py-1.5 px-3">
                    Close Reg
                  </button>

                  <button v-if="tournament.status === 'upcoming'" @click="openRegistrations(tournament)"
                          class="admin-btn-primary text-xs py-1.5 px-3">
                    Open Reg
                  </button>

                  <button v-if="tournament.status !== 'cancelled' && tournament.status !== 'completed' && tournament.format === 'groups+knockouts'"
                          @click="seedKnockout(tournament)"
                          class="admin-btn-secondary text-xs py-1.5 px-3">
                    Seed Knockout
                  </button>

                  <button v-if="tournament.status !== 'completed' && tournament.status !== 'cancelled'" @click="cancelTournament(tournament)"
                          class="admin-btn-danger text-xs py-1.5 px-3">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Tournament Modal -->
    <div v-if="showCreateModal" class="admin-modal-overlay" @click.self="showCreateModal = false">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <div class="admin-modal-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Create New Tournament</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createTournament" class="admin-modal-body max-h-[70vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Tournament Name *</label>
              <input v-model="newTournament.name" type="text" required class="admin-input">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Format *</label>
              <select v-model="newTournament.format" required class="admin-select">
                <option value="league">League</option>
                <option value="knockout">Knockout</option>
                <option value="league+playoff">League + Playoff</option>
                <option value="round-robin">Round Robin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">District *</label>
              <input v-model="newTournament.district" type="text" required class="admin-input">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Max Teams *</label>
              <input v-model.number="newTournament.maxTeams" type="number" min="2" max="128" required class="admin-input">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Start Date *</label>
              <input v-model="newTournament.startDate" type="date" required class="admin-input">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">End Date *</label>
              <input v-model="newTournament.endDate" type="date" required class="admin-input">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Registration Deadline</label>
              <input v-model="newTournament.registrationDeadline" type="date" class="admin-input">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1.5">Entry Fee (₹)</label>
              <input v-model.number="newTournament.entryFee" type="number" min="0" class="admin-input">
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea v-model="newTournament.description" rows="3" class="admin-textarea"></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Rules *</label>
            <textarea v-model="newTournament.rules" rows="4" required class="admin-textarea"></textarea>
          </div>
        </form>

        <div class="admin-modal-footer">
          <button type="button" @click="showCreateModal = false" class="admin-btn-ghost">
            Cancel
          </button>
          <button @click="createTournament" :disabled="creating" class="admin-btn-primary">
            {{ creating ? 'Creating...' : 'Create Tournament' }}
          </button>
        </div>
      </div>
    </div>

    <!-- V3 Fixture Wizard -->
    <FixtureWizard
      :show="showGenerateModal"
      :tournament="currentTournament"
      :teams="currentTournament?.participants || []"
      @close="closeGenerateModal"
      @generated="handleFixtureSuccess"
    />

    <!-- Seed Knockout Modal -->
    <SeedKnockoutModal
      v-if="showSeedKnockoutModal"
      :tournament="currentTournament"
      @close="closeSeedKnockoutModal"
      @success="handleSeedKnockoutSuccess"
    />

    <!-- Tournament Details Modal -->
    <div v-if="showDetailsModal" class="admin-modal-overlay" @click.self="showDetailsModal = false">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <div class="admin-modal-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">{{ selectedTournament?.name }}</h3>
          <button @click="showDetailsModal = false" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="selectedTournament" class="admin-modal-body max-h-[70vh]">
          <!-- Tournament Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Tournament Information</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-slate-500">Format</span>
                  <span class="text-sm text-slate-300">{{ selectedTournament.format }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-slate-500">District</span>
                  <span class="text-sm text-slate-300">{{ selectedTournament.district }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-slate-500">Duration</span>
                  <span class="text-sm text-slate-300">{{ formatDate(selectedTournament.startDate) }} - {{ formatDate(selectedTournament.endDate) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-slate-500">Max Teams</span>
                  <span class="text-sm text-slate-300">{{ selectedTournament.maxTeams }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-slate-500">Entry Fee</span>
                  <span class="text-sm text-slate-300">₹{{ selectedTournament.entryFee || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Status & Registration</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-slate-500">Status</span>
                  <span class="admin-badge" :class="selectedTournament.status">{{ selectedTournament.status }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-slate-500">Registration Deadline</span>
                  <span class="text-sm text-slate-300">{{ selectedTournament.registrationDeadline ? formatDate(selectedTournament.registrationDeadline) : 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-white mb-2">Description</h4>
            <p class="text-sm text-slate-400">{{ selectedTournament.description || 'No description provided' }}</p>
          </div>

          <!-- Rules -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-white mb-2">Rules</h4>
            <p class="text-sm text-slate-400 whitespace-pre-line">{{ selectedTournament.rules }}</p>
          </div>

          <!-- Registrations -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-white">Registrations ({{ selectedTournament.participants?.length || 0 }}/{{ selectedTournament.maxTeams }})</h4>
              <button @click="fetchRegistrations" class="text-xs text-emerald-400 hover:text-emerald-300">
                Refresh
              </button>
            </div>

            <div v-if="registrations.length === 0" class="text-center py-6 text-slate-400 text-sm">
              No registrations yet
            </div>

            <div v-else class="space-y-2 max-h-48 overflow-y-auto admin-scrollbar">
              <div v-for="reg in registrations" :key="reg._id" class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-lg flex items-center justify-center">
                    <span class="text-emerald-400 font-semibold text-xs">{{ reg.club?.name?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ reg.club?.name }}</p>
                    <p class="text-xs text-slate-500">{{ reg.club?.district }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="admin-badge" :class="reg.status">{{ reg.status }}</span>

                  <div v-if="reg.status === 'pending'" class="flex gap-1">
                    <button @click="approveRegistration(selectedTournament, reg)" class="admin-btn-primary text-xs py-1 px-2">
                      ✓
                    </button>
                    <button @click="rejectRegistration(selectedTournament, reg)" class="admin-btn-danger text-xs py-1 px-2">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
            <button v-if="selectedTournament.status === 'open'" @click="closeRegistrations(selectedTournament)"
                    class="admin-btn-secondary text-sm">
              Close Registrations
            </button>
            <button v-if="selectedTournament.status === 'upcoming' && !selectedTournament.fixturesGenerated" @click="openRegistrations(selectedTournament)"
                    class="admin-btn-primary text-sm">
              Open Registrations
            </button>
            <button v-if="selectedTournament.status === 'upcoming' && !selectedTournament.fixturesGenerated" @click="openGenerateModal(selectedTournament)"
                    class="admin-btn-secondary text-sm">
              Generate Fixtures
            </button>
            <button v-if="selectedTournament.format === 'groups+knockouts' && selectedTournament.status !== 'cancelled' && selectedTournament.status !== 'completed'"
                    @click="seedKnockout(selectedTournament)"
                    :disabled="pendingGroupCount > 0"
                    class="admin-btn-secondary text-sm">
              Seed Knockout<span v-if="pendingGroupCount>0"> (wait: {{ pendingGroupCount }} pending)</span>
            </button>
            <button v-if="selectedTournament.status !== 'completed' && selectedTournament.status !== 'cancelled'" @click="cancelTournament(selectedTournament)"
                    class="admin-btn-danger text-sm">
              Cancel Tournament
            </button>
          </div>

          <div v-if="selectedTournament.format === 'groups+knockouts'" class="mt-3 text-xs text-slate-500">
            <p>Seeding uses current group standings (Points → NRR → Wins). Ensure standings are up to date.</p>
            <p v-if="pendingGroupCount>0" class="text-red-400">There are {{ pendingGroupCount }} group matches not completed yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/api.js'
import FixtureWizard from './FixtureWizard.vue'
import SeedKnockoutModal from './SeedKnockoutModal.vue'

const tournaments = ref([])
const filteredTournaments = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedFormat = ref('')
const searchQuery = ref('')
const showCreateModal = ref(false)
const creating = ref(false)
const selectedTournament = ref(null)
const showDetailsModal = ref(false)
const registrations = ref([])

// V3 Fixture Wizard state
const showGenerateModal = ref(false)
const showSeedKnockoutModal = ref(false)
const currentTournament = ref(null)
const pendingGroupCount = ref(0)

const newTournament = ref({
  name: '',
  format: 'league',
  district: '',
  maxTeams: 16,
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  entryFee: 0,
  description: '',
  rules: ''
})

let searchTimeout = null

const activeTournaments = computed(() => {
  return tournaments.value.filter(t => t.status === 'ongoing').length
})

const upcomingTournaments = computed(() => {
  return tournaments.value.filter(t => t.status === 'upcoming' || t.status === 'open').length
})

const completedTournaments = computed(() => {
  return tournaments.value.filter(t => t.status === 'completed').length
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filterTournaments()
  }, 500)
}

const filterTournaments = () => {
  let filtered = [...tournaments.value]

  if (selectedStatus.value) {
    filtered = filtered.filter(t => t.status === selectedStatus.value)
  }

  if (selectedFormat.value) {
    filtered = filtered.filter(t => t.format === selectedFormat.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.district.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    )
  }

  filteredTournaments.value = filtered
}

const fetchTournaments = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/tournaments')
    tournaments.value = response.data
    filterTournaments()
  } catch (error) {
    console.error('Error fetching tournaments:', error)
  } finally {
    loading.value = false
  }
}

const refreshTournaments = () => {
  fetchTournaments()
}

const createTournament = async () => {
  creating.value = true
  try {
    await api.post('/admin/tournaments', newTournament.value)
    showCreateModal.value = false
    newTournament.value = {
      name: '',
      format: 'league',
      district: '',
      maxTeams: 16,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      entryFee: 0,
      description: '',
      rules: ''
    }
    fetchTournaments()
  } catch (error) {
    console.error('Error creating tournament:', error)
  } finally {
    creating.value = false
  }
}

const openGenerateModal = (t) => {
  currentTournament.value = t
  showGenerateModal.value = true
}

const closeGenerateModal = () => { 
  showGenerateModal.value = false
  currentTournament.value = null 
}

const handleFixtureSuccess = async (result) => {
  console.log('Fixture generation successful:', result)
  showGenerateModal.value = false
  currentTournament.value = null
  await fetchTournaments()
  if (selectedTournament.value) {
    const updated = tournaments.value.find(t => t._id === selectedTournament.value._id)
    if (updated) selectedTournament.value = updated
  }
}

async function seedKnockout(t){
  currentTournament.value = t
  showSeedKnockoutModal.value = true
}

const closeSeedKnockoutModal = () => {
  showSeedKnockoutModal.value = false
  currentTournament.value = null
}

const handleSeedKnockoutSuccess = async (result) => {
  console.log('Knockout seeded successfully:', result)
  showSeedKnockoutModal.value = false
  currentTournament.value = null
  await fetchTournaments()
  if (selectedTournament.value) {
    const updated = tournaments.value.find(t => t._id === selectedTournament.value._id)
    if (updated) selectedTournament.value = updated
  }
}

async function fetchPendingGroups(){
  try{
    const { data } = await api.get(`/admin/tournaments/${selectedTournament.value._id}/group-matches/pending`)
    pendingGroupCount.value = Number(data?.pending)||0
  } catch(e){
    pendingGroupCount.value = 0
  }
}

const viewTournamentDetails = async (tournament) => {
  selectedTournament.value = tournament
  await fetchRegistrations()
  await fetchPendingGroups()
  showDetailsModal.value = true
}

const fetchRegistrations = async () => {
  if (!selectedTournament.value) return

  try {
    const response = await api.get(`/admin/tournaments/${selectedTournament.value._id}/registrations`)
    registrations.value = response.data || []
  } catch (error) {
    console.error('Error fetching registrations:', error)
    registrations.value = []
  }
}

const approveRegistration = async (tournament, registration) => {
  try {
    await api.put(`/admin/tournaments/${tournament._id}/registrations/${registration._id}/approve`)
    registration.status = 'approved'
    await fetchTournaments()
  } catch (error) {
    console.error('Error approving registration:', error)
  }
}

const rejectRegistration = async (tournament, registration) => {
  try {
    await api.put(`/admin/tournaments/${tournament._id}/registrations/${registration._id}/reject`)
    registration.status = 'rejected'
    await fetchTournaments()
  } catch (error) {
    console.error('Error rejecting registration:', error)
  }
}

const openRegistrations = async (tournament) => {
  try {
    await api.put(`/admin/tournaments/${tournament._id}/open-registrations`)
    tournament.status = 'open'
  } catch (error) {
    console.error('Error opening registrations:', error)
  }
}

const closeRegistrations = async (tournament) => {
  try {
    await api.put(`/admin/tournaments/${tournament._id}/close-registrations`)
    tournament.status = 'upcoming'
  } catch (error) {
    console.error('Error closing registrations:', error)
  }
}

const cancelTournament = async (tournament) => {
  if (!confirm('Are you sure you want to cancel this tournament?')) return

  try {
    await api.put(`/admin/tournaments/${tournament._id}/cancel`)
    tournament.status = 'cancelled'
  } catch (error) {
    console.error('Error cancelling tournament:', error)
  }
}

onMounted(() => {
  fetchTournaments()
})
</script>