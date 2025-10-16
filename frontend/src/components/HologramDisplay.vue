<template>
  <div 
    class="hologram-container relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-2xl"
    @mouseenter="activateHologram"
    @mouseleave="deactivateHologram"
    @click="toggleHologram"
  >
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

    <!-- Hologram Card (Minimized State) -->
    <div 
      class="hologram-card absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl transition-all duration-500 cursor-pointer"
      :class="{ 'opacity-0 pointer-events-none scale-95': isHologramActive }"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-sm font-semibold text-green-600">Live Match Stats</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900">Interactive Hologram</h3>
          <p class="text-sm text-gray-600">Hover or click to activate 3D projection</p>
        </div>
        <div class="text-right">
          <div class="text-2xl">🏏</div>
          <div class="text-xs text-gray-500 mt-1">Click to explore</div>
        </div>
      </div>
    </div>

    <!-- Hologram Projection (Active State) -->
    <div 
      class="hologram-projection absolute inset-0 flex items-center justify-center transition-all duration-700"
      :class="{ 'opacity-100 pointer-events-auto': isHologramActive, 'opacity-0 pointer-events-none': !isHologramActive }"
    >
      <!-- Hologram Base -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"></div>
      
      <!-- 3D Projection Container -->
      <div class="relative w-full h-full flex items-center justify-center perspective-1000">
        <!-- Team Logos Container -->
        <div 
          class="teams-container relative w-64 h-64 transform-style-3d transition-transform duration-1000"
          :class="{ 'animate-orbit': isHologramActive }"
        >
          <!-- Home Team Logo -->
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-cyan-400">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {{ getInitials(activeMatch?.homeClub?.clubName || activeMatch?.homeClub?.name || 'HT') }}
            </div>
          </div>
          
          <!-- Away Team Logo -->
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-purple-400">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {{ getInitials(activeMatch?.awayClub?.clubName || activeMatch?.awayClub?.name || 'AT') }}
            </div>
          </div>
        </div>
        
        <!-- Floating Stats -->
        <div class="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div class="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/50">
            <div class="text-cyan-300 text-xs font-semibold">CURRENT SCORE</div>
            <div class="text-white text-xl font-bold">{{ getCurrentScore(1) }}</div>
          </div>
        </div>
        
        <div class="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div class="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-purple-400/50">
            <div class="text-purple-300 text-xs font-semibold">OVERS</div>
            <div class="text-white text-xl font-bold">{{ getCurrentOvers(1) }}</div>
          </div>
        </div>
        
        <div class="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2">
          <div class="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-amber-400/50">
            <div class="text-amber-300 text-xs font-semibold">RUN RATE</div>
            <div class="text-white text-xl font-bold">{{ getRunRate(1) }}</div>
          </div>
        </div>
        
        <div class="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <div class="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-emerald-400/50">
            <div class="text-emerald-300 text-xs font-semibold">PARTNERSHIP</div>
            <div class="text-white text-xl font-bold">{{ getPartnership() }}</div>
          </div>
        </div>
        
        <!-- Wicket Effect (hidden by default, shown on wicket event) -->
        <div 
          v-if="showWicketEffect"
          class="absolute inset-0 flex items-center justify-center z-20"
          @animationend="hideWicketEffect"
        >
          <div class="w-full h-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <div class="text-red-500 text-6xl font-bold animate-shake">WICKET!</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Scanline Effect -->
    <div 
      v-if="isHologramActive"
      class="scanline absolute inset-0 pointer-events-none"
      :class="{ 'animate-scan': isHologramActive }"
    ></div>
    
    <!-- Glitch Effect -->
    <div 
      v-if="showGlitch"
      class="glitch-overlay absolute inset-0 pointer-events-none"
      :class="{ 'animate-glitch': showGlitch }"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Props for match data
const props = defineProps({
  activeMatch: {
    type: Object,
    default: () => ({
      homeClub: { clubName: 'Home Team', name: 'Home Team' },
      awayClub: { clubName: 'Away Team', name: 'Away Team' },
      innings: [
        {
          runs: 125,
          wickets: 3,
          balls: 75,
          battingCard: [
            { playerName: 'Player 1', runs: 45, balls: 30 },
            { playerName: 'Player 2', runs: 32, balls: 25 }
          ]
        }
      ]
    })
  }
});

// Hologram state
const isHologramActive = ref(false);
const showWicketEffect = ref(false);
const showGlitch = ref(false);
const glitchInterval = ref(null);

// Toggle hologram activation
function toggleHologram() {
  isHologramActive.value = !isHologramActive.value;
  if (isHologramActive.value) {
    startEffects();
  } else {
    stopEffects();
  }
}

