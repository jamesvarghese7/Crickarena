<template>
  <div class="space-y-6">
    <!-- Rejection Modal -->
    <div v-if="showRejectModal" class="admin-modal-overlay" @click.self="closeRejectModal">
      <div class="admin-modal">
        <div class="admin-modal-header">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white">Reject Club Application</h3>
          </div>
        </div>
        <div class="admin-modal-body">
          <p class="text-slate-300 text-sm mb-3">Please provide a reason for rejecting this application:</p>
          <textarea v-model="rejectionReason" rows="4" class="admin-textarea" placeholder="Enter rejection reason (optional)..."></textarea>
        </div>
        <div class="admin-modal-footer">
          <button @click="closeRejectModal" :disabled="processingClub" class="admin-btn-ghost">Cancel</button>
          <button @click="confirmReject" :disabled="processingClub" class="admin-btn-danger">
            {{ processingClub ? 'Processing...' : 'Reject Application' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="admin-header-gradient rounded-xl p-6 md:p-8">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-semibold mb-4">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Club Management Portal
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Club Registration Center</h1>
          <p class="text-emerald-100 text-sm md:text-base">Review, approve, and manage cricket club applications</p>
        </div>
        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
          <div class="text-emerald-100 text-xs uppercase tracking-wider">Total Applications</div>
          <div class="text-3xl font-bold text-white">{{ clubRequests.length }}</div>
          <div class="text-emerald-200/70 text-xs mt-1">All time submissions</div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
            <p class="text-2xl font-bold text-amber-400 mt-1">{{ pendingCount }}</p>
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
            <p class="text-2xl font-bold text-emerald-400 mt-1">{{ approvedCount }}</p>
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
            <p class="text-2xl font-bold text-red-400 mt-1">{{ rejectedCount }}</p>
          </div>
          <div class="admin-stat-icon rejected">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
            <p class="text-2xl font-bold text-blue-400 mt-1">{{ totalClubs }}</p>
          </div>
          <div class="admin-stat-icon total">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="admin-card p-2">
      <div class="flex flex-wrap gap-2">
        <button v-for="status in ['all', 'pending', 'approved', 'rejected']" :key="status"
                @click="activeFilter = status"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2',
                  activeFilter === status
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                ]">
          <svg v-if="status === 'all'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
          <span v-else-if="status === 'pending'" class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span v-else-if="status === 'approved'" class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span v-else class="w-2 h-2 rounded-full bg-red-400"></span>
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          <span v-if="status !== 'all'" class="px-2 py-0.5 rounded-full text-xs"
                :class="activeFilter === status ? 'bg-white/20' : 'bg-slate-700'">
            {{ getCountByStatus(status) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Club Cards Grid - Modern Compact View -->
    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="club in filteredClubs" :key="club.id" 
           @click="toggleDetails(club.id)"
           class="relative group cursor-pointer">
        
        <!-- Card with Modern Styling -->
        <div class="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-5 
                    transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10
                    backdrop-blur-sm overflow-hidden">
          
          <!-- Subtle Gradient Overlay on Hover -->
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
          
          <!-- Card Content -->
          <div class="relative z-10">
            <!-- Top Row: Logo + Info -->
            <div class="flex items-start gap-4">
              <!-- Logo with Glow Effect -->
              <div class="relative">
                <div class="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-teal-600/30 flex items-center justify-center border border-slate-600 group-hover:border-emerald-500/50 transition-colors shadow-lg">
                  <img v-if="club.logoBase64" :src="club.logoBase64" alt="Logo" class="w-full h-full object-cover" @error="handleImageError">
                  <span v-else class="text-emerald-400 font-bold text-xl">{{ club.clubName?.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              
              <!-- Club Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-white group-hover:text-emerald-50 transition-colors truncate mb-1">{{ club.clubName }}</h3>
                <div class="flex items-center gap-1.5 text-slate-400 text-sm">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  <span class="truncate">{{ club.city }}, {{ club.district }}</span>
                </div>
              </div>
            </div>
            
            <!-- Divider -->
            <div class="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-4"></div>
            
            <!-- Bottom Row: Status + Date + Action -->
            <div class="flex items-center justify-between">
              <!-- Status Badge with Glow -->
              <span :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                club.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                club.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              ]">
                <span :class="[
                  'w-1.5 h-1.5 rounded-full',
                  club.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                  club.status === 'approved' ? 'bg-emerald-400' : 'bg-red-400'
                ]"></span>
                {{ club.status.charAt(0).toUpperCase() + club.status.slice(1) }}
              </span>
              
              <!-- Date + View Action -->
              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-500">{{ formatDate(club.submittedAt) }}</span>
                <div class="flex items-center gap-1 text-emerald-400 text-xs font-medium group-hover:text-emerald-300 transition-colors">
                  <span>View</span>
                  <svg class="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Corner Accent -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>


    <!-- Empty State -->
    <div v-if="filteredClubs.length === 0" class="admin-empty-state">
      <div class="admin-empty-icon">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-white mt-4">No Club Applications Found</h3>
      <p class="text-slate-400 text-sm mt-2">
        {{ activeFilter === 'all' ? 'No applications yet.' : `No ${activeFilter} applications.` }}
      </p>
    </div>

    <!-- Club Details Modal (Shown when card is clicked) -->
    <div v-if="expandedClub && selectedClubData" class="admin-modal-overlay" @click.self="closeDetails">
      <div class="admin-modal admin-modal-lg admin-scrollbar">
        <!-- Modal Header -->
        <div class="admin-modal-header flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center border border-slate-700">
              <img v-if="selectedClubData.logoBase64" :src="selectedClubData.logoBase64" alt="Logo" class="w-full h-full object-cover">
              <span v-else class="text-emerald-400 font-bold text-xl">{{ selectedClubData.clubName?.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">{{ selectedClubData.clubName }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="admin-badge" :class="selectedClubData.status">{{ selectedClubData.status }}</span>
                <span class="text-slate-400 text-sm">{{ selectedClubData.city }}, {{ selectedClubData.district }}</span>
              </div>
            </div>
          </div>
          <button @click="closeDetails" class="text-slate-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="admin-modal-body max-h-[70vh]">
          <!-- Contact Information -->
          <div class="mb-5">
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Contact Information
            </h4>
            <div class="grid md:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Email</p>
                  <p class="text-sm text-slate-200">{{ selectedClubData.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Phone</p>
                  <p class="text-sm text-slate-200">{{ selectedClubData.phone }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Club Details Grid -->
          <div class="mb-5">
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Club Details
            </h4>
            <div class="grid md:grid-cols-4 gap-3">
              <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p class="text-xs text-slate-500 uppercase tracking-wider">Manager</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5 truncate">{{ selectedClubData.managerName }}</p>
              </div>
              <div v-if="selectedClubData.foundedYear" class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p class="text-xs text-slate-500 uppercase tracking-wider">Founded</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClubData.foundedYear }}</p>
              </div>
              <div v-if="selectedClubData.memberCount" class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p class="text-xs text-slate-500 uppercase tracking-wider">Members</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5">{{ selectedClubData.memberCount }}</p>
              </div>
              <div v-if="selectedClubData.groundName" class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <p class="text-xs text-slate-500 uppercase tracking-wider">Home Ground</p>
                <p class="text-sm font-medium text-slate-200 mt-0.5 truncate">{{ selectedClubData.groundName }}</p>
              </div>
            </div>
          </div>

          <!-- Website -->
          <div v-if="selectedClubData.website" class="mb-5">
            <div class="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-blue-400">Club Website</p>
                  <a :href="selectedClubData.website" target="_blank" class="text-sm text-blue-300 hover:text-blue-200 underline">{{ selectedClubData.website }}</a>
                </div>
              </div>
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedClubData.description" class="mb-5">
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Club Description
            </h4>
            <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{{ selectedClubData.description }}</p>
            </div>
          </div>

          <!-- Achievements -->
          <div v-if="selectedClubData.achievements" class="mb-5">
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              Achievements
            </h4>
            <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{{ selectedClubData.achievements }}</p>
            </div>
          </div>

          <!-- Documents -->
          <div class="mb-5">
            <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Submitted Documents
            </h4>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-2">Club Logo</p>
                <div class="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                  <img v-if="selectedClubData.logoBase64" :src="selectedClubData.logoBase64" alt="Logo" class="w-full h-full object-cover">
                  <span v-else class="text-slate-500 text-sm">No logo</span>
                </div>
              </div>
              <div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p class="text-xs text-slate-500 mb-2">Verification Proof</p>
                <div v-if="selectedClubData.proofUrl" class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <div class="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-slate-200">Document</p>
                  </div>
                  <a :href="selectedClubData.proofUrl" target="_blank" class="admin-btn-primary text-xs px-3 py-1.5">View</a>
                </div>
                <div v-else class="flex items-center justify-center p-4 border border-dashed border-slate-600 rounded-lg">
                  <span class="text-slate-500 text-sm">No document</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Submission Info -->
          <div class="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 text-center">
            <p class="text-xs text-slate-500">
              Application submitted on <span class="text-slate-400">{{ formatDate(selectedClubData.submittedAt) }}</span>
              <span v-if="selectedClubData.processedAt" class="ml-2">
                • Processed on <span class="text-slate-400">{{ formatDate(selectedClubData.processedAt) }}</span>
              </span>
            </p>
          </div>
        </div>

        <!-- Modal Footer with Actions -->
        <div class="admin-modal-footer">
          <button @click="closeDetails" class="admin-btn-ghost">Close</button>
          <template v-if="selectedClubData.status === 'pending'">
            <button @click="rejectClub(selectedClubData.id)" :disabled="processingClub" class="admin-btn-danger">
              Reject Application
            </button>
            <button @click="approveClub(selectedClubData.id)" :disabled="processingClub" class="admin-btn-primary">
              {{ processingClub === selectedClubData.id ? 'Approving...' : 'Approve Application' }}
            </button>
          </template>
          <template v-else>
            <div class="px-4 py-2 rounded-lg text-sm font-medium"
                 :class="selectedClubData.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
              {{ selectedClubData.status === 'approved' ? '✓ Approved' : '✗ Rejected' }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { notify } from '../utils/notifications';

const clubRequests = ref([]);
const activeFilter = ref('all');
const processingClub = ref(null);
const showRejectModal = ref(false);
const rejectionReason = ref('');
const clubToReject = ref(null);
const expandedClub = ref(null);
const stats = ref({ pending: 0, approved: 0, rejected: 0, total: 0 });

const pendingCount = computed(() => stats.value.pending);
const approvedCount = computed(() => stats.value.approved);
const rejectedCount = computed(() => stats.value.rejected);
const totalClubs = computed(() => stats.value.approved);

const filteredClubs = computed(() => {
  if (activeFilter.value === 'all') return clubRequests.value;
  return clubRequests.value.filter(club => club.status === activeFilter.value);
});

const selectedClubData = computed(() => {
  if (!expandedClub.value) return null;
  return clubRequests.value.find(c => c.id === expandedClub.value);
});

function toggleDetails(clubId) {
  expandedClub.value = expandedClub.value === clubId ? null : clubId;
}

function closeDetails() {
  expandedClub.value = null;
}

function getCountByStatus(status) {
  return clubRequests.value.filter(club => club.status === status).length;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadClubRequests() {
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    const [clubsRes, statsRes] = await Promise.all([
      axios.get(`${API}/admin/clubs`),
      axios.get(`${API}/admin/stats`)
    ]);
    clubRequests.value = clubsRes.data.clubs || [];
    stats.value = statsRes.data.stats || stats.value;
  } catch (error) {
    console.error('Error loading admin data:', error);
    notify.error(error?.response?.data?.message || 'Failed to load admin data');
  }
}

async function approveClub(clubId) {
  processingClub.value = clubId;
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    await axios.put(`${API}/admin/clubs/${clubId}/approve`);
    const club = clubRequests.value.find(c => c.id === clubId);
    if (club) { club.status = 'approved'; club.processedAt = new Date().toISOString(); }
    notify.success('Club application approved!');
    await loadClubRequests();
  } catch (error) {
    console.error('Error approving club:', error);
    notify.error('Failed to approve club.');
  } finally {
    processingClub.value = null;
  }
}

function rejectClub(clubId) {
  clubToReject.value = clubId;
  rejectionReason.value = '';
  showRejectModal.value = true;
  closeDetails();
}

function closeRejectModal() {
  showRejectModal.value = false;
  clubToReject.value = null;
  rejectionReason.value = '';
}

async function confirmReject() {
  if (!clubToReject.value) return;
  processingClub.value = clubToReject.value;
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    await axios.put(`${API}/admin/clubs/${clubToReject.value}/reject`, { reason: rejectionReason.value });
    const club = clubRequests.value.find(c => c.id === clubToReject.value);
    if (club) { club.status = 'rejected'; club.processedAt = new Date().toISOString(); club.rejectionReason = rejectionReason.value || 'No reason provided'; }
    closeRejectModal();
    notify.success('Club application rejected!');
    await loadClubRequests();
  } catch (error) {
    console.error('Error rejecting club:', error);
    notify.error('Failed to reject club.');
  } finally {
    processingClub.value = null;
  }
}

function handleImageError(event) {
  event.target.style.display = 'none';
}

onMounted(() => { loadClubRequests(); });
</script>