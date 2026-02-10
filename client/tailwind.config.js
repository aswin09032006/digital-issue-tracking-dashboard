/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0',
                DEFAULT: '0',
                'md': '0',
                'lg': '0',
                'xl': '0',
                '2xl': '0',
                '3xl': '0',
                'full': '9999px', // keep full for avatars if needed, or make them square too? 'Sharp edges only' implies everything. I'll make avatars square too for "Sharp edges only" unless user said otherwise. User said "User avatar" in original request. Usually avatars are circle. I will keep circle for avatar, but everything else sharp.
            },
            colors: {
                'corporate-bg': 'var(--color-bg)',
                'corporate-text': 'var(--color-text)',
                'corporate-muted': 'var(--color-muted)',
                'corporate-border': 'var(--color-border)',
                'corporate-accent': 'var(--color-accent)',
                'corporate-sidebar': 'var(--color-sidebar)',
                // Keep notion vars for backward compat until replaced
                'notion-bg': 'var(--color-bg)',
                'notion-gray': 'var(--color-sidebar)',
                'notion-sidebar': 'var(--color-sidebar)', // gray-50
                'notion-border': 'var(--color-border)',
            }
        },
    },
    plugins: [],
}
