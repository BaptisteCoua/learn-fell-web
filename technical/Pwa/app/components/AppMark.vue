<template>
  <span class="app-mark" aria-hidden="true"><span class="app-mark__five">5</span></span>
</template>

<style scoped>
.app-mark {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border: 2px solid var(--cinq-ink);
  border-radius: 14px;
  background: var(--cinq-yellow);
}

.app-mark__five {
  position: relative;
  font-family: var(--cinq-font-display);
  font-size: 2.625rem;
  font-weight: 900;
  line-height: 1;
}

.app-mark__five::after {
  position: absolute;
  right: 8%;
  bottom: -6%;
  left: 8%;
  height: 4px;
  background: var(--cinq-blue);
  content: '';
}
</style>
