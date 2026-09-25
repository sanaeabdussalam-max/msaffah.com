/**
 * MASFAH SEO & Routing Configuration
 * 
 * This file defines the dynamic URL structure for maximum local Google discovery.
 */

export const SEO_ROUTES = {
  // Category-based landing pages
  categoryLanding: "/search/[category-slug]", // e.g., /search/car-repair
  
  // Zone-based landing pages
  zoneLanding: "/zone/[zone-code]",           // e.g., /zone/m10
  
  // Combined discovery pages
  combinedLanding: "/explore/[category-slug]/in/[zone-code]", // e.g., /explore/tyres/in/m12
  
  // Business Profile
  businessProfile: "/biz/[business-slug]"     // e.g., /biz/al-waha-car-ac
};

/**
 * Metadata generators for SEO
 */
export function generateMeta(category?: string, zone?: string, business?: string) {
  if (business) {
    return {
      title: `${business} | Musaffah, Abu Dhabi`,
      description: `View services, photos, and contact info for ${business} in Musaffah.`
    };
  }
  
  if (category && zone) {
    return {
      title: `Best ${category} in Musaffah ${zone} | MASFAH`,
      description: `Find top-rated ${category} businesses in Musaffah ${zone}. WhatsApp, Call, and Get Quotes.`
    };
  }
  
  return {
    title: "MASFAH | Everything in Musaffah. One Search.",
    description: "Search for factories, workshops, and shops in Musaffah, Abu Dhabi using AI."
  };
}

/**
 * Sitemap generator mock logic
 */
export async function getDynamicSitemapPaths() {
  const categories = ["car-repair", "car-ac", "tyres", "restaurants", "boat-repair"];
  const zones = ["m1", "m6", "m9", "m10", "m12", "m17", "m45"];
  
  const paths: string[] = [];
  
  categories.forEach(c => {
    paths.push(`/search/${c}`);
    zones.forEach(z => {
      paths.push(`/explore/${c}/in/${z}`);
    });
  });
  
  zones.forEach(z => paths.push(`/zone/${z}`));
  
  return paths;
}
