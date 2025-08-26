/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // 全てのHTTPSホストを許可
            },
            {
                protocol: 'http',
                hostname: '**', // 全てのHTTPホストを許可
            }
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
        // API ベース URL: コンテナ間通信はサービス名 'django'
        // 環境変数 NEXT_PUBLIC_API_BASE があればそれを優先 (例: https://api.example.com)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://django:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${apiBase}/api/:path*/`,
            },
        ];
    },
};
