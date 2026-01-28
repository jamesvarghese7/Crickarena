<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Coach Management</h2>
        <p class="text-slate-400">View and manage all registered coaches</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-blue-400 text-lg">{{ stats.total || 0 }}</div>
          <div class="text-slate-400 text-xs">Total</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-emerald-400 text-lg">{{ stats.active || 0 }}</div>
          <div class="text-slate-400 text-xs">Active</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-amber-400 text-lg">{{ stats.withClubs || 0 }}</div>
          <div class="text-slate-400 text-xs">In Clubs</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center cursor-pointer hover:ring-2 ring-orange-500/50" @click="activeTab = 'verification'; fetchPendingVerifications()">
          <div class="font-semibold text-orange-400 text-lg">{{ stats.pendingVerifications || 0 }}</div>
          <div class="text-slate-400 text-xs">Pending Verify</div>
        </div>
        <div class="admin-stat-card py-3 px-4 text-center">
          <div class="font-semibold text-purple-400 text-lg">{{ stats.pendingApplications || 0 }}</div>
          <div class="text-slate-400 text-xs">Club Apps</div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex space-x-2 border-b border-slate-700">
      <button
        @click="activeTab = 'coaches'"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
          activeTab === 'coaches'
            ? 'text-emerald-400 border-emerald-500'
            : 'text-slate-400 hover:text-white border-transparent'
        ]"
      >
        All Coaches
      </button>
      <button
        @click="activeTab = 'verification'; fetchPendingVerifications()"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2',
          activeTab === 'verification'
            ? 'text-orange-400 border-orange-500'
            : 'text-slate-400 hover:text-white border-transparent'
        ]"
      >
        Pending Verification
        <span v-if="stats.pendingVerifications > 0" class="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-xs">
          {{ stats.pendingVerifications }}
        </span>
      </button>
    </div>
    <!-- All Coaches Tab Content -->
    <template v-if="activeTab === 'coaches'">
    <!-- Filters -->
    <div class="admin-card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name, email..."
            class="admin-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
          <select v-model="filters.status" class="admin-select" @change="fetchCoaches">
            <option value="">Active Coaches</option>
            <option value="all">All Coaches</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">District</label>
          <input
            v-model="filters.district"
            type="text"
            placeholder="Filter by district"
            class="admin-input"
            @input="debouncedSearch"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Club</label>
          <select v-model="filters.club" class="admin-select" @change="fetchCoaches">
            <option value="">All Clubs</option>
            <option value="none">No Club</option>
            <option v-for="club in clubs" :key="club.id" :value="club.id">
              {{ club.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="admin-empty-state">
      <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      <p class="text-slate-400 mt-3">Loading coaches...</p>
    </div>

    <!-- Coaches Table -->
    <div v-else class="admin-card overflow-hidden">
      <div class="overflow-x-auto admin-scrollbar">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Coach</th>
              <th>Contact</th>
              <th>Cricket Info</th>
              <th>Club</th>
              <th>Status</th>
              <th>Registered</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="coach in coaches" :key="coach.id">
              <td>
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-9 w-9">
                    <img
                      v-if="coach.hasProfilePhoto"
                      class="h-9 w-9 rounded-full object-cover"
                      :src="`/api/admin/coaches/${coach.id}/photo`"
                      :alt="coach.fullName"
                      @error="handleImageError"
                    />
                    <div v-else class="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-slate-700 flex items-center justify-center">
                      <span class="text-xs font-medium text-indigo-400">
                        {{ getInitials(coach.fullName) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-white">{{ coach.fullName }}</div>
                    <div class="text-xs text-slate-400">{{ coach.age }} years, {{ coach.gender }}</div>
                  </div>
                </div>
              </td>
              
              <td>
                <div class="text-sm text-slate-200">{{ coach.email }}</div>
                <div class="text-xs text-slate-400">{{ coach.phone }}</div>
                <div class="text-xs text-slate-500">{{ coach.address?.district }}, {{ coach.address?.state }}</div>
              </td>
              
              <td>
                <div class="text-sm text-slate-200">{{ formatExperience(coach.coachingExperience) }}</div>
                <div class="text-xs text-slate-400">{{ coach.specializations?.join(', ') || 'None' }}</div>
                <div class="text-xs text-slate-500">{{ coach.yearsOfExperience }} years exp</div>
              </td>
              
              <td>
                <div v-if="coach.currentClub" class="text-sm">
                  <div class="font-medium text-slate-200">{{ coach.currentClub.name }}</div>
                  <div class="text-slate-400 text-xs">{{ coach.currentClub.district }}</div>
                </div>
                <div v-else class="text-sm text-slate-500">No club</div>
                <div v-if="coach.pendingApplications > 0" class="text-xs text-amber-400 mt-0.5">
                  {{ coach.pendingApplications }} pending
                </div>
              </td>
              
              <td>
                <!-- Verification Status (primary) -->
                <span 
                  class="admin-badge"
                  :class="{
                    'pending': coach.verificationStatus === 'pending' || !coach.verificationStatus,
                    'approved': coach.verificationStatus === 'verified',
                    'rejected': coach.verificationStatus === 'rejected'
                  }"
                >
                  {{ getVerificationLabel(coach.verificationStatus) }}
                </span>
                <!-- Active/Inactive (secondary) -->
                <span v-if="coach.verificationStatus === 'verified'" class="admin-badge ml-1" :class="coach.isActive ? 'approved' : 'rejected'">
                  {{ coach.isActive ? 'Active' : 'Inactive' }}
                </span>
                <div v-if="!coach.profileCompleted" class="text-xs text-amber-400 mt-1">
                  Profile incomplete
                </div>
              </td>
              
              <td class="text-sm text-slate-400">
                {{ formatDate(coach.registeredAt) }}
              </td>
              
              <td class="text-right">
                <button @click="viewCoach(coach)" class="admin-btn-ghost text-xs py-1.5 px-3">
                  View
                </button>
              </td>
            </tr>
            <tr v-if="coaches.length === 0">
              <td colspan="7" class="text-center py-8 text-slate-400">
                No coaches found matching your criteria
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-4 py-3 border-t border-slate-700/50">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
          </div>
          <div class="flex items-center gap-1">
            <button @click="prevPage" :disabled="pagination.page === 1" class="admin-btn-ghost text-xs py-1.5 px-3">
              Previous
            </button>
            <button
              v-for="pageNum in pageNumbers"
              :key="pageNum"
              @click="goToPage(pageNum)"
              :class="[
                'text-xs py-1.5 px-3 rounded-lg transition-colors',
                pageNum === pagination.page
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'admin-btn-ghost'
              ]"
            >
              {{ pageNum }}
            </button>
            <button @click="nextPage" :disabled="pagination.page === pagination.totalPages" class="admin-btn-ghost text-xs py-1.5 px-3">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </template>

    <!-- Pending Verification Tab Content -->
    <template v-if="activeTab === 'verification'">
      <!-- Verification Loading State -->
      <div v-if="verificationLoading" class="admin-empty-state">
        <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <p class="text-slate-400 mt-3">Loading pending verifications...</p>
      </div>

      <!-- Verification Queue -->
      <div v-else-if="pendingCoaches.length > 0" class="space-y-4">
        <div v-for="coach in pendingCoaches" :key="coach.id" class="admin-card p-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Coach Info -->
            <div class="flex-1">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 h-14 w-14">
                  <img
                    v-if="coach.hasProfilePhoto"
                    class="h-14 w-14 rounded-full object-cover"
                    :src="`/api/admin/coaches/${coach.id}/photo`"
                    :alt="coach.fullName"
                    @error="handleImageError"
                  />
                  <div v-else class="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-slate-700 flex items-center justify-center">
                    <span class="text-lg font-medium text-orange-400">{{ getInitials(coach.fullName) }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-white">{{ coach.fullName }}</h3>
                  <p class="text-sm text-slate-400">{{ coach.email }} • {{ coach.phone }}</p>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300">{{ formatExperience(coach.coachingExperience) }}</span>
                    <span v-for="spec in (coach.specializations || []).slice(0, 3)" :key="spec" class="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">{{ spec }}</span>
                  </div>
                </div>
              </div>

              <!-- Certifications -->
              <div v-if="coach.certifications?.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-slate-300 mb-2">Certifications</h4>
                <div class="flex flex-wrap gap-2">
                  <span v-for="cert in coach.certifications" :key="cert.name" class="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                    {{ cert.name }} ({{ cert.level }}) - {{ cert.issuingBody }}
                  </span>
                </div>
              </div>

              <!-- Documents -->
              <div v-if="coach.documents?.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-slate-300 mb-2">Uploaded Documents</h4>
                <div class="flex flex-wrap gap-2">
                  <a
                    v-for="doc in coach.documents"
                    :key="doc.id"
                    :href="`/api/admin/coaches/${coach.id}/document/${doc.id}`"
                    target="_blank"
                    class="text-xs px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded flex items-center gap-1.5 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    {{ doc.name }} ({{ doc.type }})
                  </a>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 lg:min-w-[180px]">
              <button
                @click="approveCoach(coach)"
                :disabled="processingId === coach.id"
                class="admin-btn-primary text-sm py-2 flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Approve
              </button>
              <button
                @click="openRejectModal(coach)"
                :disabled="processingId === coach.id"
                class="admin-btn-ghost text-sm py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Reject
              </button>
              <p class="text-xs text-slate-500 text-center">Registered {{ formatDate(coach.registeredAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="admin-empty-state py-12">
        <svg class="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-slate-400">No coaches pending verification</p>
        <p class="text-slate-500 text-sm">All coach profiles have been reviewed</p>
      </div>
    </template>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="admin-modal-overlay" @click.self="showRejectModal = false">
      <div class="admin-modal admin-modal-sm">
        <div class="admin-modal-header">
          <h3 class="text-lg font-semibold text-white">Reject Verification</h3>
          <button @click="showRejectModal = false" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="admin-modal-body">
          <p class="text-slate-300 mb-4">Rejecting verification for <strong class="text-white">{{ coachToReject?.fullName }}</strong></p>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Rejection Reason *</label>
            <textarea
              v-model="rejectionReason"
              rows="3"
              class="admin-input resize-none"
              placeholder="Provide a reason for rejection (e.g., missing certifications, incomplete documents...)"
            ></textarea>
          </div>
        </div>
        <div class="admin-modal-footer flex gap-3">
          <button @click="showRejectModal = false" class="admin-btn-ghost flex-1">Cancel</button>
          <button
            @click="rejectCoach"
            :disabled="!rejectionReason.trim() || processingId"
            class="admin-btn-primary flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- View Coach Modal -->
    <div v-if="showViewModal" class="admin-modal-overlay" @click.self="showViewModal = false">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <div class="admin-modal-header flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Coach Details</h3>
          <button @click="showViewModal = false" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="selectedCoach" class="admin-modal-body max-h-[70vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Personal Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-400">Full Name:</span><span class="text-slate-200">{{ selectedCoach.fullName }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Age:</span><span class="text-slate-200">{{ selectedCoach.age }} years</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Gender:</span><span class="text-slate-200">{{ selectedCoach.gender }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">DOB:</span><span class="text-slate-200">{{ formatDate(selectedCoach.dateOfBirth) }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Email:</span><span class="text-slate-200">{{ selectedCoach.email }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Phone:</span><span class="text-slate-200">{{ selectedCoach.phone }}</span></div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Address</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-400">Street:</span><span class="text-slate-200">{{ selectedCoach.address?.street }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">City:</span><span class="text-slate-200">{{ selectedCoach.address?.city }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">District:</span><span class="text-slate-200">{{ selectedCoach.address?.district }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">State:</span><span class="text-slate-200">{{ selectedCoach.address?.state }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Pincode:</span><span class="text-slate-200">{{ selectedCoach.address?.pincode }}</span></div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Coaching Information</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-400">Experience:</span><span class="text-slate-200">{{ formatExperience(selectedCoach.coachingExperience) }}</span></div>
                <div class="flex justify-between"><span class="text-slate-400">Specializations:</span><span class="text-slate-200">{{ selectedCoach.specializations?.join(', ') || 'None' }}</span></div>
                <div><span class="text-slate-400">Philosophy:</span><p class="text-slate-200 mt-1">{{ selectedCoach.coachingPhilosophy || 'Not provided' }}</p></div>
              </div>
            </div>
            
            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h4 class="text-sm font-semibold text-white mb-3">Status</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Active:</span>
                  <span :class="selectedCoach.isActive ? 'text-emerald-400' : 'text-red-400'">{{ selectedCoach.isActive ? 'Yes' : 'No' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Profile Complete:</span>
                  <span :class="selectedCoach.profileCompleted ? 'text-emerald-400' : 'text-amber-400'">{{ selectedCoach.profileCompleted ? 'Yes' : 'No' }}</span>
                </div>
                <div class="flex justify-between"><span class="text-slate-400">Registered:</span><span class="text-slate-200">{{ formatDate(selectedCoach.registeredAt) }}</span></div>
                <div v-if="selectedCoach.currentClub" class="flex justify-between"><span class="text-slate-400">Club:</span><span class="text-slate-200">{{ selectedCoach.currentClub.name }}</span></div>
              </div>
            </div>
          </div>
          
          <div v-if="selectedCoach.applications && selectedCoach.applications.length > 0" class="mt-4">
            <h4 class="text-sm font-semibold text-white mb-3">Applications</h4>
            <div class="admin-card overflow-hidden">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Processed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in selectedCoach.applications" :key="app.id">
                    <td>{{ app.club.name }}</td>
                    <td><span class="admin-badge" :class="app.status">{{ app.status }}</span></td>
                    <td>{{ formatDate(app.appliedAt) }}</td>
                    <td>{{ app.processedAt ? formatDate(app.processedAt) : 'Pending' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="admin-modal-footer">
          <button @click="showViewModal = false" class="admin-btn-ghost">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-4 right-4 z-[9999] max-w-sm"
      >
        <div
          :class="[
            'flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm',
            toast.type === 'success' 
              ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100' 
              : 'bg-red-900/90 border-red-700 text-red-100'
          ]"
        >
          <!-- Icon -->
          <div :class="[
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            toast.type === 'success' ? 'bg-emerald-500/30' : 'bg-red-500/30'
          ]">
            <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">{{ toast.title }}</p>
            <p class="text-sm opacity-90 mt-0.5">{{ toast.message }}</p>
          </div>
          <!-- Close Button -->
          <button @click="toast.show = false" class="flex-shrink-0 p-1 hover:opacity-70 transition-opacity">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../store/auth';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(false);
const coaches = ref([]);
const clubs = ref([]);
const stats = ref({ total: 0, active: 0, withClubs: 0, pendingApplications: 0, pendingVerifications: 0 });
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 });
const filters = ref({ search: '', status: '', district: '', club: '' });
const showViewModal = ref(false);
const selectedCoach = ref(null);

// Tab and Verification State
const activeTab = ref('coaches');
const verificationLoading = ref(false);
const pendingCoaches = ref([]);
const showRejectModal = ref(false);
const coachToReject = ref(null);
const rejectionReason = ref('');
const processingId = ref(null);

// Toast notification state
const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
});

const showToast = (type, title, message) => {
  toast.value = { show: true, type, title, message };
  setTimeout(() => { toast.value.show = false; }, 4000);
};

const pageNumbers = computed(() => {
  const pages = [];
  const totalPages = pagination.value.totalPages;
  const currentPage = pagination.value.page;
  
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) pages.push(1, 2, 3, 4, 5);
    else if (currentPage >= totalPages - 2) pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
  }
  return pages;
});

const fetchCoaches = async () => {
  loading.value = true;
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/admin/coaches`, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      params: { page: pagination.value.page, limit: pagination.value.limit, ...filters.value },
      withCredentials: true
    });
    coaches.value = response.data.coaches;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error fetching coaches:', error);
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/admin/coaches/stats`, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      withCredentials: true
    });
    stats.value = response.data.stats;
  } catch (error) {
    console.error('Error fetching coach stats:', error);
  }
};

const fetchClubs = async () => {
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/admin/clubs`, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      withCredentials: true
    });
    clubs.value = response.data.clubs;
  } catch (error) {
    console.error('Error fetching clubs:', error);
  }
};

const debouncedSearch = (() => {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => { pagination.value.page = 1; fetchCoaches(); }, 500);
  };
})();

const viewCoach = async (coach) => {
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/admin/coaches/${coach.id}`, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      withCredentials: true
    });
    selectedCoach.value = response.data.coach;
    showViewModal.value = true;
  } catch (error) {
    console.error('Error fetching coach details:', error);
  }
};

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

