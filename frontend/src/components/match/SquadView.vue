<template>
  <div class="space-y-6">
    <!-- Teams Grid -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Home Team -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 px-6 py-4 border-b border-blue-500/30">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20">
              <img v-if="match.teams?.home?.logoUrl" :src="match.teams.home.logoUrl" class="w-full h-full object-cover" />
              <span v-else class="text-2xl font-bold text-white">{{ match.teams?.home?.name?.charAt(0) }}</span>
            </div>
            <h3 class="text-lg font-bold text-white">{{ match.teams?.home?.name }}</h3>
          </div>
        </div>
        
        <div v-if="homeRoster?.length" class="divide-y divide-slate-700/30">
          <div v-for="(player, idx) in homeRoster" :key="player.playerId" 
               class="flex items-center px-5 py-4 hover:bg-slate-700/30 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold mr-4 shadow-lg shadow-blue-500/30">
              {{ player.jerseyNumber || idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-white flex items-center gap-2">
                {{ player.playerName }}
                <span v-if="isCaptain(player)" class="px-2 py-0.5 bg-amber-500/80 text-white text-xs rounded-full font-bold">C</span>
                <span v-if="isWicketkeeper(player)" class="px-2 py-0.5 bg-blue-500/80 text-white text-xs rounded-full font-bold">WK</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">{{ player.position }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p class="font-medium text-slate-400">Squad not announced</p>
        </div>
      </div>

      <!-- Away Team -->
      <div class="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-4 border-b border-purple-500/30">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20">
              <img v-if="match.teams?.away?.logoUrl" :src="match.teams.away.logoUrl" class="w-full h-full object-cover" />
              <span v-else class="text-2xl font-bold text-white">{{ match.teams?.away?.name?.charAt(0) }}</span>
            </div>
            <h3 class="text-lg font-bold text-white">{{ match.teams?.away?.name }}</h3>
          </div>
        </div>
        
        <div v-if="awayRoster?.length" class="divide-y divide-slate-700/30">
          <div v-for="(player, idx) in awayRoster" :key="player.playerId" 
               class="flex items-center px-5 py-4 hover:bg-slate-700/30 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold mr-4 shadow-lg shadow-purple-500/30">
              {{ player.jerseyNumber || idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-white flex items-center gap-2">
                {{ player.playerName }}
                <span v-if="isCaptain(player)" class="px-2 py-0.5 bg-amber-500/80 text-white text-xs rounded-full font-bold">C</span>
                <span v-if="isWicketkeeper(player)" class="px-2 py-0.5 bg-blue-500/80 text-white text-xs rounded-full font-bold">WK</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">{{ player.position }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <p class="font-medium text-slate-400">Squad not announced</p>
        </div>
      </div>
    </div>

    <!-- Team Composition -->
    <div class="bg-gradient-to-br from-slate-800/80 to-emerald-900/20 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 shadow-xl">
      <h3 class="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <span>📋</span> Team Composition
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
          <div class="text-sm text-slate-400 mb-3">{{ match.teams?.home?.name }}</div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30">🏏 {{ getComposition(homeRoster, 'bat') }} Batters</span>
            <span class="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-500/30">🎯 {{ getComposition(homeRoster, 'bowl') }} Bowlers</span>
            <span class="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium border border-amber-500/30">⚡ {{ getComposition(homeRoster, 'all') }} All-rounders</span>
            <span class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/30">🧤 {{ getComposition(homeRoster, 'wk') }} WK</span>
          </div>
        </div>
        <div class="bg-slate-900/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
          <div class="text-sm text-slate-400 mb-3">{{ match.teams?.away?.name }}</div>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30">🏏 {{ getComposition(awayRoster, 'bat') }} Batters</span>
            <span class="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-500/30">🎯 {{ getComposition(awayRoster, 'bowl') }} Bowlers</span>
            <span class="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium border border-amber-500/30">⚡ {{ getComposition(awayRoster, 'all') }} All-rounders</span>
            <span class="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/30">🧤 {{ getComposition(awayRoster, 'wk') }} WK</span>
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
