import './bootstrap';
import '../css/app.css';
import '@fontsource-variable/inter';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { CartProvider } from './Context/CartContext'; // Import this

createInertiaApp({
    title: (title) => `${title} - Luxe Hotel`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <CartProvider>
                <App {...props} />
            </CartProvider>
        );
    },
});
