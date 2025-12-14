<template>
  <div class="space-y-6">
    <!-- Controls -->
    <div class="flex flex-wrap gap-3">
      <!-- Filter -->
      <div class="flex gap-2">
        <button v-for="filter in filters" :key="filter.key"
                @click="activeFilter = filter.key"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  activeFilter === filter.key 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]">
          {{ filter.label }}
        </button>
      </div>

      <!-- Innings Selector -->
      <div class="flex gap-2 ml-auto">
        <button v-for="(innings, idx) in match?.innings || []" :key="idx"
                @click="selectedInnings = idx"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedInnings === idx 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]">
          {{ idx === 0 ? '1st' : '2nd' }} Inn
        </button>
      </div>
    </div>

    <!-- Overs List -->
    <div v-if="filteredOvers.length" class="space-y-4">
      <div v-for="over in filteredOvers" :key="over.overNumber" 
           class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Over Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
             @click="toggleOver(over.overNumber)">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
              {{ over.overNumber }}
            </div>
            <div>
              <div class="font-semibold text-gray-900">Over {{ over.overNumber }}</div>
              <div class="text-sm text-gray-500">{{ over.bowler }}</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="font-bold text-gray-900">{{ over.totalRuns }} runs</span>
              <span v-if="over.totalWickets" class="ml-2 text-red-600 font-bold">{{ over.totalWickets }}W</span>
            </div>
            <svg :class="['w-5 h-5 text-gray-400 transition-transform', expandedOvers.includes(over.overNumber) ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Over Details -->
        <div v-if="expandedOvers.includes(over.overNumber)" class="border-t border-gray-200">
          <div v-for="ball in over.balls" :key="`${over.overNumber}.${ball.ballNumber}`" 
               class="flex items-start gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0"
               :class="{
                 'bg-red-50': ball.wicket?.how,
                 'bg-amber-50': ball.runs === 6,
                 'bg-emerald-50': ball.runs === 4
               }">
            <div class="w-12 text-sm font-mono text-gray-500">{{ over.overNumber }}.{{ ball.ballNumber }}</div>
            <div class="w-12 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 :class="getBallClass(ball)">
              {{ getBallText(ball) }}
            </div>
            <div class="flex-1 text-sm text-gray-700">{{ getCommentary(ball, over) }}</div>
          </div>
          
          <div class="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
            End of Over {{ over.overNumber }} | {{ over.totalRuns }} runs | {{ over.totalWickets || 0 }} wickets
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="font-medium text-gray-500">No ball-by-ball data available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  match: { type: Object, required: true }
});

const selectedInnings = ref(0);
const activeFilter = ref('all');
const expandedOvers = ref([]);

const filters = [
  { key: 'all', label: 'All Balls' },
  { key: 'boundaries', label: '4s & 6s' },
  { key: 'wickets', label: 'Wickets' }
];

const currentInnings = computed(() => props.match?.innings?.[selectedInnings.value] || null);

const filteredOvers = computed(() => {
  if (!currentInnings.value?.overs) return [];
  const overs = [...currentInnings.value.overs].reverse();
  
  if (activeFilter.value === 'all') return overs;
  
  return overs.map(over => {
    const filteredBalls = over.balls?.filter(ball => {
      if (activeFilter.value === 'boundaries') return ball.runs === 4 || ball.runs === 6;
      if (activeFilter.value === 'wickets') return ball.wicket?.how;
      return true;
    });
    return { ...over, balls: filteredBalls };
  }).filter(over => over.balls?.length > 0);
});

function toggleOver(overNumber) {
  const idx = expandedOvers.value.indexOf(overNumber);
  if (idx > -1) expandedOvers.value.splice(idx, 1);
  else expandedOvers.value.push(overNumber);
}

function getBallClass(ball) {
  if (ball.wicket?.how) return 'bg-red-500 text-white';
  if (ball.runs === 6) return 'bg-amber-500 text-white';
  if (ball.runs === 4) return 'bg-emerald-500 text-white';
  if (ball.extras !== 'none') return 'bg-blue-500 text-white';
  return 'bg-gray-200 text-gray-900';
}

function getBallText(ball) {
  if (ball.wicket?.how) return 'W';
  if (ball.extras === 'wide') return `${ball.runs}wd`;
  if (ball.extras === 'no-ball') return `${ball.runs}nb`;
  return ball.runs;
}

function getCommentary(ball, over) {
  const bowler = over.bowler;
  const batsman = ball.batsman;
  
  if (ball.wicket?.how) {
    const w = ball.wicket;
    if (w.how === 'bowled') return `WICKET! ${w.batsman} bowled by ${bowler}`;
    if (w.how === 'caught') return `WICKET! ${w.batsman} caught by ${w.fielder} off ${bowler}`;
    if (w.how === 'lbw') return `WICKET! ${w.batsman} LBW by ${bowler}`;
    if (w.how === 'run out') return `WICKET! ${w.batsman} run out by ${w.fielder}`;
    return `WICKET! ${w.batsman} ${w.how}`;
  }
  
  if (ball.runs === 6) return `SIX! ${batsman} smashes ${bowler} over the boundary`;
  if (ball.runs === 4) return `FOUR! ${batsman} finds the gap`;
  if (ball.runs === 0) return `${bowler} to ${batsman}, no run`;
  if (ball.extras === 'wide') return `Wide ball by ${bowler}`;
  if (ball.extras === 'no-ball') return `No ball by ${bowler}`;
  
  return `${bowler} to ${batsman}, ${ball.runs} run${ball.runs > 1 ? 's' : ''}`;
}
</script>