const formatExperience = (experience) => {
  if (!experience) return 'Not specified';
  return experience.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const handleImageError = (event) => { event.target.style.display = 'none'; };
const prevPage = () => { if (pagination.value.page > 1) { pagination.value.page--; fetchCoaches(); } };
const nextPage = () => { if (pagination.value.page < pagination.value.totalPages) { pagination.value.page++; fetchCoaches(); } };
const goToPage = (pageNum) => { if (pageNum !== pagination.value.page) { pagination.value.page = pageNum; fetchCoaches(); } };

// Verification Functions
const fetchPendingVerifications = async () => {
  verificationLoading.value = true;
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/admin/coaches/pending-verification`, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      withCredentials: true
    });
    pendingCoaches.value = response.data.coaches;
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
  } finally {
    verificationLoading.value = false;
  }
};

const approveCoach = async (coach) => {
  if (processingId.value) return;
  processingId.value = coach.id;
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.put(`${API}/admin/coaches/${coach.id}/verify`, {}, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      withCredentials: true
    });
    // Remove from pending list
    pendingCoaches.value = pendingCoaches.value.filter(c => c.id !== coach.id);
    // Update stats
    if (stats.value.pendingVerifications > 0) stats.value.pendingVerifications--;
    showToast('success', 'Coach Verified', `${coach.fullName} has been verified successfully!`);
  } catch (error) {
    console.error('Error approving coach:', error);
    showToast('error', 'Approval Failed', 'Failed to approve coach. Please try again.');
  } finally {
    processingId.value = null;
  }
};

const openRejectModal = (coach) => {
  coachToReject.value = coach;
  rejectionReason.value = '';
  showRejectModal.value = true;
};

const rejectCoach = async () => {
  if (!coachToReject.value || !rejectionReason.value.trim()) return;
  processingId.value = coachToReject.value.id;
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.put(`${API}/admin/coaches/${coachToReject.value.id}/reject-verification`, {
      reason: rejectionReason.value.trim()
    }, {
      headers: { ...(idTok ? { Authorization: `Bearer ${idTok}` } : {}) },
      withCredentials: true
    });
    // Remove from pending list
    pendingCoaches.value = pendingCoaches.value.filter(c => c.id !== coachToReject.value.id);
    // Update stats
    if (stats.value.pendingVerifications > 0) stats.value.pendingVerifications--;
    showRejectModal.value = false;
    showToast('success', 'Coach Rejected', `${coachToReject.value.fullName} verification has been rejected.`);
  } catch (error) {
    console.error('Error rejecting coach:', error);
    showToast('error', 'Rejection Failed', 'Failed to reject coach. Please try again.');
  } finally {
    processingId.value = null;
    coachToReject.value = null;
  }
};

// Helper function to get verification status label
const getVerificationLabel = (status) => {
  switch (status) {
    case 'verified': return 'Verified';
    case 'rejected': return 'Rejected';
    case 'pending':
    default: return 'Pending';
  }
};

onMounted(() => { fetchCoaches(); fetchStats(); fetchClubs(); });
</script>

<style scoped>
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}
.toast-leave-active {
  animation: toast-out 0.3s ease-in forwards;
}
@keyframes toast-in {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}
</style>