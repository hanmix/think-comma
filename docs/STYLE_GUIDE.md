# Style Guide

- Avoid `<style scoped>` in SFCs. Use adjacent SCSS files instead and import them in `<script setup>`.
  - Example: `src/components/ui/TcSelect.vue` → `import './TcSelect.scss'`
- Use `tc-` prefixes and block/element structure for class names.
- Prefer design tokens from `src/styles/_variables.scss`.
- Keep overlays anchored with a dedicated container (`position: relative`) near the trigger, not the whole form group.
