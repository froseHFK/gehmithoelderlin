import { defineConfig } from 'vite';

export default defineConfig({
  // Hier kommt die wichtige Regel für 3D-Modelle
  assetsInclude: ['**/*.glb'],
});