<template>
  <div class="relative min-h-screen bg-transparent">
    <!-- Animated Cricket Background -->
    <AnimatedCricketBackground />

    <!-- Content Container with z-index to ensure it's above background -->
    <div class="relative z-10">

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 py-20 glass-panel-hero rounded-3xl my-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Content -->
          <div class="space-y-8">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Kerala's Premier Cricket Platform
              </div>
              <h1 class="text-5xl lg:text-7xl font-black leading-tight">
                <span class="neon-gradient">CrickArena</span>
              </h1>
              <p class="text-xl leading-relaxed max-w-2xl">
                Empowering Kerala's grassroots cricket community. Discover local tournaments, join neighborhood clubs, and connect with cricket lovers across God's Own Country.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-4">
              <template v-if="auth.user">
                <RouterLink to="/crickhub" class="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                  <span class="relative z-10">Go to Dashboard</span>
                  <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </RouterLink>
                <RouterLink to="/tournaments" class="px-8 py-4 border-2 border-emerald-600 text-emerald-700 bg-white rounded-2xl font-bold text-lg hover:bg-emerald-600 hover:text-white transition-all duration-300">
                  Browse Tournaments
                </RouterLink>
                <button @click="onLogout" class="px-8 py-4 border-2 border-green-600 text-green-600 rounded-2xl font-bold text-lg hover:bg-green-600 hover:text-white transition-all duration-300">
                  Logout
                </button>
              </template>
              <template v-else>
                <RouterLink to="/register" class="group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                  <span class="relative z-10">Get Started Free</span>
                  <div class="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </RouterLink>
                <RouterLink to="/login" class="px-8 py-4 border-2 border-green-600 text-green-600 rounded-2xl font-bold text-lg hover:bg-green-600 hover:text-white transition-all duration-300">
                  Sign In
                </RouterLink>
                <RouterLink to="/tournaments" class="px-8 py-4 border-2 border-emerald-600 text-emerald-700 bg-white rounded-2xl font-bold text-lg hover:bg-emerald-600 hover:text-white transition-all duration-300">
                  Browse Tournaments
                </RouterLink>
              </template>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-6 pt-8">
              <div class="text-center stat-card rounded-2xl p-4 cursor-pointer">
                <div class="text-3xl font-black text-white">{{ clubs.length }}</div>
                <div class="text-sm text-gray-300 font-medium mt-1">Kerala Clubs</div>
              </div>
              <div class="text-center stat-card rounded-2xl p-4 cursor-pointer">
                <div class="text-3xl font-black text-white">{{ upcoming.length }}</div>
                <div class="text-sm text-gray-300 font-medium mt-1">Active Tournaments</div>
              </div>
              <div class="text-center stat-card rounded-2xl p-4 cursor-pointer">
                <div class="text-3xl font-black text-white">{{ history.length }}</div>
                <div class="text-sm text-gray-300 font-medium mt-1">Completed Matches</div>
              </div>
            </div>
          </div>

          <!-- Right Content - Interactive Cricket Scene -->
          <div class="relative">
            <div class="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-2xl">
              <!-- Cricket Field Background -->
              <div class="absolute inset-0 opacity-20">
                <svg viewBox="0 0 400 300" class="w-full h-full">
                  <!-- Cricket pitch -->
                  <rect x="180" y="100" width="40" height="100" fill="white" opacity="0.8"/>
                  <!-- Wickets -->
                  <rect x="185" y="95" width="2" height="10" fill="white"/>
                  <rect x="190" y="95" width="2" height="10" fill="white"/>
                  <rect x="195" y="95" width="2" height="10" fill="white"/>
                  <rect x="185" y="205" width="2" height="10" fill="white"/>
                  <rect x="190" y="205" width="2" height="10" fill="white"/>
                  <rect x="195" y="205" width="2" height="10" fill="white"/>
                  <!-- Boundary circle -->
                  <circle cx="200" cy="150" r="120" fill="none" stroke="white" stroke-width="2" opacity="0.6"/>
                </svg>
              </div>

              <!-- Floating Cricket Elements -->
              <div class="absolute top-8 left-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce" style="animation-duration: 2s">
                <div class="w-10 h-10 bg-red-500 rounded-full relative">
                  <div class="absolute top-1 left-1 right-1 bottom-1 border-2 border-white rounded-full"></div>
                </div>
              </div>

              <div class="absolute top-16 right-12 w-12 h-20 bg-amber-100 rounded-lg shadow-lg flex items-center justify-center animate-pulse">
                <div class="w-2 h-16 bg-amber-600 rounded-full"></div>
              </div>

              <div class="absolute bottom-12 left-16 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center animate-spin" style="animation-duration: 4s">
                <svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>

              <!-- Featured Tournament Card -->
              <div v-if="upcoming.length" class="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer" @click="showTournamentDetails = !showTournamentDetails">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <span class="text-sm font-semibold text-green-600">Featured Tournament</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">{{ activeTournament.name || 'Cricket Championship' }}</h3>
                    <p class="text-sm text-gray-600">{{ activeTournament.location || 'Multiple Venues' }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl">🏏</div>
                    <div class="text-xs text-gray-500 mt-1">Click to explore</div>
                  </div>
                </div>
              </div>
              <div v-else class="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div class="text-center">
                  <div class="text-2xl mb-2">🏏</div>
                  <h3 class="text-lg font-bold text-gray-900 mb-2">Kerala Cricket Hub</h3>
                  <p class="text-sm text-gray-600">Your gateway to local cricket tournaments and clubs</p>
                </div>
              </div>
            </div>

            <!-- Floating Action Cards -->
            <div class="absolute -right-4 top-20 bg-white rounded-2xl p-4 shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <div class="text-2xl mb-2">📊</div>
              <div class="text-sm font-semibold text-gray-900">Live Scores</div>
              <div class="text-xs text-gray-500">Real-time updates</div>
            </div>

            <div class="absolute -left-4 bottom-32 bg-white rounded-2xl p-4 shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer" @click="goToClubs">
              <div class="text-2xl mb-2">🏏</div>
              <div class="text-sm font-semibold text-gray-900">Join Club</div>
              <div class="text-xs text-gray-500">Find nearby clubs</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Fixtures -->
    <section class="py-20 glass-panel rounded-3xl mx-4 my-8">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 badge-live">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Live Cricket Action
          </div>
          <h2 class="text-4xl font-black mb-4">Upcoming Fixtures</h2>
          <p class="text-xl max-w-3xl mx-auto">Don't miss the exciting cricket matches happening across Kerala. Follow your favorite teams and tournaments.</p>
        </div>

        <!-- Empty State -->
        <div v-if="fixtures.length === 0" class="text-center py-16">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Fixtures Scheduled</h3>
          <p class="text-gray-600 mb-6">Check back later for upcoming cricket matches and tournaments.</p>
          <RouterLink to="/tournaments" class="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Browse Tournaments
          </RouterLink>
        </div>

        <!-- Fixtures Grid -->
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="fx in fixtures.slice(0, 6)"
            :key="fx._id"
            class="group premium-card rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            @click="router.push({ name: 'match-details', params: { id: fx.tournament?._id, matchId: fx._id } })"
          >
            
            <!-- Match Status Badge -->
            <div class="absolute top-4 right-4 z-10">
              <div class="badge-status inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Upcoming
              </div>
            </div>

            <!-- Tournament Info -->
            <div class="absolute top-4 left-4 z-10">
              <div class="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white border border-white/30">
                {{ fx.tournament?.name || 'Tournament' }}
              </div>
            </div>

            <!-- Main Content -->
            <div class="relative z-10 p-6 pt-12">
              <!-- Teams Section -->
              <div class="text-center mb-6">
                <div class="flex items-center justify-center gap-6 mb-4">
                  <!-- Home Team -->
                  <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-green-400/40 group-hover:scale-105 transition-transform duration-300">
                      <img v-if="fx.homeClub?.logoUrl" 
                           :src="fx.homeClub.logoUrl" 
                           class="w-10 h-10 rounded-lg object-cover object-center"
                           :alt="fx.homeClub?.clubName || fx.homeClub?.name || 'Home Team'"
                           @error="$event.target.style.display='none'" />
                      <div v-if="!fx.homeClub?.logoUrl" class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {{ (fx.homeClub?.clubName || fx.homeClub?.name || 'H').charAt(0) }}
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="font-semibold text-white text-xs">{{ fx.homeClub?.clubName || fx.homeClub?.name || 'Home Team' }}</div>
                    </div>
                  </div>

                  <!-- VS Section -->
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-1" style="box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);">
                      <span class="text-sm font-bold text-gray-900">VS</span>
                    </div>
                    <div class="text-xs text-gray-300 font-medium">{{ fx.round || 'League' }}</div>
                  </div>

                  <!-- Away Team -->
                 <div class="flex flex-col items-center">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-blue-400/40 group-hover:scale-105 transition-transform duration-300">
                      <img v-if="fx.awayClub?.logoUrl" 
                           :src="fx.awayClub.logoUrl" 
                           class="w-10 h-10 rounded-lg object-cover object-center"
                           :alt="fx.awayClub?.clubName || fx.awayClub?.name || 'Away Team'"
                           @error="$event.target.style.display='none'" />
                      <div v-if="!fx.awayClub?.logoUrl" class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {{ (fx.awayClub?.clubName || fx.awayClub?.name || 'A').charAt(0) }}
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="font-semibold text-white text-xs">{{ fx.awayClub?.clubName || fx.awayClub?.name || 'Away Team' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Match Details -->
              <div class="space-y-3 mb-4 pt-4 border-t border-white/10">
                <!-- Date & Time -->
                <div class="flex items-center justify-center gap-2 p-3 bg-blue-400/10 backdrop-blur-sm rounded-xl border border-blue-400/30">
                  <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-white text-sm">
                      <span v-if="fx.date">{{ new Date(fx.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}</span>
                    </div>
                    <div v-if="fx.time" class="text-xs text-gray-300">{{ fx.time }}</div>
                  </div>
                </div>
                
                <!-- Venue -->
                <div v-if="fx.venue" class="flex items-center justify-center gap-2 p-3 bg-green-400/10 backdrop-blur-sm rounded-xl border border-green-400/30">
                  <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-white text-sm">{{ fx.venue }}</div>
                    <div class="text-xs text-gray-300">Match Venue</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <button
                  @click.stop="router.push({ name: 'tournament-details', params: { id: fx.tournament?._id } })"
                  class="btn-secondary flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
                >
                  Tournament
                </button>
                <button
                  @click.stop="router.push({ name: 'match-details', params: { id: fx.tournament?._id, matchId: fx._id } })"
                  class="btn-primary flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300"
                >
                  View Match
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- View All Button -->
        <div v-if="fixtures.length > 0" class="text-center mt-12">
          <button 
            @click="navigateToFixtures"
            class="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            View All Fixtures
          </button>
        </div>
      </div>
    </section>

    <!-- Ongoing Tournaments -->
    <section class="py-16 glass-panel rounded-3xl mx-4 my-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold">Ongoing Tournaments</h2>
          <span v-if="ongoingTournaments.length" class="text-sm text-green-400 font-semibold">{{ ongoingTournaments.length }} live</span>
        </div>
        <div v-if="ongoingTournaments.length === 0" class="text-gray-300 text-sm">No tournaments currently in progress.</div>
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="t in ongoingTournaments"
            :key="t._id"
            class="premium-card rounded-3xl overflow-hidden hover:shadow-md transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group"
          >
            <div class="h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-sm relative">
              <img v-if="t.bannerUrl" :src="t.bannerUrl" class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
              <div class="absolute top-3 left-3 badge-live inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold">
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Live
              </div>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between">
                <h3 class="font-bold text-white line-clamp-1 group-hover:text-green-400 transition-colors">{{ t.name }}</h3>
                <span class="text-xs text-gray-300">{{ t.format }}</span>
              </div>
              <div class="mt-1 text-xs text-gray-300 flex items-center gap-2">
                <svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                <span v-if="t.district">{{ t.district }}</span>
                <span v-else-if="t.location">{{ t.location }}</span>
              </div>
              <div class="mt-2 text-xs text-gray-300 flex items-center gap-2">
                <svg class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span v-if="t.startDate || t.endDate">{{ formatDateRange(t.startDate, t.endDate) }}</span>
              </div>
              <div class="mt-3 flex items-center justify-between pt-3 border-t border-white/10">
                <RouterLink :to="{ name: 'tournament-details', params: { id: t._id } }" class="text-sm text-green-400 hover:text-green-300 font-semibold transition-colors">View details</RouterLink>
                <button class="text-xs text-green-400 hover:text-green-300 font-semibold" @click="router.push({ name: 'tournament-details', params: { id: t._id } })">Open</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 glass-panel rounded-3xl mx-4 my-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black mb-4">Kerala's Grassroots Cricket Hub</h2>
          <p class="text-xl max-w-3xl mx-auto">From Thiruvananthapuram to Kasaragod, connecting cricket enthusiasts across Kerala's villages, towns, and cities.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Feature Card 1: Local Tournaments -->
          <div class="group premium-card rounded-3xl p-8 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer" @click="goToTournaments">
            <div class="relative z-10">
              <!-- Icon with Neon Gradient -->
              <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 icon-glow">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Local Tournaments</h3>
              <p class="text-gray-300 text-sm leading-relaxed mb-6">Join district-level tournaments and village championships across Kerala.</p>
              <button type="button" @click="goToTournaments" class="flex items-center text-blue-400 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>Find tournaments</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Feature Card 2: Club Management -->
          <div class="group premium-card rounded-3xl p-8 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer" @click="goToClubs">
            <div class="relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 icon-glow">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4.13a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Club Management</h3>
              <p class="text-gray-300 text-sm leading-relaxed mb-6">Register your club, manage players, and organize practice sessions.</p>
              <RouterLink to="/clubs" class="flex items-center text-green-400 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>Manage club</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </RouterLink>
            </div>
          </div>

          <!-- Feature Card 3: Live Scoring -->
          <div class="group premium-card rounded-3xl p-8 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
            <div class="relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 icon-glow">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M15 10l4.5-4.5L21 7l-6 6-4.5-4.5L9 10l6 6 6-6z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Live Scoring</h3>
              <p class="text-gray-300 text-sm leading-relaxed mb-6">Real-time match updates from grounds across Kerala districts.</p>
              <div class="flex items-center text-purple-400 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>Follow live</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Feature Card 4: Player Network -->
          <div class="group premium-card rounded-3xl p-8 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer" @click="goToClubs">
            <div class="relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 icon-glow">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-4">Player Network</h3>
              <p class="text-gray-300 text-sm leading-relaxed mb-6">Connect with players, track statistics, and build your cricket profile.</p>
              <button type="button" @click="goToClubs" class="flex items-center text-orange-400 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>Join network</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- For Players Section -->
    <section class="py-20 glass-panel rounded-3xl mx-4 my-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-black text-gray-900 mb-4">For Cricket Players</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">Join Kerala's growing cricket community. Create your profile, showcase your skills, and connect with clubs across the state.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Create Profile</h3>
            <p class="text-gray-600">Build your cricket profile with stats, achievements, and playing history.</p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Find Clubs</h3>
            <p class="text-gray-600">Discover and connect with cricket clubs in your district and across Kerala.</p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4.13a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Join Teams</h3>
            <p class="text-gray-600">Apply to clubs, participate in tournaments, and grow your cricket network.</p>
          </div>
        </div>

        <div class="text-center">
          <template v-if="!user">
            <RouterLink to="/register" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Start Your Cricket Journey
            </RouterLink>
          </template>
          <template v-else-if="user.role === 'player'">
            <RouterLink to="/player/dashboard" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Go to Player Dashboard
            </RouterLink>
          </template>
          <template v-else>
            <button @click="goToClubs" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Explore Cricket Clubs
            </button>
          </template>
        </div>
      </div>
    </section>

    <!-- Kerala Districts Section -->
    <section class="py-20 glass-panel rounded-3xl mx-4 my-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            God's Own Country
          </div>
          <h2 class="text-4xl font-black mb-4">Cricket Across Kerala</h2>
          <p class="text-xl max-w-3xl mx-auto">Discover the vibrant cricket culture spanning all 14 districts of Kerala, from Thiruvananthapuram to Kasaragod</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <div 
            v-for="(district, index) in keralaDistricts" 
            :key="district" 
            class="group relative premium-card rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer text-center"
            :style="{ transitionDelay: (index * 50) + 'ms' }"
            @click="goToDistrictClubs(district)"
          >
            <!-- Number Badge with Neon Glow -->
            <div class="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-gray-900 text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300"
                 style="box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);">
              {{ index + 1 }}
            </div>
            
            <!-- Letter Icon with Glass Effect -->
            <div class="w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border-2 border-green-400/40 group-hover:border-green-400 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              <span class="text-white font-bold text-2xl">{{ district.charAt(0) }}</span>
            </div>
            
            <!-- District Name -->
            <h3 class="font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{{ district }}</h3>
            
            <!-- Active Clubs Indicator -->
            <div class="flex items-center justify-center gap-1 text-xs text-gray-300 mt-2">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Active Clubs</span>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <button 
            @click="goToClubs" 
            class="btn-primary inline-flex items-center px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Explore District Clubs
          </button>
        </div>
      </div>
    </section>

    <!-- Accepted Clubs Section -->
    <section class="py-20 glass-panel rounded-3xl mx-4 my-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-4xl font-black">Clubs</h2>
          <span class="text-sm text-green-400 font-semibold" v-if="clubs.length">{{ clubs.length }} clubs</span>
        </div>

        <div v-if="loading" class="text-center text-gray-300">Loading clubs...</div>
        <div v-else>
          <div v-if="clubs.length" class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div v-for="club in clubs" :key="club.id || club._id" class="premium-card rounded-3xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group">
              <!-- Club Logo Section -->
              <div class="h-28 bg-gradient-to-br from-green-400/10 to-emerald-400/10 backdrop-blur-sm flex items-center justify-center border-b border-white/10">
                <img v-if="club.logoUrl" :src="club.logoUrl" alt="Club Logo" class="h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-green-400/40 group-hover:ring-green-400 transition-all" />
                <div v-else class="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center font-bold text-3xl text-white shadow-lg">
                  {{ (club.clubName || club.name || 'C').charAt(0) }}
                </div>
              </div>
              
              <!-- Club Info Section -->
              <div class="p-5">
                <div class="mb-3">
                  <h3 class="font-bold text-white leading-tight group-hover:text-green-400 transition-colors line-clamp-2">{{ club.clubName || club.name }}</h3>
                  <p class="text-xs text-gray-300 mt-1">
                    <span v-if="club.city">{{ club.city }}, </span>{{ club.district }}
                  </p>
                </div>
                
                <p v-if="club.description" class="text-sm text-gray-300 line-clamp-2 mb-3">{{ club.description }}</p>
                
                <!-- Stats & Badge -->
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3 text-gray-300">
                    <span v-if="club.memberCount" class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m4-6.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
                      </svg>
                      {{ club.memberCount }}
                    </span>
                    <span v-if="club.groundName" class="flex items-center gap-1 truncate">
                      <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      <span class="truncate">{{ club.groundName }}</span>
                    </span>
                  </div>
                  <span class="badge-verified inline-flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-300">No approved clubs yet.</div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section 
    <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-black text-gray-900 mb-4">What Kerala Cricketers Say</h2>
          <p class="text-xl text-gray-600">Hear from club managers, players, and tournament organizers across Kerala</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                <span class="text-white font-bold">🏏</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Club Manager</h3>
                <p class="text-sm text-gray-600">Kerala Cricket Club</p>
              </div>
            </div>
            <p class="text-gray-700 italic leading-relaxed">"CrickArena transformed how we manage our club. From player registrations to tournament scheduling, everything is streamlined and professional."</p>
            <div class="flex mt-4">
              <span v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-400">★</span>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                <span class="text-white font-bold">📊</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Tournament Organizer</h3>
                <p class="text-sm text-gray-600">District Cricket Association</p>
              </div>
            </div>
            <p class="text-gray-700 italic leading-relaxed">"Organizing district-level tournaments was never this easy. The platform's features save hours of coordination work and keep everyone engaged."</p>
            <div class="flex mt-4">
              <span v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-400">★</span>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-4">
                <span class="text-white font-bold">👥</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Cricket Player</h3>
                <p class="text-sm text-gray-600">Local Cricket Enthusiast</p>
              </div>
            </div>
            <p class="text-gray-700 italic leading-relaxed">"I discovered local clubs and joined weekend practice sessions. The player network helped me connect with fellow cricketers in my district."</p>
            <div class="flex mt-4">
              <span v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-400">★</span>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- District Clubs Modal -->
    <DistrictClubsModal 
      v-if="showDistrictClubsModal" 
      :district="selectedDistrict" 
      @close="showDistrictClubsModal = false" 
    />

    <!-- CTA Section -->
    <section class="py-20 glass-panel-strong rounded-3xl mx-4 my-8">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-4xl font-black mb-6 text-gray-900">Ready to Join Kerala's Cricket Community?</h2>
        <p class="text-xl mb-8 text-gray-700">Whether you're a player, club manager, or cricket enthusiast, CrickArena is your gateway to Kerala's vibrant cricket ecosystem.</p>
        
        <div class="flex flex-wrap justify-center gap-4">
          <template v-if="!auth.user">
            <RouterLink to="/register" class="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Join Free Today
            </RouterLink>
            <RouterLink to="/login" class="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300">
              Sign In
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/crickhub" class="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Go to Dashboard
            </RouterLink>
            <RouterLink to="/club-registration" class="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300">
              Register Your Club
            </RouterLink>
          </template>
        </div>

        <!-- Contact Info -->
        <div class="mt-16 pt-8 border-t border-white border-opacity-30">
          <div class="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="text-2xl mb-2">📧</div>
              <h3 class="font-semibold mb-1">Email Support</h3>
              <p class="text-sm opacity-80">support@crickarena.com</p>
            </div>
            <div>
              <div class="text-2xl mb-2">📱</div>
              <h3 class="font-semibold mb-1">WhatsApp</h3>
              <p class="text-sm opacity-80">+91 9876 543 210</p>
            </div>
            <div>
              <div class="text-2xl mb-2">🏏</div>
              <h3 class="font-semibold mb-1">Cricket Hub</h3>
              <p class="text-sm opacity-80">Kerala Cricket Association</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 glass-panel-dark text-white rounded-t-3xl mx-4 mt-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid md:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 class="text-2xl font-bold mb-4">
              <span class="text-green-400">Crick</span>Arena
            </h3>
            <p class="text-gray-400 text-sm leading-relaxed">Kerala's premier cricket management platform connecting players, clubs, and tournaments across God's Own Country.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Platform</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a href="#" class="hover:text-green-400 transition-colors">Tournaments</a></li>
              <li><RouterLink to="/clubs" class="hover:text-green-400 transition-colors">Clubs</RouterLink></li>
              <li><a href="#" class="hover:text-green-400 transition-colors">Live Scores</a></li>
              <li><a href="#" class="hover:text-green-400 transition-colors">Player Stats</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">For Players</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><RouterLink to="/register" class="hover:text-orange-400 transition-colors">Join as Player</RouterLink></li>
              <li><RouterLink to="/clubs" class="hover:text-orange-400 transition-colors">Find Clubs</RouterLink></li>
              <li><RouterLink to="/player/dashboard" class="hover:text-orange-400 transition-colors">Player Dashboard</RouterLink></li>
              <li><RouterLink to="/player/registration" class="hover:text-orange-400 transition-colors">Complete Profile</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Support</h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><RouterLink to="/help" class="hover:text-green-400 transition-colors">Help Center</RouterLink></li>
              <li><RouterLink to="/contact" class="hover:text-green-400 transition-colors">Contact Us</RouterLink></li>
              <li><RouterLink to="/privacy" class="hover:text-green-400 transition-colors">Privacy Policy</RouterLink></li>
              <li><RouterLink to="/terms" class="hover:text-green-400 transition-colors">Terms of Service</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Connect</h4>
            <div class="flex space-x-4">
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span class="text-sm">f</span>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span class="text-sm">t</span>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span class="text-sm">i</span>
              </a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 CrickArena. Made with ❤️ in Kerala. All rights reserved.</p>
        </div>
      </div>
    </footer>

    </div><!-- Close content container z-10 -->
  </div><!-- Close main container -->
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../store/auth';
import TournamentList from '../components/TournamentList.vue';
import TournamentHistory from '../components/TournamentHistory.vue';
import DistrictClubsModal from '../components/DistrictClubsModal.vue';
import AnimatedCricketBackground from '../components/AnimatedCricketBackground.vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore();

const router = useRouter();

function goToTournaments() {
  const role = auth.userProfile?.role || 'public'
  if (role === 'admin' || auth.user?.email === 'admin@crickarena.com') {
    router.push({ name: 'admin-tournaments' })
  } else if (role === 'clubManager') {
    router.push({ name: 'club-tournaments' })
  } else {
    // No public tournaments page yet; send to clubs for discovery
    router.push({ name: 'clubs' })
  }
}

function goToClubs() {
  router.push({ name: 'clubs' });
}

function goToDistrictClubs(district) {
  selectedDistrict.value = district;
  showDistrictClubsModal.value = true;
}

function navigateToFixtures() {
  if (fixtures.value.length > 0) {
    // Find the tournament with the most fixtures
    const tournamentCounts = {};
    fixtures.value.forEach(fx => {
      const tournamentId = fx.tournament?._id;
      if (tournamentId) {
        tournamentCounts[tournamentId] = (tournamentCounts[tournamentId] || 0) + 1;
      }
    });
    
    // Get the tournament with the most fixtures
    const mostFixturesTournament = Object.keys(tournamentCounts).reduce((a, b) => 
      tournamentCounts[a] > tournamentCounts[b] ? a : b
    );
    
    // Navigate to tournament details with fixtures hash
    router.push({ 
      name: 'tournament-details', 
      params: { id: mostFixturesTournament }, 
      hash: '#fixtures' 
    });
  } else {
    // Fallback to tournaments page if no fixtures
    goToTournaments();
  }
}

const clubs = ref([]);
const upcoming = ref([]);
const history = ref([]);
const loading = ref(true);
const showTournamentDetails = ref(false);
const fixtures = ref([]);
const ongoingTournaments = ref([]);
const showDistrictClubsModal = ref(false);
const selectedDistrict = ref('');

function formatDateRange(start, end) {
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  if (s && e) return `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
  if (s) return s.toLocaleDateString();
  if (e) return e.toLocaleDateString();
  return '';
}

// Kerala Districts (just names, no fake club counts)
const keralaDistricts = ref([
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
]);

// Simple featured carousel logic
const activeIndex = ref(0);
const activeTournament = computed(() => upcoming.value[activeIndex.value] || {});
let timer = null;
function setActive(i){ activeIndex.value = i; restartTimer(); }
function next(){ if (upcoming.value.length > 0) activeIndex.value = (activeIndex.value + 1) % upcoming.value.length; }
function restartTimer(){ if (timer) clearInterval(timer); if (upcoming.value.length > 1) timer = setInterval(next, 5000); }

// Logout function
async function onLogout() {
  await auth.logout();
  router.push({ name: 'home' })
}

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

onMounted(async () => {
  try {
    await auth.init();
    
    // Try to fetch real data, fallback to empty arrays if endpoints don't exist
    const [c, u, h, f] = await Promise.all([
      axios.get(`${API}/clubs/public`).catch(() => ({ data: [] })),
      axios.get(`${API}/tournaments/upcoming`).catch(() => ({ data: [] })),
      axios.get(`${API}/tournaments/history`).catch(() => ({ data: [] })),
      axios.get(`${API}/tournaments/matches/upcoming?limit=8`).catch(() => ({ data: [] }))
    ]);
    
    clubs.value = c.data || []; 
    upcoming.value = u.data || []; 
    history.value = h.data || [];
    fixtures.value = f.data || [];
    ongoingTournaments.value = (u.data || []).filter(t => (t.status || '').toLowerCase() === 'ongoing');
  } catch (error) {
    console.error('Failed to load data:', error);
    // Set empty arrays as fallback
    clubs.value = [];
    upcoming.value = [];
    history.value = [];
    ongoingTournaments.value = [];
  } finally {
    loading.value = false;
    restartTimer();
  }
});

onUnmounted(() => { 
  if (timer) clearInterval(timer); 
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Premium Stadium Theme - Custom Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes neonPulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
  }
}

@keyframes borderPulse {
  0%, 100% {
    border-color: rgba(0, 255, 136, 0.3);
  }
  50% {
    border-color: rgba(0, 255, 136, 0.8);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.3),
                 0 0 20px rgba(0, 255, 136, 0.2),
                 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 0 0 20px rgba(0, 255, 136, 0.5),
                 0 0 30px rgba(0, 255, 136, 0.3),
                 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Enhanced Glassmorphism Panel Styles */
:deep(.glass-panel) {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px) saturate(200%);
  -webkit-backdrop-filter: blur(15px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-top: 2px solid rgba(0, 255, 136, 0.3);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 0 1px rgba(0, 255, 136, 0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.glass-panel-strong) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(200%);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid rgba(0, 255, 136, 0.5);
  box-shadow: 
    0 12px 50px rgba(0, 0, 0, 0.25),
    0 0 2px rgba(0, 255, 136, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

:deep(.glass-panel-dark) {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

:deep(.glass-panel-hero) {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 2px rgba(0, 212, 255, 0.3);
}

/* Enhanced hover effects */
:deep(.glass-panel:hover) {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(0, 255, 136, 0.6);
  transform: translateY(-4px);
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.25),
    0 0 20px rgba(0, 255, 136, 0.3);
}

/* Premium Typography */
:deep(h1) {
  color: white;
  font-weight: 900;
  letter-spacing: -0.03em;
  text-shadow: 
    0 0 20px rgba(0, 255, 136, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
}

:deep(h2) {
  color: white;
  font-weight: 800;
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.4);
  line-height: 1.2;
}

:deep(h3) {
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

:deep(p) {
  color: #e5e7eb;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  line-height: 1.7;
}

/* Neon gradient text */
:deep(.neon-gradient) {
  background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glow 3s ease-in-out infinite;
}

/* Premium Buttons */
:deep(.btn-primary) {
  background: linear-gradient(135deg, #00ff88, #00d4ff);
  color: #0f172a;
  font-weight: 700;
  border: none;
  box-shadow: 
    0 4px 20px rgba(0, 255, 136, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

:deep(.btn-primary:hover) {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(0, 255, 136, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

:deep(.btn-secondary) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 136, 0.5);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.btn-secondary:hover) {
  border-color: #00ff88;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

/* Neon Badges */
:deep(.badge-live) {
  background: linear-gradient(135deg, #ff0000, #ff6b00);
  animation: neonPulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
}

:deep(.badge-verified) {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  color: #00ff88;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

:deep(.badge-status) {
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid #00d4ff;
  color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

/* Enhanced Card Styles */
:deep(.premium-card) {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.premium-card:hover) {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(0, 255, 136, 0.6);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 136, 0.3);
}

/* Icon glow effects */
:deep(.icon-glow) {
  filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.4));
  transition: filter 0.3s ease;
}

:deep(.icon-glow:hover) {
  filter: drop-shadow(0 0 15px rgba(0, 255, 136, 0.7));
}

/* Stats cards */
:deep(.stat-card) {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 136, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

:deep(.stat-card:hover) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 255, 136, 0.7);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(0, 255, 136, 0.3);
  transform: scale(1.05);
}

/* Browser fallback */
@supports not (backdrop-filter: blur(10px)) {
  :deep(.glass-panel) {
    background: rgba(255, 255, 255, 0.9);
  }
  
  :deep(.glass-panel-strong) {
    background: rgba(255, 255, 255, 0.95);
  }
  
  :deep(.glass-panel-dark) {
    background: rgba(0, 0, 0, 0.8);
  }
  
  :deep(.glass-panel-hero) {
    background: rgba(255, 255, 255, 0.85);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  :deep(.glass-panel) {
    background: rgba(255, 255, 255, 0.2);
  }
  
  :deep(h1) {
    font-size: 2.5rem;
  }
  
  :deep(h2) {
    font-size: 2rem;
  }
}
</style>