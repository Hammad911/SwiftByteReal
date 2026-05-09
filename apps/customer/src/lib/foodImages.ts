/** Diverse Unsplash food photos when API omits banner/photo (stable per id). */

const BANNERS = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&q=85",
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&q=85",
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1600&q=85",
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=85",
  "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1600&q=85",
  "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1600&q=85",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85",
  "https://images.unsplash.com/photo-1533085230417-61bad90a9abd?w=1600&q=85",
  "https://images.unsplash.com/photo-1584270354945-1cd512b73f1a?w=1600&q=85",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&q=85",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1600&q=85",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=85",
];

const MENU_ITEMS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=85",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=85",
  "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=85",
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=85",
  "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&q=85",
  "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=85",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=85",
  "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=85",
  "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&q=85",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=85",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85",
  "https://images.unsplash.com/photo-1476224209411-9a64f84aa4bd?w=600&q=85",
  "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=85",
  "https://images.unsplash.com/photo-1563379091339-03c21e2c0e3b?w=600&q=85",
  "https://images.unsplash.com/photo-1603088521525-1b097b2bbfc1?w=600&q=85",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=85",
  "https://images.unsplash.com/photo-1598515214211-7577aa9e7484?w=600&q=85",
  "https://images.unsplash.com/photo-1612874477003-887f8eed50f8?w=600&q=85",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=85",
  "https://images.unsplash.com/photo-1559058684-47b3a5e3df8e?w=600&q=85",
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=85",
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=85",
];

function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function fallbackBannerUrl(restaurantId: string): string {
  return BANNERS[hashKey(`banner-${restaurantId}`) % BANNERS.length];
}

export function fallbackMenuItemPhotoUrl(menuItemId: string): string {
  return MENU_ITEMS[hashKey(`item-${menuItemId}`) % MENU_ITEMS.length];
}
