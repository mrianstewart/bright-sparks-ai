/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://brightsparks.ai',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
};
