<template>
  <div class="animated-cricket-background" :class="{ 'reduced-motion': prefersReducedMotion }">
    <!-- Animated Gradient Background -->
    <div class="gradient-bg"></div>

    <!-- SVG Container for all animations -->
    <svg class="cricket-animations" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
      <defs>
        <!-- Gradients for cricket elements -->
        <linearGradient id="ballGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
        </linearGradient>
        
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:0.3" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Ball trajectory paths -->
        <path id="trajectory1" d="M 100,800 Q 500,200 900,700" fill="none"/>
        <path id="trajectory2" d="M 1800,900 Q 1200,300 400,600" fill="none"/>
        <path id="trajectory3" d="M 960,100 Q 1400,400 1700,900" fill="none"/>
        <path id="trajectory4" d="M 1700,200 Q 1000,500 300,300" fill="none"/>
        <path id="trajectory5" d="M 960,540 m -300,0 a 300,300 0 1,0 600,0 a 300,300 0 1,0 -600,0" fill="none"/>
      </defs>

      <!-- Geometric Pitch Patterns (Background) -->
      <g class="geometric-patterns" opacity="0.15">
        <!-- Hexagons -->
        <polygon class="hex hex-1" points="300,200 350,170 400,200 400,260 350,290 300,260" fill="none" stroke="#10b981" stroke-width="2"/>
        <polygon class="hex hex-2" points="1500,400 1550,370 1600,400 1600,460 1550,490 1500,460" fill="none" stroke="#059669" stroke-width="2"/>
        <polygon class="hex hex-3" points="800,700 850,670 900,700 900,760 850,790 800,760" fill="none" stroke="#10b981" stroke-width="2"/>
        
        <!-- Triangles -->
        <polygon class="triangle tri-1" points="200,600 280,600 240,680" fill="none" stroke="#34d399" stroke-width="2"/>
        <polygon class="triangle tri-2" points="1600,150 1680,150 1640,230" fill="none" stroke="#10b981" stroke-width="2"/>
        <polygon class="triangle tri-3" points="1200,800 1280,800 1240,880" fill="none" stroke="#059669" stroke-width="2"/>
      </g>

      <!-- Boundary Circles (Expanding) -->
      <g class="boundary-circles">
        <circle class="boundary-circle circle-1" cx="960" cy="540" r="100" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="10,10" opacity="0.4"/>
        <circle class="boundary-circle circle-2" cx="960" cy="540" r="100" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="10,10" opacity="0.3"/>
        <circle class="boundary-circle circle-3" cx="960" cy="540" r="100" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="10,10" opacity="0.2"/>
      </g>

      <!-- Wicket Silhouettes -->
      <g class="wickets">
        <g class="wicket wicket-1" transform="translate(400, 300)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="15" y1="0" x2="15" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="30" y1="0" x2="30" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="-5" y1="0" x2="35" y2="0" stroke="white" stroke-width="2" opacity="0.6"/>
        </g>
        
        <g class="wicket wicket-2" transform="translate(1400, 700)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="15" y1="0" x2="15" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="30" y1="0" x2="30" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="-5" y1="0" x2="35" y2="0" stroke="white" stroke-width="2" opacity="0.6"/>
        </g>

        <g class="wicket wicket-3" transform="translate(700, 850)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="15" y1="0" x2="15" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="30" y1="0" x2="30" y2="40" stroke="white" stroke-width="3" opacity="0.6"/>
          <line x1="-5" y1="0" x2="35" y2="0" stroke="white" stroke-width="2" opacity="0.6"/>
        </g>
      </g>

      <!-- Bat Swing Arcs -->
      <g class="bat-arcs">
        <path class="bat-arc arc-1" d="M 500,400 Q 650,300 800,350" fill="none" stroke="url(#glowGradient)" stroke-width="3" filter="url(#glow)"/>
        <path class="bat-arc arc-2" d="M 1300,600 Q 1150,500 1000,550" fill="none" stroke="url(#glowGradient)" stroke-width="3" filter="url(#glow)"/>
        <path class="bat-arc arc-3" d="M 600,750 Q 750,650 900,700" fill="none" stroke="url(#glowGradient)" stroke-width="3" filter="url(#glow)"/>
      </g>

      <!-- Cricket Balls on Trajectories -->
      <g class="cricket-balls">
        <!-- Ball 1 -->
        <g class="ball-container">
          <circle class="ball ball-1" r="8" fill="url(#ballGradient)" filter="url(#glow)">
            <animateMotion dur="12s" repeatCount="indefinite">
              <mpath href="#trajectory1"/>
            </animateMotion>
          </circle>
          <circle class="ball-seam ball-1" r="8" fill="none" stroke="white" stroke-width="1">
            <animateMotion dur="12s" repeatCount="indefinite">
              <mpath href="#trajectory1"/>
            </animateMotion>
          </circle>
        </g>

        <!-- Ball 2 -->
        <g class="ball-container">
          <circle class="ball ball-2" r="8" fill="url(#ballGradient)" filter="url(#glow)">
            <animateMotion dur="15s" repeatCount="indefinite">
              <mpath href="#trajectory2"/>
            </animateMotion>
          </circle>
          <circle class="ball-seam ball-2" r="8" fill="none" stroke="white" stroke-width="1">
            <animateMotion dur="15s" repeatCount="indefinite">
              <mpath href="#trajectory2"/>
            </animateMotion>
          </circle>
        </g>

        <!-- Ball 3 -->
        <g class="ball-container">
          <circle class="ball ball-3" r="8" fill="url(#ballGradient)" filter="url(#glow)">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#trajectory3"/>
            </animateMotion>
          </circle>
          <circle class="ball-seam ball-3" r="8" fill="none" stroke="white" stroke-width="1">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#trajectory3"/>
            </animateMotion>
          </circle>
        </g>

        <!-- Ball 4 -->
        <g class="ball-container">
          <circle class="ball ball-4" r="8" fill="url(#ballGradient)" filter="url(#glow)">
            <animateMotion dur="13s" repeatCount="indefinite">
              <mpath href="#trajectory4"/>
            </animateMotion>
          </circle>
          <circle class="ball-seam ball-4" r="8" fill="none" stroke="white" stroke-width="1">
            <animateMotion dur="13s" repeatCount="indefinite">
              <mpath href="#trajectory4"/>
            </animateMotion>
          </circle>
        </g>

        <!-- Ball 5 (Circular orbit) -->
        <g class="ball-container">
          <circle class="ball ball-5" r="8" fill="url(#ballGradient)" filter="url(#glow)">
            <animateMotion dur="20s" repeatCount="indefinite">
              <mpath href="#trajectory5"/>
            </animateMotion>
          </circle>
          <circle class="ball-seam ball-5" r="8" fill="none" stroke="white" stroke-width="1">
            <animateMotion dur="20s" repeatCount="indefinite">
              <mpath href="#trajectory5"/>
            </animateMotion>
          </circle>
        </g>
      </g>
    </svg>

    <!-- Particle System (CSS-based) -->
    <div class="particles">
      <div v-for="i in particleCount" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Particle count - reduce on mobile
