<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="admin-header-gradient rounded-xl p-6 md:p-8">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Club Management Center</h1>
          <p class="text-emerald-100 text-sm md:text-base">Review, approve, and manage cricket club registration applications</p>
        </div>
        <button @click="refreshClubs" 
                class="admin-btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clubs</p>
            <p class="text-2xl font-bold text-white mt-1">{{ stats.total }}</p>
            <p class="text-xs text-slate-500 mt-1">All registrations</p>
          </div>
          <div class="admin-stat-icon total">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Review</p>
            <p class="text-2xl font-bold text-amber-400 mt-1">{{ stats.pending }}</p>
            <p class="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </div>
          <div class="admin-stat-icon pending">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved</p>
            <p class="text-2xl font-bold text-emerald-400 mt-1">{{ stats.approved }}</p>
            <p class="text-xs text-slate-500 mt-1">Active clubs</p>
          </div>
          <div class="admin-stat-icon approved">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected</p>
            <p class="text-2xl font-bold text-red-400 mt-1">{{ stats.rejected }}</p>
            <p class="text-xs text-slate-500 mt-1">Declined apps</p>
          </div>
          <div class="admin-stat-icon rejected">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
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
          <select v-model="selectedStatus" @change="fetchClubs" class="admin-select w-auto min-w-32">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">District:</label>
          <select v-model="selectedDistrict" @change="fetchClubs" class="admin-select w-auto min-w-40">
            <option value="">All Districts</option>
            <option v-for="district in districts" :key="district" :value="district">{{ district }}</option>
          </select>
        </div>

        <div class="flex-1 min-w-64">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input v-model="searchQuery" @input="debounceSearch" type="text" 
                   placeholder="Search clubs by name, manager, district..."
                   class="admin-input pl-10">
          </div>
        </div>
      </div>
    </div>

    <!-- Club Cards Grid -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">
          Club Registration Applications
          <span class="text-sm font-normal text-slate-400 ml-2">({{ clubs.length }} total)</span>
        </h3>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="admin-empty-state">
        <div class="admin-animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        <p class="text-slate-400 mt-4">Loading club applications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="clubs.length === 0" class="admin-empty-state">
        <div class="admin-empty-icon">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white mt-4">No club applications found</h3>
        <p class="text-slate-400 text-sm mt-1 max-w-sm text-center">No clubs match your current filters. Try adjusting your search criteria or check back later for new applications.</p>
      </div>

      <!-- Club Cards -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div v-for="club in clubs" :key="club.id" class="admin-card overflow-hidden hover:border-slate-600 transition-all">
          <!-- Card Header -->
          <div class="p-4 border-b border-slate-700/50">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center flex-shrink-0 border border-slate-700">
                  <img v-if="club.logoData" :src="club.logoData" alt="Club Logo" 
                       class="w-full h-full object-cover" 
                       @error="($event.target.style.display='none')">
                  <img v-else-if="club.logoUrl" :src="club.logoUrl" alt="Club Logo" 
                       class="w-full h-full object-cover" 
                       @error="($event.target.style.display='none')">
                  <span v-else class="text-emerald-400 font-bold text-base">
                    {{ (club.clubName || 'C')?.charAt(0)?.toUpperCase() }}
                  </span>
                </div>
                <div class="min-w-0">
                  <h4 class="text-base font-semibold text-white truncate">{{ club.clubName }}</h4>
                  <p class="text-slate-400 text-sm truncate">{{ club.district }}<span v-if="club.city">, {{ club.city }}</span></p>
                </div>
              </div>
              <span class="admin-badge" :class="club.status">
                {{ club.status }}
              </span>
            </div>
          </div>

          <!-- Quick Info -->
          <div class="p-4">
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-slate-800/50 rounded-lg p-2.5">
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Manager</p>
                <p class="text-sm font-medium text-slate-200 truncate mt-0.5">{{ club.managerName || '—' }}</p>
              </div>
              <div class="bg-slate-800/50 rounded-lg p-2.5">
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Founded</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5">{{ club.foundedYear || '—' }}</p>
              </div>
              <div class="bg-slate-800/50 rounded-lg p-2.5">
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Members</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5">{{ club.memberCount || '—' }}</p>
              </div>
              <div class="bg-slate-800/50 rounded-lg p-2.5">
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5">{{ formatDate(club.submittedAt) }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 pt-3 border-t border-slate-700/50">
              <button v-if="club.status === 'pending'" @click="approveClub(club)"
                      class="admin-btn-primary flex-1 text-sm py-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Approve
              </button>
              <button v-if="club.status === 'pending'" @click="rejectClub(club)"
                      class="admin-btn-danger flex-1 text-sm py-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Reject
              </button>
              <button @click="viewClubDetails(club)"
                      class="admin-btn-ghost text-sm py-2 px-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="admin-modal-overlay" @click.self="showRejectModal = false">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">Reject Club Application</h3>
              <p class="text-sm text-slate-400">{{ clubToReject?.clubName }}</p>
            </div>
          </div>
        </div>
        
        <div class="admin-modal-body">
          <label class="block text-sm font-medium text-slate-300 mb-2">Reason for rejection *</label>
          <textarea v-model="rejectReason" rows="4" 
                    class="admin-textarea"
                    placeholder="Please provide a clear reason for rejection. This will be sent to the club manager."></textarea>
          <p class="text-xs text-slate-500 mt-2">Be specific about what needs to be improved or corrected.</p>
        </div>
        
        <div class="admin-modal-footer">
          <button @click="showRejectModal = false" class="admin-btn-ghost">
            Cancel
          </button>
          <button @click="confirmReject" :disabled="!rejectReason.trim()" class="admin-btn-danger">
            Reject Application
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedClub" class="admin-modal-overlay" @click.self="selectedClub = null">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <!-- Modal Header -->
        <div class="admin-header-gradient p-6 relative">
          <button @click="selectedClub = null" 
                  class="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <img v-if="selectedClub.logoData" :src="selectedClub.logoData" alt="Club Logo" 
                   class="w-full h-full object-cover" 
                   @error="($event.target.style.display='none')">
              <span v-else class="text-white font-bold text-2xl">
                {{ (selectedClub.clubName || 'C')?.charAt(0)?.toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-xl font-bold text-white">{{ selectedClub.clubName }}</h3>
                <span class="admin-badge" :class="selectedClub.status">
                  {{ selectedClub.status }}
                </span>
              </div>
              <p class="text-emerald-100 text-sm">{{ selectedClub.district }}<span v-if="selectedClub.city">, {{ selectedClub.city }}</span></p>
              <p class="text-emerald-200/70 text-xs mt-1">Submitted on {{ formatDate(selectedClub.submittedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="admin-modal-body max-h-[60vh]">
          <!-- Quick Actions -->
          <div v-if="selectedClub.status === 'pending'" class="flex items-center gap-3 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-200">Ready to make a decision?</p>
              <p class="text-xs text-slate-400">Review all information below before approving or rejecting.</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="approveClub(selectedClub)" class="admin-btn-primary text-sm">
                Approve
              </button>
              <button @click="rejectClub(selectedClub)" class="admin-btn-danger text-sm">
                Reject
              </button>
            </div>
          </div>

          <!-- Status Banner (if processed) -->
          <div v-if="selectedClub.status !== 'pending'" class="mb-6 p-4 rounded-xl border"
               :class="selectedClub.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                   :class="selectedClub.status === 'approved' ? 'bg-emerald-500/20' : 'bg-red-500/20'">
                <svg v-if="selectedClub.status === 'approved'" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium" :class="selectedClub.status === 'approved' ? 'text-emerald-300' : 'text-red-300'">
                  Application {{ selectedClub.status === 'approved' ? 'Approved' : 'Rejected' }}
                </p>
                <p class="text-sm text-slate-400">{{ selectedClub.processedAt ? 'on ' + formatDate(selectedClub.processedAt) : '' }}</p>
              </div>
            </div>
            <div v-if="selectedClub.status === 'rejected' && selectedClub.rejectionReason" class="mt-3 p-3 bg-slate-900/50 rounded-lg">
              <p class="text-sm font-medium text-slate-300 mb-1">Rejection Reason:</p>
              <p class="text-sm text-slate-400">{{ selectedClub.rejectionReason }}</p>
            </div>
          </div>

          <!-- Information Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Basic Information
              </h4>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wider">Founded Year</p>
                    <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClub.foundedYear || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 uppercase tracking-wider">Member Count</p>
                    <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClub.memberCount || '—' }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Home Ground</p>
                  <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClub.groundName || 'Not specified' }}</p>
                </div>
                <div v-if="selectedClub.website">
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Website</p>
                  <a :href="selectedClub.website" target="_blank" class="text-sm text-emerald-400 hover:text-emerald-300 break-all">{{ selectedClub.website }}</a>
                </div>
              </div>
            </div>

            <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Contact Information
              </h4>
              <div class="space-y-3">
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Manager Name</p>
                  <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClub.managerName || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
                  <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClub.phone || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p class="text-sm font-medium text-slate-200 mt-0.5 break-all">{{ selectedClub.email || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedClub.description" class="admin-card p-4 mb-4">
            <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Club Description
            </h4>
            <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{{ selectedClub.description }}</p>
          </div>

          <!-- Achievements -->
          <div v-if="selectedClub.achievements" class="admin-card p-4">
            <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              Club Achievements
            </h4>
            <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{{ selectedClub.achievements }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api.js'

const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

const clubs = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const selectedDistrict = ref('')
const searchQuery = ref('')
const districts = ref([])
const showRejectModal = ref(false)
const rejectReason = ref('')
const clubToReject = ref(null)
const selectedClub = ref(null)

let searchTimeout = null

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
    fetchClubs()
  }, 500)
}

const fetchClubs = async () => {
  loading.value = true
  try {
    let url = '/admin/clubs?'
    if (selectedStatus.value) url += `status=${selectedStatus.value}&`
    if (selectedDistrict.value) url += `district=${selectedDistrict.value}&`
    if (searchQuery.value) url += `search=${encodeURIComponent(searchQuery.value)}&`

    const response = await api.get(url)
    clubs.value = response.data.clubs

    // Update districts
    const uniqueDistricts = [...new Set(clubs.value.map(club => club.district).filter(Boolean))]
    districts.value = uniqueDistricts.sort()

  } catch (error) {
    console.error('Error fetching clubs:', error)
  } finally {
    loading.value = false
  }
}

const refreshClubs = () => {
  fetchClubs()
  fetchStats()
}

const fetchStats = async () => {
  try {
    const response = await api.get('/admin/stats')
    stats.value = response.data.stats
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const approveClub = async (club) => {
  try {
    await api.put(`/admin/clubs/${club.id}/approve`)
    club.status = 'approved'
    fetchStats()
  } catch (error) {
    console.error('Error approving club:', error)
  }
}

const rejectClub = (club) => {
  clubToReject.value = club
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!clubToReject.value || !rejectReason.value.trim()) return

  try {
    await api.put(`/admin/clubs/${clubToReject.value.id}/reject`, {
      reason: rejectReason.value
    })
    clubToReject.value.status = 'rejected'
    showRejectModal.value = false
    rejectReason.value = ''
    clubToReject.value = null
    fetchStats()
  } catch (error) {
    console.error('Error rejecting club:', error)
  }
}

const viewClubDetails = (club) => {
  selectedClub.value = club
}

onMounted(() => {
  fetchClubs()
  fetchStats()
})
</script>