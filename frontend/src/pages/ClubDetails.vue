<template>
  <div class="min-h-screen">
    <!-- Navigation Bar -->
    <div class="glass-nav border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <button @click="$router.back()" class="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to Clubs
    </button>
      </div>
    </div>

    <div v-if="loading" class="py-24 text-center text-gray-300">
      <div class="inline-block rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
      <p class="text-lg">Loading club details...</p>
    </div>
    
    <div v-else-if="!club" class="py-24 text-center">
      <div class="glass-panel inline-block rounded-2xl p-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-lg font-medium text-white">Club not found</p>
        <p class="text-sm text-gray-400 mt-1">The club you're looking for doesn't exist or has been removed</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Hero Section -->
      <div class="relative glass-panel-dark border-b border-white/10">
        
        <div class="relative max-w-7xl mx-auto px-4 py-12">
          <div class="flex flex-col lg:flex-row items-start gap-8">
            <!-- Club Logo and Basic Info -->
            <div class="flex items-center gap-6">
              <div class="relative">
                <img 
                  v-if="club.logoUrl" 
                  :src="resolvedLogoUrl" 
                  alt="Club Logo" 
                  class="w-32 h-32 rounded-2xl object-cover border-2 border-emerald-200 shadow-lg" 
                  @error="e => (e.target.style.display='none')" 
                />
                <div 
                  v-else 
                  class="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-emerald-300 shadow-lg flex items-center justify-center text-white text-4xl font-bold"
                >
                  {{ (club.name || club.clubName)?.charAt(0)?.toUpperCase() || 'C' }}
                </div>
                <!-- Status Badge -->
                <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              
                <div class="text-white">
                <h1 class="text-4xl lg:text-5xl font-black mb-2">{{ club.name || club.clubName }}</h1>
                <div class="flex items-center gap-2 text-lg text-gray-300 mb-4">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="font-medium">{{ club.city || club.district }}</span>
                </div>
                
                <!-- Quick Stats -->
                <div class="flex flex-wrap gap-3">
                  <div class="glass-panel rounded-xl px-4 py-3 border border-emerald-500/30">
                    <div class="text-2xl font-bold text-emerald-400">{{ club.memberCount || 0 }}</div>
                    <div class="text-xs text-gray-300 font-medium">Active Players</div>
                  </div>
                  <div v-if="club.foundedYear" class="glass-panel rounded-xl px-4 py-3 border border-emerald-500/30">
                    <div class="text-2xl font-bold text-emerald-400">{{ club.foundedYear }}</div>
                    <div class="text-xs text-gray-300 font-medium">Founded</div>
                  </div>
                  <div v-if="club.groundName" class="glass-panel rounded-xl px-4 py-3 border border-emerald-500/30">
                    <div class="text-xs font-semibold text-gray-400 uppercase">Home Ground</div>
                    <div class="text-sm text-white font-medium truncate max-w-32">{{ club.groundName }}</div>
                  </div>
                </div>
              </div>
          </div>
            
            <!-- Action Buttons -->
            <div class="lg:ml-auto flex flex-col gap-3">
              <button @click="toggleFavoriteClub()" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-panel border border-white/20 text-white hover:border-emerald-400/50 hover:bg-white/10 transition-all duration-300">
                <span class="text-yellow-400 text-xl">{{ isFav ? '★' : '☆' }}</span>
                <span class="font-medium">{{ isFav ? 'Favorited' : 'Add to Favorites' }}</span>
            </button>
              
              <!-- Apply to Club Button -->
              <button 
                v-if="isPlayer && auth.user" 
                @click="handleApplyClick()" 
                :disabled="isApplying || !canApply"
                :class="[
                  'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm',
                  canApply 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg border border-emerald-600' 
                    : playerStatus?.hasClub 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200',
                  'disabled:opacity-75'
                ]"
              >
                <svg v-if="isApplying" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
                <svg v-else-if="canApply" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" stroke-linecap="round"/>
              </svg>
                <svg v-else-if="playerStatus?.hasClub" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
                <span>{{ getButtonText() }}</span>
            </button>
            
            <!-- Apply to Coach Club Button -->
            <button 
              v-if="isCoach && auth.user" 
              @click="handleCoachApplyClick()" 
              :disabled="isCoachApplying || !canCoachApply"
              :class="[
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-sm',
                canCoachApply 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg border border-emerald-600' 
                  : coachStatus?.hasClub 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200',
                'disabled:opacity-75'
              ]"
            >
              <svg v-if="isCoachApplying" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
              <svg v-else-if="canCoachApply" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="coachStatus?.hasClub" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ getCoachButtonText() }}</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Main Content Area -->
          <div class="lg:col-span-2 space-y-8">
            <!-- About Section -->
            <div class="glass-card rounded-2xl border border-white/20 p-8 transition-all duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-white">About the Club</h2>
              </div>
              <div class="prose prose-invert max-w-none">
                <p class="text-gray-300 leading-relaxed text-base">
                  {{ club.description || 'This cricket club is dedicated to promoting the sport and nurturing talent at all levels. We welcome players of all skill levels and provide a supportive environment for growth and development.' }}
                </p>
              </div>
            </div>

            <!-- Achievements Section -->
            <div v-if="club.achievements" class="glass-card rounded-2xl border border-white/20 p-8 transition-all duration-300">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-white">Achievements & Honors</h2>
              </div>
              <div class="prose prose-invert max-w-none">
                <p class="text-gray-300 leading-relaxed whitespace-pre-line text-base">{{ club.achievements }}</p>
              </div>
            </div>
            
            <!-- Club Players Section -->
            <div class="glass-card rounded-2xl border border-white/20 p-8 transition-all duration-300">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white">Squad Members</h2>
                </div>
                <div v-if="clubPlayers.length > 0" class="flex items-center gap-2">
                  <span class="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-semibold">
                    {{ clubPlayers.length }} Active Players
                  </span>
                </div>
              </div>
              
              <div v-if="loadingPlayers" class="text-center py-12">
                <div class="inline-block rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                <p class="text-gray-300 text-lg">Loading squad members...</p>
              </div>
              
              <div v-else-if="clubPlayers.length === 0" class="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">No Active Players</h3>
                <p class="text-gray-400 max-w-md mx-auto">This club is currently building its squad. Be the first to join and help establish a strong team!</p>
              </div>
              
              <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div v-for="player in clubPlayers" :key="player.id" 
                     class="group relative glass-card rounded-2xl overflow-hidden border border-white/20 hover:border-emerald-500/40 transition-all duration-300">
                  
                  <!-- Card Header with Gradient -->
                  <div class="relative h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 overflow-hidden">
                    <!-- Decorative Pattern -->
                    <div class="absolute inset-0 opacity-10">
                      <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <circle cx="5" cy="5" r="1" fill="white"/>
                        </pattern>
                        <rect width="100" height="100" fill="url(#grid)"/>
                      </svg>
                    </div>
                    
                    <!-- Role Badge - Top Right -->
                    <div class="absolute top-3 right-3">
                      <span :class="[
                        'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg',
                        player.preferredPosition?.toLowerCase()?.includes('bat') ? 'bg-amber-400 text-amber-900' :
                        player.preferredPosition?.toLowerCase()?.includes('bowl') ? 'bg-purple-400 text-purple-900' :
                        player.preferredPosition?.toLowerCase()?.includes('keeper') ? 'bg-blue-400 text-blue-900' :
                        'bg-emerald-400 text-emerald-900'
                      ]">
                        {{ player.preferredPosition || 'All-rounder' }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Avatar - Overlapping Header -->
                  <div class="relative -mt-12 px-5">
                    <div class="relative inline-block">
                      <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-slate-700 ring-4 ring-emerald-500/20">
                        {{ player.fullName?.charAt(0)?.toUpperCase() || 'P' }}
                      </div>
                      <!-- Active Status Badge -->
                      <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-slate-700 flex items-center justify-center shadow-md">
                        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Player Info -->
                  <div class="px-5 pt-3 pb-4">
                    <!-- Name and Age -->
                    <div class="mb-4">
                      <h3 class="text-lg font-black text-white mb-0.5 truncate">{{ player.fullName }}</h3>
                      <div class="flex items-center gap-2 text-sm text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="font-medium">{{ player.age }} years old</span>
                      </div>
                    </div>

                    <!-- Stats Section -->
                    <div class="bg-slate-800/70 rounded-xl p-3 mb-4 border border-white/10">
                      <!-- Stats Header -->
                      <div class="flex items-center justify-center gap-1.5 mb-2.5 pb-2 border-b border-white/10">
                        <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Career Stats</span>
                      </div>
                      
                      <!-- Primary Stats Row -->
                      <div class="grid grid-cols-3 gap-1.5 mb-2">
                        <div class="text-center py-2 px-1 bg-blue-500/10 rounded-lg border border-blue-500/20 overflow-hidden">
                          <div class="text-base font-black text-blue-400">{{ player.statistics?.matchesPlayed || 0 }}</div>
                          <div class="text-[8px] text-gray-400 font-semibold uppercase">Matches</div>
                        </div>
                        <div class="text-center py-2 px-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 overflow-hidden">
                          <div class="text-base font-black text-emerald-400">{{ player.statistics?.runsScored || 0 }}</div>
                          <div class="text-[8px] text-gray-400 font-semibold uppercase">Runs</div>
                        </div>
                        <div class="text-center py-2 px-1 bg-purple-500/10 rounded-lg border border-purple-500/20 overflow-hidden">
                          <div class="text-base font-black text-purple-400">{{ player.statistics?.wicketsTaken || 0 }}</div>
                          <div class="text-[8px] text-gray-400 font-semibold uppercase">Wkts</div>
                        </div>
                      </div>
                      
                      <!-- Secondary Stats Row -->
                      <div class="grid grid-cols-2 gap-1.5">
                        <div class="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <div class="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <svg class="w-2.5 h-2.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>
                            </svg>
                          </div>
                          <div class="text-center">
                            <div class="text-sm font-black text-white leading-none">{{ player.statistics?.catches || 0 }}</div>
                            <div class="text-[7px] text-gray-400 font-semibold uppercase">Catch</div>
                          </div>
                        </div>
                        <div class="flex items-center justify-center gap-1.5 py-2 px-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                          <div class="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                            <svg class="w-2.5 h-2.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                          </div>
                          <div class="text-center">
                            <div class="text-sm font-black text-white leading-none">{{ player.statistics?.stumpings || 0 }}</div>
                            <div class="text-[7px] text-gray-400 font-semibold uppercase">Stump</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Player Details Footer -->
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div class="flex items-center gap-2 py-2 px-3 bg-slate-700/50 rounded-lg border border-white/10">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <div class="min-w-0 flex-1">
                          <div class="text-[10px] text-gray-500 font-medium uppercase">Exp</div>
                          <div class="font-bold text-gray-200 text-xs">{{ player.playingExperience || 'N/A' }}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 py-2 px-3 bg-slate-700/50 rounded-lg border border-white/10">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <div class="min-w-0 flex-1">
                          <div class="text-[10px] text-gray-500 font-medium uppercase">Joined</div>
                          <div class="font-bold text-gray-200 text-xs">{{ formatDate(player.joinedAt) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Club Coaches Section - Enhanced Details -->
          <div class="glass-card rounded-2xl border border-white/20 p-8 transition-all duration-300">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-white">Coaching Team</h2>
              </div>
              <div v-if="clubCoaches.length > 0" class="flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-sm font-semibold">
                  {{ clubCoaches.length }} Coaches
                </span>
              </div>
            </div>
            
            <div v-if="loadingCoaches" class="text-center py-12">
              <div class="inline-block rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-4"></div>
              <p class="text-gray-300">Loading coaching team...</p>
            </div>
            
            <div v-else-if="clubCoaches.length === 0" class="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-1">No coaches available</h3>
              <p class="text-gray-400 text-sm">This club is currently building its coaching team.</p>
            </div>
            
            <div v-else class="space-y-6">
              <div v-for="coach in clubCoaches" :key="coach.id" 
                   class="border border-white/20 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300">
                <!-- Coach Header -->
                <div class="flex items-center gap-4 p-4 bg-white/5">
                  <div class="relative flex-shrink-0">
                    <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {{ coach.fullName?.charAt(0)?.toUpperCase() || 'C' }}
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-white text-lg">{{ coach.fullName }}</h3>
                    <div class="flex flex-wrap items-center gap-2 mt-1">
                      <span class="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">
                        {{ formatExperience(coach.coachingExperience) }}
                      </span>
                      <span class="text-sm text-gray-400">Age {{ coach.age }}</span>
                    </div>
                  </div>
                  
                  <button 
                    @click="viewCoachProfile(coach)"
                    class="text-emerald-600 hover:text-emerald-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all duration-300 border border-emerald-200 hover:border-emerald-300"
                  >
                    View Profile
                  </button>
                </div>
                
                <!-- Coach Details -->
                <div class="p-4">
                  <!-- Specializations -->
                  <div v-if="coach.specializations && coach.specializations.length > 0" class="mb-3">
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specializations</div>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="spec in coach.specializations" :key="spec" 
                            class="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        {{ formatSpecialization(spec) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Coaching History Preview -->
                  <div v-if="coach.coachingHistory && coach.coachingHistory.length > 0" class="mb-3">
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Experience</div>
                    <div class="text-sm">
                      <div class="font-medium text-gray-900">{{ coach.coachingHistory[0].teamName }}</div>
                      <div class="text-gray-600">{{ coach.coachingHistory[0].position }} ({{ coach.coachingHistory[0].yearsCoached }})</div>
                      <div v-if="coach.coachingHistory[0].playersCoached" class="text-gray-500 text-xs mt-1">
                        Coached {{ coach.coachingHistory[0].playersCoached }} players
                      </div>
                    </div>
                  </div>
                  
                  <!-- Additional Stats -->
                  <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div class="flex items-center gap-4">
                      <span>{{ coach.coachingHistory?.length || 0 }} teams coached</span>
                      <span>{{ formatDate(coach.joinedAt) }}</span>
                    </div>
                    <div v-if="coach.coachingHistory && coach.coachingHistory.length > 1" class="text-orange-600">
                      +{{ coach.coachingHistory.length - 1 }} more roles
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Contact Information -->
          <div class="glass-card rounded-2xl border border-white/20 p-6 transition-all duration-300">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white">Contact Information</h3>
            </div>
            
            <div class="space-y-4">
              <div v-if="club.email" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <div>
                  <div class="text-sm text-gray-400 font-medium">Email</div>
                  <a :href="`mailto:${club.email}`" class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">{{ club.email }}</a>
                </div>
              </div>
              
              <div v-if="club.phone" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <div>
                  <div class="text-sm text-gray-400 font-medium">Phone</div>
                  <a :href="`tel:${club.phone}`" class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">{{ club.phone }}</a>
                </div>
              </div>
              
              <div v-if="club.website" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <div class="text-sm text-gray-400 font-medium">Website</div>
                  <a :href="club.website" target="_blank" class="text-emerald-400 hover:text-emerald-300 font-medium break-all transition-colors">{{ club.website }}</a>
                </div>
              </div>
              
              <div v-if="!club.email && !club.phone && !club.website" class="text-center py-8">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <p class="text-sm text-gray-400">Contact information not available</p>
              </div>
            </div>
          </div>

          <!-- Club Statistics -->
          <div class="glass-card rounded-2xl border border-white/20 p-6 transition-all duration-300">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white">Club Statistics</h3>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 px-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span class="text-gray-300 font-semibold">Active Players</span>
                <span class="text-2xl font-bold text-emerald-400">{{ club.memberCount || 0 }}</span>
              </div>
              
              <div v-if="club.foundedYear" class="flex items-center justify-between py-3 px-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span class="text-gray-300 font-semibold">Years Active</span>
                <span class="text-2xl font-bold text-emerald-400">{{ new Date().getFullYear() - club.foundedYear }}</span>
              </div>
              
              <div v-if="club.groundName" class="py-3 px-4 bg-white/5 rounded-xl border border-white/10">
                <div class="text-gray-400 font-semibold mb-1">Home Ground</div>
                <div class="text-white font-semibold">{{ club.groundName }}</div>
              </div>
            </div>
          </div>

          <!-- Sponsors Section -->
          <div v-if="clubSponsors.length > 0" class="glass-card rounded-2xl border border-white/20 p-6 transition-all duration-300">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white">Our Sponsors</h3>
            </div>
            <div class="space-y-3">
              <div v-for="sponsor in clubSponsors.slice(0, 5)" :key="sponsor._id" 
                   class="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
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
        </div>
      </div>
    </div>
    
    <!-- Coach Profile Modal -->
    <Transition name="fade">
      <div 
        v-if="showCoachModal && selectedCoach" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="closeCoachModal"
      >
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Close Button -->
          <button 
            @click="closeCoachModal"
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-8 rounded-t-3xl">
            <div class="flex items-center gap-6">
              <div class="w-24 h-24 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {{ selectedCoach.fullName?.charAt(0)?.toUpperCase() || 'C' }}
              </div>
              <div class="text-white">
                <h2 class="text-3xl font-black mb-2">{{ selectedCoach.fullName }}</h2>
                <div class="flex items-center gap-4 text-emerald-100">
                  <span class="text-lg">Age {{ selectedCoach.age }}</span>
                  <span class="text-lg">•</span>
                  <span class="text-lg">{{ formatExperience(selectedCoach.coachingExperience) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-8 space-y-6">
            <!-- Specializations -->
            <div v-if="selectedCoach.specializations && selectedCoach.specializations.length > 0">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
                </svg>
                Specializations
              </h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="spec in selectedCoach.specializations" 
                  :key="spec"
                  class="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                >
                  {{ formatSpecialization(spec) }}
                </span>
              </div>
            </div>

            <!-- Coaching History -->
            <div v-if="selectedCoach.coachingHistory && selectedCoach.coachingHistory.length > 0">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Coaching History
              </h3>
              <div class="space-y-3">
                <div 
                  v-for="(history, index) in selectedCoach.coachingHistory" 
                  :key="index"
                  class="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-gray-900">{{ history.teamName }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ history.position }}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      {{ history.yearsCoached || 'N/A' }}
                    </span>
                  </div>
                  <div v-if="history.playersCoached" class="mt-3 pt-3 border-t border-gray-200">
                    <p class="text-sm text-gray-600">
                      <span class="font-semibold text-emerald-600">{{ history.playersCoached }}</span> players coached
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Additional Info -->
            <div v-if="(!selectedCoach.specializations || selectedCoach.specializations.length === 0) && (!selectedCoach.coachingHistory || selectedCoach.coachingHistory.length === 0)" class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-gray-500">No additional information available</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-8 py-6 bg-gray-50 rounded-b-3xl border-t border-gray-200">
            <button 
              @click="closeCoachModal"
              class="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import api from '../utils/api.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const loading = ref(true);
// Prefill from navigation state if available to avoid flash/404 when coming from list
const initialStateClub = history.state?.club || null;
const club = ref(initialStateClub);
let cancelled = false;

// Player functionality
const isPlayer = computed(() => (auth.userProfile?.role || 'public') === 'player');
const isCoach = computed(() => (auth.userProfile?.role || 'public') === 'coach');
const isApplying = ref(false);
const isCoachApplying = ref(false);
const playerStatus = ref(null);
const coachStatus = ref(null);
const clubPlayers = ref([]);
const loadingPlayers = ref(false);

// Coach functionality
const clubCoaches = ref([]);
const loadingCoaches = ref(false);

// Coach profile modal
const showCoachModal = ref(false);
const selectedCoach = ref(null);

// Sponsors
const clubSponsors = ref([]);
const SPONSOR_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getSponsorLogoUrl(url) {
  if (url?.startsWith('http')) return url;
  return `${SPONSOR_API_URL}${url}`;
}

async function fetchSponsors() {
  try {
    const clubId = route.params.id;
    const res = await fetch(`${SPONSOR_API_URL}/api/sponsorships/target/club/${clubId}/sponsors`);
    if (res.ok) {
      const data = await res.json();
      clubSponsors.value = data.sponsors || [];
    }
  } catch (e) {
    console.warn('Failed to fetch club sponsors:', e);
  }
}

const resolvedLogoUrl = computed(() => {
  if (!club.value) return '';
  const id = club.value.id || club.value._id;
  const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
  return club.value.logoUrl || (id ? `${API}/clubs/${id}/logo` : '');
});

// Computed properties for button logic
const canApply = computed(() => {
  return playerStatus.value?.canApply === true;
});

const canCoachApply = computed(() => {
  return coachStatus.value?.canApply === true;
});

const getButtonText = () => {
  if (isApplying.value) return 'Applying...';
  if (playerStatus.value?.hasClub) return `Member of ${playerStatus.value.currentClub?.name}`;
  if (playerStatus.value?.hasPendingApplication) return 'Application Pending';
  if (canApply.value) return 'Apply to Club';
  return 'Cannot Apply';
};

const getCoachButtonText = () => {
  if (isCoachApplying.value) return 'Applying...';
  if (coachStatus.value?.hasClub) return `Coaching at ${coachStatus.value.currentClub?.name}`;
  if (coachStatus.value?.hasPendingApplication) return 'Application Pending';
  if (canCoachApply.value) return 'Apply to Coach Club';
  return 'Cannot Apply';
};

// Favorites (server-backed per-account)
const isFav = ref(false);
async function syncFavFromServer(){
  try{
    const { data } = await api.get('/users/me/favorites');
    const list = (data.favoriteClubs || []).map(String);
    const id = String(route.params.id);
    isFav.value = list.includes(id);
  }catch{}
}
async function toggleFavoriteClub(){
  try{
    const id = String(route.params.id);
    const { data } = await api.get('/users/me/favorites');
    const current = (data.favoriteClubs || []).map(String);
    const action = current.includes(id) ? 'remove' : 'add';
    await api.post('/users/me/favorites', { type: 'club', id, action });
    isFav.value = action === 'add';
  }catch{}
}

// Load player status to determine button state
async function loadPlayerStatus() {
  if (!auth.user || !isPlayer.value) {
    playerStatus.value = { canApply: false, message: 'Please log in as a player' };
    return;
  }

  try {
    const { data } = await api.get('/players/club-status');
    playerStatus.value = data;
  } catch (error) {
    console.error('Error loading player status:', error);
    playerStatus.value = { canApply: false, message: 'Unable to check player status' };
  }
}

// Load coach status to determine button state
async function loadCoachStatus() {
  if (!auth.user || !isCoach.value) {
    coachStatus.value = { canApply: false, message: 'Please log in as a coach' };
    return;
  }

  try {
    const { data } = await api.get('/coaches/club-status');
    coachStatus.value = data;
  } catch (error) {
    console.error('Error loading coach status:', error);
    coachStatus.value = { canApply: false, message: 'Unable to check coach status' };
  }
}

// Load club players
async function loadClubPlayers() {
  if (!club.value) return;
  
  loadingPlayers.value = true;
  try {
    const clubId = club.value.id || club.value._id;
    console.log(`🏏 Loading players for club: ${club.value.name || club.value.clubName} (ID: ${clubId})`);
    const { data } = await api.get(`/clubs/public/${clubId}/players`);
    console.log(`✅ Loaded ${data.players?.length || 0} players:`, data.players);
    clubPlayers.value = data.players || [];
  } catch (error) {
    console.error('❌ Error loading club players:', error);
    console.error('Error details:', error.response?.data || error.message);
    clubPlayers.value = [];
  } finally {
    loadingPlayers.value = false;
  }
}

// Load club coaches
async function loadClubCoaches() {
  if (!club.value) return;
  
  loadingCoaches.value = true;
  try {
    const clubId = club.value.id || club.value._id;
    console.log(`🏏 Loading coaches for club: ${club.value.name || club.value.clubName} (ID: ${clubId})`);
    const { data } = await api.get(`/clubs/public/${clubId}/coaches`);
    console.log(`✅ Loaded ${data.coaches?.length || 0} coaches:`, data.coaches);
    clubCoaches.value = data.coaches || [];
  } catch (error) {
    console.error('❌ Error loading club coaches:', error);
    console.error('Error details:', error.response?.data || error.message);
    clubCoaches.value = [];
  } finally {
    loadingCoaches.value = false;
  }
}

// Handle apply button click
function handleApplyClick() {
  if (!canApply.value) {
    if (playerStatus.value?.hasClub) {
      alert(`You are already a member of ${playerStatus.value.currentClub?.name}. You cannot join multiple clubs.`);
    } else if (playerStatus.value?.hasPendingApplication) {
      alert('You have a pending application. Please wait for the club manager to review it before applying to other clubs.');
    } else {
      alert(playerStatus.value?.message || 'You cannot apply to this club at this time.');
    }
    return;
  }
  
  applyToClub();
}

async function applyToClub() {
  if (!auth.user || !isPlayer.value) {
    alert('Please log in as a player to apply to clubs.');
    return;
  }

  // Check if player has completed their profile
  try {
    const { data: playerProfile } = await api.get('/players/profile');
    if (!playerProfile?.player || !playerProfile.player.profileCompleted) {
      alert('Please complete your player profile before applying to clubs.');
      router.push({ name: 'player-registration' });
      return;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      alert('Please complete your player profile before applying to clubs.');
      router.push({ name: 'player-registration' });
      return;
    }
    console.error('Error checking player profile:', error);
    alert('Unable to verify player profile. Please try again.');
    return;
  }

  const message = prompt('Please enter a message with your application (optional):');
  if (message === null) return; // User cancelled

  isApplying.value = true;
  try {
    const clubId = club.value.id || club.value._id;
    await api.post(`/players/apply-to-club/${clubId}`, {
      message: message.trim() || 'I would like to join your club.'
    });
    
    alert('Application submitted successfully! The club manager will review your application.');
    // Refresh player status after successful application
    await loadPlayerStatus();
  } catch (error) {
    console.error('Error applying to club:', error);
    const errorMessage = error.response?.data?.message || 'Failed to submit application. Please try again.';
    alert(errorMessage);
  } finally {
    isApplying.value = false;
  }
}

// Handle coach apply button click
function handleCoachApplyClick() {
  if (!canCoachApply.value) {
    if (coachStatus.value?.hasClub) {
      alert(`You are already coaching at ${coachStatus.value.currentClub?.name}. You cannot apply to multiple clubs.`);
    } else if (coachStatus.value?.hasPendingApplication) {
      alert('You have a pending application. Please wait for the club manager to review it before applying to other clubs.');
    } else {
      alert(coachStatus.value?.message || 'You cannot apply to this club at this time.');
    }
    return;
  }
  
  applyToCoachClub();
}

async function applyToCoachClub() {
  if (!auth.user || !isCoach.value) {
    alert('Please log in as a coach to apply to clubs.');
    return;
  }

  // Check if coach has completed their profile
  try {
    const { data: coachProfile } = await api.get('/coaches/profile');
    if (!coachProfile?.coach || !coachProfile.coach.profileCompleted) {
      alert('Please complete your coach profile before applying to clubs.');
      router.push({ name: 'coach-registration' });
      return;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      alert('Please complete your coach profile before applying to clubs.');
      router.push({ name: 'coach-registration' });
      return;
    }
    console.error('Error checking coach profile:', error);
    alert('Unable to verify coach profile. Please try again.');
    return;
  }

  const message = prompt('Please enter a message with your coaching application (optional):');
  if (message === null) return; // User cancelled

  isCoachApplying.value = true;
  try {
    const clubId = club.value.id || club.value._id;
    await api.post(`/coaches/apply-to-club/${clubId}`, {
      message: message.trim() || 'I would like to coach for your club.'
    });
    
    alert('Coaching application submitted successfully! The club manager will review your application.');
    // Refresh coach status after successful application
    await loadCoachStatus();
  } catch (error) {
    console.error('Error applying to coach club:', error);
    const errorMessage = error.response?.data?.message || 'Failed to submit coaching application. Please try again.';
    alert(errorMessage);
  } finally {
    isCoachApplying.value = false;
  }
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format experience helper
function formatExperience(experience) {
  if (!experience) return 'N/A';
  return experience;
}

// Format specialization helper
function formatSpecialization(spec) {
  if (!spec) return '';
  return spec.charAt(0).toUpperCase() + spec.slice(1).replace(/([A-Z])/g, ' $1').trim();
}

// View coach profile function
function viewCoachProfile(coach) {
  if (!coach) return;
  selectedCoach.value = coach;
  showCoachModal.value = true;
}

function closeCoachModal() {
  showCoachModal.value = false;
  selectedCoach.value = null;
}

onMounted(async () => {
  cancelled = false;
  await syncFavFromServer();
  
  // Load player status if user is a player
  if (auth.user && isPlayer.value) {
    await loadPlayerStatus();
  }
  
  // Load coach status if user is a coach
  if (auth.user && isCoach.value) {
    await loadCoachStatus();
  }
  
  // If we already have club from list, render immediately and then refresh in background
  if (club.value) {
    loading.value = false;
    // Load club players and coaches immediately if we have club data
    loadClubPlayers();
    loadClubCoaches();
    fetchSponsors();
  } else {
    loading.value = true;
  }

  try {
    const { data } = await api
      .get(`/clubs/public/${route.params.id}`)
      .catch(() => ({ data: null }));
    if (!cancelled && data) {
      club.value = data;
      // Load club players and coaches after getting club data
      loadClubPlayers();
      loadClubCoaches();
      fetchSponsors();
    } else if (!cancelled) {
      // Fallback: fetch list and find the club client-side
      const listResp = await api.get('/clubs/public').catch(() => ({ data: [] }));
      const arr = Array.isArray(listResp.data) ? listResp.data : [];
      const found = arr.find(c => (c.id || c._id) == route.params.id);
      if (found) {
        club.value = found;
        loadClubPlayers();
        loadClubCoaches();
        fetchSponsors();
      }
    }
  } catch (e) {
    if (!cancelled) {
      console.error('Failed to load club', e);
      // Keep existing club if we had one from state; otherwise null
      club.value = club.value || null;
    }
  } finally {
    if (!cancelled) loading.value = false;
  }
});

watch(() => route.params.id, syncFavFromServer);

onUnmounted(() => { cancelled = true; });
</script>

<style scoped>
/* Glassmorphism Navigation */
.glass-nav {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Glassmorphism Panel */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Dark Glass Panel */
.glass-panel-dark {
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
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

/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>