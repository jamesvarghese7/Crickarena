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
        <!-- Navigation Tabs -->
        <div class="glass-panel rounded-2xl border border-white/20 overflow-hidden">
          <div class="border-b border-white/10">
            <nav class="flex flex-wrap gap-1 p-2">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="tabClass(tab.id)"
                class="group relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <div class="flex items-center gap-2">
                  <span>{{ tab.icon }}</span>
                  <span>{{ tab.label }}</span>
                  <span v-if="tab.count !== undefined"
                    class="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs rounded-full">
                    {{ tab.count }}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">

            <!-- OVERVIEW TAB -->
            <div v-if="activeTab === 'overview'" class="grid lg:grid-cols-3 gap-8">
            <!-- Left: About + Achievements -->
            <div class="lg:col-span-2 space-y-8">
              <!-- About -->
              <div class="glass-card rounded-2xl border border-white/20 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white">About the Club</h2>
                </div>
                <p class="text-gray-300 leading-relaxed text-base">
                  {{ club.description || 'This cricket club is dedicated to promoting the sport and nurturing talent at all levels.' }}
                </p>
              </div>
              <!-- Achievements -->
              <div v-if="club.achievements" class="glass-card rounded-2xl border border-white/20 p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-white">Achievements &amp; Honors</h2>
                </div>
                <p class="text-gray-300 leading-relaxed whitespace-pre-line text-base">{{ club.achievements }}</p>
              </div>
            </div>
            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Contact -->
              <div class="glass-card rounded-2xl border border-white/20 p-6">
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white">Contact</h3>
                </div>
                <div class="space-y-3">
                  <div v-if="club.email" class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <a :href="`mailto:${club.email}`" class="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">{{ club.email }}</a>
                  </div>
                  <div v-if="club.phone" class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    <a :href="`tel:${club.phone}`" class="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">{{ club.phone }}</a>
                  </div>
                  <div v-if="club.website" class="flex items-center gap-3">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <a :href="club.website" target="_blank" class="text-emerald-400 hover:text-emerald-300 text-sm break-all transition-colors">{{ club.website }}</a>
                  </div>
                  <p v-if="!club.email && !club.phone && !club.website" class="text-sm text-gray-400">No contact info available.</p>
                </div>
              </div>
              <!-- Stats -->
              <div class="glass-card rounded-2xl border border-white/20 p-6">
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white">Club Stats</h3>
                </div>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-2 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span class="text-gray-300 text-sm font-semibold">Active Players</span>
                    <span class="text-xl font-bold text-emerald-400">{{ club.memberCount || 0 }}</span>
                  </div>
                  <div v-if="club.foundedYear" class="flex items-center justify-between py-2 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span class="text-gray-300 text-sm font-semibold">Years Active</span>
                    <span class="text-xl font-bold text-emerald-400">{{ new Date().getFullYear() - club.foundedYear }}</span>
                  </div>
                  <div v-if="club.groundName" class="py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                    <div class="text-gray-400 text-xs font-semibold mb-1">Home Ground</div>
                    <div class="text-white font-semibold text-sm">{{ club.groundName }}</div>
                  </div>
                </div>
              </div>
              <!-- Sponsors preview -->
              <div v-if="clubSponsors.length > 0" class="glass-card rounded-2xl border border-white/20 p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-white">Our Sponsors</h3>
                </div>
                <div class="space-y-2">
                  <div v-for="sponsor in clubSponsors.slice(0, 4)" :key="sponsor._id"
                       class="flex items-center gap-3 p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div class="w-8 h-8 rounded-lg overflow-hidden bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <img v-if="sponsor.logoUrl" :src="getSponsorLogoUrl(sponsor.logoUrl)" :alt="sponsor.companyName" class="w-full h-full object-cover"/>
                      <span v-else class="text-amber-400 font-bold text-xs">{{ sponsor.companyName?.charAt(0) }}</span>
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

            <!-- SQUAD TAB -->
            <div v-if="activeTab === 'squad'">
            <div v-if="loadingPlayers" class="text-center py-16">
              <div class="inline-block rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
              <p class="text-gray-300 text-lg">Loading squad members...</p>
            </div>
            <div v-else-if="clubPlayers.length === 0" class="text-center py-20 glass-card rounded-2xl border border-white/20">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">No Active Players</h3>
              <p class="text-gray-400 max-w-md mx-auto">This club is currently building its squad. Be the first to join!</p>
            </div>
            <div v-else class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="player in clubPlayers" :key="player.id"
                   class="group relative glass-card rounded-2xl overflow-hidden border border-white/20 hover:border-emerald-500/40 transition-all duration-300">
                <div class="relative h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 overflow-hidden">
                  <div class="absolute inset-0 opacity-10">
                    <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <pattern id="grida" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="white"/></pattern>
                      <rect width="100" height="100" fill="url(#grida)"/>
                    </svg>
                  </div>
                  <div class="absolute top-3 right-3">
                    <span :class="[
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg',
                      player.preferredPosition?.toLowerCase()?.includes('bat') ? 'bg-amber-400 text-amber-900' :
                      player.preferredPosition?.toLowerCase()?.includes('bowl') ? 'bg-purple-400 text-purple-900' :
                      player.preferredPosition?.toLowerCase()?.includes('keeper') ? 'bg-blue-400 text-blue-900' :
                      'bg-emerald-400 text-emerald-900'
                    ]">{{ player.preferredPosition || 'All-rounder' }}</span>
                  </div>
                </div>
                <div class="relative -mt-12 px-5">
                  <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-slate-700 ring-4 ring-emerald-500/20">
                    {{ player.fullName?.charAt(0)?.toUpperCase() || 'P' }}
                  </div>
                </div>
                <div class="px-5 pt-3 pb-4">
                  <h3 class="text-lg font-black text-white mb-0.5 truncate">{{ player.fullName }}</h3>
                  <div class="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span>{{ player.age }} years old</span>
                  </div>
                  <div class="bg-slate-800/70 rounded-xl p-3 mb-4 border border-white/10">
                    <div class="text-[10px] text-gray-400 font-bold uppercase text-center mb-2 pb-1.5 border-b border-white/10">Career Stats</div>
                    <div class="grid grid-cols-3 gap-1.5 mb-2">
                      <div class="text-center py-2 px-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div class="text-base font-black text-blue-400">{{ player.statistics?.matchesPlayed || 0 }}</div>
                        <div class="text-[8px] text-gray-400 font-semibold uppercase">Matches</div>
                      </div>
                      <div class="text-center py-2 px-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <div class="text-base font-black text-emerald-400">{{ player.statistics?.runsScored || 0 }}</div>
                        <div class="text-[8px] text-gray-400 font-semibold uppercase">Runs</div>
                      </div>
                      <div class="text-center py-2 px-1 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div class="text-base font-black text-purple-400">{{ player.statistics?.wicketsTaken || 0 }}</div>
                        <div class="text-[8px] text-gray-400 font-semibold uppercase">Wkts</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-1.5">
                      <div class="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <div class="text-center"><div class="text-sm font-black text-white leading-none">{{ player.statistics?.catches || 0 }}</div><div class="text-[7px] text-gray-400 font-semibold uppercase">Catch</div></div>
                      </div>
                      <div class="flex items-center justify-center gap-1.5 py-2 px-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                        <div class="text-center"><div class="text-sm font-black text-white leading-none">{{ player.statistics?.stumpings || 0 }}</div><div class="text-[7px] text-gray-400 font-semibold uppercase">Stump</div></div>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="flex items-center gap-2 py-2 px-3 bg-slate-700/50 rounded-lg border border-white/10">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <div><div class="text-[10px] text-gray-500 font-medium uppercase">Exp</div><div class="font-bold text-gray-200 text-xs">{{ player.playingExperience || 'N/A' }}</div></div>
                    </div>
                    <div class="flex items-center gap-2 py-2 px-3 bg-slate-700/50 rounded-lg border border-white/10">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <div><div class="text-[10px] text-gray-500 font-medium uppercase">Joined</div><div class="font-bold text-gray-200 text-xs">{{ formatDate(player.joinedAt) }}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <!-- MATCHES TAB -->
            <div v-if="activeTab === 'matches'">
              <div v-if="loadingMatches" class="text-center py-16">
                <div class="inline-block rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
                <p class="text-gray-300 text-lg">Loading matches...</p>
              </div>
              
              <div v-else-if="clubMatches.length === 0" class="text-center py-20 glass-card rounded-2xl border border-white/20">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">No Matches Yet</h3>
                <p class="text-gray-400 max-w-md mx-auto">This club hasn't participated in any matches yet. Check back later!</p>
              </div>

              <div v-else class="space-y-8">
                <!-- Quick Stats Summary -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div class="rounded-xl p-4 border border-red-500/50 text-center bg-gradient-to-br from-red-950/60 to-red-900/40 backdrop-blur-sm shadow-lg">
                    <div class="text-3xl font-black text-red-400 mb-1">{{ liveMatches.length }}</div>
                    <div class="text-xs text-gray-300 font-semibold uppercase tracking-wider">Live Now</div>
                  </div>
                  <div class="rounded-xl p-4 border border-blue-500/50 text-center bg-gradient-to-br from-blue-950/60 to-blue-900/40 backdrop-blur-sm shadow-lg">
                    <div class="text-3xl font-black text-blue-400 mb-1">{{ upcomingMatches.length }}</div>
                    <div class="text-xs text-gray-300 font-semibold uppercase tracking-wider">Upcoming</div>
                  </div>
                  <div class="rounded-xl p-4 border border-green-500/50 text-center bg-gradient-to-br from-green-950/60 to-green-900/40 backdrop-blur-sm shadow-lg">
                    <div class="text-3xl font-black text-green-400 mb-1">{{ completedMatches.length }}</div>
                    <div class="text-xs text-gray-300 font-semibold uppercase tracking-wider">Completed</div>
                  </div>
                </div>

                <!-- Show message if all match arrays are empty -->
                <div v-if="liveMatches.length === 0 && upcomingMatches.length === 0 && completedMatches.length === 0" class="text-center py-20 glass-card rounded-2xl border border-white/20">
                  <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-white mb-2">No Categorized Matches</h3>
                  <p class="text-gray-400 max-w-md mx-auto">Match data is loading or unavailable.</p>
                </div>
                <!-- Live Matches Section -->
                <div v-if="liveMatches.length > 0">
                  <div class="flex items-center gap-3 mb-5 bg-gradient-to-r from-red-900/40 to-transparent px-4 py-3 rounded-xl border border-red-500/30">
                    <div class="w-10 h-10 rounded-xl bg-red-500/30 flex items-center justify-center animate-pulse shadow-lg">
                      <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8"/>
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white">Live Matches</h3>
                    <span class="px-3 py-1 bg-red-500/30 text-red-300 text-sm font-semibold rounded-full border border-red-500/50 animate-pulse shadow-lg">
                      {{ liveMatches.length }} LIVE
                    </span>
                  </div>
                  
                  <div class="grid gap-4">
                    <div v-for="match in liveMatches" :key="match._id"
                         @click="viewMatchDetails(match._id)"
                         class="rounded-2xl border-2 border-red-500/40 hover:border-red-500/60 transition-all duration-300 overflow-hidden cursor-pointer group relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl shadow-xl">
                      <!-- Live indicator -->
                      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>
                      
                      <div class="p-5">
                        <!-- Match Header -->
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-3 py-1.5 rounded-full text-xs font-bold uppercase border bg-red-500/40 text-red-200 border-red-500/60 animate-pulse shadow-lg">
                              🔴 LIVE
                            </span>
                            <span v-if="match.matchFormat" class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50 shadow-md">
                              {{ match.matchFormat }}
                            </span>
                            <span v-if="match.stage || match.round" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-500/50 shadow-md">
                              {{ match.stage || match.round }}
                            </span>
                          </div>
                          <div class="text-right bg-slate-800/60 px-3 py-1.5 rounded-lg border border-red-500/30">
                            <div class="text-sm font-semibold text-red-300">{{ formatMatchDate(match.date) }}</div>
                            <div v-if="match.time" class="text-xs text-gray-300">{{ formatMatchTime(match.time) }}</div>
                          </div>
                        </div>

                        <!-- Tournament Info -->
                        <div v-if="match.tournament?.name" class="mb-4 flex items-center gap-2 text-sm">
                          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                          </svg>
                          <span class="text-gray-300 font-semibold">{{ match.tournament.name }}</span>
                          <span v-if="match.matchCode" class="text-xs text-gray-500">({{ match.matchCode }})</span>
                        </div>

                        <!-- Teams with Scores -->
                        <div class="space-y-3">
                          <!-- Home Club -->
                          <div v-if="match.homeClub" class="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-transparent rounded-xl border border-emerald-500/40 backdrop-blur-sm">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-[3px] flex items-center justify-center flex-shrink-0 shadow-lg">
                                <div class="w-full h-full rounded-lg bg-white flex items-center justify-center p-1">
                                  <img v-if="match.homeClub?.logoUrl" :src="match.homeClub.logoUrl" :alt="match.homeClub?.name || 'Home Team'" class="w-full h-full object-contain" />
                                  <span v-else class="text-emerald-600 font-bold text-lg">{{ match.homeClub?.name?.charAt(0) || 'H' }}</span>
                                </div>
                              </div>
                              <div class="min-w-0">
                                <div class="font-bold text-white text-lg truncate">{{ match.homeClub?.name || 'Home Team' }}</div>
                                <div class="text-xs text-emerald-400 font-semibold">HOME</div>
                              </div>
                            </div>
                            <div v-if="match.homeScore" class="text-right ml-4">
                              <div class="text-3xl font-black text-white">{{ match.homeScore.runs }}<span class="text-gray-400">/{{ match.homeScore.wickets }}</span></div>
                              <div class="text-xs text-gray-400 font-semibold">({{ match.homeScore.overs }} ov)</div>
                            </div>
                            <div v-else class="text-gray-500 text-sm font-medium ml-4">Yet to bat</div>
                          </div>

                          <!-- Away Club -->
                          <div v-if="match.awayClub" class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/30 via-blue-500/20 to-transparent rounded-xl border border-blue-500/40 backdrop-blur-sm">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-[3px] flex items-center justify-center flex-shrink-0 shadow-lg">
                                <div class="w-full h-full rounded-lg bg-white flex items-center justify-center p-1">
                                  <img v-if="match.awayClub?.logoUrl" :src="match.awayClub.logoUrl" :alt="match.awayClub?.name || 'Away Team'" class="w-full h-full object-contain" />
                                  <span v-else class="text-blue-600 font-bold text-lg">{{ match.awayClub?.name?.charAt(0) || 'A' }}</span>
                                </div>
                              </div>
                              <div class="min-w-0">
                                <div class="font-bold text-white text-lg truncate">{{ match.awayClub?.name || 'Away Team' }}</div>
                                <div class="text-xs text-blue-400 font-semibold">AWAY</div>
                              </div>
                            </div>
                            <div v-if="match.awayScore" class="text-right ml-4">
                              <div class="text-3xl font-black text-white">{{ match.awayScore.runs }}<span class="text-gray-400">/{{ match.awayScore.wickets }}</span></div>
                              <div class="text-xs text-gray-400 font-semibold">({{ match.awayScore.overs }} ov)</div>
                            </div>
                            <div v-else class="text-gray-500 text-sm font-medium ml-4">Yet to bat</div>
                          </div>

                          <!-- Fallback if no teams found -->
                          <div v-if="!match.homeClub && !match.awayClub" class="text-center py-6 text-gray-400">
                            <p class="text-sm">Match data incomplete</p>
                          </div>
                        </div>

                        <!-- Venue -->
                        <div v-if="match.venue" class="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-gray-300">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>{{ match.venue }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Upcoming Matches Section -->
                <div v-if="upcomingMatches.length > 0">
                  <div class="flex items-center gap-3 mb-5 bg-gradient-to-r from-blue-900/40 to-transparent px-4 py-3 rounded-xl border border-blue-500/30">
                    <div class="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white">Upcoming Matches</h3>
                    <span class="px-3 py-1 bg-blue-500/30 text-blue-300 text-sm font-semibold rounded-full border border-blue-500/50 shadow-lg">
                      {{ upcomingMatches.length }}
                    </span>
                  </div>
                  
                  <div class="grid gap-4">
                    <div v-for="match in upcomingMatches" :key="match._id"
                         @click="viewMatchDetails(match._id)"
                         class="rounded-2xl border border-white/20 hover:border-blue-500/40 transition-all duration-300 overflow-hidden cursor-pointer group bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl shadow-lg">
                      <div class="p-5">
                        <!-- Match Header -->
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span :class="['px-3 py-1.5 rounded-full text-xs font-bold uppercase border shadow-lg', getMatchStatusColor(match.status)]">
                              {{ match.status }}
                            </span>
                            <span v-if="match.matchFormat" class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50 shadow-md">
                              {{ match.matchFormat }}
                            </span>
                            <span v-if="match.stage || match.round" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-500/50 shadow-md">
                              {{ match.stage || match.round }}
                            </span>
                          </div>
                          <div class="text-right bg-slate-800/60 px-3 py-1.5 rounded-lg border border-blue-500/30">
                            <div class="text-sm font-semibold text-blue-300">{{ formatMatchDate(match.date) }}</div>
                            <div v-if="match.time" class="text-xs text-gray-300">{{ formatMatchTime(match.time) }}</div>
                          </div>
                        </div>

                        <!-- Tournament Info -->
                        <div v-if="match.tournament?.name" class="mb-4 flex items-center gap-2 text-sm">
                          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                          </svg>
                          <span class="text-gray-300 font-semibold">{{ match.tournament.name }}</span>
                          <span v-if="match.matchCode" class="text-xs text-gray-500">({{ match.matchCode }})</span>
                        </div>

                        <!-- Teams -->
                        <div v-if="match.homeClub && match.awayClub" class="flex items-center justify-between gap-4">
                          <!-- Home Club -->
                          <div class="flex items-center gap-3 flex-1 min-w-0">
                            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-[3px] flex items-center justify-center flex-shrink-0 shadow-lg">
                              <div class="w-full h-full rounded-lg bg-white flex items-center justify-center p-1.5">
                                <img v-if="match.homeClub?.logoUrl" :src="match.homeClub.logoUrl" :alt="match.homeClub?.name || 'Home Team'" class="w-full h-full object-contain" />
                                <span v-else class="text-emerald-600 font-bold text-xl">{{ match.homeClub?.name?.charAt(0) || 'H' }}</span>
                              </div>
                            </div>
                            <div class="min-w-0">
                              <div class="font-bold text-white text-lg truncate">{{ match.homeClub?.name || 'Home Team' }}</div>
                              <div class="text-xs text-emerald-400 font-semibold">HOME</div>
                            </div>
                          </div>

                          <!-- VS -->
                          <div class="px-5 py-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl border border-white/20 shadow-lg flex-shrink-0">
                            <span class="text-white font-black text-lg">VS</span>
                          </div>

                          <!-- Away Club -->
                          <div class="flex items-center gap-3 flex-1 justify-end min-w-0">
                            <div class="min-w-0 text-right">
                              <div class="font-bold text-white text-lg truncate">{{ match.awayClub?.name || 'Away Team' }}</div>
                              <div class="text-xs text-blue-400 font-semibold">AWAY</div>
                            </div>
                            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-[3px] flex items-center justify-center flex-shrink-0 shadow-lg">
                              <div class="w-full h-full rounded-lg bg-white flex items-center justify-center p-1.5">
                                <img v-if="match.awayClub?.logoUrl" :src="match.awayClub.logoUrl" :alt="match.awayClub?.name || 'Away Team'" class="w-full h-full object-contain" />
                                <span v-else class="text-blue-600 font-bold text-xl">{{ match.awayClub?.name?.charAt(0) || 'A' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Fallback if teams missing -->
                        <div v-else class="text-center py-6 text-gray-400">
                          <p class="text-sm">Team information unavailable</p>
                        </div>

                        <!-- Venue -->
                        <div v-if="match.venue" class="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-gray-300">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>{{ match.venue }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Completed Matches Section -->
                <div v-if="completedMatches.length > 0">
                  <div class="flex items-center gap-3 mb-5 bg-gradient-to-r from-green-900/40 to-transparent px-4 py-3 rounded-xl border border-green-500/30">
                    <div class="w-10 h-10 rounded-xl bg-green-500/30 flex items-center justify-center shadow-lg">
                      <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white">Completed Matches</h3>
                    <span class="px-3 py-1 bg-green-500/30 text-green-300 text-sm font-semibold rounded-full border border-green-500/50 shadow-lg">
                      {{ completedMatches.length }}
                    </span>
                  </div>
                  
                  <div class="grid gap-4">
                    <div v-for="match in completedMatches" :key="match._id"
                         @click="viewMatchDetails(match._id)"
                         class="rounded-2xl border border-white/20 hover:border-green-500/40 transition-all duration-300 overflow-hidden cursor-pointer group bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl shadow-lg">
                      <div class="p-5">
                        <!-- Match Header -->
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span :class="['px-3 py-1.5 rounded-full text-xs font-bold uppercase border shadow-lg', getMatchStatusColor(match.status)]">
                              ✓ {{ match.status }}
                            </span>
                            <span v-if="match.matchFormat" class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-500/50 shadow-md">
                              {{ match.matchFormat }}
                            </span>
                            <span v-if="match.stage || match.round" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-500/50 shadow-md">
                              {{ match.stage || match.round }}
                            </span>
                          </div>
                          <div class="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-green-500/30">
                            <div class="text-sm font-semibold text-green-300">{{ formatMatchDate(match.date) }}</div>
                          </div>
                        </div>

                        <!-- Tournament Info -->
                        <div v-if="match.tournament?.name" class="mb-4 flex items-center gap-2 text-sm">
                          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                          </svg>
                          <span class="text-gray-300 font-semibold">{{ match.tournament.name }}</span>
                          <span v-if="match.matchCode" class="text-xs text-gray-500">({{ match.matchCode }})</span>
                        </div>

                        <!-- Teams with Scores -->
                        <div v-if="match.homeClub && match.awayClub" class="space-y-3">
                          <!-- Home Club -->
                          <div :class="[
                            'flex items-center justify-between p-4 rounded-xl border transition-all backdrop-blur-sm',
                            match.result?.winner && match.homeClub?._id && String(match.result.winner) === String(match.homeClub._id)
                              ? 'bg-gradient-to-r from-green-600/40 via-green-500/20 to-transparent border-green-500/50'
                              : 'bg-slate-800/60 border-white/20'
                          ]">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                              <div class="relative">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-[3px] flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <div class="w-full h-full rounded-lg bg-white flex items-center justify-center p-1">
                                    <img v-if="match.homeClub?.logoUrl" :src="match.homeClub.logoUrl" :alt="match.homeClub?.name || 'Home Team'" class="w-full h-full object-contain" />
                                    <span v-else class="text-emerald-600 font-bold text-lg">{{ match.homeClub?.name?.charAt(0) || 'H' }}</span>
                                  </div>
                                </div>
                                <!-- Winner Badge -->
                                <div v-if="match.result?.winner && match.homeClub?._id && String(match.result.winner) === String(match.homeClub._id)" 
                                     class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                </div>
                              </div>
                              <div class="min-w-0">
                                <div class="font-bold text-white text-lg truncate">{{ match.homeClub?.name || 'Home Team' }}</div>
                                <div class="text-xs text-emerald-400 font-semibold">HOME</div>
                              </div>
                            </div>
                            <div v-if="match.homeScore" class="text-right ml-4">
                              <div class="text-3xl font-black text-white">{{ match.homeScore.runs }}<span class="text-gray-400">/{{ match.homeScore.wickets }}</span></div>
                              <div class="text-xs text-gray-400 font-semibold">({{ match.homeScore.overs }} ov)</div>
                            </div>
                            <div v-else class="text-gray-500 text-sm font-medium ml-4">Did not bat</div>
                          </div>

                          <!-- Away Club -->
                          <div :class="[
                            'flex items-center justify-between p-4 rounded-xl border transition-all backdrop-blur-sm',
                            match.result?.winner && match.awayClub?._id && String(match.result.winner) === String(match.awayClub._id)
                              ? 'bg-gradient-to-r from-green-600/40 via-green-500/20 to-transparent border-green-500/50'
                              : 'bg-slate-800/60 border-white/20'
                          ]">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                              <div class="relative">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-[3px] flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <div class="w-full h-full rounded-lg bg-white flex items-center justify-center p-1">
                                    <img v-if="match.awayClub?.logoUrl" :src="match.awayClub.logoUrl" :alt="match.awayClub?.name || 'Away Team'" class="w-full h-full object-contain" />
                                    <span v-else class="text-blue-600 font-bold text-lg">{{ match.awayClub?.name?.charAt(0) || 'A' }}</span>
                                  </div>
                                </div>
                                <!-- Winner Badge -->
                                <div v-if="match.result?.winner && match.awayClub?._id && String(match.result.winner) === String(match.awayClub._id)" 
                                     class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                </div>
                              </div>
                              <div class="min-w-0">
                                <div class="font-bold text-white text-lg truncate">{{ match.awayClub?.name || 'Away Team' }}</div>
                                <div class="text-xs text-blue-400 font-semibold">AWAY</div>
                              </div>
                            </div>
                            <div v-if="match.awayScore" class="text-right ml-4">
                              <div class="text-3xl font-black text-white">{{ match.awayScore.runs }}<span class="text-gray-400">/{{ match.awayScore.wickets }}</span></div>
                              <div class="text-xs text-gray-400 font-semibold">({{ match.awayScore.overs }} ov)</div>
                            </div>
                            <div v-else class="text-gray-500 text-sm font-medium ml-4">Did not bat</div>
                          </div>
                        </div>

                        <!-- Fallback if teams missing -->
                        <div v-else class="text-center py-6 text-gray-400">
                          <p class="text-sm">Team information unavailable</p>
                        </div>

                        <!-- Result -->
                        <div v-if="match.result?.summary || match.summary" class="mt-4 pt-4 border-t border-white/10">
                          <div class="flex items-center gap-2 text-sm">
                            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-green-400 font-semibold">{{ match.result?.summary || match.summary }}</span>
                          </div>
                        </div>

                        <!-- Venue -->
                        <div v-if="match.venue" class="mt-3 flex items-center gap-2 text-xs text-gray-300">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>{{ match.venue }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- COACHES TAB -->
            <div v-if="activeTab === 'coaches'">
            <div v-if="loadingCoaches" class="text-center py-16">
              <div class="inline-block rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-4"></div>
              <p class="text-gray-300">Loading coaching team...</p>
            </div>
            <div v-else-if="clubCoaches.length === 0" class="text-center py-20 glass-card rounded-2xl border border-white/20">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m0 0a5.002 5.002 0 0 1 9.75 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-1">No coaches available</h3>
              <p class="text-gray-400 text-sm">This club is currently building its coaching team.</p>
            </div>
            <div v-else class="grid md:grid-cols-2 gap-5">
              <div v-for="coach in clubCoaches" :key="coach.id"
                   class="glass-card border border-white/20 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all duration-300">
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
                      <span class="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">{{ formatExperience(coach.coachingExperience) }}</span>
                      <span class="text-sm text-gray-400">Age {{ coach.age }}</span>
                    </div>
                  </div>
                  <button @click="viewCoachProfile(coach)"
                    class="text-emerald-400 hover:text-emerald-300 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-emerald-500/10 transition-all border border-emerald-500/30">
                    Profile
                  </button>
                </div>
                <div class="p-4">
                  <div v-if="coach.specializations && coach.specializations.length > 0" class="mb-3">
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Specializations</div>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="spec in coach.specializations" :key="spec" class="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300">{{ formatSpecialization(spec) }}</span>
                    </div>
                  </div>
                  <div v-if="coach.coachingHistory && coach.coachingHistory.length > 0">
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent Experience</div>
                    <div class="font-medium text-white text-sm">{{ coach.coachingHistory[0].teamName }}</div>
                    <div class="text-gray-400 text-xs mt-0.5">{{ coach.coachingHistory[0].position }} ({{ coach.coachingHistory[0].yearsCoached }})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <!-- GALLERY TAB -->
            <div v-if="activeTab === 'gallery'">
            <div v-if="galleryItems.length > 0" class="flex flex-wrap gap-2 mb-5">
              <button v-for="cat in galleryCats" :key="cat.value" @click="galleryFilter = cat.value"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all border',
                  galleryFilter === cat.value
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white/10 text-gray-300 border-white/20 hover:border-purple-400/50'
                ]">{{ cat.label }}</button>
            </div>
            <div v-if="loadingGallery" class="text-center py-16">
              <div class="inline-block rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p class="text-gray-300">Loading gallery...</p>
            </div>
            <div v-else-if="filteredGallery.length === 0" class="text-center py-20 glass-card rounded-2xl border border-white/20">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white mb-1">No photos yet</h3>
              <p class="text-gray-400 text-sm">This club hasn't added any photos to their gallery.</p>
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div v-for="(item, idx) in filteredGallery" :key="item.id"
                @click="openLightbox(idx)"
                class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-purple-500/40 transition-all duration-300">
                <img :src="getGalleryImageUrl(item.imageUrl)" :alt="item.caption || 'Gallery photo'"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  @error="e => e.target.style.display='none'"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div class="absolute bottom-0 left-0 right-0 p-3">
                    <p v-if="item.caption" class="text-white text-xs font-medium truncate">{{ item.caption }}</p>
                    <p class="text-gray-300 text-[10px] capitalize">{{ item.category }}</p>
                  </div>
                </div>
                <div v-if="item.isFeatured" class="absolute top-2 right-2 px-1.5 py-0.5 bg-yellow-500 text-white text-[9px] font-bold rounded-full">★</div>
              </div>
            </div>
          </div>

            <!-- INFO TAB -->
            <div v-if="activeTab === 'info'" class="grid md:grid-cols-2 gap-6">
            <!-- Contact -->
            <div class="glass-card rounded-2xl border border-white/20 p-6">
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
                  <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <div><div class="text-sm text-gray-400 font-medium">Email</div><a :href="`mailto:${club.email}`" class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">{{ club.email }}</a></div>
                </div>
                <div v-if="club.phone" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <div><div class="text-sm text-gray-400 font-medium">Phone</div><a :href="`tel:${club.phone}`" class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">{{ club.phone }}</a></div>
                </div>
                <div v-if="club.website" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <div><div class="text-sm text-gray-400 font-medium">Website</div><a :href="club.website" target="_blank" class="text-emerald-400 hover:text-emerald-300 font-medium break-all transition-colors">{{ club.website }}</a></div>
                </div>
                <div v-if="!club.email && !club.phone && !club.website" class="text-center py-6">
                  <p class="text-sm text-gray-400">Contact information not available</p>
                </div>
              </div>
            </div>
            <!-- Stats -->
            <div class="glass-card rounded-2xl border border-white/20 p-6">
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
                <div v-if="club.foundedYear" class="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/10">
                  <span class="text-gray-300 font-semibold">Founded</span>
                  <span class="text-2xl font-bold text-emerald-400">{{ club.foundedYear }}</span>
                </div>
                <div v-if="club.groundName" class="py-3 px-4 bg-white/5 rounded-xl border border-white/10">
                  <div class="text-gray-400 font-semibold mb-1">Home Ground</div>
                  <div class="text-white font-semibold">{{ club.groundName }}</div>
                </div>
              </div>
            </div>
            <!-- Full Sponsors -->
            <div v-if="clubSponsors.length > 0" class="glass-card rounded-2xl border border-white/20 p-6 md:col-span-2">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">Our Sponsors</h3>
              </div>
              <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="sponsor in clubSponsors" :key="sponsor._id"
                     class="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <img v-if="sponsor.logoUrl" :src="getSponsorLogoUrl(sponsor.logoUrl)" :alt="sponsor.companyName" class="w-full h-full object-cover"/>
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

    <!-- Application Modal (for both Player and Coach) -->
    <Transition name="fade">
      <div 
        v-if="showApplicationModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeApplicationModal"
      >
        <div class="relative glass-card rounded-3xl shadow-2xl max-w-lg w-full border border-white/20 overflow-hidden">
          <!-- Modal Header -->
          <div class="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-6">
            <!-- Close Button -->
            <button 
              @click="closeApplicationModal"
              class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="text-white">
                <h2 class="text-xl font-bold">{{ applicationModalType === 'coach' ? 'Apply to Coach' : 'Apply to Join' }}</h2>
                <p class="text-emerald-100 text-sm">{{ club?.name || club?.clubName }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-2">
                Application Message <span class="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea 
                v-model="applicationMessage"
                rows="4"
                :placeholder="applicationModalType === 'coach' ? 'Tell the club why you\'d be a great coach for their team...' : 'Tell the club why you\'d like to join their team...'"
                class="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>

            <!-- Info Box -->
            <div class="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <svg class="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-emerald-300">
                {{ applicationModalType === 'coach' 
                  ? 'Your coaching profile and experience will be shared with the club manager for review.' 
                  : 'Your player profile and stats will be shared with the club manager for review.' }}
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-5 bg-slate-900/50 border-t border-white/10 flex gap-3">
            <button 
              @click="closeApplicationModal"
              class="flex-1 px-4 py-3 rounded-xl bg-white/10 text-gray-300 font-semibold hover:bg-white/20 transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button 
              @click="submitApplication"
              :disabled="isSubmittingApplication"
              class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="isSubmittingApplication" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
              <span>{{ isSubmittingApplication ? 'Submitting...' : 'Submit Application' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Gallery Lightbox Modal -->
    <Transition name="fade">
      <div v-if="lightboxOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" @click.self="closeLightbox">
        <button @click="closeLightbox" class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <!-- Navigation arrows -->
        <button v-if="lightboxIndex > 0" @click.stop="lightboxIndex--" class="absolute left-4 p-2 text-white/70 hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button v-if="lightboxIndex < filteredGallery.length - 1" @click.stop="lightboxIndex++" class="absolute right-4 p-2 text-white/70 hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div class="max-w-4xl max-h-[85vh] mx-4">
          <img v-if="filteredGallery[lightboxIndex]" :src="getGalleryImageUrl(filteredGallery[lightboxIndex].imageUrl)" :alt="filteredGallery[lightboxIndex].caption || 'Gallery photo'" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"/>
          <div v-if="filteredGallery[lightboxIndex]?.caption" class="text-center mt-3">
            <p class="text-white text-sm font-medium">{{ filteredGallery[lightboxIndex].caption }}</p>
            <p class="text-gray-400 text-xs mt-1 capitalize">{{ filteredGallery[lightboxIndex].category }} · {{ filteredGallery[lightboxIndex].uploadedBy }}</p>
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

// Active tab state
const activeTab = ref('overview');

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

// Matches functionality
const clubMatches = ref([]);
const loadingMatches = ref(false);
const matchFilter = ref('all'); // 'all', 'upcoming', 'completed'

// Coach profile modal
const showCoachModal = ref(false);
const selectedCoach = ref(null);

// Application modal (for both player and coach)
const showApplicationModal = ref(false);
const applicationModalType = ref(''); // 'player' or 'coach'
const applicationMessage = ref('');
const isSubmittingApplication = ref(false);

// Sponsors
const clubSponsors = ref([]);
const SPONSOR_API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE?.replace(/\/api\/?$/, '') || 'http://localhost:4000';

// Gallery state
const galleryItems = ref([]);
const loadingGallery = ref(false);
const galleryFilter = ref('all');
const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const galleryCats = [
  { value: 'all', label: 'All' },
  { value: 'team', label: 'Team' },
  { value: 'match', label: 'Match' },
  { value: 'training', label: 'Training' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' }
];

const filteredGallery = computed(() => {
  if (galleryFilter.value === 'all') return galleryItems.value;
  return galleryItems.value.filter(i => i.category === galleryFilter.value);
});

// Filtered matches based on status
const filteredMatches = computed(() => {
  if (matchFilter.value === 'all') return clubMatches.value;
  if (matchFilter.value === 'upcoming') {
    return clubMatches.value.filter(m => 
      m.status === 'Scheduled' || m.status === 'scheduled' || m.status === 'upcoming'
    );
  }
  if (matchFilter.value === 'completed') {
    return clubMatches.value.filter(m => 
      m.status === 'Completed' || m.status === 'completed'
    );
  }
  return clubMatches.value;
});

// Separate upcoming and completed for display
const upcomingMatches = computed(() => 
  clubMatches.value.filter(m => 
    m.status === 'Scheduled' || m.status === 'scheduled' || m.status === 'upcoming'
  )
);

const liveMatches = computed(() => 
  clubMatches.value.filter(m => 
    m.status === 'Live' || m.status === 'live'
  )
);

const completedMatches = computed(() => 
  clubMatches.value.filter(m => 
    m.status === 'Completed' || m.status === 'completed'
  )
);

// Tab configuration
const tabs = computed(() => [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'squad', label: 'Squad', icon: '👥', count: clubPlayers.value.length },
  { id: 'matches', label: 'Matches', icon: '🏏', count: clubMatches.value.length },
  { id: 'coaches', label: 'Coaches', icon: '🎓', count: clubCoaches.value.length },
  { id: 'gallery', label: 'Gallery', icon: '📸', count: galleryItems.value.length },
  { id: 'info', label: 'Info', icon: 'ℹ️' }
]);

// Tab class helper
const tabClass = (tabId) => {
  return activeTab.value === tabId
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'text-gray-400 hover:text-white hover:bg-white/10';
};

function getGalleryImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SPONSOR_API_URL}${path}`;
}

function openLightbox(idx) {
  lightboxIndex.value = idx;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

async function fetchGallery() {
  const clubId = route.params.id;
  if (!clubId) return;
  loadingGallery.value = true;
  try {
    const { data } = await api.get(`/gallery/club/${clubId}?limit=50`);
    galleryItems.value = data.items || [];
  } catch (e) {
    console.warn('Failed to fetch gallery:', e);
  } finally {
    loadingGallery.value = false;
  }
}

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

// Load club matches
async function loadClubMatches() {
  if (!club.value) return;
  
  loadingMatches.value = true;
  try {
    const clubId = club.value.id || club.value._id;
    console.log(`🏏 Loading matches for club: ${club.value.name || club.value.clubName} (ID: ${clubId})`);
    const { data } = await api.get(`/clubs/public/${clubId}/matches`);
    console.log(`✅ Loaded ${data.matches?.length || 0} matches`);
    
    // Debug: Log match data structure
    if (data.matches && data.matches.length > 0) {
      console.log('📊 Sample match structure:', {
        firstMatch: data.matches[0],
        hasHomeClub: !!data.matches[0]?.homeClub,
        hasAwayClub: !!data.matches[0]?.awayClub,
        hasTournament: !!data.matches[0]?.tournament,
        homeClubName: data.matches[0]?.homeClub?.name,
        awayClubName: data.matches[0]?.awayClub?.name,
        homeClubLogoUrl: data.matches[0]?.homeClub?.logoUrl,
        awayClubLogoUrl: data.matches[0]?.awayClub?.logoUrl
      });
      console.log('📊 Match statuses:', data.matches.map(m => ({ 
        id: m._id, 
        status: m.status, 
        date: m.date,
        hasHomeClub: !!m.homeClub,
        hasAwayClub: !!m.awayClub,
        homeLogoUrl: m.homeClub?.logoUrl,
        awayLogoUrl: m.awayClub?.logoUrl
      })));
    }
    
    clubMatches.value = data.matches || [];
  } catch (error) {
    console.error('❌ Error loading club matches:', error);
    console.error('Error details:', error.response?.data || error.message);
    clubMatches.value = [];
  } finally {
    loadingMatches.value = false;
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

  // Show the application modal
  applicationModalType.value = 'player';
  applicationMessage.value = '';
  showApplicationModal.value = true;
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

  // Show the application modal
  applicationModalType.value = 'coach';
  applicationMessage.value = '';
  showApplicationModal.value = true;
}

// Close application modal
function closeApplicationModal() {
  showApplicationModal.value = false;
  applicationMessage.value = '';
  applicationModalType.value = '';
}

// Submit application (from modal)
async function submitApplication() {
  isSubmittingApplication.value = true;
  
  try {
    const clubId = club.value.id || club.value._id;
    const message = applicationMessage.value.trim();
    
    if (applicationModalType.value === 'coach') {
      await api.post(`/coaches/apply-to-club/${clubId}`, {
        message: message || 'I would like to coach for your club.'
      });
      // Refresh coach status after successful application
      await loadCoachStatus();
    } else {
      await api.post(`/players/apply-to-club/${clubId}`, {
        message: message || 'I would like to join your club.'
      });
      // Refresh player status after successful application
      await loadPlayerStatus();
    }
    
    // Close modal and show success message
    closeApplicationModal();
    alert('Application submitted successfully! The club manager will review your application.');
    
  } catch (error) {
    console.error('Error submitting application:', error);
    const errorMessage = error.response?.data?.message || 'Failed to submit application. Please try again.';
    alert(errorMessage);
  } finally {
    isSubmittingApplication.value = false;
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

// Format match date
function formatMatchDate(dateString) {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'TBD';
  }
}

// Format match time
function formatMatchTime(timeString) {
  if (!timeString) return '';
  return timeString;
}

// Get match status badge color
function getMatchStatusColor(status) {
  const statusLower = status?.toLowerCase();
  const colors = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    live: 'bg-red-500/20 text-red-400 border-red-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    abandoned: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    interrupted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };
  return colors[statusLower] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

// Get club logo URL
function getClubLogoUrl(logoUrl) {
  if (!logoUrl) {
    console.log('🖼️ No logoUrl provided');
    return '';
  }
  if (logoUrl.startsWith('http')) {
    console.log('🖼️ Using full URL:', logoUrl);
    return logoUrl;
  }
  const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
  const fullUrl = `${API}${logoUrl}`;
  console.log('🖼️ Constructed logo URL:', fullUrl);
  return fullUrl;
}

// Handle logo image load error
function handleLogoError(event, clubName) {
  console.error('❌ Failed to load logo for:', clubName, 'src:', event.target.src);
  // Hide the image on error so fallback text shows
  event.target.style.display = 'none';
}

// Navigate to match details
function viewMatchDetails(matchId) {
  router.push({ name: 'match-details', params: { id: matchId } });
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
    loadClubMatches();
    loadClubCoaches();
    fetchSponsors();
    fetchGallery();
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
      loadClubMatches();
      loadClubCoaches();
      fetchSponsors();
      fetchGallery();
    } else if (!cancelled) {
      // Fallback: fetch list and find the club client-side
      const listResp = await api.get('/clubs/public').catch(() => ({ data: [] }));
      const arr = Array.isArray(listResp.data) ? listResp.data : [];
      const found = arr.find(c => (c.id || c._id) == route.params.id);
      if (found) {
        club.value = found;
        loadClubPlayers();
        loadClubMatches();
        loadClubCoaches();
        fetchSponsors();
        fetchGallery();
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