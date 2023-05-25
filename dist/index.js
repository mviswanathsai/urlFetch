"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
var robotsParser = require("robots-parser");
const urls = [
    "https://www.theblock.co/sitemap_tbco_index.xml",
    // "https://blockworks.co/news-sitemap-index.xml", // news-sitemap
    "https://www.coinbureau.com/sitemap_index.xml",
    "https://coingape.com/sitemap_index.xml",
    "https://thedefiant.io/robots.txt",
    "https://www.coindesk.com/robots.txt", // news-sitemap-index, new-sitemap-index-es
];
const allowedKeywords = [
    "news-sitemap-index",
    "post_type_post",
    "news-sitemap",
    "post-sitemap",
];
const disallowedKeywords = ["news-sitemap-index-es"];
async function getSitemapUrls(sitemapUrl) {
    //set logic for past 24hrs
    const currentDate = new Date();
    const twentyFourHoursAgo = currentDate.getTime() - 24 * 60 * 60 * 1000;
    const filteredUrls = [];
    await Promise.all(sitemapUrl.map(async (sitemapUrl) => {
        try {
            //get the bunch of urls
            const response = await axios_1.default.get(sitemapUrl);
            const sitemapXml = response.data;
            var parsedSitemapUrl = [];
            if (sitemapUrl.includes("robots")) {
                var robots = robotsParser("", sitemapXml);
                const sitemapUrl = robots.getSitemaps();
                parsedSitemapUrl = sitemapUrl.map((url) => {
                    return { loc: [url] };
                });
            }
            else {
                const parsedSitemap = await (0, xml2js_1.parseStringPromise)(sitemapXml);
                parsedSitemapUrl = parsedSitemap.sitemapindex.sitemap;
            }
            // filter the parsed array of urls to find the needed urls that have been altered in the past 24hrs
            const filter = parsedSitemapUrl
                .filter((sitemapUrl) => {
                const containsAllowedKeywords = allowedKeywords.some((keyword) => {
                    return sitemapUrl.loc[0].includes(keyword);
                });
                const containsDisallowedKeywords = disallowedKeywords.some((keyword) => {
                    return sitemapUrl.loc[0].includes(keyword);
                });
                if (sitemapUrl.loc[0].includes("coingape") &&
                    sitemapUrl.loc[0].includes("news-sitemap")) {
                    return false;
                }
                return containsAllowedKeywords && !containsDisallowedKeywords;
            })
                .filter((sitemapUrl) => {
                if (sitemapUrl.lastmod) {
                    const lastmodDate = new Date(sitemapUrl.lastmod[0]);
                    return lastmodDate.getTime() >= twentyFourHoursAgo;
                }
                else {
                    return true;
                }
            })
                .map((filteredUrl) => {
                return filteredUrl.loc[0];
            });
            filteredUrls.push(...filter);
        }
        catch (error) {
            console.error("Error fetching sitemap:", error);
        }
    }));
    return [
        ...filteredUrls,
        "https://blockworks.co/news-sitemap/1",
        "https://blockworks.co/news-sitemap/2",
    ];
}
async function getArticleUrls(sitemapUrl) {
    console.log("running for " + sitemapUrl);
    //set logic for past 24hrs
    const currentDate = new Date();
    const twentyFourHoursAgo = currentDate.getTime() - 24 * 60 * 60 * 1000;
    const filteredUrls = [];
    await Promise.all(sitemapUrl.map(async (sitemapUrl) => {
        try {
            //get the bunch of urls
            const response = await axios_1.default.get(sitemapUrl);
            const sitemapXml = response.data;
            const parsedSitemap = await (0, xml2js_1.parseStringPromise)(sitemapXml);
            const parsedSitemapUrl = parsedSitemap.urlset.url;
            // filter the parsed array of urls to find those in the past 24hrs
            const filter = parsedSitemapUrl === null || parsedSitemapUrl === void 0 ? void 0 : parsedSitemapUrl.filter((sitemapUrl) => {
                if (sitemapUrl.lastmod) {
                    const lastmodDate = new Date(sitemapUrl.lastmod[0]);
                    return lastmodDate.getTime() >= twentyFourHoursAgo;
                }
            }).map((filteredUrl) => {
                return filteredUrl.loc[0];
            });
            filteredUrls.push(...filter);
        }
        catch (error) {
            console.error("Error fetching sitemap:", error);
        }
    }));
    // log and return the array
    const filteredUrlsJSON = JSON.stringify(filteredUrls);
    console.log(filteredUrlsJSON);
    return filteredUrlsJSON;
}
async function run() {
    const sitemapUrls = await getSitemapUrls(urls);
    getArticleUrls(sitemapUrls);
}
run();
// getSitemapUrls(urls);
// const sitemapUrls = [
//   "https://www.coinbureau.com/post-sitemap.xml",
//   "https://www.coinbureau.com/post-sitemap2.xml", //[]
//   "https://www.coindesk.com/arc/outboundfeeds/news-sitemap-index/?outputType=xml",
//   "https://thedefiant.io/sitemap/post-sitemap.xml", // []
//   "https://thedefiant.io/sitemap/post-sitemap1.xml", // []
//   "https://thedefiant.io/sitemap/post-sitemap2.xml", // []
//   "https://thedefiant.io/sitemap/post-sitemap3.xml", // []
//   "https://www.theblock.co/sitemap_tbco_post_type_post_9.xml",
//   "https://coingape.com/post-sitemap.xml",
//   "https://coingape.com/post-sitemap17.xml",
//   "https://blockworks.co/news-sitemap/1",
//   "https://blockworks.co/news-sitemap/2",
// ];
// getArticleUrls(sitemapUrls);
//# sourceMappingURL=index.js.map