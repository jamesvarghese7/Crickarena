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
                {{ matchInfo.isModifying ? 'Update your team selection' : 'Select 11 playing XI + 3 substitutes' }} for {{ matchInfo.opponent }} match
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
                  <p class="text-sm text-slate-600">11 playing XI + 3 substitutes required</p>
                </div>
                <div class="text-right flex gap-6">
                  <!-- Playing XI Counter -->
                  <div>
                    <div class="text-xs text-slate-500 mb-1">Playing XI</div>
                    <div :class="[
                      'text-2xl font-bold',
                      playingXI.length === 11 ? 'text-green-600' : 
                      playingXI.length > 11 ? 'text-red-600' : 'text-blue-600'
                    ]">
                      {{ playingXI.length }}/11
                    </div>
                    <div v-if="playingXI.length !== 11" class="text-xs text-slate-500">
                      {{ playingXI.length > 11 ? 'Too many' : `${11 - playingXI.length} more` }}
                    </div>
                  </div>
                  <!-- Substitutes Counter -->
                  <div>
                    <div class="text-xs text-slate-500 mb-1">Substitutes</div>
                    <div :class="[
                      'text-2xl font-bold',
                      substitutes.length === 3 ? 'text-green-600' : 
                      substitutes.length > 3 ? 'text-red-600' : 'text-orange-600'
                    ]">
                      {{ substitutes.length }}/3
                    </div>
                    <div v-if="substitutes.length !== 3" class="text-xs text-slate-500">
                      {{ substitutes.length > 3 ? 'Too many' : `${3 - substitutes.length} more` }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Lineup Suggestions -->
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-base font-bold text-slate-900">AI Lineup Suggestions</h3>
                      <span v-if="!mlStatus.checking" :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
                        mlStatus.trained 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      ]">
                        {{ mlStatus.trained ? '🤖 ML' : '📊 Rules' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600">
                      {{ mlStatus.trained 
                        ? 'Machine Learning enhanced recommendations' 
                        : 'Smart recommendations based on player performance' }}
                    </p>
                  </div>
                </div>
                <button 
                  @click="generateSuggestions" 
                  :disabled="loadingSuggestions"
                  class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold">
                  <span v-if="loadingSuggestions" class="flex items-center gap-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Generate
                  </span>
                </button>
              </div>

              <!-- Suggestions Display -->
              <div v-if="suggestions.length > 0" class="space-y-3">
                <div v-for="(suggestion, idx) in suggestions" :key="idx"
                     class="bg-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                     @click="openLineupPresentation(suggestion)">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white',
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                        'bg-gradient-to-br from-amber-600 to-amber-800'
                      ]">
                        {{ idx + 1 }}
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900 capitalize">{{ suggestion.strategy }} Strategy</h4>
                        <p class="text-xs text-slate-600">{{ getStrategyDescription(suggestion.strategy) }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-slate-500">Team Strength</div>
                      <div :class="[
                        'text-lg font-bold',
                        suggestion.teamScore >= 75 ? 'text-green-600' :
                        suggestion.teamScore >= 60 ? 'text-blue-600' : 'text-orange-600'
                      ]">
                        {{ Math.round(suggestion.teamScore) }}%
                      </div>
                    </div>
                  </div>


                  <!-- Team Balance -->
                  <div class="flex items-center gap-2 text-xs mb-3">
                    <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                      🏏 {{ suggestion.balance.batsmen }} Batsmen
                    </span>
                    <span class="px-2 py-1 bg-green-50 text-green-700 rounded-md font-medium">
                      ⚡ {{ suggestion.balance.bowlers }} Bowlers
                    </span>
                    <span class="px-2 py-1 bg-orange-50 text-orange-700 rounded-md font-medium">
                      🎯 {{ suggestion.balance.allRounders }} All-rounders
                    </span>
                    <span class="px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                      🧤 {{ suggestion.balance.wicketKeepers }} WK
                    </span>
                  </div>

                  <!-- Top Players Preview -->
                  <div class="text-xs text-slate-600 space-y-1">
                    <div>
                      <span class="font-semibold">Playing XI: </span>
                      {{ suggestion.playing.slice(0, 6).map(p => p.fullName).join(', ') }}
                      <span v-if="suggestion.playing.length > 6"> + {{ suggestion.playing.length - 6 }} more</span>
                    </div>
                    <div>
                      <span class="font-semibold text-orange-600">Substitutes: </span>
                      {{ suggestion.substitutes.map(p => p.fullName).join(', ') }}
                    </div>
                  </div>

                  <!-- Click to apply hint -->
                  <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-purple-600 font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                    </svg>
                    Click to preview in broadcast mode
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="!loadingSuggestions" class="text-center py-8">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <p class="text-sm text-slate-600">Click "Generate" to get AI-powered lineup suggestions</p>
                <p class="text-xs text-slate-500 mt-1">Analyzes player stats, form, and team balance</p>
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
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all-rounder">All-rounder</option>
                  <option value="wicket-keeper">Wicket-keeper</option>
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
                        <div class="flex items-center gap-3 mb-1">
                          <h4 class="text-lg font-bold text-slate-900">
                            {{ player.fullName || player.name || `Player ${player._id}` }}
                          </h4>
                          <!-- Role Badge -->
                          <span v-if="getPlayerRole(player._id) === 'playing'" 
                                class="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                            Playing XI
                          </span>
                          <span v-else-if="getPlayerRole(player._id) === 'substitute'" 
                                class="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                            🔄 Substitute
                          </span>
                        </div>
                        <div class="flex items-center gap-3 text-sm text-slate-600">
                          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{{ formatPosition(player.position) }}</span>
                          <span class="font-medium">Age: {{ player.age }}</span>
                          <span v-if="player.jerseyNumber" class="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                            Jersey #{{ player.jerseyNumber }}
                          </span>
                          <span v-else class="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">
                            No Jersey #
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
                    :disabled="playingXI.length !== 11 || substitutes.length !== 3 || submitting"
                    :class="[
                      'px-6 py-3 rounded-2xl font-semibold transition-all duration-200',
                      playingXI.length === 11 && substitutes.length === 3 && !submitting
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

  <!-- Broadcast-Style Lineup Presentation -->
  <div v-if="presentationOpen && selectedSuggestion" class="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="closeLineupPresentation"></div>

    <!-- Card wrapper — scrollable on small screens -->
    <div class="relative w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl" style="background: linear-gradient(160deg,#0d1b3e 0%,#112250 40%,#0a1628 100%);">

      <!-- Outer glow border -->
      <div class="absolute inset-0 rounded-2xl pointer-events-none" style="box-shadow: inset 0 0 0 2px rgba(100,160,255,0.18), 0 0 60px rgba(30,80,180,0.5);"></div>

      <!-- Header -->
      <div class="relative pt-6 pb-3 text-center px-4">
        <p class="text-[10px] tracking-[0.3em] text-blue-300/70 uppercase font-semibold mb-1">Match Day Template</p>
        <h2 class="text-3xl sm:text-4xl font-black tracking-widest text-white uppercase" style="letter-spacing:0.18em; text-shadow: 0 0 24px rgba(80,160,255,0.6);">Playing XI</h2>
        <!-- Strategy badge -->
        <div class="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-bold text-blue-200 uppercase tracking-widest border border-white/15">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {{ selectedSuggestion.strategy }} · {{ selectedSuggestion.mlEnhanced ? '🤖 ML' : '📊 Rules' }} · Strength {{ Math.round(selectedSuggestion.teamScore) }}%
        </div>
        <!-- Opponent -->
        <p class="mt-2 text-[11px] text-blue-200/80 uppercase tracking-widest font-medium">
          vs {{ matchInfo.opponent }}
        </p>
        <!-- divider -->
        <div class="mt-3 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent mx-4"></div>
      </div>

      <!-- Player rows 4-4-3 -->
      <div class="px-3 pb-3 space-y-2">
        <div
          v-for="(row, rowIdx) in playerRows"
          :key="rowIdx"
          class="flex justify-center gap-2"
        >
          <div
            v-for="(player, pIdx) in row"
            :key="player._id || `${player.fullName}-${rowIdx}-${pIdx}`"
            class="lineup-player-card flex flex-col items-center"
          >
            <!-- Jersey badge -->
            <div class="relative">
              <!-- Outer ring -->
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg,#1e3a7a,#2455b0); border: 2px solid rgba(100,160,255,0.35); box-shadow: 0 4px 16px rgba(0,0,50,0.6);">
                <!-- Cricket player silhouette SVG -->
                <svg viewBox="0 0 64 64" class="w-10 h-10 sm:w-12 sm:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Head -->
                  <circle cx="32" cy="14" r="8" fill="#4fa3e0"/>
                  <!-- Body / torso -->
                  <path d="M20 28 Q20 22 32 22 Q44 22 44 28 L46 44 H18 Z" fill="#4fa3e0"/>
                  <!-- Left arm holding bat -->
                  <path d="M20 28 L10 38 L13 41 L25 32" fill="#4fa3e0"/>
                  <!-- Bat -->
                  <rect x="6" y="36" width="4" height="16" rx="2" transform="rotate(-20 6 36)" fill="#a0c4ff"/>
                  <!-- Legs -->
                  <path d="M24 44 L22 58 H28 L30 48 L34 48 L36 58 H42 L40 44 Z" fill="#3b8fcc"/>
                </svg>
              </div>
              <!-- Jersey number chip -->
              <div v-if="player.jerseyNumber" class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[9px] font-black leading-none border border-white/40">
                {{ player.jerseyNumber }}
              </div>
            </div>
            <!-- Name plate -->
            <div class="mt-1.5 text-center w-16 sm:w-[72px]">
              <div class="text-white font-bold text-[10px] sm:text-[11px] leading-tight truncate uppercase tracking-wide">
                {{ shortName(player.fullName) }}
              </div>
              <div class="text-blue-300/80 text-[8px] sm:text-[9px] leading-tight capitalize tracking-wide mt-px">
                {{ positionAbbr(player.position) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mx-4 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>

      <!-- Substitutes bench -->
      <div class="px-4 py-3">
        <p class="text-[9px] tracking-[0.25em] text-orange-300/80 uppercase font-bold text-center mb-2">Substitutes</p>
        <div class="flex justify-center gap-4">
          <div
            v-for="(player, idx) in selectedSuggestion.substitutes"
            :key="player._id || `${player.fullName}-sub-${idx}`"
            class="flex flex-col items-center"
          >
            <div class="w-11 h-11 rounded-full flex items-center justify-center" style="background: linear-gradient(135deg,#3d1f00,#7c3d00); border: 2px solid rgba(251,146,60,0.4); box-shadow: 0 3px 12px rgba(0,0,0,0.5);">
              <svg viewBox="0 0 64 64" class="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="14" r="8" fill="#fb923c" opacity="0.85"/>
                <path d="M20 28 Q20 22 32 22 Q44 22 44 28 L46 44 H18 Z" fill="#fb923c" opacity="0.85"/>
                <path d="M20 28 L10 38 L13 41 L25 32" fill="#fb923c" opacity="0.85"/>
                <rect x="6" y="36" width="4" height="16" rx="2" transform="rotate(-20 6 36)" fill="#fed7aa"/>
                <path d="M24 44 L22 58 H28 L30 48 L34 48 L36 58 H42 L40 44 Z" fill="#ea7a1e" opacity="0.85"/>
              </svg>
            </div>
            <div class="mt-1 text-center w-14">
              <div class="text-orange-200 font-bold text-[9px] leading-tight truncate uppercase tracking-wide">{{ shortName(player.fullName) }}</div>
              <div class="text-orange-300/70 text-[8px] leading-tight capitalize mt-px">{{ positionAbbr(player.position) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mx-4 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>

      <!-- Footer actions -->
      <div class="px-4 py-4 flex gap-3 justify-end">
        <button
          @click="closeLineupPresentation"
          class="px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition-colors text-sm font-semibold"
        >
          Edit
        </button>
        <button
          @click="confirmSuggestedLineup"
          class="px-5 py-2 rounded-xl font-extrabold text-sm text-slate-900 transition-all hover:scale-105"
          style="background: linear-gradient(135deg,#10b981,#06b6d4); box-shadow: 0 4px 20px rgba(16,185,129,0.4);"
        >
          Confirm Lineup ✓
        </button>
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
const playingXI = ref([]); // 11 players for playing XI
const substitutes = ref([]); // 3 substitute players
const submitting = ref(false);
const searchQuery = ref('');
const positionFilter = ref('');

// Backward compatibility: computed for selectedPlayers (all 14 players combined)
const selectedPlayers = computed(() => [...playingXI.value, ...substitutes.value]);

// AI Suggestions
const loadingSuggestions = ref(false);
const suggestions = ref([]);
const mlStatus = ref({ trained: false, checking: true });
const presentationOpen = ref(false);
const selectedSuggestion = ref(null);

// Helper function to format position names
const formatPosition = (position) => {
  if (!position) return 'All-rounder';
  // Convert from backend format (lowercase with hyphens) to display format
  return position
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};

// Computed
const isPlayerSelected = (playerId) => {
  return playingXI.value.some(p => p._id === playerId) || 
         substitutes.value.some(p => p._id === playerId);
};

const getPlayerRole = (playerId) => {
  if (playingXI.value.some(p => p._id === playerId)) return 'playing';
  if (substitutes.value.some(p => p._id === playerId)) return 'substitute';
  return null;
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
    
    // Check ML model status
    checkMLStatus();
  } catch (err) {
    console.error('Error loading players:', err);
    error.value = err.response?.data?.message || 'Failed to load players';
  } finally {
    loading.value = false;
  }
}

function togglePlayer(player) {
  const inPlayingXI = playingXI.value.findIndex(p => p._id === player._id);
  const inSubstitutes = substitutes.value.findIndex(p => p._id === player._id);
  
  if (inPlayingXI > -1) {
    // Remove from playing XI
    playingXI.value.splice(inPlayingXI, 1);
  } else if (inSubstitutes > -1) {
    // Remove from substitutes
    substitutes.value.splice(inSubstitutes, 1);
  } else {
    // Add player: prioritize playing XI first, then substitutes
    if (playingXI.value.length < 11) {
      playingXI.value.push(player);
    } else if (substitutes.value.length < 3) {
      substitutes.value.push(player);
    } else {
      // Show notification if trying to select more than 14 players
      emit('show-notification', 'error', 'Maximum Players Selected', 'You have already selected 11 playing XI and 3 substitutes (14 total).');
    }
  }
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'P';
}

// Check ML model status
async function checkMLStatus() {
  try {
    const response = await axios.get(`${API}/matches/ml/status`, { withCredentials: true });
    mlStatus.value = { 
      trained: response.data.trained, 
      checking: false,
      modelType: response.data.modelType 
    };
  } catch (err) {
    console.error('Error checking ML status:', err);
    mlStatus.value = { trained: false, checking: false };
  }
}

// Generate AI lineup suggestions
async function generateSuggestions() {
  if (players.value.length < 11) {
    emit('show-notification', 'error', 'Insufficient Players', 'You need at least 11 active players to generate lineup suggestions.');
    return;
  }

  loadingSuggestions.value = true;
  suggestions.value = [];

  try {
    const response = await axios.post(
      `${API}/matches/${props.matchInfo.matchId}/lineup/suggest`,
      {},
      { withCredentials: true }
    );

    suggestions.value = response.data.suggestions || [];

    if (suggestions.value.length > 0) {
      // Check if ML was actually used for these suggestions
      const mlUsed = suggestions.value[0]?.mlEnhanced || false;
      mlStatus.value.trained = mlUsed; // Update status based on actual usage
      
      const mlBadge = mlUsed ? '🤖 ML-Enhanced' : '📊 Rule-Based';
      emit('show-notification', 'success', 'AI Suggestions Ready!', `${mlBadge} - Generated ${suggestions.value.length} optimized lineup strategies.`);
    }
  } catch (err) {
    console.error('Error generating suggestions:', err);
    emit('show-notification', 'error', 'Suggestion Failed', err.response?.data?.message || 'Failed to generate lineup suggestions. Please try again.');
  } finally {
    loadingSuggestions.value = false;
  }
}

// Open TV-style preview for a suggested lineup
function openLineupPresentation(suggestion) {
  selectedSuggestion.value = suggestion;
  presentationOpen.value = true;
}

function closeLineupPresentation() {
  presentationOpen.value = false;
  selectedSuggestion.value = null;
}

const fieldOrderedPlayers = computed(() => {
  if (!selectedSuggestion.value?.playing) return [];

  const byRole = {
    wicketKeeper: [],
    batsmen: [],
    allRounders: [],
    bowlers: [],
    other: []
  };

  selectedSuggestion.value.playing.forEach(player => {
    const pos = (player.position || '').toLowerCase();
    if (pos.includes('wicket-keeper')) byRole.wicketKeeper.push(player);
    else if (pos.includes('batsman')) byRole.batsmen.push(player);
    else if (pos.includes('all-rounder')) byRole.allRounders.push(player);
    else if (pos.includes('bowler')) byRole.bowlers.push(player);
    else byRole.other.push(player);
  });

  return [
    ...byRole.wicketKeeper,
    ...byRole.batsmen,
    ...byRole.allRounders,
    ...byRole.bowlers,
    ...byRole.other
  ].slice(0, 11);
});

// Broadcast card helpers
const playerRows = computed(() => {
  const all = fieldOrderedPlayers.value;
  return [all.slice(0, 4), all.slice(4, 8), all.slice(8, 11)].filter(r => r.length > 0);
});

function shortName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 9);
  return `${parts[0]} ${parts[parts.length - 1][0]}.`.slice(0, 12);
}

function positionAbbr(pos = '') {
  const p = pos.toLowerCase();
  if (p.includes('wicket')) return 'WK';
  if (p.includes('all-rounder') || p.includes('allrounder')) return 'AR';
  if (p.includes('batsman')) return 'BAT';
  if (p.includes('bowler')) return 'BWL';
  return pos.split(/[\s-]/)[0].slice(0, 3).toUpperCase() || 'PLY';
}

// Apply a suggested lineup after preview confirmation
function confirmSuggestedLineup() {
  if (!selectedSuggestion.value) return;

  const suggestion = selectedSuggestion.value;
  const suggestedPlayingIdSet = new Set(suggestion.playing.map(p => String(p._id)));
  const suggestedSubstituteIdSet = new Set(suggestion.substitutes.map(p => String(p._id)));
  
  const suggestedPlayingPlayers = players.value.filter(player => 
    suggestedPlayingIdSet.has(String(player._id))
  );
  
  const suggestedSubstitutePlayers = players.value.filter(player => 
    suggestedSubstituteIdSet.has(String(player._id))
  );

  if (suggestedPlayingPlayers.length !== 11 || suggestedSubstitutePlayers.length !== 3) {
    emit('show-notification', 'error', 'Invalid Suggestion', 'Could not apply this lineup. Some players may no longer be available.');
    return;
  }

  playingXI.value = suggestedPlayingPlayers;
  substitutes.value = suggestedSubstitutePlayers;
  closeLineupPresentation();
  emit('show-notification', 'success', 'Lineup Applied!', `${suggestion.strategy.charAt(0).toUpperCase() + suggestion.strategy.slice(1)} strategy lineup with 11 playing + 3 substitutes has been applied.`);
}

// Get strategy description
function getStrategyDescription(strategy) {
  const descriptions = {
    'balanced': 'Well-rounded team with equal focus on batting and bowling',
    'aggressive': 'Batting-heavy lineup for high-scoring matches',
    'defensive': 'Bowling-focused team to restrict opposition'
  };
  return descriptions[strategy] || 'Custom strategy';
}

async function submitRoster() {
  // Strict validation: exactly 11 playing + 3 substitutes
  if (playingXI.value.length !== 11 || substitutes.value.length !== 3) {
    const playingNeeded = 11 - playingXI.value.length;
    const subsNeeded = 3 - substitutes.value.length;
    
    let message = 'Incomplete lineup: ';
    if (playingNeeded !== 0) {
      message += `${playingNeeded > 0 ? `Need ${playingNeeded} more` : `Remove ${Math.abs(playingNeeded)}`} playing XI player${Math.abs(playingNeeded) === 1 ? '' : 's'}. `;
    }
    if (subsNeeded !== 0) {
      message += `${subsNeeded > 0 ? `Need ${subsNeeded} more` : `Remove ${Math.abs(subsNeeded)}`} substitute${Math.abs(subsNeeded) === 1 ? '' : 's'}.`;
    }
      
    emit('show-notification', 'error', 'Invalid Selection', message);
    return;
  }

  submitting.value = true;
  
  try {
    const rosterData = {
      playing: playingXI.value.map(player => ({
        playerId: player._id,
        playerName: player.fullName || player.name || 'Unknown Player',
        position: player.position || player.preferredPosition || 'All-rounder',
        jerseyNumber: player.jerseyNumber || null
      })),
      substitutes: substitutes.value.map(player => ({
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
    
    emit('show-notification', 'success', 'Lineup Submitted!', 'Your team lineup with 11 players + 3 substitutes has been successfully submitted.');
    
    closeModal();
  } catch (err) {
    console.error('Error submitting roster:', err);
    console.error('Error details:', err.response?.data);
    
    let errorMessage = 'Failed to submit roster';
    if (err.response?.data?.errors) {
      // Handle validation errors
      const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
      errorMessage = `Validation errors: ${errorMessages}`;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    emit('show-notification', 'error', 'Submission Failed', errorMessage);
    error.value = errorMessage;
  } finally {
    submitting.value = false;
  }
}

function closeModal() {
  playingXI.value = [];
  substitutes.value = [];
  closeLineupPresentation();
  error.value = '';
  searchQuery.value = '';
  positionFilter.value = '';
  suggestions.value = [];
  emit('close');
}

// Load existing roster if available
async function loadExistingRoster() {
  if (!props.matchInfo.matchId) return;
  
  try {
    const response = await axios.get(`${API}/matches/${props.matchInfo.matchId}/roster/my-team`, { withCredentials: true });
    if (response.data.hasRoster && response.data.roster) {
      // Pre-select players from existing roster
      // Support both old (players array) and new (playing + substitutes) formats
      if (response.data.roster.playing && response.data.roster.substitutes) {
        // New format
        const existingPlayingIds = response.data.roster.playing.map(p => String(p.playerId));
        const existingSubIds = response.data.roster.substitutes.map(p => String(p.playerId));
        playingXI.value = players.value.filter(player => existingPlayingIds.includes(String(player._id)));
        substitutes.value = players.value.filter(player => existingSubIds.includes(String(player._id)));
      } else if (response.data.roster.players) {
        // Old format - put all in playing XI
        const existingPlayerIds = response.data.roster.players.map(p => String(p.playerId));
        playingXI.value = players.value.filter(player => existingPlayerIds.includes(String(player._id)));
      }
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
    playingXI.value = [];
    substitutes.value = [];
    closeLineupPresentation();
    error.value = '';
    searchQuery.value = '';
    positionFilter.value = '';
    suggestions.value = [];
    loadingSuggestions.value = false;
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