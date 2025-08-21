/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'raw.githubusercontent.com' },
            { protocol: 'https', hostname: '*.githubusercontent.com' },
            { protocol: 'https', hostname: '*.github.io' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
        // プロダクション環境でより制限したい場合の設定例（コメントアウト）
        // remotePatterns: [
        //     {
        //         protocol: 'https',
        //         hostname: '*.github.io', // GitHub Pages
        //     },
        //     {
        //         protocol: 'https',
        //         hostname: 'raw.githubusercontent.com', // GitHub raw content
        //     },
        //     {
        //         protocol: 'https',
        //         hostname: '*.vercel.app', // Vercel deployments
        //     },
        //     {
        //         protocol: 'https',
        //         hostname: '*.netlify.app', // Netlify deployments
        //     },
        //     // 一般的な画像ホスティングサービス
        //     {
        //         protocol: 'https',
        //         hostname: 'imgur.com',
        //     },
        //     {
        //         protocol: 'https',
        //         hostname: 'i.imgur.com',
        //     },
        // ],
    },
}

module.exports = {
    ...nextConfig,
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://host.docker.internal:8000/api/:path*/',
                },
            ]
        }
        return []
    },
};
