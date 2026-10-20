import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

// Aset bawaan Laravel (tidak dipakai website; tampilan web ada di folder sd-app).
// Bila dibangun, gayanya memakai Bootstrap seperti sd-app.
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
