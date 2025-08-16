/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://flexicure.app",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/dashboard/*", "/auth/*", "/api/*", "/admin/*", "/server-sitemap-index.xml"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/auth/", "/api/", "/admin/"],
      },
    ],
    additionalSitemaps: [`${process.env.NEXT_PUBLIC_APP_URL || "https://flexicure.app"}/server-sitemap-index.xml`],
  },
  transform: async (config, path) => {
    // Custom priority based on page importance
    const priorities = {
      "/": 1.0,
      "/about": 0.8,
      "/pricing": 0.9,
      "/contact": 0.7,
      "/blog": 0.8,
      "/terms": 0.3,
      "/privacy": 0.3,
    }

    return {
      loc: path,
      changefreq: path === "/" ? "daily" : "weekly",
      priority: priorities[path] || 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
