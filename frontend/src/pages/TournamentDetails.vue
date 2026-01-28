<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Dynamic Field Grid Background Animation -->
    <div class="absolute inset-0 -z-10 overflow-hidden hidden">
      <!-- Hidden - using global stadium background instead -->
    </div>
    
    <!-- Loading / Not Found -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p class="text-gray-300 font-medium">Loading tournament...</p>
      </div>
    </div>
    
    <div v-else-if="!tournament" class="flex items-center justify-center min-h-screen">
      <div class="text-center glass-panel rounded-2xl p-8 border border-white/20">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-rose-500/20 flex items-center justify-center">
          <svg class="w-12 h-12 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">Tournament not found</h3>
        <p class="text-gray-400">The tournament you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <div class="relative overflow-hidden">
        <!-- Background with banner -->
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-emerald-900/80 to-slate-900/90 backdrop-blur-sm">
          <div v-if="tournament.bannerUrl" class="absolute inset-0 opacity-30">
            <img :src="tournament.bannerUrl" alt="Banner" class="w-full h-full object-cover" />
          </div>
        </div>
        
        <!-- Hero Content -->
        <div class="relative px-4 sm:px-6 lg:px-8 py-4">
          <div class="max-w-6xl mx-auto">
            <!-- Tournament Header -->
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div class="flex-1">
                <!-- Status and Format Badges -->
                <div class="flex flex-wrap items-center gap-2 mb-1.5">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass(tournament.status)"></span>
                    {{ tournament.status }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    {{ prettyFormat }}
                  </span>
                  <span v-if="tournament.matchFormat" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    {{ tournament.matchFormat }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm">
                    {{ fmtDate(tournament.startDate) }} - {{ fmtDate(tournament.endDate) }}
                  </span>
                </div>
                
                <!-- Tournament Title -->
                <h1 class="text-lg lg:text-xl font-bold tracking-tight text-white mb-1.5">
                  {{ tournament.name }}
                </h1>
                
                <!-- Tournament Info -->
                <div class="flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <div v-if="tournament.district" class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                    </svg>
                    <span class="font-medium">{{ tournament.district }}</span>
              </div>
                  <div v-if="venueCount" class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span>{{ venueCount }} venues</span>
                  </div>
                  <div v-if="participants.length" class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>{{ participants.length }} teams</span>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- User Actions -->
                <button @click="toggleFavorite" 
                        class="group relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200">
                  <span v-if="isFav" class="text-yellow-400 text-base">★</span>
                  <span v-else class="text-white/70 text-base">☆</span>
                </button>
                
                <button @click="share" 
                        class="group relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                </button>
                
                <!-- Admin Actions -->
                <div v-if="isAdmin" class="flex flex-wrap items-center gap-1.5">
                  <button @click="syncStatuses" :disabled="syncing"
                          class="px-2.5 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors disabled:opacity-60">
                    {{ syncing ? 'Syncing…' : 'Sync' }}
                  </button>
                  <button v-if="!tournament.fixturesGenerated && tournament.status === 'open'" 
                          @click="closeRegs" 
                          class="px-2.5 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600 transition-colors">
                    Close Reg
                  </button>
                  
                  <button v-if="!tournament.fixturesGenerated && tournament.status !== 'open' && !['cancelled','completed'].includes(tournament.status)" 
                          @click="openRegs" 
                          class="px-2.5 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                    Open Reg
                  </button>
                  
                  <button v-if="!tournament.fixturesGenerated && tournament.status === 'upcoming'" 
                          @click="openGenerateModal" 
                          class="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Generate
                  </button>
                  
                  <button v-if="tournament.fixturesGenerated" 
                          @click="openDeleteFixturesModal" 
                          class="px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                    Delete
                  </button>
                  
                  <button @click="beginEdit" 
                          class="px-2.5 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs font-medium hover:bg-white/30 transition-colors">
                    Edit
                  </button>
                  
                  <button @click="cancelTournament" 
                          class="px-2.5 py-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-lg text-xs font-medium hover:bg-red-500 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Key Metrics -->
            <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/20 hover:bg-white/20 transition-all duration-200">
                <div class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
              </div>
                  <div class="text-xs text-white/70 font-medium">Matches</div>
              </div>
                <div class="text-2xl font-bold text-white">{{ matches.length }}</div>
              </div>
              
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/20 hover:bg-white/20 transition-all duration-200">
                <div class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
              </div>
                  <div class="text-xs text-white/70 font-medium">Teams</div>
            </div>
                <div class="text-2xl font-bold text-white">{{ participants.length }}</div>
          </div>
              
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/20 hover:bg-white/20 transition-all duration-200">
                <div class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div class="text-xs text-white/70 font-medium">Venues</div>
                </div>
                <div class="text-2xl font-bold text-white">{{ venueCount }}</div>
        </div>

              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 ring-1 ring-white/20 hover:bg-white/20 transition-all duration-200">
                <div class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="text-xs text-white/70 font-medium">Duration</div>
                </div>
                <div class="text-2xl font-bold text-white">{{ durationDays }} days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-4 sm:px-6 lg:px-8 py-8">
        <!-- Navigation Tabs -->
        <div class="glass-panel rounded-2xl border border-white/20 overflow-hidden">
          <div class="border-b border-white/10">
            <nav class="flex flex-wrap gap-1 p-2">
              <button @click="activeTab = 'overview'" 
                      :class="tabClass('overview')" 
                      class="group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  <span>Overview</span>
                </div>
              </button>
              
              <button @click="activeTab = 'fixtures'" 
                      :class="tabClass('fixtures')" 
                      class="group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>Fixtures</span>
                  <span v-if="matches.length" class="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">{{ matches.length }}</span>
                </div>
              </button>
              
              <button v-if="showTable" @click="activeTab = 'table'" 
                      :class="tabClass('table')" 
                      class="group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                  <span>Standings</span>
                </div>
              </button>
              
              <button @click="activeTab = 'participants'" 
                      :class="tabClass('participants')" 
                      class="group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>Participants</span>
                  <span v-if="participants.length" class="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">{{ participants.length }}</span>
                </div>
              </button>
              
              <button v-if="hasBracket" @click="activeTab = 'bracket'" 
                      :class="tabClass('bracket')" 
                      class="group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>Bracket</span>
                </div>
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
          <!-- OVERVIEW TAB -->
            <div v-if="activeTab === 'overview'" class="space-y-8">
              <div class="grid lg:grid-cols-3 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-8">
                  <!-- About Section -->
                  <div v-if="tournament.description" class="glass-card rounded-2xl p-6 border border-white/20">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                </div>
                      <h3 class="text-xl font-bold text-white">About This Tournament</h3>
                    </div>
                    <p class="text-gray-300 leading-relaxed">{{ tournament.description }}</p>
                  </div>

                  <!-- Rules Section -->
                  <div v-if="tournament.rules" class="glass-card rounded-2xl p-6 border border-white/20">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <h3 class="text-xl font-bold text-white">Rules & Regulations</h3>
                    </div>
                    <div class="prose prose-invert max-w-none">
                  <p class="whitespace-pre-line text-gray-300">{{ tournament.rules }}</p>
                </div>
                  </div>

                  <!-- Venues Section -->
                  <div v-if="Array.isArray(tournament.venues) && tournament.venues.length" class="glass-card rounded-2xl p-6 border border-white/20">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                </div>
                      <h3 class="text-xl font-bold text-white">Venues</h3>
                      </div>
                    <div class="flex flex-wrap gap-3">
                      <span v-for="v in tournament.venues" :key="v" class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        {{ v }}
                      </span>
                        </div>
                  </div>

                  <!-- Live Matches Section -->
                  <div class="glass-card rounded-2xl p-6 border border-white/20">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <h3 class="text-xl font-bold text-white">Live Matches</h3>
                      <span v-if="liveMatches.length" class="px-3 py-1 bg-rose-500/20 text-rose-400 text-sm font-semibold rounded-full border border-rose-500/30">
                        {{ liveMatches.length }} Live
                      </span>
                    </div>
                    
                    <div v-if="liveMatches.length === 0" class="text-center py-8">
                      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <p class="text-gray-400 font-medium">No matches live at the moment</p>
                    </div>
                    
                    <div v-else class="grid md:grid-cols-2 gap-4">
                      <div v-for="m in liveMatches" :key="m._id" 
                           class="group bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer" 
                           @click="$router.push({ name: 'match-details', params: { id: route.params.id, matchId: m._id } })">
                        <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-rose-500 rounded-full"></div>
                            <span class="text-sm font-bold text-rose-400">LIVE</span>
                        </div>
                          <div class="text-sm text-gray-400">{{ m.venue || 'TBA' }}</div>
                      </div>
                        
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <img v-if="m.homeClub?.logoUrl" :src="m.homeClub.logoUrl" class="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
                            <div v-else class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <span class="text-xs font-bold text-gray-300">{{ clubName(m.homeClub).charAt(0) }}</span>
                    </div>
                            <span class="font-semibold text-white">{{ clubName(m.homeClub) }}</span>
                  </div>
                          
                          <span class="text-gray-500 font-bold">VS</span>
                          
                          <div class="flex items-center gap-3">
                            <span class="font-semibold text-white">{{ clubName(m.awayClub) }}</span>
                            <img v-if="m.awayClub?.logoUrl" :src="m.awayClub.logoUrl" class="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
                            <div v-else class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <span class="text-xs font-bold text-gray-300">{{ clubName(m.awayClub).charAt(0) }}</span>
                </div>
              </div>
                </div>
                    </div>
                  </div>
                </div>
              </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                  <!-- Quick Stats -->
                  <div class="glass-card rounded-2xl p-6 border border-white/20">
                    <h3 class="text-lg font-bold text-white mb-4">Quick Stats</h3>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Total Matches</span>
                        <span class="font-bold text-emerald-400">{{ matches.length }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Participating Teams</span>
                        <span class="font-bold text-emerald-400">{{ participants.length }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Entry Fee</span>
                        <span class="font-bold text-emerald-400">₹{{ tournament.entryFee || 0 }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Prize Pool</span>
                        <span class="font-bold text-emerald-400">₹{{ tournament.prizePool || 0 }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Max Teams</span>
                        <span class="font-bold text-emerald-400">{{ tournament.maxTeams }}</span>
                      </div>
                      <div v-if="tournament.matchFormat" class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Match Format</span>
                        <span class="font-bold text-emerald-400">{{ tournament.matchFormat }} ({{ tournament.oversLimit || 20 }} overs)</span>
                      </div>
                      <div v-if="tournament.restDaysMin !== undefined" class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Minimum Rest Days</span>
                        <span class="font-bold text-emerald-400">{{ tournament.restDaysMin }}</span>
                      </div>
                    </div>
                    <div v-if="isClubManager && Number(tournament.entryFee) > 0" class="mt-4">
                      <!-- Show "Paid" button if payment is completed -->
                      <button v-if="clubPaymentStatus === 'paid' && clubPaymentVerified"
                              disabled
                              class="w-full px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold cursor-not-allowed">
                        ✓ Paid
                      </button>
                      <!-- Show "Pay Entry Fee" button if not paid -->
                      <button v-else @click="payEntryFee" :disabled="payLoading"
                              class="w-full px-4 py-2 rounded-lg text-white font-semibold"
                              :class="payLoading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'">
                        {{ payLoading ? 'Processing Payment...' : `Pay Entry Fee (₹${Number(tournament.entryFee).toFixed(0)})` }}
                      </button>
                    </div>
                  </div>

                  <!-- Quick Standings Preview -->
                  <div v-if="showTable" class="glass-card rounded-2xl p-6 border border-white/20">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-lg font-bold text-white">Standings</h3>
                      <button class="text-sm text-emerald-400 hover:text-emerald-300 font-semibold" @click="activeTab='table'">
                        View All →
                      </button>
                    </div>
                    
                    <div v-if="standingsSorted.length === 0" class="text-center py-4">
                      <p class="text-sm text-gray-400">No standings yet</p>
                    </div>
                    
                    <div v-else class="space-y-3">
                      <div v-for="(row, idx) in standingsSorted.slice(0, 5)" :key="row.teamId" 
                           class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div class="flex items-center gap-3">
                          <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                            {{ idx + 1 }}
                          </div>
                          <span class="font-semibold text-white">{{ row.teamName }}</span>
                        </div>
                        <div class="text-sm font-bold text-emerald-400">{{ row.points }} pts</div>
                      </div>
                    </div>
                  </div>

                  <!-- Sponsors Section -->
                  <div v-if="tournamentSponsors.length > 0" class="glass-card rounded-2xl p-6 border border-white/20">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <h3 class="text-lg font-bold text-white">Sponsors</h3>
                    </div>
                    <div class="space-y-3">
                      <div v-for="sponsor in tournamentSponsors.slice(0, 5)" :key="sponsor._id" 
                           class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <div class="w-10 h-10 rounded-lg overflow-hidden bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <img v-if="sponsor.logoUrl" :src="getSponsorLogoUrl(sponsor.logoUrl)" 
                               :alt="sponsor.companyName" class="w-full h-full object-cover" />
                          <span v-else class="text-amber-400 font-bold">{{ sponsor.companyName?.charAt(0) }}</span>
                        </div>
                        <div class="min-w-0">
                          <div class="font-semibold text-white text-sm truncate">{{ sponsor.companyName }}</div>
                          <div class="text-xs text-amber-400">{{ sponsor.tier || 'Sponsor' }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Sponsors Section -->
                  <div v-if="tournamentSponsors.length > 0" class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <h3 class="text-lg font-bold text-gray-900">Sponsors</h3>
                    </div>
                    <div class="space-y-3">
                      <div v-for="sponsor in tournamentSponsors.slice(0, 5)" :key="sponsor._id" 
                           class="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                        <div class="w-10 h-10 rounded-lg overflow-hidden bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <img v-if="sponsor.logoUrl" :src="getSponsorLogoUrl(sponsor.logoUrl)" 
                               :alt="sponsor.companyName" class="w-full h-full object-cover" />
                          <span v-else class="text-amber-600 font-bold">{{ sponsor.companyName?.charAt(0) }}</span>
                        </div>
                        <div class="min-w-0">
                          <div class="font-semibold text-gray-900 text-sm truncate">{{ sponsor.companyName }}</div>
                          <div class="text-xs text-amber-600">{{ sponsor.tier || 'Sponsor' }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <!-- FIXTURES TAB -->
          <div v-if="activeTab === 'fixtures'" id="fixtures" class="p-6">
            <!-- Enhanced Filters -->
            <div class="glass-card rounded-2xl p-6 mb-8 border border-white/20">
              <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <div class="flex-1">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input v-model.trim="searchTerm" 
                           type="text" 
                           placeholder="Search teams, venues, or matches..." 
                           class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <select v-model="statusFilter" class="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                    <option value="all" class="bg-slate-800">All Status</option>
                <option value="Scheduled" class="bg-slate-800">Scheduled</option>
                <option value="Live" class="bg-slate-800">Live</option>
                <option value="Completed" class="bg-slate-800">Completed</option>
                <option value="Cancelled" class="bg-slate-800">Cancelled</option>
              </select>
                  <select v-model="timeFilter" class="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                <option value="upcoming" class="bg-slate-800">Upcoming</option>
                <option value="past" class="bg-slate-800">Past</option>
                    <option value="all" class="bg-slate-800">All Time</option>
              </select>
                </div>
              </div>
            </div>

            <!-- No Fixtures State -->
            <div v-if="fixturesGrouped.length === 0" class="text-center py-16">
              <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                </div>
              <h3 class="text-xl font-semibold text-white mb-2">No fixtures found</h3>
              <p class="text-gray-400">Try adjusting your filters or check back later for updates.</p>
                      </div>

            <!-- Fixtures List -->
            <div v-else class="space-y-8">
              <div v-for="group in fixturesGrouped" :key="group.dateKey" class="glass-card rounded-2xl border border-white/20 overflow-hidden">
                <!-- Date Header -->
                <div class="bg-gradient-to-r from-emerald-600/80 to-teal-600/80 px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                        </div>
                    <div>
                      <h3 class="text-lg font-bold text-white">{{ group.label }}</h3>
                      <p class="text-emerald-100 text-sm">{{ group.items.length }} matches</p>
                      </div>
                    </div>
                      </div>

                <!-- Matches Grid -->
                <div class="p-6">
                  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div v-for="fx in group.items" :key="fx._id" 
                         class="group relative glass-card rounded-2xl border border-white/20 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
                         @click="!isAdmin ? viewMatchDetails(fx) : null">
                      
                      <!-- Status Badge -->
                      <div class="absolute top-4 right-4 z-10">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" :class="statusPillClass(fx.status)">
                          {{ fx.status || 'Scheduled' }}
                        </span>
                      </div>

                      <!-- Round Badge -->
                      <div class="absolute top-4 left-4 z-10">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                          {{ fx.round || fx.stage || 'Fixture' }}
                        </span>
                    </div>

                      <!-- Main Content -->
                      <div class="p-6 pt-16">

                        <!-- Teams Section -->
                        <div class="text-center mb-6">
                          <div class="flex items-center justify-center gap-6 mb-4">
                            <!-- Home Team -->
                            <div class="flex flex-col items-center">
                              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-3 border-2 border-green-200 group-hover:scale-110 transition-transform duration-300">
                                <img v-if="fx.homeClub?.logoUrl" 
                                     :src="fx.homeClub.logoUrl" 
                                     class="w-12 h-12 rounded-xl object-cover object-center"
                                     :alt="clubName(fx.homeClub)"
                                     @error="$event.target.style.display='none'" />
                                <div v-if="!fx.homeClub?.logoUrl" class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                  {{ clubName(fx.homeClub)?.charAt(0) }}
                      </div>
                              </div>
                              <div class="text-center">
                                <div class="font-bold text-gray-900 text-sm mb-1">{{ clubName(fx.homeClub) }}</div>
                                <div class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Home</div>
                              </div>
                            </div>

                            <!-- VS Section -->
                            <div class="flex flex-col items-center">
                              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-2">
                                <span class="text-sm font-bold text-gray-600">VS</span>
                              </div>
                            </div>

                            <!-- Away Team -->
                            <div class="flex flex-col items-center">
                              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3 border-2 border-blue-200 group-hover:scale-110 transition-transform duration-300">
                                <img v-if="fx.awayClub?.logoUrl" 
                                     :src="fx.awayClub.logoUrl" 
                                     class="w-12 h-12 rounded-xl object-cover object-center"
                                     :alt="clubName(fx.awayClub)"
                                     @error="$event.target.style.display='none'" />
                                <div v-if="!fx.awayClub?.logoUrl" class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                  {{ clubName(fx.awayClub)?.charAt(0) }}
                                </div>
                              </div>
                              <div class="text-center">
                                <div class="font-bold text-gray-900 text-sm mb-1">{{ clubName(fx.awayClub) }}</div>
                                <div class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Away</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Match Result (for Completed matches) -->
                        <div v-if="fx.status === 'Completed' && (fx.result || fx.innings?.length)" class="mb-4">
                          <div class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                            <!-- Score Display -->
                            <div v-if="fx.innings && fx.innings.length > 0" class="flex items-center justify-between mb-3">
                              <div class="text-center flex-1">
                                <p class="text-xs text-gray-500 font-medium mb-1">{{ getInningsTeamName(fx, 0) }}</p>
                                <p class="text-xl font-bold text-gray-900">{{ getInningsScore(fx, 0) }}</p>
                              </div>
                              <div class="text-gray-400 font-bold text-sm">vs</div>
                              <div class="text-center flex-1">
                                <p class="text-xs text-gray-500 font-medium mb-1">{{ getInningsTeamName(fx, 1) }}</p>
                                <p class="text-xl font-bold text-gray-900">{{ getInningsScore(fx, 1) }}</p>
                              </div>
                            </div>
                            
                            <!-- Result Summary -->
                            <div class="flex items-center justify-center gap-2">
                              <div class="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
                                </svg>
                              </div>
                              <p class="text-sm font-semibold text-amber-800">
                                {{ getResultSummary(fx) }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Match Details -->
                        <div class="space-y-3 mb-6">
                          <!-- Date & Time -->
                          <div class="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                            <div class="text-center">
                              <div class="font-semibold text-gray-900 text-sm">
                        <span v-if="fx.date">{{ fmtDate(fx.date) }}</span>
                      </div>
                              <div v-if="fx.time" class="text-xs text-gray-600">{{ fx.time }}</div>
                    </div>
                  </div>
                          
                          <!-- Venue -->
                          <div v-if="fx.venue" class="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              </svg>
                            </div>
                            <div class="text-center">
                              <div class="font-semibold text-gray-900 text-sm">{{ fx.venue }}</div>
                              <div class="text-xs text-gray-600">Match Venue</div>
                            </div>
                          </div>
                          
                          <!-- Match Format -->
                          <div v-if="tournament.matchFormat" class="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                              </svg>
                            </div>
                            <div class="text-center">
                              <div class="font-semibold text-gray-900 text-sm">{{ tournament.matchFormat }}</div>
                              <div class="text-xs text-gray-600">{{ tournament.oversLimit || 20 }} overs</div>
                            </div>
                          </div>
                        </div>

                        <!-- Admin Actions -->
                        <div v-if="isAdmin" class="flex gap-2">
                          <button class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all duration-300" @click.stop="viewMatchDetails(fx)">
                            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            View
                          </button>
                          <button class="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-all duration-300" @click.stop="openFixtureEditor(fx)">
                            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Edit
                          </button>
                          <button class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-all duration-300" @click.stop="$router.push({ name: 'admin-match-editor', params: { id: route.params.id, matchId: fx._id } })">
                            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Admin
                          </button>
                        </div>
                      </div>

                      <!-- Hover Effect -->
                      <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Fixture Editor Modal -->
            <div v-if="editFxOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <!-- Header -->
                <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-white">Edit Fixture</h3>
                        <p class="text-indigo-100 text-sm">{{ editFxForm.matchCode || 'Match' }} • {{ editFxForm.stage || 'League' }}</p>
                      </div>
                    </div>
                    <button @click="closeFixtureEditor" class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                  <!-- Teams Section -->
                  <div class="space-y-4">
                    <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span class="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">1</span>
                      Teams
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">🏠 Home Team</label>
                        <select v-model="editFxForm.homeClub" class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                          <option value="">Select home team</option>
                          <option v-for="t in participantOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">🏕️ Away Team</label>
                        <select v-model="editFxForm.awayClub" class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                          <option value="">Select away team</option>
                          <option v-for="t in participantOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                        </select>
                      </div>
                    </div>
                    <!-- Same team warning -->
                    <div v-if="editFxForm.homeClub && editFxForm.homeClub === editFxForm.awayClub" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      ⚠️ Home and away teams cannot be the same
                    </div>
                  </div>

                  <!-- Schedule Section -->
                  <div class="space-y-4">
                    <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">2</span>
                      Schedule
                    </h4>
                    
                    <!-- Tournament date range info -->
                    <div v-if="tournament?.startDate && tournament?.endDate" class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="text-blue-800 font-medium">Tournament:</span>
                        <span class="text-blue-700">{{ formatDate(tournament.startDate) }} → {{ formatDate(tournament.endDate) }}</span>
                        <span class="text-blue-500">({{ tournamentDurationDays }} days)</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                        <input 
                          v-model="editFxForm.date" 
                          type="date" 
                          :min="tournamentStartDateISO" 
                          :max="tournamentEndDateISO"
                          class="w-full px-4 py-2.5 border-2 rounded-xl transition-all"
                          :class="isDateOutOfRange ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'"
                        />
                        <p v-if="isDateOutOfRange" class="text-xs text-red-600 mt-1">Outside tournament dates</p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">⏰ Time Slot</label>
                        <div class="flex flex-wrap gap-2">
                          <button 
                            v-for="slot in computedTimeSlots" 
                            :key="slot"
                            @click="editFxForm.time = slot"
                            class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                            :class="editFxForm.time === slot 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                          >
                            {{ slot }}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">🏟️ Venue</label>
                        <select v-model="editFxForm.venue" class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                          <option value="">Select venue</option>
                          <option v-for="v in venueOptions" :key="v" :value="v">{{ v }}</option>
                        </select>
                      </div>
                    </div>

                    <!-- Scheduling Warnings -->
                    <div v-if="scheduleWarnings.length > 0" class="space-y-2">
                      <div v-for="(warning, idx) in scheduleWarnings" :key="idx" 
                           class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex items-start gap-2">
                        <svg class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <span class="text-amber-800">{{ warning }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Match Info Section (Display Only) -->
                  <div class="space-y-4">
                    <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">3</span>
                      Match Info
                      <span class="text-xs text-gray-400 font-normal">(read only)</span>
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Round</label>
                        <div class="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-700">
                          {{ editFxForm.round || 'Not set' }}
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Stage</label>
                        <div class="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-700 capitalize">
                          {{ editFxForm.stage ? editFxForm.stage.replace('-', ' ') : 'Not set' }}
                        </div>
                      </div>
                      <!-- Group - Only show and allow editing for group tournaments -->
                      <div v-if="hasGroups">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Group</label>
                        <select v-model="editFxForm.group" class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all">
                          <option value="">No Group</option>
                          <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
                        </select>
                      </div>
                      <div v-else>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Group</label>
                        <div class="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-400">
                          N/A
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-500 mb-1">Match Code</label>
                        <div class="px-4 py-2.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-700">
                          {{ editFxForm.matchCode || 'Not set' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Cricket Rules Section -->
                  <div class="space-y-4">
                    <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs">4</span>
                      Cricket Rules
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Match Format</label>
                        <select v-model="editFxForm.matchFormat" @change="onMatchFormatChange" class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all">
                          <option value="T20">T20</option>
                          <option value="ODI">ODI</option>
                          <option value="T10">T10</option>
                          <option value="Test">Test</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Overs</label>
                        <input 
                          v-model.number="editFxForm.oversLimit" 
                          type="number" 
                          min="1" max="100"
                          class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <!-- Rule Toggles -->
                    <div class="flex flex-wrap gap-3">
                      <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all"
                             :class="editFxForm.dlsEnabled ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'">
                        <input type="checkbox" v-model="editFxForm.dlsEnabled" class="w-4 h-4 text-green-600 rounded">
                        <span class="text-sm font-medium">🌧️ DLS Method</span>
                      </label>
                      <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all"
                             :class="editFxForm.superOverEnabled ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'">
                        <input type="checkbox" v-model="editFxForm.superOverEnabled" class="w-4 h-4 text-green-600 rounded">
                        <span class="text-sm font-medium">⚡ Super Over</span>
                      </label>
                      <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all"
                             :class="editFxForm.freeHitOnNoBall ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'">
                        <input type="checkbox" v-model="editFxForm.freeHitOnNoBall" class="w-4 h-4 text-green-600 rounded">
                        <span class="text-sm font-medium">🎯 Free Hit</span>
                      </label>
                      <label class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all"
                             :class="editFxForm.hasReserveDay ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                        <input type="checkbox" v-model="editFxForm.hasReserveDay" class="w-4 h-4 text-blue-600 rounded">
                        <span class="text-sm font-medium">📅 Reserve Day</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                  <div v-if="scheduleWarnings.length > 0" class="text-sm text-amber-600">
                    ⚠️ {{ scheduleWarnings.length }} warning(s)
                  </div>
                  <div v-else></div>
                  <div class="flex gap-3">
                    <button @click="closeFixtureEditor" 
                            class="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition">
                      Cancel
                    </button>
                    <button @click="saveFixtureEdit" 
                            :disabled="savingEditFx || (editFxForm.homeClub && editFxForm.homeClub === editFxForm.awayClub)"
                            class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg transition disabled:opacity-50">
                      <span v-if="savingEditFx" class="flex items-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Saving...
                      </span>
                      <span v-else>💾 Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLE TAB -->
          <div v-if="activeTab === 'table'" class="p-4 md:p-6">
            <template v-if="groupKeys.length > 1">
              <div class="grid grid-cols-1 gap-6">
                <div v-for="g in groupKeys" :key="g" class="rounded-2xl border border-white/20 overflow-hidden glass-card">
                  <div class="px-4 py-3 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 text-white flex items-center justify-between">
                    <div class="text-sm font-semibold">{{ g || 'Group' }} Standings</div>
                    <div class="text-xs bg-white/20 px-2 py-0.5 rounded-full">{{ getStandingsSorted(g).length }} teams</div>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="min-w-full">
                      <thead class="bg-white/5 sticky top-0 z-10">
                        <tr class="text-left text-[11px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          <th class="px-3 md:px-4 py-2">Pos</th>
                          <th class="px-3 md:px-4 py-2">Team</th>
                          <th class="px-3 md:px-4 py-2">P</th>
                          <th class="px-3 md:px-4 py-2">W</th>
                          <th class="px-3 md:px-4 py-2">L</th>
                          <th class="px-3 md:px-4 py-2">T/NR</th>
                          <th class="px-3 md:px-4 py-2">NRR</th>
                          <th class="px-3 md:px-4 py-2">Pts</th>
                          <th class="px-3 md:px-4 py-2">Form</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-white/10">
                        <tr v-for="(row, idx) in getStandingsSorted(g)" :key="row.teamId" class="text-sm text-gray-300 hover:bg-white/5">
                          <td class="px-3 md:px-4 py-2 text-gray-500">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                  :class="idx===0 ? 'bg-amber-100 text-amber-700' : idx===1 ? 'bg-slate-100 text-slate-700' : idx===2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'">
                              {{ idx+1 }}
                            </span>
                          </td>
                          <td class="px-3 md:px-4 py-2 font-medium">
                            <div class="flex items-center gap-2">
                              <span class="truncate">{{ row.teamName }}</span>
                            </div>
                          </td>
                          <td class="px-3 md:px-4 py-2">{{ row.played }}</td>
                          <td class="px-3 md:px-4 py-2 text-emerald-600 font-semibold">{{ row.won }}</td>
                          <td class="px-3 md:px-4 py-2 text-rose-600">{{ row.lost }}</td>
                          <td class="px-3 md:px-4 py-2">{{ row.tied + row.noResult }}</td>
                          <td class="px-3 md:px-4 py-2">{{ fmtNRR(row.nrr) }}</td>
                          <td class="px-3 md:px-4 py-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                  :class="row.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'">
                              {{ row.points }}
                            </span>
                          </td>
                          <td class="px-3 md:px-4 py-2">
                            <div class="flex gap-1">
                              <span v-for="(r, i) in row.form" :key="i" class="w-2.5 h-2.5 rounded-full"
                                    :class="r==='W' ? 'bg-emerald-500' : r==='L' ? 'bg-rose-500' : 'bg-amber-400'"></span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="rounded-2xl border border-white/20 overflow-hidden glass-card">
                <div class="px-4 py-3 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 text-white flex items-center justify-between">
                  <div class="text-sm font-semibold">Standings</div>
                  <div class="text-xs bg-white/20 px-2 py-0.5 rounded-full">{{ standingsByGroup.length }} teams</div>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full">
                    <thead class="bg-white/5 sticky top-0 z-10">
                      <tr class="text-left text-[11px] md:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        <th class="px-3 md:px-4 py-2">Pos</th>
                        <th class="px-3 md:px-4 py-2">Team</th>
                        <th class="px-3 md:px-4 py-2">P</th>
                        <th class="px-3 md:px-4 py-2">W</th>
                        <th class="px-3 md:px-4 py-2">L</th>
                        <th class="px-3 md:px-4 py-2">T/NR</th>
                        <th class="px-3 md:px-4 py-2">NRR</th>
                        <th class="px-3 md:px-4 py-2">Pts</th>
                        <th class="px-3 md:px-4 py-2">Form</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                      <tr v-for="(row, idx) in standingsByGroup" :key="row.teamId" class="text-sm text-gray-300 hover:bg-white/5">
                        <td class="px-3 md:px-4 py-2 text-gray-500">
                          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                :class="idx===0 ? 'bg-amber-100 text-amber-700' : idx===1 ? 'bg-slate-100 text-slate-700' : idx===2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'">
                            {{ idx+1 }}
                          </span>
                        </td>
                        <td class="px-3 md:px-4 py-2 font-medium">
                          <div class="flex items-center gap-2">
                            <span class="truncate">{{ row.teamName }}</span>
                          </div>
                        </td>
                        <td class="px-3 md:px-4 py-2">{{ row.played }}</td>
                        <td class="px-3 md:px-4 py-2 text-emerald-600 font-semibold">{{ row.won }}</td>
                        <td class="px-3 md:px-4 py-2 text-rose-600">{{ row.lost }}</td>
                        <td class="px-3 md:px-4 py-2">{{ row.tied + row.noResult }}</td>
                        <td class="px-3 md:px-4 py-2">{{ fmtNRR(row.nrr) }}</td>
                        <td class="px-3 md:px-4 py-2">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                :class="row.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'">
                            {{ row.points }}
                          </span>
                        </td>
                        <td class="px-3 md:px-4 py-2">
                          <div class="flex gap-1">
                            <span v-for="(r, i) in row.form" :key="i" class="w-2.5 h-2.5 rounded-full"
                                  :class="r==='W' ? 'bg-emerald-500' : r==='L' ? 'bg-rose-500' : 'bg-amber-400'"></span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </template>
          </div>

          <!-- PARTICIPANTS TAB -->
          <div v-if="activeTab === 'participants'" class="p-4 md:p-6">
            <div v-if="participants.length === 0" class="text-sm text-gray-400">No participants available yet.</div>
            <div v-else class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div v-for="p in participants" :key="p._id || p.id" class="glass-card rounded-xl border border-white/20 p-4 hover:border-emerald-500/40 transition">
                <div class="flex items-center gap-3">
                  <img v-if="p.logoUrl" :src="p.logoUrl" class="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                  <div>
                    <div class="font-semibold text-white">{{ p.clubName || p.name }}</div>
                    <div class="text-xs text-gray-400">{{ p.district || 'Kerala' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BRACKET TAB -->
          <div v-if="activeTab === 'bracket'" class="p-4 md:p-6">
            <div v-if="!hasBracket" class="text-sm text-gray-400">No bracket rounds found.</div>
            <div v-else class="overflow-x-auto">
              <div class="min-w-[720px] grid grid-cols-3 gap-6">
                <div v-for="col in bracketColumns" :key="col.round" class="glass-card rounded-xl p-3 border border-white/20">
                  <div class="text-sm font-semibold text-white mb-2">{{ col.title }}</div>
                  <div class="space-y-3">
                    <div v-for="m in col.matches" :key="m._id" class="bg-white/5 rounded-lg border border-white/10 p-3 hover:bg-white/10 cursor-pointer transition" @click="$router.push({ name: 'match-details', params: { id: route.params.id, matchId: m._id } })">
                      <div class="text-[11px] text-gray-400 flex items-center justify-between">
                        <span>{{ m.matchCode || m.round || col.title }}</span>
                        <span>{{ fmtShortDate(m.date) }} {{ m.time || '' }}</span>
                      </div>
                      <div class="mt-1.5 space-y-1.5">
                        <div class="flex items-center justify-between" :class="isWinner(m, m.homeClub)? 'font-semibold text-emerald-400' : 'text-gray-300'">
                          <span>{{ clubName(m.homeClub) }}</span>
                          <span class="text-xs" v-if="winnerId(m)"> {{ isWinner(m, m.homeClub)? 'WIN' : '' }} </span>
                        </div>
                        <div class="flex items-center justify-between" :class="isWinner(m, m.awayClub)? 'font-semibold text-emerald-400' : 'text-gray-300'">
                          <span>{{ clubName(m.awayClub) }}</span>
                          <span class="text-xs" v-if="winnerId(m)"> {{ isWinner(m, m.awayClub)? 'WIN' : '' }} </span>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Edit Modal - Enhanced UI -->
    <div v-if="isAdmin && editOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 scale-100">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Edit Tournament</h2>
              <p class="text-indigo-100 text-sm">Update tournament details and settings</p>
            </div>
          </div>
          <button @click="editOpen = false" class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form Content -->
        <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form class="p-6 space-y-8" @submit.prevent="saveEdit">
            <!-- Basic Information Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Tournament Name <span class="text-red-500">*</span>
                  </label>
                  <input v-model="editForm.name" type="text" required
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                         placeholder="Enter tournament name"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Tournament Format</label>
                  <select v-model="editForm.format"
                          class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 appearance-none">
                    <option value="knockout">🏆 Knockout</option>
                    <option value="league">📊 League</option>
                    <option value="round-robin">🔄 Round-robin</option>
                    <option value="league+playoff">🏅 League+Playoff</option>
                    <option value="groups+knockouts">🗂️ Groups+Knockouts</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">District</label>
                  <input v-model="editForm.district" type="text"
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                         placeholder="Enter district"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Max Teams Allowed</label>
                  <input v-model.number="editForm.maxTeams" type="number" min="2" max="128"
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                         placeholder="16"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Match Format</label>
                  <select v-model="editForm.matchFormat"
                          class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 appearance-none">
                    <option value="T20">T20 (20 overs)</option>
                    <option value="ODI">ODI (50 overs)</option>
                    <option value="Test">Test (90 overs)</option>
                    <option value="T10">T10 (10 overs)</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Overs Limit</label>
                  <input v-model.number="editForm.oversLimit" type="number" min="1" max="100"
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                         placeholder="20"/>
                </div>
              </div>
            </div>

            <!-- Dates & Financial Details Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Dates & Financial Details</h3>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Start Date <span class="text-red-500">*</span></label>
                  <input v-model="editForm.startDate" type="date" required
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">End Date <span class="text-red-500">*</span></label>
                  <input v-model="editForm.endDate" type="date" required
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Registration Deadline</label>
                  <input v-model="editForm.registrationDeadline" type="date"
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Minimum Rest Days</label>
                  <input v-model.number="editForm.restDaysMin" type="number" min="0" max="7"
                         class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                         placeholder="1"/>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Entry Fee (INR)</label>
                  <div class="relative">
                    <span class="absolute left-4 top-3.5 text-gray-500 font-medium">₹</span>
                    <input v-model.number="editForm.entryFee" type="number" min="0" step="1"
                           class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                           placeholder="0"/>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Prize Pool (INR)</label>
                  <div class="relative">
                    <span class="absolute left-4 top-3.5 text-gray-500 font-medium">₹</span>
                    <input v-model.number="editForm.prizePool" type="number" min="0" step="1"
                           class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                           placeholder="0"/>
                  </div>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700">Sponsor Information</label>
                  <div class="relative">
                    <input v-model="editForm.sponsorInfo" type="text"
                           class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                           placeholder="Enter sponsor details (e.g., Sponsored by XYZ Company)"/>
                    <svg class="w-5 h-5 text-gray-400 absolute right-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Venue & Description Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Venue & Description</h3>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Venues (comma separated)</label>
                  <div class="relative">
                    <textarea v-model="editForm.venuesText" rows="2"
                              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                              placeholder="Ground A, Ground B, Ground C"></textarea>
                    <svg class="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                    </svg>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Tournament Description</label>
                  <textarea v-model="editForm.description" rows="3"
                            class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                            placeholder="Provide a brief overview of the tournament, its significance, and what participants can expect..."></textarea>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700">Rules & Regulations</label>
                  <textarea v-model="editForm.rules" rows="4"
                            class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                            placeholder="Key rules including eligibility criteria, overs per match, player limits, dress code, fees, conduct rules, etc."></textarea>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="button" @click="editOpen = false"
                      class="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200">
                Cancel
              </button>
              <button type="submit"
                      class="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Old Generate Fixtures Modal removed - using V3 FixtureWizard instead -->

    <!-- Delete Fixtures Confirmation Modal -->
    <div v-if="isAdmin && showDeleteFixturesModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 rounded-t-2xl">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Delete All Fixtures</h2>
              <p class="text-red-100 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-6">
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="text-sm text-red-800">
                <p class="font-semibold mb-1">Warning: Permanent Deletion</p>
                <p>You are about to delete <strong>all {{ matches.length }} fixtures</strong> for this tournament. This will:</p>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  <li>Remove all scheduled matches</li>
                  <li>Clear all match dates and venues</li>
                  <li>Allow you to regenerate fixtures from scratch</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong>{{ matches.length }}</strong> matches will be deleted</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex items-center justify-end gap-3">
          <button 
            @click="closeDeleteFixturesModal" 
            :disabled="deletingFixtures"
            class="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button 
            @click="confirmDeleteFixtures" 
            :disabled="deletingFixtures"
            class="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            <span v-if="deletingFixtures" class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Deleting...
            </span>
            <span v-else class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete All Fixtures
            </span>
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- V3 Fixture Wizard -->
  <FixtureWizard
    :show="showFixtureWizard"
    :tournament="tournament"
    :teams="wizardTeams"
    @close="showFixtureWizard = false"
    @generated="onFixturesGenerated"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import api from '../utils/api';
import { notify } from '../utils/notifications';
import FixtureWizard from '../components/admin/FixtureWizard.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);
const tournament = ref(null);
const matches = ref([]);
const participants = ref([]);
const registrations = ref([]);
const activeTab = ref('overview');

const isAdmin = computed(() => auth.userProfile?.role === 'admin');
const isClubManager = computed(() => auth.userProfile?.role === 'clubManager');
const payLoading = ref(false);
const clubPaymentStatus = ref('pending');
const clubPaymentVerified = ref(false);
const showRegistrationSuccess = ref(false);
const syncing = ref(false);

// Sponsors
const tournamentSponsors = ref([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getSponsorLogoUrl(url) {
  if (url?.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

async function fetchSponsors() {
  try {
    const res = await fetch(`${API_URL}/api/sponsorships/target/tournament/${route.params.id}/sponsors`);
    if (res.ok) {
      const data = await res.json();
      tournamentSponsors.value = data.sponsors || [];
    }
  } catch (e) {
    console.warn('Failed to fetch sponsors:', e);
  }
}

// Animated draw state
// Fixture draw variables removed

async function payEntryFee(){
  try{
    if (!tournament.value?._id) return;
    
    // Check if already paid
    if (clubPaymentStatus.value === 'paid' && clubPaymentVerified.value) {
      notify.warning('Entry fee has already been paid for this tournament');
      return;
    }
    
    payLoading.value = true;

    // Create payment order only if admin has approved registration and payment is pending
    const { data } = await api.post('/payments/orders', { tournamentId: tournament.value._id });
    const { keyId, order, amount, currency } = data;
    // Load Razorpay Checkout script if not present
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
      });
    }
    const options = {
      key: keyId,
      amount,
      currency,
      name: tournament.value.name,
      description: 'Tournament Entry Fee',
      order_id: order.id,
      prefill: { name: auth.userProfile?.name, email: auth.user?.email },
      theme: { color: '#059669' },
      handler: async function (response){
        try{
          await api.post('/payments/verify', {
            tournamentId: tournament.value._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          
          // Update payment status
          await loadClubPaymentStatus();
          await loadAll(tournament.value._id);

          // Show registration success modal
          showRegistrationSuccess.value = true;

        }catch(err){
          notify.error(err?.response?.data?.message || 'Payment verification failed. Please contact support.');
        }
      },
      modal: { ondismiss: function(){ payLoading.value = false; } }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }catch(err){
    // Surface detailed backend error to help diagnose (e.g., invalid key, network error)
    const detail = err?.response?.data?.detail;
    const msg = err?.response?.data?.message || err.message || 'Failed to initiate payment';
    notify.error(detail ? `${msg}: ${detail}` : msg);
    console.error('Payment init error:', err?.response?.data || err);
  }finally{
    setTimeout(() => { payLoading.value = false; }, 600);
  }
}

// Theme helpers
function statusDotClass(status){
  return status === 'cancelled' ? 'bg-rose-400' :
         status === 'open' ? 'bg-emerald-300' :
         status === 'ongoing' ? 'bg-amber-300' :
         status === 'completed' ? 'bg-emerald-300' :
         'bg-white/60';
}
function statusPillClass(status){
  return status === 'Live' ? 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
         status === 'Completed' ? 'px-2 py-0.5 rounded bg-gray-500/20 text-gray-300 border border-gray-500/30' :
         status === 'Cancelled' ? 'px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30' :
         'px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30';
}
function tabClass(name){
  return activeTab.value === name
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'text-gray-400 hover:text-white hover:bg-white/10';
}

// Formatting
function fmtDate(d){ if(!d) return ''; return new Date(d).toLocaleDateString(); }
function fmtShortDate(d){ if(!d) return ''; const dt = new Date(d); return dt.toLocaleDateString(undefined,{ month:'short', day:'numeric' }); }

// Format date for display (e.g., "Nov 15, 2025")
function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const prettyFormat = computed(() => (tournament.value?.format || '').replace(/\b\w/g, c => c.toUpperCase()));
const venueCount = computed(() => Array.isArray(tournament.value?.venues) ? tournament.value.venues.length : 0);
const durationDays = computed(() => {
  const s = tournament.value?.startDate; const e = tournament.value?.endDate;
  if (!s || !e) return 0; const diff = (new Date(e) - new Date(s));
  return Math.max(1, Math.round(diff / (1000*60*60*24)) + 1);
});

function clubName(c){
  // If populated object with name present
  if (c && typeof c === 'object' && (c.clubName || c.name)) return c.clubName || c.name;
  const id = String(c?._id || c?.id || c || '');
  const p = participantsMap?.value?.get ? participantsMap.value.get(id) : null;
  return (p?.clubName || p?.name) || 'Club';
}

// Match result display helpers
function getInningsTeamName(match, inningsIndex) {
  const innings = match.innings?.[inningsIndex];
  if (!innings) return '';
  
  // Get batting club ID
  const battingClubId = String(innings.battingClub?._id || innings.battingClub || '');
  
  // Check if it matches homeClub or awayClub
  const homeId = String(match.homeClub?._id || match.homeClub || '');
  const awayId = String(match.awayClub?._id || match.awayClub || '');
  
  if (battingClubId === homeId) {
    return clubName(match.homeClub);
  } else if (battingClubId === awayId) {
    return clubName(match.awayClub);
  }
  
  // Fallback to looking up in participants
  return clubName(innings.battingClub);
}

function getInningsScore(match, inningsIndex) {
  const innings = match.innings?.[inningsIndex];
  if (!innings) return '-';
  
  const runs = innings.runs || 0;
  const wickets = innings.wickets || 0;
  const balls = innings.balls || 0;
  
  // Calculate overs from balls
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  const oversStr = remainingBalls > 0 ? `${overs}.${remainingBalls}` : `${overs}`;
  
  return `${runs}/${wickets} (${oversStr})`;
}

function getResultSummary(match) {
  // First check for explicit result summary
  if (match.result?.summary) {
    return match.result.summary;
  }
  
  // Check for special cases
  if (match.result?.isNoResult) {
    return 'Match abandoned - No result';
  }
  
  if (match.result?.isTie) {
    if (match.result?.isSuperOverWin && match.superOver?.winner) {
      const soWinnerName = clubName(match.superOver.winner);
      return `Match tied - ${soWinnerName} won in Super Over`;
    }
    return 'Match tied';
  }
  
  // Get winner details
  const winnerId = String(match.result?.winner || '');
  if (!winnerId) {
    return 'Match completed';
  }
  
  // Determine winner name
  const homeId = String(match.homeClub?._id || match.homeClub || '');
  const awayId = String(match.awayClub?._id || match.awayClub || '');
  
  let winnerName = '';
  if (winnerId === homeId) {
    winnerName = clubName(match.homeClub);
  } else if (winnerId === awayId) {
    winnerName = clubName(match.awayClub);
  } else {
    winnerName = 'Winner';
  }
  
  // Build result string from margin
  const margin = match.result?.margin;
  if (margin?.runs && margin.runs > 0) {
    return `${winnerName} won by ${margin.runs} run${margin.runs !== 1 ? 's' : ''}`;
  } else if (margin?.wickets && margin.wickets > 0) {
    return `${winnerName} won by ${margin.wickets} wicket${margin.wickets !== 1 ? 's' : ''}`;
  }
  
  // DLS or Super Over win without margin details
  if (match.result?.isDLSWin) {
    return `${winnerName} won (D/L method)`;
  }
  if (match.result?.isSuperOverWin) {
    return `${winnerName} won in Super Over`;
  }
  
  return `${winnerName} won`;
}


// Favorite (server-backed per-account)
const isFav = ref(false);
async function loadFav(){
  try{
    const { data } = await api.get('/users/me/favorites');
    const list = (data.favoriteTournaments || []).map(String);
    isFav.value = list.includes(String(route.params.id));
  }catch{}
}
async function toggleFavorite(){
  try{
    const id = String(route.params.id);
    const { data } = await api.get('/users/me/favorites');
    const current = (data.favoriteTournaments || []).map(String);
    const action = current.includes(id) ? 'remove' : 'add';
    await api.post('/users/me/favorites', { type: 'tournament', id, action });
    isFav.value = action === 'add';
  }catch{}
}
function share(){
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: tournament.value?.name || 'Tournament', url }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(url);
    notify.success('Link copied to clipboard');
  }
}

// Admin-triggered status sync
async function syncStatuses(){
  if (!isAdmin.value) return;
  try{
    syncing.value = true;
    await api.post('/admin/tournaments/status-sync');
    const id = route.params.id;
    await loadAll(id);
    notify.success('Tournament statuses synced successfully');
  } catch(e){
    notify.error(e?.response?.data?.message || 'Status sync failed');
  } finally {
    syncing.value = false;
  }
}

// Data loading
async function loadClubPaymentStatus() {
  if (!isClubManager.value || !tournament.value?._id) return;
  
  try {
    // Fetch club's registered tournaments to get payment status
    const { data } = await api.get('/clubs/my-club/tournaments');
    const tournamentData = data.tournaments?.find(t => String(t.id) === String(tournament.value._id));
    
    if (tournamentData) {
      clubPaymentStatus.value = tournamentData.paymentStatus || 'pending';
      clubPaymentVerified.value = tournamentData.paymentVerified || false;
    }
  } catch (error) {
    console.error('Failed to load payment status:', error);
  }
}

async function loadAll(id){
  // Optional: warm from cache to avoid blank UI after refresh
  try{
    const cached = sessionStorage.getItem(`tournament:${id}`);
    if (cached && !tournament.value) {
      const obj = JSON.parse(cached);
      if (obj && obj._id) tournament.value = obj;
    }
  } catch {}

  // Load tournament immediately
  const tResp = await api.get(`/tournaments/${id}`);
  tournament.value = tResp.data;
  try{ sessionStorage.setItem(`tournament:${id}`, JSON.stringify(tResp.data)); } catch {}
  const regs = Array.isArray(tResp.data.registrations) ? tResp.data.registrations : [];
  const populatedParticipants = Array.isArray(tResp.data.participants) ? tResp.data.participants : [];
  const regsApproved = regs.filter(r => r.status === 'approved');
  const approvedClubs = regsApproved
    .map(r => (r && typeof r.club === 'object'
      ? r.club
      : populatedParticipants.find(p => String(p._id || p.id) === String(r.club))))
    .filter(Boolean);
  participants.value = approvedClubs.length ? approvedClubs : populatedParticipants;

  // Fire registrations and matches in parallel; do not block UI
  const tasks = [];
  if (isAdmin.value) {
    tasks.push(api.get(`/admin/tournaments/${id}/registrations`).then(r => { registrations.value = r.data; }).catch(() => { registrations.value = regs; }));
  }
  // Matches loader with separate state to avoid blocking
  loadingMatches.value = true;
  tasks.push(api.get(`/tournaments/${id}/matches`).then(m => { matches.value = m.data; }).finally(() => { loadingMatches.value = false; }));

  // Do not await here; let background tasks resolve without blocking initial render
  tasks.forEach(p => p.catch(()=>{}));
}

onMounted(async () => {
  try{
    const id = route.params.id;
    loadFav();
    fetchSponsors();
    await loadAll(id);
    
    // Load payment status for club managers
    if (isClubManager.value) {
      await loadClubPaymentStatus();
    }
    
    // Check for hash navigation to fixtures
    if (window.location.hash === '#fixtures') {
      activeTab.value = 'fixtures';
      // Scroll to fixtures section after a short delay to ensure it's rendered
      setTimeout(() => {
        const fixturesElement = document.getElementById('fixtures');
        if (fixturesElement) {
          fixturesElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  } finally {
    loading.value = false;
  }
});

// Lightweight periodic refresh to reflect live status changes
let refreshTimer = null;
onMounted(() => {
  refreshTimer = setInterval(async () => {
    try{
      const id = route.params.id;
      // Refresh matches only to reduce load
      loadingMatches.value = true;
      await api.get(`/tournaments/${id}/matches`).then(r => { matches.value = r.data; }).finally(() => { loadingMatches.value = false; });
    } catch(_) {}
  }, 60 * 1000); // every 60s
});
onBeforeUnmount(() => { if (refreshTimer) clearInterval(refreshTimer); refreshTimer = null; });

// Admin actions
async function updateReg(reg, action){
  if (!['approve','reject'].includes(action)) return;
  const id = route.params.id;
  await api.put(`/admin/tournaments/${id}/registrations/${reg._id}/${action}`);
  await loadAll(id);
}
async function openRegs(){
  const id = route.params.id;
  await api.put(`/admin/tournaments/${id}/open-registrations`);
  await loadAll(id);
}
async function closeRegs(){
  const id = route.params.id;
  await api.put(`/admin/tournaments/${id}/close-registrations`);
  await loadAll(id);
}
// V3 Fixture Wizard state (old modal removed)
const showDeleteFixturesModal = ref(false);
const deletingFixtures = ref(false);
const showFixtureWizard = ref(false);
const wizardTeams = ref([]);

function openGenerateModal() {
  // Open the new V3 wizard
  wizardTeams.value = participants.value || [];
  showFixtureWizard.value = true;
}

// Handler when wizard generates fixtures
async function onFixturesGenerated(result) {
  console.log('Fixtures generated:', result);
  showFixtureWizard.value = false;
  await loadAll(tournament.value._id);
  notify.success(`Generated ${result?.data?.matchesCount || 0} fixtures successfully!`);
}

function openDeleteFixturesModal() {
  showDeleteFixturesModal.value = true;
}

function closeDeleteFixturesModal() {
  showDeleteFixturesModal.value = false;
}

async function confirmDeleteFixtures(){
  const id = route.params.id;
  deletingFixtures.value = true;
  try {
    // Ensure Authorization header is present (fallback to current idToken)
    let token = auth.idToken;
    try { if (!token && auth.user?.getIdToken) token = await auth.user.getIdToken(true); } catch {}
    // Only attach headers if we actually have a token to avoid passing undefined headers (breaks interceptor)
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const { data } = await api.delete(`/admin/tournaments/${id}/fixtures`, config);
    
    // Immediately clear local state
    matches.value = [];
    if (tournament.value) tournament.value.fixturesGenerated = false;
    
    // Close modal immediately
    showDeleteFixturesModal.value = false;
    
    // Switch to overview tab
    activeTab.value = 'overview';
    
    // Refresh tournament data in background
    await loadAll(id);
  } catch (e) {
    console.error('Delete fixtures failed', e);
    notify.error(e?.response?.data?.message || 'Failed to delete fixtures');
  } finally {
    deletingFixtures.value = false;
  }
}
async function cancelTournament(){
  const id = route.params.id;
  if (!confirm('Cancel this tournament?')) return;
  await api.put(`/admin/tournaments/${id}/cancel`);
  await loadAll(id);
}

// Edit modal
const editOpen = ref(false);
const editForm = ref({ name: '', format: 'league', district: '', maxTeams: 16, startDate: '', endDate: '', registrationDeadline: '', entryFee: 0, description: '', rules: '', venuesText: '', prizePool: 0, sponsorInfo: '', matchFormat: 'T20', oversLimit: 20, restDaysMin: 1 });
function beginEdit(){
  const t = tournament.value; if (!t) return;
  editForm.value = {
    name: t.name || '',
    format: t.format || 'league',
    district: t.district || '',
    maxTeams: t.maxTeams || 16,
    startDate: t.startDate ? String(t.startDate).slice(0,10) : '',
    endDate: t.endDate ? String(t.endDate).slice(0,10) : '',
    registrationDeadline: t.registrationDeadline ? String(t.registrationDeadline).slice(0,10) : '',
    entryFee: Number(t.entryFee) || 0,
    prizePool: Number(t.prizePool) || 0,
    sponsorInfo: t.sponsorInfo || '',
    matchFormat: t.matchFormat || 'T20',
    oversLimit: Number(t.oversLimit) || 20,
    restDaysMin: Number(t.restDaysMin) || 1,
    description: t.description || '',
    rules: t.rules || '',
    venuesText: Array.isArray(t.venues) ? t.venues.join(', ') : ''
  };
  editOpen.value = true;
}
async function saveEdit(){
  const id = route.params.id;
  const payload = {
    name: editForm.value.name,
    format: editForm.value.format,
    district: editForm.value.district,
    maxTeams: editForm.value.maxTeams,
    startDate: editForm.value.startDate,
    endDate: editForm.value.endDate,
    registrationDeadline: editForm.value.registrationDeadline || undefined,
    entryFee: Number(editForm.value.entryFee) || 0,
    prizePool: Number(editForm.value.prizePool) || 0,
    sponsorInfo: editForm.value.sponsorInfo,
    matchFormat: editForm.value.matchFormat,
    oversLimit: Number(editForm.value.oversLimit) || 20,
    restDaysMin: Number(editForm.value.restDaysMin) || 1,
    description: editForm.value.description,
    rules: editForm.value.rules,
    venues: editForm.value.venuesText.split(',').map(s=>s.trim()).filter(Boolean)
  };
  await api.put(`/admin/tournaments/${id}`, payload);
  editOpen.value = false;
  await loadAll(id);
}

// Live matches
const liveMatches = computed(() => (matches.value || []).filter(m => m.status === 'Live'));

// Fixtures filtering and grouping
const searchTerm = ref('');
const statusFilter = ref('all'); // all | Scheduled | Live | Completed | Cancelled
const timeFilter = ref('all'); // upcoming | past | all (default to 'all' to avoid hiding past fixtures)
const loadingMatches = ref(false);

// Inline fixture editor state (enhanced)
const editFxOpen = ref(false);
const savingEditFx = ref(false);
const editFxForm = ref({ 
  matchId: '', 
  homeClub: '', 
  awayClub: '', 
  date: '', 
  time: '', 
  venue: '',
  // New fields
  round: '',
  stage: 'group',
  group: '',
  matchCode: '',
  matchFormat: 'T20',
  oversLimit: 20,
  dlsEnabled: true,
  superOverEnabled: true,
  freeHitOnNoBall: true,
  hasReserveDay: false
});

// Time slots from tournament settings or defaults
const computedTimeSlots = computed(() => {
  const slots = tournament.value?.matchTimeSlots;
  return Array.isArray(slots) && slots.length > 0 ? slots : ['09:00', '14:00', '18:00'];
});

const timeSlotOptions = ref(['09:00','14:00','18:00']);
const venueOptions = computed(() => Array.isArray(tournament.value?.venues) ? tournament.value.venues : []);
const participantOptions = computed(() => {
  const regs = Array.isArray(tournament.value?.registrations) ? tournament.value.registrations : [];
  const approved = regs.filter(r => r.status === 'approved').map(r => r.club).filter(Boolean);
  const base = approved.length ? approved : (tournament.value?.participants || []);
  return base.map(p => ({ id: p._id || p, name: p.clubName || p.name || String(p) }));
});

// Check if tournament has groups (for group selector visibility)
const hasGroups = computed(() => {
  const format = tournament.value?.format;
  return format === 'groups+knockouts' || format === 'groups+super8' || format === 'league+playoff';
});

// Available groups from tournament or default A-D
const availableGroups = computed(() => {
  const groups = tournament.value?.groups;
  if (Array.isArray(groups) && groups.length > 0) {
    return groups.map(g => g.name || g.group || g.label || `Group ${groups.indexOf(g) + 1}`);
  }
  // Default groups based on numGroups or A-D
  const numGroups = tournament.value?.numGroups || 2;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return letters.slice(0, numGroups).map(l => `Group ${l}`);
});

// Scheduling warnings computed
const scheduleWarnings = computed(() => {
  const warnings = [];
  const f = editFxForm.value;
  if (!f.date || !f.homeClub || !f.awayClub) return warnings;
  
  const selectedDate = new Date(f.date);
  const restDays = tournament.value?.restDaysMin || 1;
  
  // Check for rest day violations
  const otherMatches = (matches.value || []).filter(m => m._id !== f.matchId);
  
  // Check home team rest days
  const homeTeamMatches = otherMatches.filter(m => 
    String(m.homeClub?._id || m.homeClub) === String(f.homeClub) ||
    String(m.awayClub?._id || m.awayClub) === String(f.homeClub)
  );
  
  for (const m of homeTeamMatches) {
    if (!m.date) continue;
    const matchDate = new Date(m.date);
    const diffDays = Math.abs((selectedDate - matchDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= restDays) {
      const teamName = participantOptions.value.find(p => String(p.id) === String(f.homeClub))?.name || 'Home team';
      warnings.push(`${teamName} played on ${matchDate.toLocaleDateString()} (only ${Math.floor(diffDays)} day${diffDays > 1 ? 's' : ''} rest, minimum ${restDays} required)`);
      break;
    }
  }
  
  // Check away team rest days
  const awayTeamMatches = otherMatches.filter(m => 
    String(m.homeClub?._id || m.homeClub) === String(f.awayClub) ||
    String(m.awayClub?._id || m.awayClub) === String(f.awayClub)
  );
  
  for (const m of awayTeamMatches) {
    if (!m.date) continue;
    const matchDate = new Date(m.date);
    const diffDays = Math.abs((selectedDate - matchDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= restDays) {
      const teamName = participantOptions.value.find(p => String(p.id) === String(f.awayClub))?.name || 'Away team';
      warnings.push(`${teamName} played on ${matchDate.toLocaleDateString()} (only ${Math.floor(diffDays)} day${diffDays > 1 ? 's' : ''} rest, minimum ${restDays} required)`);
      break;
    }
  }
  
  // Check for same-day double headers
  const sameDayMatches = otherMatches.filter(m => {
    if (!m.date) return false;
    const matchDate = new Date(m.date).toDateString();
    return matchDate === selectedDate.toDateString();
  });
  
  for (const m of sameDayMatches) {
    const homeInMatch = String(m.homeClub?._id || m.homeClub) === String(f.homeClub) || String(m.homeClub?._id || m.homeClub) === String(f.awayClub);
    const awayInMatch = String(m.awayClub?._id || m.awayClub) === String(f.homeClub) || String(m.awayClub?._id || m.awayClub) === String(f.awayClub);
    if (homeInMatch || awayInMatch) {
      warnings.push(`Team already has a match scheduled on this date`);
      break;
    }
  }
  
  // Venue conflict check
  if (f.venue && f.time) {
    const venueConflict = sameDayMatches.find(m => m.venue === f.venue && m.time === f.time);
    if (venueConflict) {
      warnings.push(`${f.venue} is already booked at ${f.time} on this date`);
    }
  }
  
  return warnings;
});

// Tournament date range validation
const tournamentStartDateISO = computed(() => {
  if (!tournament.value?.startDate) return null;
  return new Date(tournament.value.startDate).toISOString().slice(0, 10);
});

const tournamentEndDateISO = computed(() => {
  if (!tournament.value?.endDate) return null;
  return new Date(tournament.value.endDate).toISOString().slice(0, 10);
});

const tournamentDurationDays = computed(() => {
  if (!tournament.value?.startDate || !tournament.value?.endDate) return 0;
  const start = new Date(tournament.value.startDate);
  const end = new Date(tournament.value.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
});

const isDateOutOfRange = computed(() => {
  if (!editFxForm.value.date || !tournament.value?.startDate || !tournament.value?.endDate) return false;
  const selectedDate = new Date(editFxForm.value.date);
  const startDate = new Date(tournament.value.startDate);
  const endDate = new Date(tournament.value.endDate);
  return selectedDate < startDate || selectedDate > endDate;
});

function openFixtureEditor(fx){
  editFxForm.value = {
    matchId: fx._id,
    homeClub: fx.homeClub?._id || fx.homeClub || '',
    awayClub: fx.awayClub?._id || fx.awayClub || '',
    date: fx.date ? String(fx.date).slice(0,10) : '',
    time: fx.time || '',
    venue: fx.venue || '',
    // New fields
    round: fx.round || '',
    stage: fx.stage || 'group',
    group: fx.group || '',
    matchCode: fx.matchCode || '',
    matchFormat: fx.matchFormat || tournament.value?.matchFormat || 'T20',
    oversLimit: fx.oversLimit || tournament.value?.oversLimit || 20,
    dlsEnabled: fx.dlsEnabled !== undefined ? fx.dlsEnabled : true,
    superOverEnabled: fx.superOverEnabled !== undefined ? fx.superOverEnabled : true,
    freeHitOnNoBall: fx.freeHitOnNoBall !== undefined ? fx.freeHitOnNoBall : true,
    hasReserveDay: fx.hasReserveDay || false
  };
  editFxOpen.value = true;
}

function closeFixtureEditor(){ editFxOpen.value = false; }

// Auto-set overs based on format
function onMatchFormatChange() {
  const format = editFxForm.value.matchFormat;
  switch(format) {
    case 'T20': editFxForm.value.oversLimit = 20; break;
    case 'ODI': editFxForm.value.oversLimit = 50; break;
    case 'T10': editFxForm.value.oversLimit = 10; break;
    case 'Test': editFxForm.value.oversLimit = 90; break;
  }
}

async function saveFixtureEdit(){
  const id = route.params.id;
  const f = editFxForm.value;
  if (!f.homeClub || !f.awayClub) { notify.error('Select both teams'); return; }
  if (String(f.homeClub) === String(f.awayClub)) { notify.error('Home and away cannot be the same'); return; }
  if (!f.date || !f.time || !f.venue) { notify.error('Please fill date, time and venue'); return; }
  savingEditFx.value = true;
  try{
    await api.put(`/admin/tournaments/${id}/matches/${f.matchId}`, {
      homeClub: f.homeClub,
      awayClub: f.awayClub,
      date: f.date,
      time: f.time,
      venue: f.venue,
      // New fields
      round: f.round,
      stage: f.stage,
      group: f.group,
      matchCode: f.matchCode,
      matchFormat: f.matchFormat,
      oversLimit: f.oversLimit,
      dlsEnabled: f.dlsEnabled,
      superOverEnabled: f.superOverEnabled,
      freeHitOnNoBall: f.freeHitOnNoBall,
      hasReserveDay: f.hasReserveDay,
      allowedTimeSlots: computedTimeSlots.value
    });
    editFxOpen.value = false;
    await loadAll(id);
    notify.success('Fixture updated successfully');
  } catch(e){
    notify.error(e?.response?.data?.message || 'Failed to update fixture');
  } finally {
    savingEditFx.value = false;
  }
}

const fixturesFiltered = computed(() => {
  const q = searchTerm.value.toLowerCase();
  const now = new Date();
  return (matches.value || []).filter(m => {
    if (statusFilter.value !== 'all' && (m.status || 'Scheduled') !== statusFilter.value) return false;
    if (timeFilter.value !== 'all') {
      const isPast = m.date ? new Date(m.date) < now : false;
      if (timeFilter.value === 'upcoming' && isPast) return false;
      if (timeFilter.value === 'past' && !isPast) return false;
    }
    if (!q) return true;
    const parts = [clubName(m.homeClub), clubName(m.awayClub), m.venue, m.round, m.stage].map(v => String(v||'').toLowerCase());
    return parts.some(v => v.includes(q));
  });
});

const fixturesGrouped = computed(() => {
  const byDate = {};
  for (const m of fixturesFiltered.value) {
    const key = m.date ? new Date(m.date).toDateString() : 'TBA';
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(m);
  }
  const groups = Object.keys(byDate).sort((a,b) => {
    if (a === 'TBA') return 1; if (b === 'TBA') return -1;
    return new Date(a) - new Date(b);
  }).map(k => ({
    dateKey: k,
    label: k === 'TBA' ? 'To be announced' : new Date(k).toLocaleDateString(undefined, { weekday:'long', month: 'long', day: 'numeric' }),
    items: byDate[k].sort((a,b) => (a.time||'').localeCompare(b.time||''))
  }));
  return groups;
});

// Standings
const participantsMap = computed(() => {
  const map = new Map();
  for (const p of (participants.value || [])) map.set(String(p._id || p.id), p);
  return map;
});

function ballsToOvers(b){ if(!b && b!==0) return 0; return b/6; }

function computeStandingsForGroup(groupKey){
  // Determine teams in this group
  let teams = (participants.value || []);
  if (groupKey) {
    const grp = (tournament.value?.groups || []).find(g => g.name === groupKey);
    const clubIds = new Set((grp?.clubs || []).map(x => String(x)));
    if (clubIds.size) {
      teams = teams.filter(p => clubIds.has(String(p._id || p.id)));
    }
  }

  const rows = teams.map(p => ({
    teamId: String(p._id || p.id),
    teamName: p.clubName || p.name || 'Club',
    group: groupKey || '',
    played: 0, won: 0, lost: 0, tied: 0, noResult: 0,
    runsFor: 0, ballsFaced: 0, runsAgainst: 0, ballsBowled: 0,
    points: 0, form: []
  }));
  const idx = new Map(rows.map(r => [r.teamId, r]));
  // Consider only matches within this group (if specified)
  const completed = (matches.value || []).filter(m => m.status === 'Completed' && (!groupKey || String(m.group||'') === groupKey));
  const chron = [...completed].sort((a,b) => new Date(a.date||0) - new Date(b.date||0));

  for (const m of chron) {
    const homeId = String(m.homeClub?._id || m.homeClub?.id || m.homeClub);
    const awayId = String(m.awayClub?._id || m.awayClub?.id || m.awayClub);
    const ri = m.innings || [];
    const hInns = ri.find(x => String(x.battingClub) === homeId);
    const aInns = ri.find(x => String(x.battingClub) === awayId);
    const rHome = hInns?.runs || 0; const bHome = hInns?.balls || 0;
    const rAway = aInns?.runs || 0; const bAway = aInns?.balls || 0;

    const home = idx.get(homeId); const away = idx.get(awayId);
    if (!home || !away) continue;

    home.played++; away.played++;
    home.runsFor += rHome; home.ballsFaced += bHome; home.runsAgainst += rAway; home.ballsBowled += bAway;
    away.runsFor += rAway; away.ballsFaced += bAway; away.runsAgainst += rHome; away.ballsBowled += bHome;

    const winner = String(m.result?.winner || '')
    const tie = !!m.result?.isTie; const noRes = !!m.result?.isNoResult;
    if (tie || noRes) {
      home.noResult += noRes ? 1 : 0; away.noResult += noRes ? 1 : 0;
      home.tied += tie ? 1 : 0; away.tied += tie ? 1 : 0;
      home.points += 1; away.points += 1;
      home.form.push('NR'); away.form.push('NR');
    } else if (winner === homeId) {
      home.won++; away.lost++; home.points += 2; home.form.push('W'); away.form.push('L');
    } else if (winner === awayId) {
      away.won++; home.lost++; away.points += 2; away.form.push('W'); home.form.push('L');
    }
    if (home.form.length > 5) home.form.shift();
    if (away.form.length > 5) away.form.shift();
  }

  for (const r of rows) {
    const forOvers = ballsToOvers(r.ballsFaced) || 0.0001;
    const agOvers = ballsToOvers(r.ballsBowled) || 0.0001;
    const nrrFor = r.runsFor / forOvers;
    const nrrAg = r.runsAgainst / agOvers;
    r.nrr = Number((nrrFor - nrrAg).toFixed(3));
  }
  return rows;
}

function fmtNRR(v){ if (v === 0) return '0.000'; if (!v) return '-'; return (v>0? '+':'') + Number(v).toFixed(3); }

const showTable = computed(() => String(tournament.value?.format || '').toLowerCase().includes('league') || matches.value.some(m => (m.group||'').length));

const groupKeys = computed(() => {
  const keys = new Set();
  // Prefer groups from matches
  for (const m of (matches.value || [])) if (m.group) keys.add(String(m.group));
  // Fallback to tournament.groups if matches lack group labels
  if (keys.size === 0 && Array.isArray(tournament.value?.groups)) {
    for (const g of tournament.value.groups) if (g?.name) keys.add(String(g.name));
  }
  const arr = Array.from(keys);
  if (arr.length === 0) arr.push('');
  return arr;
});
const activeGroup = ref('');
watch(groupKeys, (arr) => { if (arr.length && !arr.includes(activeGroup.value)) activeGroup.value = arr[0]; }, { immediate: true });

const standingsAll = computed(() => computeStandingsForGroup(activeGroup.value));
const standingsSorted = computed(() => [...standingsAll.value].sort((a,b) => b.points - a.points || b.nrr - a.nrr));
const standingsByGroup = computed(() => standingsSorted.value);

function getStandingsSorted(groupKey){
  const rows = computeStandingsForGroup(groupKey);
  return rows.sort((a,b) => b.points - a.points || b.nrr - a.nrr);
}

// Bracket
const hasBracket = computed(() => (matches.value || []).some(m => ['Quarterfinal','Semifinal','Final'].includes(m.round)) || (matches.value || []).some(m => m.stage && ['Knockout','Playoff','Final'].includes(m.stage)));

function winnerId(m){ return String(m.result?.winner || ''); }
function isWinner(m, club){ const id = String(club?._id || club?.id || club); return id && winnerId(m) === id; }

const bracketColumns = computed(() => {
  const rounds = [
    { key: 'Quarterfinal', title: 'Quarterfinals' },
    { key: 'Semifinal', title: 'Semifinals' },
    { key: 'Final', title: 'Final' }
  ];
  const byRound = (matches.value || []).reduce((acc, m) => {
    const k = m.round || (m.stage === 'Final' ? 'Final' : (m.stage === 'Knockout' ? 'Semifinal' : ''));
    if (!k) return acc; (acc[k] ||= []).push(m); return acc;
  }, {});
  return rounds.map(r => ({ round: r.key, title: r.title, matches: (byRound[r.key] || []).sort((a,b) => new Date(a.date||0) - new Date(b.date||0)) }));
});

function viewMatchDetails(match) {
  // Navigate to the new match details page
  router.push({ 
    name: 'match-details', 
    params: { 
      id: route.params.id, 
      matchId: match._id 
    } 
  });
}
</script>

<style scoped>
/* Glassmorphism Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Glassmorphism Card */
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
