/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false, // Sécurité : masquer "X-Powered-By: Next.js"

    experimental: {
        optimizePackageImports: ["lucide-react"],
        serverComponentsExternalPackages: ["bcryptjs"],
    },

    // Configuration des domaines autorisés pour les images (logos des outils)
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'logo.clearbit.com', // Service externe typique pour les logos
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com', // Si hébergement d'images custom
            }
        ],
    },

    // Headers de sécurité HTTP obligatoires
    async headers() {
        return [
            {
                // Applique les headers à toutes les routes
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN' // Sécurité : empêche le clickjacking via iframe
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff' // Sécurité : empêche le MIME sniffing
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        // Content Security Policy basique mais robuste
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https:;"
                    }
                ]
            }
        ];
    }
};

module.exports = nextConfig;
