import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'app': path.resolve(__dirname, './src/app'),
          'widgets': path.resolve(__dirname, './src/widgets'),
          'features': path.resolve(__dirname, './src/features'),
          'entities': path.resolve(__dirname, './src/entities'),
          'shared': path.resolve(__dirname, './src/shared'),
        }
      }
    };
});
