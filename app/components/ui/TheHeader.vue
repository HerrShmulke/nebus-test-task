<template>
  <header class="app-header">
    <NuxtLink to="/" class="app-header__brand"><span class="app-header__brand-icon">N</span> Заметки</NuxtLink>
  </header>
</template>

<style lang="scss">
.app-header {
  height: 72px; 
  padding: 0 max(24px, calc((100% - 1120px) / 2));
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  background: $color-surface; 
  border-bottom: 1px solid $color-border;

  &__brand {
    display: inline-flex; 
    align-items: center; 
    gap: 10px; 
    font-size: 17px; 
    font-weight: 750; 
  }

  &__brand-icon {
    display: grid; 
    place-items: center; 
    width: 32px; 
    height: 32px; 
    border-radius: 10px;
    color: white;
    background: $color-primary; 
    font-weight: 800;
  }

  @media (max-width: 680px) {
    height: 62px; 
    padding: 0 20px; 
  }
}
</style>