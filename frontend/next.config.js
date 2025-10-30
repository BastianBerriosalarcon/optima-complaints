/** @type {import('next').NextConfig} */

const nextConfig = {
    // Configuración básica del monorepo
    transpilePackages: ['@optimacx/shared'],

    // Deshabilitar ESLint y TypeScript check durante build en producción
    // El linting se hace en desarrollo y en CI/CD
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