// Activate on hover
function activateHologram() {
  if (!isHologramActive.value) {
    isHologramActive.value = true;
    startEffects();
  }
}

// Deactivate on mouse leave
function deactivateHologram() {
  // Only deactivate if not in click-activated mode
  if (isHologramActive.value && !isClickActivated.value) {
    isHologramActive.value = false;
    stopEffects();
  }
}

// Track if activated by click
const isClickActivated = ref(false);

// Start special effects
function startEffects() {
  isClickActivated.value = true;
  
  // Start glitch effect randomly
  glitchInterval.value = setInterval(() => {
    if (isHologramActive.value && Math.random() > 0.7) {
      showGlitch.value = true;
      setTimeout(() => {
        showGlitch.value = false;
      }, 300);
    }
  }, 5000);
  
  // Simulate wicket events randomly
  setTimeout(() => {
    if (isHologramActive.value) {
      simulateWicket();
    }
  }, 8000);
}

// Stop all effects
function stopEffects() {
  isClickActivated.value = false;
  if (glitchInterval.value) {
    clearInterval(glitchInterval.value);
    glitchInterval.value = null;
  }
  showGlitch.value = false;
  showWicketEffect.value = false;
}

// Simulate wicket event
function simulateWicket() {
  showWicketEffect.value = true;
  // This would be triggered by real match events in a full implementation
}

// Hide wicket effect after animation
function hideWicketEffect() {
  showWicketEffect.value = false;
}

// Helper functions
function getInitials(name) {
  if (!name) return '??';
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getCurrentScore(inningsNumber) {
  if (!props.activeMatch || !props.activeMatch.innings || props.activeMatch.innings.length < inningsNumber) {
    return '0/0';
  }
  const innings = props.activeMatch.innings[inningsNumber - 1];
  return `${innings.runs || 0}/${innings.wickets || 0}`;
}

function getCurrentOvers(inningsNumber) {
  if (!props.activeMatch || !props.activeMatch.innings || props.activeMatch.innings.length < inningsNumber) {
    return '0.0';
  }
  const innings = props.activeMatch.innings[inningsNumber - 1];
  if (!innings.balls) return '0.0';
  const overs = Math.floor(innings.balls / 6);
  const balls = innings.balls % 6;
  return `${overs}.${balls}`;
}

function getRunRate(inningsNumber) {
  if (!props.activeMatch || !props.activeMatch.innings || props.activeMatch.innings.length < inningsNumber) {
    return '0.00';
  }
  const innings = props.activeMatch.innings[inningsNumber - 1];
  if (!innings.balls || innings.balls === 0) return '0.00';
  const overs = innings.balls / 6;
  const runRate = innings.runs / overs;
  return runRate.toFixed(2);
}

function getPartnership() {
  if (!props.activeMatch || !props.activeMatch.innings || props.activeMatch.innings.length < 1) {
    return '0(0)';
  }
  const innings = props.activeMatch.innings[0];
  if (!innings.battingCard || innings.battingCard.length < 2) {
    return '0(0)';
  }
  // Get the two active batsmen
  const batsman1 = innings.battingCard[0];
  const batsman2 = innings.battingCard[1];
  const partnershipRuns = batsman1.runs + batsman2.runs;
  const partnershipBalls = batsman1.balls + batsman2.balls;
  return `${partnershipRuns}(${partnershipBalls})`;
}

// Cleanup on unmount
onUnmounted(() => {
  stopEffects();
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.animate-orbit {
  animation: orbit 20s infinite linear;
}

@keyframes orbit {
  0% {
    transform: rotateY(0deg) rotateX(10deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(10deg);
  }
}

.scanline {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 100% 10px;
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.glitch-overlay {
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 5px
  );
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

.animate-glitch {
  animation: glitch 0.3s linear;
}

@keyframes shake {
  0% { transform: translate(0, 0) rotate(0); }
  10% { transform: translate(-5px, -5px) rotate(-1deg); }
  20% { transform: translate(5px, 5px) rotate(1deg); }
  30% { transform: translate(-5px, 5px) rotate(-1deg); }
  40% { transform: translate(5px, -5px) rotate(1deg); }
  50% { transform: translate(-5px, -5px) rotate(-1deg); }
  60% { transform: translate(5px, 5px) rotate(1deg); }
  70% { transform: translate(-5px, 5px) rotate(-1deg); }
  80% { transform: translate(5px, -5px) rotate(1deg); }
  90% { transform: translate(-5px, -5px) rotate(-1deg); }
  100% { transform: translate(0, 0) rotate(0); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
</file_content>