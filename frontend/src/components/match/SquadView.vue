<template>
  <div class="space-y-6">
    <!-- Teams Grid -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Home Team -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
              <img v-if="match.teams?.home?.logoUrl" :src="match.teams.home.logoUrl" class="w-full h-full object-cover" />
              <span v-else class="text-xl font-bold text-white">{{ match.teams?.home?.name?.charAt(0) }}</span>
            </div>
            <h3 class="text-lg font-bold text-white">{{ match.teams?.home?.name }}</h3>
          </div>
        </div>
        
        <div v-if="homeRoster?.length" class="divide-y divide-gray-100">
          <div v-for="(player, idx) in homeRoster" :key="player.playerId" 
               class="flex items-center px-4 py-3 hover:bg-gray-50">
            <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-3">
              {{ player.jerseyNumber || idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900">
                {{ player.playerName }}
                <span v-if="isCaptain(player)" class="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-bold">C</span>
                <span v-if="isWicketkeeper(player)" class="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-bold">WK</span>
              </div>
              <div class="text-xs text-gray-500">{{ player.position }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="font-medium">Squad not announced</p>
        </div>
      </div>

      <!-- Away Team -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
              <img v-if="match.teams?.away?.logoUrl" :src="match.teams.away.logoUrl" class="w-full h-full object-cover" />
              <span v-else class="text-xl font-bold text-white">{{ match.teams?.away?.name?.charAt(0) }}</span>
            </div>
            <h3 class="text-lg font-bold text-white">{{ match.teams?.away?.name }}</h3>
          </div>
        </div>
        
        <div v-if="awayRoster?.length" class="divide-y divide-gray-100">
          <div v-for="(player, idx) in awayRoster" :key="player.playerId" 
               class="flex items-center px-4 py-3 hover:bg-gray-50">
            <div class="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold mr-3">
              {{ player.jerseyNumber || idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-gray-900">
                {{ player.playerName }}
                <span v-if="isCaptain(player)" class="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-bold">C</span>
                <span v-if="isWicketkeeper(player)" class="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-bold">WK</span>
              </div>
              <div class="text-xs text-gray-500">{{ player.position }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="font-medium">Squad not announced</p>
        </div>
      </div>
    </div>

    <!-- Team Composition -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Team Composition</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-sm text-gray-500 mb-2">{{ match.teams?.home?.name }}</div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">🏏 {{ getComposition(homeRoster, 'bat') }} Batters</span>
            <span class="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">🎯 {{ getComposition(homeRoster, 'bowl') }} Bowlers</span>
            <span class="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm">⚡ {{ getComposition(homeRoster, 'all') }} All-rounders</span>
            <span class="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">🧤 {{ getComposition(homeRoster, 'wk') }} WK</span>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-200">
          <div class="text-sm text-gray-500 mb-2">{{ match.teams?.away?.name }}</div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">🏏 {{ getComposition(awayRoster, 'bat') }} Batters</span>
            <span class="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">🎯 {{ getComposition(awayRoster, 'bowl') }} Bowlers</span>
            <span class="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm">⚡ {{ getComposition(awayRoster, 'all') }} All-rounders</span>
            <span class="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">🧤 {{ getComposition(awayRoster, 'wk') }} WK</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true },
  rosters: { type: Object, default: null }
});

const homeRoster = computed(() => props.rosters?.homeTeam?.roster?.players || []);
const awayRoster = computed(() => props.rosters?.awayTeam?.roster?.players || []);

function isCaptain(player) {
  const pos = (player.position || '').toLowerCase();
  return pos.includes('captain') || pos.includes('(c)');
}

function isWicketkeeper(player) {
  const pos = (player.position || '').toLowerCase();
  return pos.includes('wicket') || pos.includes('keeper') || pos.includes('wk');
}

function getComposition(roster, type) {
  if (!roster?.length) return 0;
  return roster.filter(p => {
    const pos = (p.position || '').toLowerCase();
    if (type === 'bat') return pos.includes('bat') && !pos.includes('all');
    if (type === 'bowl') return pos.includes('bowl') && !pos.includes('all');
    if (type === 'all') return pos.includes('all');
    if (type === 'wk') return pos.includes('wicket') || pos.includes('keeper');
    return false;
  }).length;
}
</script>
