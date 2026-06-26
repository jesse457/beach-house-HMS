import { defineConfig } from 'vite';
import inertia from '@inertiajs/vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        inertia({
            ssr: {
                entry: 'resources/js/ssr.tsx',
            },
        }),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        // Use lightningcss for best-in-class CSS minification
        cssMinify: 'lightningcss',

        // Strip console.* and debugger from production JS
        esbuild: {
            drop: ['console', 'debugger'],
        },

        // Split vendor libraries into cache-friendly chunks
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/@inertiajs/react')) {
                        return 'vendor-inertia';
                    }
                    if (id.includes('node_modules/framer-motion')) {
                        return 'vendor-motion';
                    }
                    if (id.includes('node_modules/@heroicons') || id.includes('node_modules/lucide-react')) {
                        return 'vendor-icons';
                    }
                },
            },
        },
    },
});
