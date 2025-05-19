/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://host.docker.internal:8000/api/:path*/',
            },
        ]
    },
};
