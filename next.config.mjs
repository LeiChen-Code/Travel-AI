/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns:[
            {
                protocol:'https',
                hostname:'fastidious-deer-80.convex.cloud'
            }
        ]
    }
};

export default nextConfig;
