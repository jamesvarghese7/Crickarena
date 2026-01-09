<template>
  <div class="cricket-background">
    <!-- Video Background -->
    <video 
      class="bg-video" 
      autoplay 
      muted 
      loop 
      playsinline
      preload="auto"
    >
      <source src="../assets/cricket-stadium-bg.mp4" type="video/mp4" />
    </video>
    <!-- Dark Overlay for better text readability -->
    <div class="bg-overlay"></div>
  </div>
</template>

<script setup>
// Video cricket stadium background - loops seamlessly
</script>

<style scoped>
.cricket-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Cricket Stadium Background Video */
.bg-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
}

/* Dark Overlay for better text readability */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.3) 0%,
    rgba(15, 23, 42, 0.5) 50%,
    rgba(15, 23, 42, 0.7) 100%
  );
}

/* Mobile Optimizations - slightly darker overlay */
@media (max-width: 768px) {
  .bg-overlay {
    background: linear-gradient(
      to bottom,
      rgba(15, 23, 42, 0.4) 0%,
      rgba(15, 23, 42, 0.6) 50%,
      rgba(15, 23, 42, 0.8) 100%
    );
  }
}
</style>
