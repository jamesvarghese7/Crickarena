<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Ticket Management</h1>
        <p class="text-slate-400 text-sm">Manage ticket sales for knockout matches (Finals, Semi-Finals, Quarter-Finals)</p>
      </div>
      <div class="flex gap-2">
        <button @click="autoCloseTickets" class="admin-btn-ghost" :disabled="autoClosing">
          <svg v-if="autoClosing" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Auto-Close Completed
        </button>
        <button @click="refreshData" class="admin-btn-ghost" :disabled="loading">
          <svg v-if="loading" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tournaments</p>
            <p class="text-2xl font-bold text-white mt-1">{{ tournaments.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knockout Matches</p>
            <p class="text-2xl font-bold text-white mt-1">{{ eligibleMatches.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets Enabled</p>
            <p class="text-2xl font-bold text-white mt-1">{{ matchesWithTickets }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p class="text-2xl font-bold text-emerald-400 mt-1">₹{{ formatNumber(totalRevenue) }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-4 mb-4 border-b border-slate-700">
      <button 
        @click="activeTab = 'active'"
        :class="activeTab === 'active' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-slate-300'"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
      >
        Active Matches
      </button>
      <button 
        @click="activeTab = 'history'"
        :class="activeTab === 'history' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-slate-300'"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors focus:outline-none"
      >
        History (Completed)
      </button>
    </div>

    <!-- Tournament Filter -->
    <div class="admin-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">Tournament:</label>
          <select v-model="selectedTournament" class="admin-select">
            <option value="">All Tournaments</option>
            <option v-for="t in tournaments" :key="t._id" :value="t._id">{{ t.name }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-300">Status:</label>
          <select v-model="statusFilter" class="admin-select">
            <option value="">All</option>
            <option value="configured">Configured</option>
            <option value="not_configured">Not Configured</option>
            <option value="open">Sales Open</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="admin-empty-state">
      <div class="admin-animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      <p class="text-slate-400 mt-3">Loading knockout matches...</p>
    </div>

    <!-- Match Cards Grid -->
    <div v-else-if="filteredMatches.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="match in filteredMatches" :key="match._id" 
           class="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
           @click="openDetailsModal(match)">
        
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-700/50">
          <div class="flex items-center justify-between">
            <span class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold">
              {{ match.round || match.stage }}
            </span>
            <span v-if="match.ticketInventory" 
                  :class="{
                    'px-2 py-1 rounded text-xs font-semibold': true,
                    'bg-emerald-500/20 text-emerald-300': match.ticketInventory.salesStatus === 'open',
                    'bg-amber-500/20 text-amber-300': match.ticketInventory.salesStatus === 'paused',
                    'bg-slate-500/20 text-slate-300': match.ticketInventory.salesStatus === 'draft'
                  }">
              {{ match.ticketInventory.salesStatus === 'open' ? '✓ Open' : 
                 match.ticketInventory.salesStatus === 'paused' ? '⏸ Paused' : '📝 Draft' }}
            </span>
            <span v-else class="px-2 py-1 bg-slate-600/30 text-slate-400 rounded text-xs">
              Not Set
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 cursor-pointer">
          <!-- Teams -->
          <div class="mb-3">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="match.homeClub?.logoUrl" :src="match.homeClub.logoUrl" class="w-full h-full object-cover" />
                <span v-else class="text-white text-xs font-bold">{{ (match.homeClub?.shortName || '?').charAt(0) }}</span>
              </div>
              <span class="text-white text-sm font-medium truncate">
                {{ match.homeClub?.name || match.homeClub?.clubName || getPlaceholderTeamName(match, 'home') }}
              </span>
            </div>
            <div class="text-center text-emerald-400 text-xs font-bold my-1">VS</div>
            <div class="flex items-center gap-2 mt-1">
              <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="match.awayClub?.logoUrl" :src="match.awayClub.logoUrl" class="w-full h-full object-cover" />
                <span v-else class="text-white text-xs font-bold">{{ (match.awayClub?.shortName || '?').charAt(0) }}</span>
              </div>
              <span class="text-white text-sm font-medium truncate">
                {{ match.awayClub?.name || match.awayClub?.clubName || getPlaceholderTeamName(match, 'away') }}
              </span>
            </div>
          </div>

          <!-- Metrics for Active Tab -->
          <div v-if="activeTab === 'active' && match.ticketInventory" class="space-y-2 mb-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Occupancy:</span>
              <div class="flex items-center gap-2">
                <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500" 
                       :style="{ width: Math.min((getTotalBooked(match) / getTotalCapacity(match)) * 100, 100) + '%' }"></div>
                </div>
                <span class="text-white font-medium">{{ Math.round((getTotalBooked(match) / getTotalCapacity(match)) * 100) }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Sold:</span>
              <span class="text-white font-medium">{{ getTotalBooked(match) }}/{{ getTotalCapacity(match) }}</span>
            </div>
          </div>

          <!-- Metrics for History Tab -->
          <div v-if="activeTab === 'history' && match.bookingStats" class="space-y-2 mb-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Revenue:</span>
              <span class="text-emerald-400 font-bold">₹{{ formatNumber(match.bookingStats.totalRevenue) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Bookings:</span>
              <span class="text-white font-medium">{{ match.bookingStats.totalBookings }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400">Tickets:</span>
              <span class="text-white font-medium">{{ match.bookingStats.totalTickets }}</span>
            </div>
          </div>

          <!-- Match Info -->
          <div class="text-xs text-slate-400 space-y-1 mb-3">
            <div class="flex items-center gap-2">
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>{{ formatDate(match.date) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="truncate">{{ match.venue || 'TBA' }}</span>
            </div>
          </div>

          <!-- Click to view details hint -->
          <div class="text-center text-xs text-emerald-400 font-medium">
            Click to view details →
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedMatchForDetails" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="selectedMatchForDetails = null">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden" @click.stop>
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">{{ selectedMatchForDetails.round || selectedMatchForDetails.stage }}</h3>
            <p class="text-sm text-purple-100">{{ formatDate(selectedMatchForDetails.date) }} • {{ selectedMatchForDetails.venue || 'TBA' }}</p>
          </div>
          <button @click="selectedMatchForDetails = null" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
            <svg class="w-5 h-5 text-white" fill="none"stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <!-- Match Teams -->
          <div class="flex items-center justify-center gap-8 mb-6 pb-6 border-b border-slate-700">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden mx-auto mb-2">
                <img v-if="selectedMatchForDetails.homeClub?.logoUrl" :src="selectedMatchForDetails.homeClub.logoUrl" class="w-full h-full object-cover" />
                <span v-else class="text-2xl font-bold text-white">{{ (selectedMatchForDetails.homeClub?.shortName || '?').charAt(0) }}</span>
              </div>
              <p class="font-semibold text-white">{{ selectedMatchForDetails.homeClub?.name || selectedMatchForDetails.homeClub?.clubName || getPlaceholderTeamName(selectedMatchForDetails, 'home') }}</p>
            </div>
            <div class="text-2xl font-bold text-emerald-400">VS</div>
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden mx-auto mb-2">
                <img v-if="selectedMatchForDetails.awayClub?.logoUrl" :src="selectedMatchForDetails.awayClub.logoUrl" class="w-full h-full object-cover" />
                <span v-else class="text-2xl font-bold text-white">{{ (selectedMatchForDetails.awayClub?.shortName || '?').charAt(0) }}</span>
              </div>
              <p class="font-semibold text-white">{{ selectedMatchForDetails.awayClub?.name || selectedMatchForDetails.awayClub?.clubName || getPlaceholderTeamName(selectedMatchForDetails, 'away') }}</p>
            </div>
          </div>

          <!-- Content based on tab and match state -->
          <div v-if="selectedMatchForDetails">
            <!-- HISTORY TAB - Show booking stats and history -->
            <div v-if="activeTab === 'history' && selectedMatchForDetails.bookingStats" class="space-y-4">
              <!-- Sales Stats -->
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-slate-700/30 rounded-lg p-4 text-center">
                  <p class="text-xs text-slate-400 mb-2">Total Revenue</p>
                  <p class="text-2xl font-bold text-emerald-400">₹{{ formatNumber(selectedMatchForDetails.bookingStats.totalRevenue) }}</p>
                </div>
                <div class="bg-slate-700/30 rounded-lg p-4 text-center">
                  <p class="text-xs text-slate-400 mb-2">Bookings</p>
                  <p class="text-2xl font-bold text-white">{{ selectedMatchForDetails.bookingStats.totalBookings }}</p>
                </div>
                <div class="bg-slate-700/30 rounded-lg p-4 text-center">
                  <p class="text-xs text-slate-400 mb-2">Tickets Sold</p>
                  <p class="text-2xl font-bold text-white">{{ selectedMatchForDetails.bookingStats.totalTickets }}</p>
                </div>
              </div>

              <!-- Sections Table -->
              <div v-if="selectedMatchForDetails.ticketInventory" class="overflow-x-auto">
                <h4 class="text-sm font-semibold text-white mb-3">Ticket Sections</h4>
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-left text-slate-400 border-b border-slate-700">
                      <th class="py-2 px-3">Section</th>
                      <th class="py-2 px-3">Price</th>
                      <th class="py-2 px-3">Capacity</th>
                      <th class="py-2 px-3">Sold</th>
                      <th class="py-2 px-3">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="section in selectedMatchForDetails.ticketInventory.sections" :key="section.name" class="border-b border-slate-700/50">
                      <td class="py-2 px-3 font-medium text-white">{{ section.name }}</td>
                      <td class="py-2 px-3 text-emerald-400">₹{{ formatNumber(section.price) }}</td>
                      <td class="py-2 px-3 text-slate-300">{{ section.capacity }}</td>
                      <td class="py-2 px-3 text-white font-medium">{{ section.booked }}</td>
                      <td class="py-2 px-3">
                        <div class="flex items-center gap-2">
                          <div class="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500" :style="{ width: Math.min((section.booked / section.capacity) * 100, 100) + '%' }"></div>
                          </div>
                          <span class="text-xs text-slate-400">{{ Math.round((section.booked / section.capacity) * 100) }}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ACTIVE TAB -->
            <div v-else-if="activeTab === 'active'" class="space-y-6">
              
              <!-- STATE 1: No Inventory - Show Mode Selection Cards -->
              <div v-if="!selectedMatchForDetails.ticketInventory" class="text-center py-4">
                <h4 class="text-lg font-semibold text-white mb-2">Choose Booking Mode</h4>
                <p class="text-slate-400 text-sm mb-6">Select how you want to manage ticket sales for this match</p>
                
                <div class="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <!-- Classic Mode Card -->
                  <div 
                    @click="selectedConfigMode = 'classic'"
                    :class="[
                      'p-6 rounded-xl border-2 cursor-pointer transition-all',
                      selectedConfigMode === 'classic' 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    ]"
                  >
                    <div class="text-4xl mb-3">🎫</div>
                    <h5 class="text-lg font-semibold text-white mb-2">Classic Mode</h5>
                    <p class="text-sm text-slate-400 mb-4">Define custom sections (VIP, Gallery, etc.) with manual capacity and pricing</p>
                    <ul class="text-xs text-slate-500 space-y-1 text-left">
                      <li>✓ Custom section names</li>
                      <li>✓ Manual capacity control</li>
                      <li>✓ Simple booking flow</li>
                    </ul>
                  </div>

                  <!-- 3D Mode Card -->
                  <div 
                    @click="selectedConfigMode = '3d'"
                    :class="[
                      'p-6 rounded-xl border-2 cursor-pointer transition-all',
                      selectedConfigMode === '3d' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    ]"
                  >
                    <div class="text-4xl mb-3">🏟️</div>
                    <h5 class="text-lg font-semibold text-white mb-2">3D Seat Selection</h5>
                    <p class="text-sm text-slate-400 mb-4">Interactive stadium view with individual seat selection</p>
                    <ul class="text-xs text-slate-500 space-y-1 text-left">
                      <li>✓ Visual seat picker</li>
                      <li>✓ Auto-lock distant seats</li>
                      <li>✓ Premium user experience</li>
                    </ul>
                  </div>
                </div>

                <!-- Classic Configuration Options -->
                <div v-if="selectedConfigMode === 'classic'" class="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 text-left max-w-2xl mx-auto">
                  <h5 class="text-sm font-semibold text-white mb-4">Configure Classic Sections</h5>
                  <div v-for="(section, idx) in newClassicSections" :key="idx" class="flex items-center gap-3 mb-3">
                    <input v-model="section.name" placeholder="Section Name" class="admin-input flex-1" />
                    <input v-model.number="section.capacity" type="number" placeholder="Capacity" min="1" class="admin-input w-24" />
                    <div class="flex items-center">
                      <span class="text-slate-400 mr-1">₹</span>
                      <input v-model.number="section.price" type="number" placeholder="Price" min="0" class="admin-input w-28" />
                    </div>
                    <button v-if="newClassicSections.length > 1" @click="newClassicSections.splice(idx, 1)" class="text-red-400 hover:text-red-300">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <button @click="newClassicSections.push({ name: '', capacity: 100, price: 500 })" class="text-emerald-400 text-sm hover:text-emerald-300">
                    + Add Section
                  </button>
                </div>

                <!-- 3D Configuration Options -->
                <div v-if="selectedConfigMode === '3d'" class="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 text-left max-w-2xl mx-auto">
                  <h5 class="text-sm font-semibold text-white mb-4">Configure 3D Stadium</h5>
                  <div class="grid md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">Stadium Size</label>
                      <select v-model="stadiumConfig3D.modelCode" class="admin-input w-full text-sm">
                        <option value="small">Small (4,500 seats)</option>
                        <option value="medium">Medium (13,500 seats)</option>
                        <option value="large">Large (31,000 seats)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">Active Capacity</label>
                      <input 
                        v-model.number="stadiumConfig3D.activeCapacity" 
                        type="number" 
                        :max="getMaxCapacity(stadiumConfig3D.modelCode)"
                        min="500"
                        class="admin-input w-full text-sm"
                      />
                      <p class="text-xs text-slate-500 mt-1">Max: {{ getMaxCapacity(stadiumConfig3D.modelCode).toLocaleString() }}</p>
                    </div>
                    <div>
                      <label class="block text-xs text-slate-400 mb-1">Base Price (₹)</label>
                      <input 
                        v-model.number="stadiumConfig3D.basePrice" 
                        type="number" 
                        min="100"
                        class="admin-input w-full text-sm"
                      />
                    </div>
                  </div>
                  <p class="text-xs text-amber-400 mt-3">💡 Seats beyond active capacity will be auto-locked (furthest from pitch first)</p>
                </div>

                <!-- Confirm Button -->
                <div v-if="selectedConfigMode" class="mt-6">
                  <button 
                    @click="createInventoryWithMode(selectedMatchForDetails)"
                    :disabled="savingMatch === selectedMatchForDetails._id"
                    class="admin-btn-primary px-8 py-3"
                  >
                    {{ savingMatch === selectedMatchForDetails._id ? 'Creating...' : 'Create Ticket Inventory' }}
                  </button>
                </div>
              </div>

              <!-- STATE 2: Has Inventory -->
              <div v-else>
                <!-- Booking Mode Badge & Controls -->
                <div class="flex items-center justify-between mb-4 p-3 bg-slate-700/30 rounded-lg">
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-slate-400">Current Mode:</span>
                    <span v-if="getBookingMode(selectedMatchForDetails) === 'classic'" class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                      🎫 Classic
                    </span>
                    <span v-else class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      🏟️ 3D Seats
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button v-if="selectedMatchForDetails.ticketInventory.salesStatus !== 'open'" 
                            @click="enableSales(selectedMatchForDetails)" 
                            :disabled="savingMatch === selectedMatchForDetails._id"
                            class="admin-btn-primary text-xs py-2 px-4">
                      Enable Sales
                    </button>
                    <button v-else 
                            @click="disableSales(selectedMatchForDetails)" 
                            :disabled="savingMatch === selectedMatchForDetails._id"
                            class="admin-btn-ghost text-xs py-2 px-4">
                      Pause Sales
                    </button>
                  </div>
                </div>

                <!-- CLASSIC MODE CONTENT -->
                <div v-if="getBookingMode(selectedMatchForDetails) === 'classic'">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-semibold text-white">Ticket Sections</h4>
                    <button @click="editMatch(selectedMatchForDetails); selectedMatchForDetails = null" class="admin-btn-ghost text-xs py-2 px-4">
                      Edit Sections
                    </button>
                  </div>
                  
                  <!-- Sections Table -->
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="text-left text-slate-400 border-b border-slate-700">
                          <th class="py-2 px-3">Section</th>
                          <th class="py-2 px-3">Price</th>
                          <th class="py-2 px-3">Capacity</th>
                          <th class="py-2 px-3">Booked</th>
                          <th class="py-2 px-3">Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="section in selectedMatchForDetails.ticketInventory.sections" :key="section.name" class="border-b border-slate-700/50">
                          <td class="py-2 px-3 font-medium text-white">{{ section.name }}</td>
                          <td class="py-2 px-3 text-emerald-400">₹{{ formatNumber(section.price) }}</td>
                          <td class="py-2 px-3 text-slate-300">{{ section.capacity }}</td>
                          <td class="py-2 px-3 text-slate-300">{{ section.booked }}</td>
                          <td class="py-2 px-3">
                            <span :class="(section.capacity - section.booked - (section.pending || 0)) > 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'">
                              {{ section.capacity - section.booked - (section.pending || 0) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 3D MODE CONTENT -->
                <div v-else>
                  <h4 class="text-sm font-semibold text-white mb-4">3D Stadium Configuration</h4>
                  
                  <!-- Current Stadium Info -->
                  <div v-if="selectedMatchForDetails.ticketInventory?.stadiumConfig?.modelCode" class="grid md:grid-cols-4 gap-4 mb-4">
                    <div class="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-400 mb-1">Stadium Model</p>
                      <p class="text-lg font-bold text-white capitalize">{{ selectedMatchForDetails.ticketInventory.stadiumConfig.modelCode }}</p>
                    </div>
                    <div class="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-400 mb-1">Total Seats</p>
                      <p class="text-lg font-bold text-white">{{ (selectedMatchForDetails.ticketInventory.seats?.length || 0).toLocaleString() }}</p>
                    </div>
                    <div class="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-400 mb-1">Active Seats</p>
                      <p class="text-lg font-bold text-emerald-400">{{ (selectedMatchForDetails.ticketInventory.stadiumConfig.activeCapacity || 0).toLocaleString() }}</p>
                    </div>
                    <div class="bg-slate-700/30 rounded-lg p-3 text-center">
                      <p class="text-xs text-slate-400 mb-1">Locked Seats</p>
                      <p class="text-lg font-bold text-slate-500">{{ ((selectedMatchForDetails.ticketInventory.seats?.length || 0) - (selectedMatchForDetails.ticketInventory.stadiumConfig.activeCapacity || 0)).toLocaleString() }}</p>
                    </div>
                  </div>

                  <!-- Reconfigure Section -->
                  <div class="p-4 bg-slate-700/20 rounded-lg border border-slate-600/50 mb-4">
                    <h5 class="text-sm font-medium text-white mb-3">Reconfigure Stadium</h5>
                    <div class="grid md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">Stadium Size</label>
                        <select v-model="stadiumConfig3D.modelCode" @change="updateAvailableSections" class="admin-input w-full text-sm">
                          <option value="small">Small (4,500 seats)</option>
                          <option value="medium">Medium (13,500 seats)</option>
                          <option value="large">Large (31,000 seats)</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">Active Capacity</label>
                        <input 
                          v-model.number="stadiumConfig3D.activeCapacity" 
                          type="number" 
                          :max="getMaxCapacity(stadiumConfig3D.modelCode)"
                          min="500"
                          class="admin-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-slate-400 mb-1">Base Price (₹)</label>
                        <input 
                          v-model.number="stadiumConfig3D.basePrice" 
                          type="number" 
                          min="100"
                          class="admin-input w-full text-sm"
                        />
                      </div>
                    </div>
                    <div class="flex items-center justify-between mt-4">
                      <p class="text-xs text-amber-400">⚠️ Reconfiguring will reset all seat data (excluding confirmed bookings)</p>
                      <button 
                        @click="configure3DStadium(selectedMatchForDetails)"
                        :disabled="saving3DConfig"
                        class="admin-btn-primary text-xs py-2 px-4"
                      >
                        {{ saving3DConfig ? 'Updating...' : 'Update Configuration' }}
                      </button>
                    </div>
                  </div>

                  <!-- Section Selection -->
                  <div class="p-4 bg-slate-700/20 rounded-lg border border-slate-600/50">
                    <div class="flex items-center justify-between mb-3">
                      <h5 class="text-sm font-medium text-white">Select Active Sections</h5>
                      <div class="flex items-center gap-2">
                        <button @click="selectAllSections" class="text-xs text-emerald-400 hover:text-emerald-300">
                          Select All
                        </button>
                        <span class="text-slate-500">|</span>
                        <button @click="deselectAllSections" class="text-xs text-slate-400 hover:text-slate-300">
                          Deselect All
                        </button>
                      </div>
                    </div>
                    <p class="text-xs text-slate-400 mb-3">Choose which sections will have tickets available for booking. Unselected sections will be locked.</p>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      <label v-for="section in availableSections" :key="section.code" 
                             class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all"
                             :class="selectedSections.includes(section.code) 
                               ? 'bg-emerald-500/20 border-emerald-500/50' 
                               : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'">
                        <input 
                          type="checkbox" 
                          :value="section.code"
                          v-model="selectedSections"
                          class="w-4 h-4 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <span 
                              class="w-3 h-3 rounded-full flex-shrink-0" 
                              :style="{ backgroundColor: section.color }"
                            ></span>
                            <span class="text-xs font-semibold text-white truncate">{{ section.code }}</span>
                          </div>
                          <p class="text-xs text-slate-400 truncate">{{ section.name }}</p>
                        </div>
                      </label>
                    </div>

                    <div class="mt-3 flex items-center justify-between">
                      <p class="text-xs text-slate-400">
                        <span class="text-emerald-400 font-semibold">{{ selectedSections.length }}</span> of 
                        <span class="text-white font-semibold">{{ availableSections.length }}</span> sections selected
                      </p>
                      <button 
                        @click="applySectionSelection(selectedMatchForDetails)"
                        :disabled="savingSectionConfig || selectedSections.length === 0"
                        class="admin-btn-primary text-xs py-2 px-4"
                      >
                        {{ savingSectionConfig ? 'Applying...' : 'Apply Section Selection' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="admin-empty-state">
      <div class="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
        </svg>
      </div>
      <p class="text-slate-400">No knockout matches found</p>
      <p class="text-slate-500 text-sm mt-1">Ticket sales are only available for knockout stage matches</p>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingMatch" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Edit Ticket Configuration</h3>
            <button @click="editingMatch = null" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <div v-for="(section, idx) in editSections" :key="idx" 
               class="p-3 bg-slate-700/50 rounded-lg space-y-2">
            <div class="flex items-center gap-3">
              <input v-model="section.name" placeholder="Section Name" class="admin-input flex-1" />
              <input v-model.number="section.capacity" type="number" placeholder="Capacity" min="1" class="admin-input w-24" />
              <div class="flex items-center">
                <span class="text-slate-400 mr-1">₹</span>
                <input v-model.number="section.price" type="number" placeholder="Price" min="0" class="admin-input w-28" />
              </div>
              <button @click="confirmRemoveSectionEdit(idx)" class="text-red-400 hover:text-red-300 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            <input v-model="section.description" 
                   placeholder="Stand/Section Description (optional)" 
                   class="admin-input w-full text-sm" />
            <div v-if="section.booked > 0" class="text-xs text-amber-400">
              ⚠️ {{ section.booked }} tickets already booked
            </div>
          </div>
          <button @click="editSections.push({ name: '', capacity: 100, price: 500, description: '' })" class="admin-btn-ghost text-sm">
            + Add Section
          </button>
        </div>
        
        <div class="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
          <button @click="editingMatch = null" class="admin-btn-ghost">Cancel</button>
          <button @click="updateInventory" :disabled="savingMatch" class="admin-btn-primary">
            {{ savingMatch ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../../store/auth';
import { getStadiumModel } from '../../utils/stadiumModels';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const autoClosing = ref(false);
const tournaments = ref([]);
const activeTab = ref('active');
const eligibleMatches = ref([]);
const completedMatches = ref([]);
const selectedTournament = ref('');
const statusFilter = ref('');
const savingMatch = ref(null);
const newSections = reactive({});
const editingMatch = ref(null);
const editSections = ref([]);
const totalRevenue = ref(0);
const expandedBookings = reactive({});
const loadingBookings = reactive({});
const configErrors = reactive({});
const selectedMatchForDetails = ref(null);

// 3D Stadium Configuration
const stadiumConfig3D = reactive({
  modelCode: 'medium',
  activeCapacity: 15000,
  basePrice: 500
});
const saving3DConfig = ref(false);
const savingSectionConfig = ref(false);

// Section selection
const availableSections = ref([]);
const selectedSections = ref([]);

// Mode selection for new inventory creation
const selectedConfigMode = ref(null); // 'classic' or '3d'
const newClassicSections = ref([
  { name: 'VIP', capacity: 100, price: 2000 },
  { name: 'Gallery', capacity: 500, price: 500 }
]);

// Create inventory with selected mode
async function createInventoryWithMode(match) {
  if (!selectedConfigMode.value) return;
  
  savingMatch.value = match._id;
  
  try {
    let response;
    
    if (selectedConfigMode.value === 'classic') {
      // Create classic inventory with sections
      const validSections = newClassicSections.value.filter(s => s.name && s.capacity > 0);
      if (validSections.length === 0) {
        alert('Please add at least one valid section');
        savingMatch.value = null;
        return;
      }
      
      response = await axios.post(`${API_BASE}/admin/tickets/inventory`, {
        matchId: match._id,
        sections: validSections.map(s => ({
          name: s.name,
          capacity: s.capacity,
          price: s.price || 500,
          description: s.description || ''
        }))
      });
      
    } else if (selectedConfigMode.value === '3d') {
      // Create 3D inventory
      response = await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/3d-config`, {
        modelCode: stadiumConfig3D.modelCode,
        activeCapacity: stadiumConfig3D.activeCapacity,
        basePrice: stadiumConfig3D.basePrice
      });
    }
    
    // Update the match object with the new inventory data
    if (response && response.data) {
      // For 3D mode, the response has inventory nested
      const inventoryData = response.data.inventory || response.data;
      match.ticketInventory = inventoryData;
      
      // Also update in the eligibleMatches array
      const matchIndex = eligibleMatches.value.findIndex(m => m._id === match._id);
      if (matchIndex !== -1) {
        eligibleMatches.value[matchIndex].ticketInventory = inventoryData;
      }
    }
    
    // Refresh data to ensure everything is in sync
    await refreshData();
    
    // Reset form
    selectedConfigMode.value = null;
    newClassicSections.value = [
      { name: 'VIP', capacity: 100, price: 2000 },
      { name: 'Gallery', capacity: 500, price: 500 }
    ];
    
    // Keep modal open to show the newly created sections
    // User can see the sections immediately and enable sales
    alert('Ticket inventory created successfully! You can now enable sales.');
    
  } catch (error) {
    console.error('Error creating inventory:', error);
    alert('Failed to create inventory: ' + (error.response?.data?.message || error.message));
  } finally {
    savingMatch.value = null;
  }
}

// Stadium model capacities (must match backend stadiumGenerator.js)
const STADIUM_CAPACITIES = {
  small: 4500,
  medium: 13500,
  large: 31000
};

function getMaxCapacity(modelCode) {
  return STADIUM_CAPACITIES[modelCode] || 15000;
}

function getBookingMode(match) {
  return match?.ticketInventory?.bookingMode || 'classic';
}

async function setBookingMode(match, mode) {
  if (!match.ticketInventory) {
    // Show notification that inventory needs to be created first
    alert('Please configure ticket inventory first before switching modes');
    return;
  }
  
  try {
    savingMatch.value = match._id;
    await axios.put(`${API_BASE}/admin/tickets/inventory/${match._id}/booking-mode`, { mode });
    match.ticketInventory.bookingMode = mode;
  } catch (error) {
    console.error('Error changing booking mode:', error);
    alert('Failed to change booking mode: ' + (error.response?.data?.message || error.message));
  } finally {
    savingMatch.value = null;
  }
}

async function configure3DStadium(match) {
  try {
    saving3DConfig.value = true;
    
    const payload = {
      modelCode: stadiumConfig3D.modelCode,
      activeCapacity: stadiumConfig3D.activeCapacity,
      basePrice: stadiumConfig3D.basePrice
    };
    
    const res = await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/3d-config`, payload);
    
    // Update match with new inventory data
    match.ticketInventory = res.data.inventory;
    
    // Show success message
    alert(`Successfully configured 3D stadium with ${res.data.seatsGenerated} seats (${res.data.activeSeats} active)`);
    
  } catch (error) {
    console.error('Error configuring 3D stadium:', error);
    alert('Failed to configure 3D stadium: ' + (error.response?.data?.message || error.message));
  } finally {
    saving3DConfig.value = false;
  }
}

// Helper functions for card interactions
function openDetailsModal(match) {
  selectedMatchForDetails.value = match;
  
  // If match has 3D stadium config, initialize the reconfigure form with existing values
  if (match.ticketInventory?.bookingMode === '3d' && match.ticketInventory?.stadiumConfig) {
    const config = match.ticketInventory.stadiumConfig;
    stadiumConfig3D.modelCode = config.modelCode || 'medium';
    stadiumConfig3D.activeCapacity = config.activeCapacity || getMaxCapacity(config.modelCode || 'medium');
    stadiumConfig3D.basePrice = config.basePrice || 500;
    
    // Load active sections if available
    if (config.activeSections && Array.isArray(config.activeSections)) {
      selectedSections.value = [...config.activeSections];
    } else {
      // Default to all sections
      updateAvailableSections();
      selectedSections.value = availableSections.value.map(s => s.code);
    }
  } else {
    // Reset to defaults for new configuration
    stadiumConfig3D.modelCode = 'medium';
    stadiumConfig3D.activeCapacity = 13500;
    stadiumConfig3D.basePrice = 500;
    updateAvailableSections();
    selectedSections.value = availableSections.value.map(s => s.code);
  }
  
  // Update available sections based on model
  updateAvailableSections();
}

// Update available sections when stadium model changes
function updateAvailableSections() {
  const model = getStadiumModel(stadiumConfig3D.modelCode);
  availableSections.value = model.sections || [];
  
  // Keep only valid selections
  selectedSections.value = selectedSections.value.filter(code => 
    availableSections.value.some(s => s.code === code)
  );
}

// Select/Deselect all sections
function selectAllSections() {
  selectedSections.value = availableSections.value.map(s => s.code);
}

function deselectAllSections() {
  selectedSections.value = [];
}

// Apply section selection
async function applySectionSelection(match) {
  if (selectedSections.value.length === 0) {
    alert('Please select at least one section');
    return;
  }
  
  savingSectionConfig.value = true;
  try {
    const response = await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/sections`, {
      activeSections: selectedSections.value
    });
    
    // Update match with new config
    if (response.data.inventory) {
      match.ticketInventory = response.data.inventory;
    }
    
    alert(`Successfully configured ${selectedSections.value.length} sections`);
    await refreshData();
  } catch (error) {
    console.error('Error applying section selection:', error);
    alert('Failed to apply section selection: ' + (error.response?.data?.message || error.message));
  } finally {
    savingSectionConfig.value = false;
  }
}

function getTotalCapacity(match) {
  if (!match.ticketInventory) return 0;
  
  // For 3D mode, use stadiumConfig.activeCapacity or seatSummary
  if (match.ticketInventory.bookingMode === '3d') {
    if (match.ticketInventory.stadiumConfig?.activeCapacity) {
      return match.ticketInventory.stadiumConfig.activeCapacity;
    }
    // Use seatSummary from API
    if (match.ticketInventory.seatSummary) {
      return match.ticketInventory.seatSummary.available + match.ticketInventory.seatSummary.booked + match.ticketInventory.seatSummary.pending;
    }
    return 0;
  }
  
  // For classic mode, sum section capacities
  if (!match.ticketInventory.sections) return 0;
  return match.ticketInventory.sections.reduce((sum, s) => sum + s.capacity, 0);
}

function getTotalBooked(match) {
  if (!match.ticketInventory) return 0;
  
  // For 3D mode, use seatSummary
  if (match.ticketInventory.bookingMode === '3d') {
    if (match.ticketInventory.seatSummary) {
      return match.ticketInventory.seatSummary.booked;
    }
    return 0;
  }
  
  // For classic mode, sum section booked counts
  if (!match.ticketInventory.sections) return 0;
  return match.ticketInventory.sections.reduce((sum, s) => sum + s.booked, 0);
}


// Computed
const matchesWithTickets = computed(() => {
  return eligibleMatches.value.filter(m => m.ticketInventory?.salesStatus === 'open').length;
});

const filteredMatches = computed(() => {
  // Choose source based on tab
  let matches = activeTab.value === 'active' ? eligibleMatches.value : completedMatches.value;
  
  if (selectedTournament.value) {
    matches = matches.filter(m => m.tournament?._id === selectedTournament.value);
  }
  
  if (statusFilter.value === 'configured') {
    matches = matches.filter(m => m.ticketInventory);
  } else if (statusFilter.value === 'not_configured') {
    matches = matches.filter(m => !m.ticketInventory);
  } else if (statusFilter.value === 'open') {
    matches = matches.filter(m => m.ticketInventory?.salesStatus === 'open');
  }
  
  return matches;
});

// Methods
function formatDate(date) {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getPlaceholderTeamName(match, position) {
  // Generate descriptive placeholder names for unseeded matches
  const stage = match.stage || match.round || '';
  
  if (stage === 'Final') {
    return position === 'home' ? 'Winner of Semi-Final 1' : 'Winner of Semi-Final 2';
  } else if (stage === 'Qualifier2') {
    return position === 'home' ? 'Loser of Qualifier 1' : 'Winner of Eliminator';
  } else if (stage.includes('Semi')) {
    return position === 'home' ? 'Winner of Quarter-Final 1' : 'Winner of Quarter-Final 2';
  } else if (stage === 'Qualifier1') {
    return position === 'home' ? '1st Place Team' : '2nd Place Team';
  } else if (stage === 'Eliminator') {
    return position === 'home' ? '3rd Place Team' : '4th Place Team';
  }
  
  return 'To Be Determined';
}

function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-IN');
}

function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function toggleBookingHistory(matchId) {
  expandedBookings[matchId] = !expandedBookings[matchId];
  
  if (expandedBookings[matchId]) {
    await fetchBookingsForMatch(matchId);
  }
}

async function fetchBookingsForMatch(matchId) {
  const match = completedMatches.value.find(m => m._id === matchId);
  if (!match || match.bookings) return; // Already loaded
  
  loadingBookings[matchId] = true;
  try {
    const res = await axios.get(`${API_BASE}/admin/tickets/bookings?matchId=${matchId}`);
    match.bookings = res.data.bookings;
    match.bookingStats = res.data.stats;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    match.bookings = [];
    match.bookingStats = { totalRevenue: 0, totalBookings: 0, totalTickets: 0 };
  } finally {
    loadingBookings[matchId] = false;
  }
}

async function refreshData() {
  loading.value = true;
  try {
    // Store the currently selected match ID to refresh it after data load
    const selectedMatchId = selectedMatchForDetails.value?._id;
    
    // Fetch tournaments with knockouts
    const tournamentsRes = await axios.get(`${API_BASE}/admin/tickets/tournaments-with-knockouts`);
    tournaments.value = tournamentsRes.data;

    // Fetch eligible matches (Active)
    const matchesRes = await axios.get(`${API_BASE}/admin/tickets/eligible-matches`);
    eligibleMatches.value = matchesRes.data;

    // Fetch completed matches (History)
    const historyRes = await axios.get(`${API_BASE}/admin/tickets/eligible-matches?includeCompleted=true`);
    const allMatches = historyRes.data;
    completedMatches.value = allMatches.filter(m => m.status === 'Completed');
    
    // Fetch booking stats for each completed match (regardless of inventory status)
    await Promise.all(
      completedMatches.value.map(async (match) => {
        try {
          const statsRes = await axios.get(`${API_BASE}/admin/tickets/bookings?matchId=${match._id}&limit=0`);
          match.bookingStats = statsRes.data.stats;
        } catch (error) {
          console.error(`Error fetching stats for match ${match._id}:`, error);
          match.bookingStats = { totalRevenue: 0, totalBookings: 0, totalTickets: 0 };
        }
      })
    );
    
    // If a match was selected in the modal, update it with fresh data
    if (selectedMatchId) {
      const updatedMatch = eligibleMatches.value.find(m => m._id === selectedMatchId) ||
                          completedMatches.value.find(m => m._id === selectedMatchId);
      if (updatedMatch) {
        selectedMatchForDetails.value = updatedMatch;
      }
    }
    
    // Debug: Log first match to see structure
    if (eligibleMatches.value.length > 0) {
      console.log('First match data:', eligibleMatches.value[0]);
      console.log('Home club:', eligibleMatches.value[0].homeClub);
      console.log('Away club:', eligibleMatches.value[0].awayClub);
    }

    // Fetch revenue stats
    const bookingsRes = await axios.get(`${API_BASE}/admin/tickets/bookings?limit=1`);
    totalRevenue.value = bookingsRes.data.stats?.totalRevenue || 0;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
}

function addSection(matchId) {
  if (!newSections[matchId]) {
    newSections[matchId] = [];
  }
  newSections[matchId].push({ name: '', capacity: 100, price: 500, description: '' });
}

function removeSection(matchId, idx) {
  newSections[matchId].splice(idx, 1);
  validateAllSections(matchId);
}

function confirmRemoveSection(matchId, idx) {
  if (confirm('Are you sure you want to remove this section?')) {
    removeSection(matchId, idx);
  }
}

function confirmRemoveSectionEdit(idx) {
  const section = editSections.value[idx];
  if (section.booked > 0) {
    if (!confirm(`This section has ${section.booked} booked tickets. Are you sure you want to remove it?`)) {
      return;
    }
  }
  editSections.value.splice(idx, 1);
}

function validateSection(matchId, idx) {
  validateAllSections(matchId);
}

function validateAllSections(matchId) {
  const sections = newSections[matchId] || [];
  const errors = [];
  const names = new Set();
  
  sections.forEach((s, idx) => {
    const sectionLabel = s.name || `Section ${idx + 1}`;
    
    if (!s.name?.trim()) {
      errors.push(`${sectionLabel}: Name is required`);
    } else {
      const nameLower = s.name.toLowerCase().trim();
      if (names.has(nameLower)) {
        errors.push(`Duplicate section name: "${s.name}"`);
      }
      names.add(nameLower);
    }
    
    if (!s.capacity || s.capacity < 1) {
      errors.push(`${sectionLabel}: Capacity must be at least 1`);
    }
    
    if (s.price === undefined || s.price === null || s.price < 0) {
      errors.push(`${sectionLabel}: Price cannot be negative`);
    }
  });
  
  configErrors[matchId] = errors;
  return errors.length === 0;
}

function calculateTotalCapacity(matchId) {
  const sections = newSections[matchId] || [];
  return sections.reduce((sum, s) => sum + (s.capacity || 0), 0);
}

function calculatePotentialRevenue(matchId) {
  const sections = newSections[matchId] || [];
  return sections.reduce((sum, s) => sum + ((s.capacity || 0) * (s.price || 0)), 0);
}

function confirmApplyTemplate(matchId, template) {
  const existing = newSections[matchId]?.length || 0;
  if (existing > 0) {
    if (!confirm(`This will replace your ${existing} existing section(s). Continue?`)) {
      return;
    }
  }
  applyTemplate(matchId, template);
}

function applyTemplate(matchId, template) {
  if (template === 'standard') {
    newSections[matchId] = [
      { name: 'VIP', capacity: 50, price: 5000, description: 'Premium seating with best view' },
      { name: 'Premium', capacity: 150, price: 2000, description: 'Elevated seating area' },
      { name: 'General', capacity: 300, price: 500, description: 'Standard seating' }
    ];
  } else if (template === 'simple') {
    newSections[matchId] = [
      { name: 'General', capacity: 500, price: 500, description: 'General admission' }
    ];
  }
  configErrors[matchId] = [];
}

async function saveInventory(match) {
  const sections = newSections[match._id];
  if (!sections || sections.length === 0) {
    alert('Please add at least one section');
    return;
  }

  // Validate all sections
  if (!validateAllSections(match._id)) {
    return; // Errors are already displayed
  }

  savingMatch.value = match._id;
  try {
    await axios.post(`${API_BASE}/admin/tickets/inventory`, {
      matchId: match._id,
      sections
    });

    await refreshData();
    delete newSections[match._id];
    delete configErrors[match._id];
  } catch (error) {
    console.error('Error saving inventory:', error);
    const errorMsg = error.response?.data?.message || 'Failed to save inventory';
    alert(errorMsg);
  } finally {
    savingMatch.value = null;
  }
}

function editMatch(match) {
  editingMatch.value = match;
  editSections.value = match.ticketInventory.sections.map(s => ({ ...s }));
}

async function updateInventory() {
  if (!editingMatch.value) return;

  // Check if capacity reduced below booked
  const warnings = [];
  editSections.value.forEach(section => {
    if (section.booked && section.capacity < section.booked) {
      warnings.push(`${section.name}: Capacity (${section.capacity}) is less than booked tickets (${section.booked})`);
    }
  });

  if (warnings.length > 0) {
    if (!confirm(`Warning:\n${warnings.join('\n')}\n\nThis may cause issues. Continue?`)) {
      return;
    }
  }

  savingMatch.value = editingMatch.value._id;
  try {
    await axios.put(`${API_BASE}/admin/tickets/inventory/${editingMatch.value._id}`, {
      sections: editSections.value
    });

    await refreshData();
    editingMatch.value = null;
  } catch (error) {
    console.error('Error updating:', error);
    alert(error.response?.data?.message || 'Failed to update');
  } finally {
    savingMatch.value = null;
  }
}

async function enableSales(match) {
  savingMatch.value = match._id;
  try {
    await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/enable`);
    await refreshData();
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'Failed to enable sales');
  } finally {
    savingMatch.value = null;
  }
}

async function disableSales(match) {
  savingMatch.value = match._id;
  try {
    await axios.post(`${API_BASE}/admin/tickets/inventory/${match._id}/disable`);
    await refreshData();
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'Failed to pause sales');
  } finally {
    savingMatch.value = null;
  }
}

async function autoCloseTickets() {
  if (!confirm('This will automatically close ticket sales for all completed or cancelled matches. Continue?')) {
    return;
  }
  
  autoClosing.value = true;
  try {
    const response = await axios.post(`${API_BASE}/admin/tickets/auto-close`);
    alert(response.data.message);
    await refreshData();
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.message || 'Failed to auto-close tickets');
  } finally {
    autoClosing.value = false;
  }
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.admin-stat-card {
  @apply bg-slate-800/50 border border-slate-700/50 rounded-xl p-4;
}

.admin-card {
  @apply bg-slate-800/50 border border-slate-700/50 rounded-xl;
}

.admin-btn-primary {
  @apply px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50;
}

.admin-btn-ghost {
  @apply px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600/50 transition-all disabled:opacity-50;
}

.admin-input {
  @apply bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent;
}

.admin-select {
  @apply bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent;
}

.admin-empty-state {
  @apply flex flex-col items-center justify-center py-12;
}

.admin-animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
