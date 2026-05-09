export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  photo: string;
  tags?: string[];
  popular?: boolean;
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  rating: number;
  totalRatings: number;
  prepTime: string;
  deliveryFee: number;
  minOrder: number;
  distance: string;
  address: string;
  banner: string;
  hours: string;
  menu: MenuSection[];
}

export const RESTAURANTS_LIST: Restaurant[] = [
  {
    id: "1",
    name: "Mama Put Kitchen",
    cuisine: "Local Dishes",
    description: "Soulful home-style West African cooking. Slow-stewed jollof, smoky suya, and grandma's secret pepper sauce — served in clay pots straight from the kitchen.",
    rating: 4.7,
    totalRatings: 1248,
    prepTime: "25–35 min",
    deliveryFee: 2.99,
    minOrder: 12,
    distance: "1.4 km",
    address: "F-7 Markaz · Islamabad",
    banner: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1600&q=85",
    hours: "11:00 AM – 11:30 PM",
    menu: [
      {
        id: "signatures",
        name: "Chef's Signatures",
        items: [
          { id: "s1", name: "Smoky Jollof Rice", description: "Slow-cooked basmati in our heirloom tomato base, scented with bay leaves and finished over open flame. Served with grilled chicken thigh.", price: 14.5, photo: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=85", tags: ["Signature", "Spicy"], popular: true },
          { id: "s2", name: "Suya Beef Skewers", description: "Hand-cut beef tenderloin marinated 24 hours in yaji spice, charred over coals. Served with raw onion and tomato.", price: 12.0, photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=85", tags: ["Spicy"], popular: true },
          { id: "s3", name: "Egusi & Pounded Yam", description: "Melon-seed stew with assorted goat meat, simmered low and slow. Served with hand-pounded yam.", price: 16.0, photo: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=600&q=85" },
        ],
      },
      {
        id: "small-plates",
        name: "Small Plates",
        items: [
          { id: "p1", name: "Crispy Plantains", description: "Sweet ripe plantains, double-fried golden. Drizzled with lime and chili honey.", price: 6.5, photo: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=85", tags: ["Vegan"] },
          { id: "p2", name: "Akara Fritters", description: "Fluffy black-eyed pea fritters with smoked pepper aioli.", price: 7.0, photo: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&q=85", tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "The Ramen Bar",
    cuisine: "Japanese",
    description: "Tonkotsu broth simmered 18 hours, hand-pulled noodles every morning, chashu cured in-house. Just ramen — done properly.",
    rating: 4.9,
    totalRatings: 2104,
    prepTime: "20–30 min",
    deliveryFee: 3.5,
    minOrder: 15,
    distance: "0.8 km",
    address: "F-6 Super Market · Islamabad",
    banner: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=1600&q=85",
    hours: "5:00 PM – 12:00 AM",
    menu: [
      {
        id: "ramen",
        name: "Ramen",
        items: [
          { id: "r1", name: "Tonkotsu Ramen", description: "18-hour pork bone broth, chashu pork belly, ajitsuke tamago, scallion, black garlic oil.", price: 16.5, photo: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "r2", name: "Spicy Miso Ramen", description: "Aged red miso, pork mince, bamboo shoots, corn, layered with our chili oil.", price: 17.0, photo: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600&q=85", tags: ["Spicy"], popular: true },
          { id: "r3", name: "Shoyu Chicken Ramen", description: "Clean chicken broth, soy tare, char-grilled chicken thigh, nori, marinated egg.", price: 15.0, photo: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&q=85" },
        ],
      },
      {
        id: "starters",
        name: "Starters",
        items: [
          { id: "st1", name: "Pork Gyoza (6 pc)", description: "Hand-folded pork dumplings, pan-seared, with black vinegar dipping sauce.", price: 8.5, photo: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=85" },
          { id: "st2", name: "Edamame, Smoked Salt", description: "Boiled soybeans tossed with house smoked sea salt.", price: 5.0, photo: "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=600&q=85", tags: ["Vegan"] },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Smoky Grill House",
    cuisine: "BBQ",
    description: "Low and slow. Texas-style brisket smoked over post oak, ribs that fall off the bone, and the only burnt ends in the city worth waiting for.",
    rating: 4.6,
    totalRatings: 891,
    prepTime: "15–25 min",
    deliveryFee: 2.5,
    minOrder: 18,
    distance: "2.1 km",
    address: "Blue Area · Islamabad",
    banner: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=85",
    hours: "12:00 PM – 11:00 PM",
    menu: [
      {
        id: "smoked",
        name: "From the Smoker",
        items: [
          { id: "g1", name: "Smoked Brisket Plate", description: "½ lb hand-sliced brisket, pickles, white bread, Carolina mustard sauce.", price: 22.0, photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "g2", name: "Pork Ribs (Half Rack)", description: "St. Louis-cut, dry-rubbed, smoked 6 hours. Glazed with bourbon BBQ.", price: 20.0, photo: "https://images.unsplash.com/photo-1565299543923-37dd37887442?w=600&q=85" },
          { id: "g3", name: "Burnt Ends", description: "Crispy candied brisket points tossed in molasses sauce. Limited daily.", price: 16.0, photo: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=85", popular: true },
        ],
      },
      {
        id: "sides",
        name: "Sides",
        items: [
          { id: "sd1", name: "Mac & Cheese", description: "Three-cheese baked mac with smoked breadcrumb crust.", price: 7.0, photo: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&q=85", tags: ["Vegetarian"] },
          { id: "sd2", name: "Charred Corn", description: "Grilled corn, lime crema, cotija, smoked paprika.", price: 6.0, photo: "https://images.unsplash.com/photo-1551845728-6820a30c64e1?w=600&q=85", tags: ["Vegetarian"] },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Pizzeria Napoli",
    cuisine: "Italian",
    description: "True Neapolitan pizza. 00 flour from Caputo, San Marzano tomatoes, buffalo mozzarella from Campania. 90 seconds in a wood-fired oven.",
    rating: 4.8,
    totalRatings: 1567,
    prepTime: "18–28 min",
    deliveryFee: 2.99,
    minOrder: 14,
    distance: "1.1 km",
    address: "E-11 Markaz · Islamabad",
    banner: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=85",
    hours: "12:00 PM – 11:30 PM",
    menu: [
      {
        id: "pizzas",
        name: "Pizzas",
        items: [
          { id: "pz1", name: "Margherita D.O.P.", description: "San Marzano tomato, fior di latte, basil, EVOO. The original.", price: 13.5, photo: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=85", tags: ["Vegetarian", "Signature"], popular: true },
          { id: "pz2", name: "Diavola", description: "Spicy soppressata, fior di latte, chili oil, oregano.", price: 16.0, photo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85", tags: ["Spicy"], popular: true },
          { id: "pz3", name: "Quattro Formaggi", description: "Mozzarella, gorgonzola, taleggio, pecorino, honey drizzle.", price: 17.0, photo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85", tags: ["Vegetarian"] },
        ],
      },
      {
        id: "antipasti",
        name: "Antipasti",
        items: [
          { id: "a1", name: "Burrata, Tomato", description: "Hand-stretched burrata, heirloom tomato, basil, sea salt, EVOO.", price: 12.5, photo: "https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600&q=85", tags: ["Vegetarian"] },
          { id: "a2", name: "Prosciutto & Melon", description: "24-month aged prosciutto di Parma, cantaloupe, lemon.", price: 11.0, photo: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=85" },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Seoul Garden",
    cuisine: "Korean",
    description: "Authentic Korean BBQ and street food. Prime marbled beef, kimchi fermented in-house, and gochujang sauces that take three weeks to make.",
    rating: 4.8,
    totalRatings: 1034,
    prepTime: "20–30 min",
    deliveryFee: 3.0,
    minOrder: 16,
    distance: "1.7 km",
    address: "G-9 Markaz · Islamabad",
    banner: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1600&q=85",
    hours: "12:00 PM – 11:00 PM",
    menu: [
      {
        id: "bbq",
        name: "Korean BBQ",
        items: [
          { id: "k1", name: "Wagyu Bulgogi", description: "Thinly sliced wagyu marinated in Asian pear, soy, sesame. Served with steamed rice and banchan.", price: 22.0, photo: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "k2", name: "Samgyeopsal (Pork Belly)", description: "Thick-cut pork belly, sesame oil dipping sauce, ssam leaves, garlic.", price: 18.0, photo: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&q=85", popular: true },
          { id: "k3", name: "Spicy Tteokbokki", description: "Chewy rice cakes in our three-week gochujang sauce, fish cake, scallion.", price: 11.0, photo: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=600&q=85", tags: ["Spicy", "Vegetarian"] },
        ],
      },
      {
        id: "sides-k",
        name: "Sides & Soups",
        items: [
          { id: "k4", name: "Kimchi Jjigae", description: "Deeply fermented kimchi stew with silken tofu, pork, and glass noodles.", price: 12.0, photo: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600&q=85", tags: ["Spicy"] },
          { id: "k5", name: "Steamed Gyoza (8 pc)", description: "Pork & cabbage dumplings, steamed, with soy-vinegar dip.", price: 9.0, photo: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=85" },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "The Biryani House",
    cuisine: "Pakistani",
    description: "Dum biryani cooked the old way. Long-grain basmati sealed under dough, layers of saffron milk, caramelised onions, and whole spices. No shortcuts.",
    rating: 4.9,
    totalRatings: 3201,
    prepTime: "25–40 min",
    deliveryFee: 1.99,
    minOrder: 10,
    distance: "0.6 km",
    address: "F-10 Markaz · Islamabad",
    banner: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1600&q=85",
    hours: "11:30 AM – 11:00 PM",
    menu: [
      {
        id: "biryani",
        name: "Biryani",
        items: [
          { id: "b1", name: "Dum Chicken Biryani", description: "Free-range chicken, aged basmati, saffron, crispy onions, raita. The gold standard.", price: 15.0, photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "b2", name: "Beef Nihari Biryani", description: "Slow-braised beef nihari folded into biryani rice. Weekend special.", price: 17.0, photo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=85", popular: true },
          { id: "b3", name: "Vegetable Biryani", description: "Seasonal vegetables, cashews, dried fruit, whole spices, basmati.", price: 12.0, photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=85", tags: ["Vegetarian"] },
        ],
      },
      {
        id: "extras-b",
        name: "Sides",
        items: [
          { id: "b4", name: "Seekh Kebab (4 pc)", description: "Hand-minced beef, coriander, green chili, coal-grilled. Served with mint chutney.", price: 8.0, photo: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=85" },
          { id: "b5", name: "Shami Burger", description: "Crispy shami patty, egg, tamarind chutney, sesame bun.", price: 7.5, photo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85" },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "Casa Tacos",
    cuisine: "Mexican",
    description: "Street tacos done properly. Handmade tortillas pressed to order, three salsas ground fresh daily, and birria consommé you can dip everything in.",
    rating: 4.6,
    totalRatings: 748,
    prepTime: "15–20 min",
    deliveryFee: 2.49,
    minOrder: 12,
    distance: "2.8 km",
    address: "Jinnah Super · Islamabad",
    banner: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1600&q=85",
    hours: "11:00 AM – 10:00 PM",
    menu: [
      {
        id: "tacos",
        name: "Tacos",
        items: [
          { id: "t1", name: "Birria Quesatacos (3 pc)", description: "Slow-braised beef birria, Oaxacan cheese, dipped in consommé, fried crispy.", price: 14.0, photo: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "t2", name: "Al Pastor (3 pc)", description: "Spit-roasted pork, pineapple, white onion, cilantro, salsa verde.", price: 12.0, photo: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=85", popular: true },
          { id: "t3", name: "Roasted Poblano (3 pc)", description: "Charred poblano, black beans, cotija, crema. Fully plant-based.", price: 11.0, photo: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=85", tags: ["Vegetarian"] },
        ],
      },
      {
        id: "sides-t",
        name: "Sides",
        items: [
          { id: "t4", name: "Elotes (Corn Cup)", description: "Grilled corn, mayo, cotija, chili, lime. Mexico City classic.", price: 5.5, photo: "https://images.unsplash.com/photo-1551845728-6820a30c64e1?w=600&q=85", tags: ["Vegetarian"] },
          { id: "t5", name: "Birria Consommé", description: "The full braising liquid. Sip it, dip it, live in it.", price: 4.0, photo: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=85" },
        ],
      },
    ],
  },
  {
    id: "8",
    name: "Wok & Roll",
    cuisine: "Chinese",
    description: "Hong Kong–style wok cooking at ferocious heat. Breath of the wok, silky noodles, and clay pot rice that takes 40 minutes and is worth every second.",
    rating: 4.5,
    totalRatings: 612,
    prepTime: "20–30 min",
    deliveryFee: 2.99,
    minOrder: 14,
    distance: "1.9 km",
    address: "F-8 Markaz · Islamabad",
    banner: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1600&q=85",
    hours: "12:00 PM – 11:00 PM",
    menu: [
      {
        id: "mains-w",
        name: "Wok Mains",
        items: [
          { id: "w1", name: "Beef Chow Fun", description: "Silky flat rice noodles, wok-seared beef, bean sprouts, dark soy. Must order.", price: 15.0, photo: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "w2", name: "Kung Pao Chicken", description: "Twice-fried chicken, Sichuan peppercorns, peanuts, dried chilies, hoisin.", price: 14.5, photo: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&q=85", tags: ["Spicy"], popular: true },
          { id: "w3", name: "Clay Pot Rice", description: "Lap cheong, chicken, ginger, oyster sauce. Caramelised rice crust at the bottom.", price: 16.0, photo: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=85" },
        ],
      },
      {
        id: "dim-sum",
        name: "Dim Sum",
        items: [
          { id: "w4", name: "Har Gow (4 pc)", description: "Translucent prawn dumplings, bamboo shoots, hand-pleated 8 folds.", price: 9.0, photo: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=85" },
          { id: "w5", name: "Char Siu Bao (3 pc)", description: "Fluffy baked BBQ pork buns, honey glaze, spring onion.", price: 8.0, photo: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=85" },
        ],
      },
    ],
  },
  {
    id: "9",
    name: "Green Bowl Co.",
    cuisine: "Healthy",
    description: "Clean food that tastes like something. Macro-balanced bowls, cold-pressed everything, and smoothies built around function — without tasting like it.",
    rating: 4.7,
    totalRatings: 920,
    prepTime: "10–18 min",
    deliveryFee: 1.99,
    minOrder: 10,
    distance: "0.9 km",
    address: "Centaurus · Islamabad",
    banner: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85",
    hours: "8:00 AM – 9:00 PM",
    menu: [
      {
        id: "bowls",
        name: "Power Bowls",
        items: [
          { id: "h1", name: "The Green Machine", description: "Kale, quinoa, avocado, edamame, pickled cucumber, tahini miso dressing.", price: 13.5, photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=85", tags: ["Vegan", "Signature"], popular: true },
          { id: "h2", name: "Teriyaki Salmon Bowl", description: "Wild salmon fillet, brown rice, pickled ginger, sesame, steamed broccoli.", price: 16.0, photo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85", popular: true },
          { id: "h3", name: "Açaí Power Bowl", description: "Frozen açaí, banana, granola, chia, almond butter drizzle.", price: 11.0, photo: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=85", tags: ["Vegan"] },
        ],
      },
      {
        id: "drinks-h",
        name: "Cold-Pressed Drinks",
        items: [
          { id: "h4", name: "Green Detox Juice", description: "Spinach, cucumber, green apple, lemon, ginger. Cold-pressed fresh.", price: 6.0, photo: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=85", tags: ["Vegan"] },
          { id: "h5", name: "Golden Milk Latte", description: "Turmeric, ashwagandha, oat milk, black pepper, honey.", price: 5.5, photo: "https://images.unsplash.com/photo-1543353071-087092ec393a?w=600&q=85", tags: ["Vegan"] },
        ],
      },
    ],
  },
  {
    id: "10",
    name: "Dessert Lab",
    cuisine: "Desserts",
    description: "Pastry as precision. Croissants laminated 27 layers. Soufflés timed to the second. Chocolate from single-origin beans roasted on-site.",
    rating: 4.9,
    totalRatings: 1876,
    prepTime: "15–25 min",
    deliveryFee: 2.49,
    minOrder: 8,
    distance: "1.3 km",
    address: "F-7 Super Market · Islamabad",
    banner: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&q=85",
    hours: "9:00 AM – 11:00 PM",
    menu: [
      {
        id: "pastry",
        name: "Pastry & Cakes",
        items: [
          { id: "ds1", name: "Kouign Amann", description: "Caramelised Breton butter cake. Flaky, salty, sweet. Arrives warm.", price: 8.0, photo: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=85", tags: ["Signature"], popular: true },
          { id: "ds2", name: "Valrhona Chocolate Tart", description: "Pâte sucrée, ganache from 70% Guanaja, fleur de sel, gold leaf.", price: 10.0, photo: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=85", popular: true },
          { id: "ds3", name: "Matcha Basque Cheesecake", description: "Burnt cheesecake base, ceremonial matcha swirl, no biscuit base.", price: 9.5, photo: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=85", tags: ["Vegetarian"] },
        ],
      },
      {
        id: "drinks-d",
        name: "Specialty Coffee",
        items: [
          { id: "ds4", name: "Single Origin Pour Over", description: "Ethiopian Yirgacheffe, light roast, 92°C, 3-minute brew. Taste the terroir.", price: 6.0, photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=85" },
          { id: "ds5", name: "Iced Brown Sugar Latte", description: "Double espresso, brown sugar syrup, oat milk, hand-shaped ice cube.", price: 6.5, photo: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=85" },
        ],
      },
    ],
  },
];

// Lookup map for O(1) access by id
export const RESTAURANTS_DB: Record<string, Restaurant> = Object.fromEntries(
  RESTAURANTS_LIST.map((r) => [r.id, r])
);

export function getRestaurant(id: string): Restaurant | null {
  return RESTAURANTS_DB[id] ?? null;
}
