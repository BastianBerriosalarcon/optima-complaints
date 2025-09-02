/** @type {import('next').NextConfig} */

const nextConfig = {
    // Configuración de imágenes optimizada
    images: {
        domains: [
            'images.unsplash.com',
            'supabase.co',
            'pnkdyagqibqxfxziqwxt.supabase.co', // Tu instancia Supabase
            'i.pravatar.cc', // Para avatares
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    
    // Configuración del monorepo
    transpilePackages: ['@optimacx/shared'],
    
    // Optimizaciones para producción
    output: 'standalone',
    trailingSlash: true,
    compress: true,
    poweredByHeader: false,
    
    // Configuración experimental
    experimental: {
        isrMemoryCacheSize: 0,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        turbo: {
            rules: {
                '*.svg': {
                  loaders: ['@svgr/webpack'],
                  as: '*.js',
                },
            },
        },
    },
    
    // Configuración de generación estática
    generateStaticParams: false,
    dynamicParams: true,
    
    // Headers de seguridad para OptimaCX
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, max-age=0',
                    },
                ],
            },
        ];
    },
    
    // Redirects para SEO y UX
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/dashboard/overview',
                permanent: false,
            },
        ];
    },
    
    // Configuración de Webpack para optimizaciones
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Optimización de bundle
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                    radix: {
                        test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                        name: 'radix',
                        chunks: 'all',
                    },
                    supabase: {
                        test: /[\\/]node_modules[\\/]@supabase[\\/]/,
                        name: 'supabase',
                        chunks: 'all',
                    },
                },
            };
        }
        
        // Configuración para SVGs
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        
        return config;
    },
    
    // Variables de entorno públicas para OptimaCX
    env: {
        NEXT_PUBLIC_APP_NAME: 'OptimaCX',
        NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    },
};

// Configuración condicional para Tempo DevTools
if (process.env.NEXT_PUBLIC_TEMPO) {
    nextConfig["experimental"] = {
        ...nextConfig.experimental,
        // NextJS 13.4.8 up to 14.1.3:
        // swcPlugins: [[require.resolve("tempo-devtools/swc/0.86"), {}]],
        // NextJS 14.1.3 to 14.2.11:
        swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]]
        // NextJS 15+ (Not yet supported, coming soon)
    }
}

module.exports = nextConfig;