const particleCount = computed(() => {
  if (typeof window === 'undefined') return 200;
  return window.innerWidth < 768 ? 50 : 200;
});

// Check for reduced motion preference
const prefersReducedMotion = ref(false);

onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mediaQuery.matches;
    
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches;
    });
  }
});

// Generate random particle styles
function getParticleStyle(index) {
  const colors = ['#10b981', '#34d399', '#059669', '#ffffff', '#f97316'];
  const randomColor = colors[index % colors.length];
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomSize = Math.random() * 3 + 2;
  const randomDelay = Math.random() * 20;
  const randomDuration = Math.random() * 10 + 15;
  
  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    width: `${randomSize}px`,
    height: `${randomSize}px`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
  };
}
</script>

<style scoped>
.animated-cricket-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Animated Gradient Background */
.gradient-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%);
  background-size: 400% 400%;
  animation: gradientShift 30s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* SVG Container */
.cricket-animations {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Geometric Patterns Animations */
.hex {
  animation: pulseRotate 8s ease-in-out infinite;
  transform-origin: center;
}

.hex-1 { animation-delay: 0s; }
.hex-2 { animation-delay: 2s; }
.hex-3 { animation-delay: 4s; }

.triangle {
  animation: float 6s ease-in-out infinite;
  transform-origin: center;
}

.tri-1 { animation-delay: 0s; }
.tri-2 { animation-delay: 2s; }
.tri-3 { animation-delay: 4s; }

@keyframes pulseRotate {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 0.15;
  }
  50% { 
    transform: scale(1.1) rotate(5deg);
    opacity: 0.25;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Boundary Circles */
.boundary-circle {
  animation: expandFade 6s ease-out infinite;
  transform-origin: center;
}

.circle-1 { animation-delay: 0s; }
.circle-2 { animation-delay: 2s; }
.circle-3 { animation-delay: 4s; }

@keyframes expandFade {
  0% {
    r: 100;
    opacity: 0.4;
  }
  100% {
    r: 500;
    opacity: 0;
  }
}

/* Wickets Pulsing */
.wicket {
  animation: wicketPulse 5s ease-in-out infinite;
}

.wicket-1 { animation-delay: 0s; }
.wicket-2 { animation-delay: 1.5s; }
.wicket-3 { animation-delay: 3s; }

@keyframes wicketPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Bat Arcs Drawing Effect */
.bat-arc {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: drawArc 6s ease-in-out infinite;
}

.arc-1 { animation-delay: 0s; }
.arc-2 { animation-delay: 2s; }
.arc-3 { animation-delay: 4s; }

@keyframes drawArc {
  0%, 100% {
    stroke-dashoffset: 300;
    opacity: 0;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 0.8;
  }
}

/* Cricket Balls Rotation */
.ball {
  animation: rotateBall 2s linear infinite;
}

@keyframes rotateBall {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Particle System */
.particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  animation: particleFloat 15s ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.3;
  }
  25% {
    transform: translate(20px, -30px);
    opacity: 0.6;
  }
  50% {
    transform: translate(-20px, -60px);
    opacity: 0.4;
  }
  75% {
    transform: translate(30px, -30px);
    opacity: 0.7;
  }
}

/* Reduced Motion Support */
.reduced-motion .gradient-bg {
  animation: none;
  background-position: 0% 50%;
}

.reduced-motion .hex,
.reduced-motion .triangle,
.reduced-motion .boundary-circle,
.reduced-motion .wicket,
.reduced-motion .bat-arc,
.reduced-motion .ball,
.reduced-motion .particle {
  animation: none !important;
  opacity: 0.3;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .geometric-patterns,
  .bat-arcs {
    opacity: 0.08;
  }
  
  .particles {
    display: none;
  }
  
  .boundary-circles {
    opacity: 0.5;
  }
}

/* Performance Optimizations */
.cricket-animations,
.particles,
.gradient-bg {
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
