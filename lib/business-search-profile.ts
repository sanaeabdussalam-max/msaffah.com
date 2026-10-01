import { BusinessForMatching } from './search-matching';

type ProfileInput = Pick<BusinessForMatching, 'name' | 'sourceUrl' | 'category'>;

export interface BusinessSearchProfile {
  searchCategories: string[];
  activities: string[];
  itemTypes: string[];
  capabilities: string[];
  keywords: string[];
}

const profile = (
  searchCategories: string[],
  activities: string[],
  itemTypes: string[],
  capabilities: string[],
  keywords: string[],
): BusinessSearchProfile => ({ searchCategories, activities, itemTypes, capabilities, keywords });

/**
 * Source-backed search metadata. These are intentionally narrow: a category alone
 * must not imply a service that the business has not published.
 */
export function getBusinessSearchProfile(input: ProfileInput): BusinessSearchProfile {
  const source = (input.sourceUrl || '').toLowerCase();
  const name = input.name.toLowerCase();

  if (source.includes('alkasirscrap.com') || source.includes('metalscrapmusaffah.com')) {
    return profile(['Scrap'], ['Buy scrap', 'Buy used items', 'Scrap pickup'], ['Scrap', 'Used machinery', 'Metal'], ['buys_from_customers', 'buys_used_items', 'home_pickup'], ['سكراب', 'خردة', 'scrap', 'used machinery', 'metal scrap']);
  }
  if (source.includes('globalscraptrading.org')) {
    return profile(['Scrap'], ['Buy scrap', 'Demolition', 'Scrap pickup'], ['Scrap', 'Metal'], ['buys_from_customers', 'buys_used_items', 'home_pickup'], ['سكراب', 'خردة', 'scrap', 'demolition', 'recycling']);
  }

  if (source.includes('magictouchautogarage.com') || source.includes('mazautouae.com') || source.includes('redfox.ae') || source.includes('gtsautorepair.ae') || source.includes('exoticautoservices.ae') || source.includes('swissauto.ae')) {
    return profile(['Automotive', 'Garage'], ['Car repair', 'Auto service'], ['Car'], ['repairs_items'], ['كراج', 'جراج', 'ورشة', 'garage', 'auto repair', 'car repair']);
  }
  if (source.includes('galaxytyreshop.com') || source.includes('tire.ae') || source.includes('instagram.com/p/du5o2edkwzm')) {
    return profile(['Tyres'], ['Tyre service', 'Tyre fitting', 'Wheel service'], ['Tyres'], ['repairs_items'], ['تاير', 'تواير', 'إطارات', 'tyre', 'tyres', 'tire']);
  }
  if (source.includes('popularautoparts.ae') || source.includes('bestautoparts.ae') || source.includes('easyautospareparts.com')) {
    return profile(['Auto Spare Parts'], ['Auto spare parts'], ['Car parts'], [], ['قطع غيار', 'سبير بارت', 'spare parts', 'auto parts']);
  }

  if (source.includes('globalscraptrading.org') || name.includes('scrap')) {
    return profile(['Scrap'], ['Buy scrap', 'Scrap pickup'], ['Scrap', 'Metal'], ['buys_from_customers', 'buys_used_items', 'home_pickup'], ['سكراب', 'خردة', 'scrap']);
  }
  if (source.includes('facebook.com/almaamoonwelding') || source.includes('springtimewelding.com') || source.includes('swamengineering.com')) {
    return profile(['Welding & Fabrication'], ['Welding', 'Metal fabrication'], ['Metal'], ['fabricates_items', 'repairs_items'], ['حداد', 'حدادة', 'لحام', 'welding', 'fabrication']);
  }
  if (source.includes('hidayath.com')) {
    return profile(['Metal Fabrication', 'Aluminium'], ['Aluminium and stainless fabrication'], ['Aluminium', 'Stainless steel'], ['fabricates_items'], ['المنيوم', 'ألمنيوم', 'aluminium', 'aluminum', 'stainless steel']);
  }

  if (source.includes('adsb.ae') || source.includes('mbkmarine.com')) {
    return profile(['Marine', 'Marine & Boats'], ['Boat building', 'Ship repair', 'Marine repair'], ['Boat', 'Ship'], ['repairs_items', 'fabricates_items'], ['قارب', 'قوارب', 'بوت', 'boat', 'marine', 'ship repair']);
  }
  if (source.includes('alseermarine.com')) {
    return profile(['Marine', 'Marine & Boats'], ['Boat building', 'Marine equipment'], ['Boat'], ['fabricates_items'], ['قارب', 'قوارب', 'بوت', 'boat', 'marine']);
  }
  if (source.includes('amshipyard.com')) {
    return profile(['Marine', 'Marine & Boats', 'Aluminium'], ['Boat building', 'Boat maintenance', 'Marine repair', 'Aluminium fabrication'], ['Boat', 'Fiberglass', 'Aluminium'], ['repairs_items', 'fabricates_items'], ['قارب', 'قوارب', 'بوت', 'boat', 'marine', 'fiberglass', 'المنيوم', 'ألمنيوم', 'aluminium', 'aluminum']);
  }
  if (source.includes('hayaarimarine.com')) {
    return profile(['Marine', 'Marine & Boats'], ['Boat building', 'Boat maintenance', 'Marine repair'], ['Boat', 'Fiberglass'], ['repairs_items', 'fabricates_items'], ['قارب', 'قوارب', 'بوت', 'boat', 'marine', 'fiberglass']);
  }
  if (source.includes('oceanwaves.ae')) {
    return profile(['Marine', 'Marine & Boats'], ['Boat building', 'Boat repair', 'Fiberglass repair'], ['Boat', 'Fiberglass'], ['repairs_items', 'fabricates_items'], ['قارب', 'قوارب', 'بوت', 'boat', 'marine', 'fiberglass']);
  }
  if (source.includes('gac.com/marine')) {
    return profile(['Marine', 'Marine & Boats'], ['Marine transport', 'Tugs and barges'], ['Boat', 'Vessel'], ['transports_items'], ['قارب', 'قوارب', 'boat', 'marine', 'tug', 'barge']);
  }

  if (source.includes('frontlinem.com')) {
    return profile(['Industrial Equipment'], ['Hydraulic equipment repair', 'Hydraulic winch repair', 'Engine repair'], ['Industrial equipment', 'Winch'], ['repairs_items'], ['معدات صناعية', 'ونش', 'winch', 'hydraulic winch', 'industrial equipment']);
  }
  if (source.includes('matrixspares.com') || source.includes('alrumooz.com')) {
    return profile(['Industrial Equipment'], ['Industrial equipment', 'Equipment parts'], ['Industrial equipment'], [], ['معدات صناعية', 'معدات', 'industrial equipment', 'heavy equipment']);
  }

  if (source.includes('emiratesrecoveryservice.com') || source.includes('abudhabimusaffahrecovery.com') || source.includes('kassabcarrecovery.com') || source.includes('royalautotowing.com')) {
    return profile(['Transport & Recovery'], ['Vehicle recovery', 'Towing', 'Roadside assistance'], ['Car', 'Vehicle'], ['towing', 'vehicle_recovery', 'home_pickup'], ['ونش', 'سطحة', 'سحب', 'قطر', 'ريكفري', 'recovery', 'towing']);
  }

  return profile([input.category || ''], [], [], [], [input.category || ''].filter(Boolean));
}

export function applyBusinessSearchProfile<T extends BusinessForMatching>(business: T): T {
  const metadata = getBusinessSearchProfile(business);
  return {
    ...business,
    searchCategories: [...new Set([...(business.searchCategories || []), ...metadata.searchCategories])],
    activities: [...new Set([...(business.activities || []), ...metadata.activities])],
    itemTypes: [...new Set([...(business.itemTypes || []), ...metadata.itemTypes])],
    capabilities: [...new Set([...(business.capabilities || []), ...metadata.capabilities])],
    keywords: [...new Set([...(business.keywords || []), ...metadata.keywords])],
  };
}
