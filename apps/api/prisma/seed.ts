import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Varied menu photos; stable per restaurant/category/item/name. */
const SEED_MENU_PHOTOS = [
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
  "https://images.unsplash.com/photo-1476224209411-9a64f84aa4bd?w=600&q=85",
  "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=85",
  "https://images.unsplash.com/photo-1563379091339-03c21e2c0e3b?w=600&q=85",
  "https://images.unsplash.com/photo-1603088521525-1b097b2bbfc1?w=600&q=85",
  "https://images.unsplash.com/photo-1598515214211-7577aa9e7484?w=600&q=85",
  "https://images.unsplash.com/photo-1612874477003-887f8eed50f8?w=600&q=85",
];

function seedMenuPhoto(restaurantId: string, catIdx: number, itemIdx: number, name: string): string {
  const key = `${restaurantId}-${catIdx}-${itemIdx}-${name}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return SEED_MENU_PHOTOS[Math.abs(h) % SEED_MENU_PHOTOS.length];
}

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean existing data ────────────────────────────────────────────────────
  await prisma.loyaltyPoint.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.riderEarning.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.operatingHours.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // ─── Admin ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@swiftbyte.com",
      passwordHash: hashedPassword,
      role: "admin",
      roles: ["admin", "customer"],
      isVerified: true,
    },
  });

  // ─── Customers (20) ─────────────────────────────────────────────────────────
  const customerData = [
    { name: "Alice Johnson", email: "alice@example.com", phone: "+1-555-0101" },
    { name: "Bob Martinez", email: "bob@example.com", phone: "+1-555-0102" },
    { name: "Carol White", email: "carol@example.com", phone: "+1-555-0103" },
    { name: "David Kim", email: "david@example.com", phone: "+1-555-0104" },
    { name: "Emma Davis", email: "emma@example.com", phone: "+1-555-0105" },
    { name: "Frank Wilson", email: "frank@example.com", phone: "+1-555-0106" },
    { name: "Grace Lee", email: "grace@example.com", phone: "+1-555-0107" },
    { name: "Henry Brown", email: "henry@example.com", phone: "+1-555-0108" },
    { name: "Isabella Taylor", email: "isabella@example.com", phone: "+1-555-0109" },
    { name: "James Anderson", email: "james@example.com", phone: "+1-555-0110" },
    { name: "Katherine Thomas", email: "kate@example.com", phone: "+1-555-0111" },
    { name: "Liam Jackson", email: "liam@example.com", phone: "+1-555-0112" },
    { name: "Mia Harris", email: "mia@example.com", phone: "+1-555-0113" },
    { name: "Noah Martin", email: "noah@example.com", phone: "+1-555-0114" },
    { name: "Olivia Thompson", email: "olivia@example.com", phone: "+1-555-0115" },
    { name: "Peter Garcia", email: "peter@example.com", phone: "+1-555-0116" },
    { name: "Quinn Martinez", email: "quinn@example.com", phone: "+1-555-0117" },
    { name: "Rachel Robinson", email: "rachel@example.com", phone: "+1-555-0118" },
    { name: "Samuel Clark", email: "samuel@example.com", phone: "+1-555-0119" },
    { name: "Tara Rodriguez", email: "tara@example.com", phone: "+1-555-0120" },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.user.create({
        data: { ...c, passwordHash: hashedPassword, role: "customer", roles: ["customer"], isVerified: true },
      })
    )
  );

  // ─── Customer Addresses ──────────────────────────────────────────────────────
  const addressData = [
    { lat: 40.7128, lng: -74.006, fullAddress: "123 Broadway, New York, NY 10007" },
    { lat: 40.7282, lng: -73.7949, fullAddress: "456 Queens Blvd, Queens, NY 11373" },
    { lat: 40.6501, lng: -73.9496, fullAddress: "789 Flatbush Ave, Brooklyn, NY 11203" },
  ];

  for (const customer of customers) {
    const addr = addressData[Math.floor(Math.random() * addressData.length)];
    await prisma.address.create({
      data: {
        userId: customer.id,
        label: "Home",
        lat: addr.lat + (Math.random() - 0.5) * 0.05,
        lng: addr.lng + (Math.random() - 0.5) * 0.05,
        fullAddress: addr.fullAddress,
        isDefault: true,
      },
    });
  }

  // ─── Restaurant Owners ───────────────────────────────────────────────────────
  const restaurantOwners = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          name: `Restaurant Owner ${i + 1}`,
          email: `owner${i + 1}@swiftbyte.com`,
          passwordHash: hashedPassword,
          role: "restaurant",
          roles: ["customer", "restaurant"],
          isVerified: true,
        },
      })
    )
  );

  // ─── Restaurants (10) ────────────────────────────────────────────────────────
  const restaurantData = [
    {
      name: "Burger Republic",
      description: "Gourmet burgers crafted from premium Angus beef with artisan buns and fresh toppings.",
      cuisineTypes: ["burgers", "american"],
      minOrder: 15,
      prepTime: 20,
      deliveryFee: 2.99,
      rating: 4.7,
      totalRatings: 342,
      address: "234 W 42nd St, New York, NY 10036",
      lat: 40.7557,
      lng: -73.9881,
      banner: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&q=85",
    },
    {
      name: "Pizza Palazzo",
      description: "Authentic Neapolitan pizza baked in a wood-fired oven with imported Italian ingredients.",
      cuisineTypes: ["pizza", "italian"],
      minOrder: 20,
      prepTime: 25,
      deliveryFee: 1.99,
      rating: 4.5,
      totalRatings: 289,
      address: "500 8th Ave, New York, NY 10018",
      lat: 40.7505,
      lng: -73.9934,
      banner: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&q=85",
    },
    {
      name: "Sushi Sakura",
      description: "Premium omakase-style sushi with daily fresh fish from the Tsukiji market selection.",
      cuisineTypes: ["sushi", "japanese"],
      minOrder: 30,
      prepTime: 35,
      deliveryFee: 3.99,
      rating: 4.9,
      totalRatings: 198,
      address: "145 E 49th St, New York, NY 10017",
      lat: 40.7563,
      lng: -73.9703,
      banner: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1600&q=85",
    },
    {
      name: "Spice Garden",
      description: "Authentic North Indian cuisine with traditional spices and clay oven-cooked breads.",
      cuisineTypes: ["indian", "halal"],
      minOrder: 25,
      prepTime: 30,
      deliveryFee: 2.49,
      rating: 4.6,
      totalRatings: 415,
      address: "321 Lexington Ave, New York, NY 10016",
      lat: 40.7487,
      lng: -73.9768,
      banner: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=85",
    },
    {
      name: "Dragon Palace",
      description: "Cantonese dim sum and Szechuan specialties made from family recipes spanning three generations.",
      cuisineTypes: ["chinese", "dim-sum"],
      minOrder: 18,
      prepTime: 25,
      deliveryFee: 1.99,
      rating: 4.3,
      totalRatings: 521,
      address: "88 Mott St, New York, NY 10013",
      lat: 40.7155,
      lng: -73.9976,
      banner: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1600&q=85",
    },
    {
      name: "Taco Fiesta",
      description: "Street-style Mexican tacos, burritos, and quesadillas with housemade salsas and guac.",
      cuisineTypes: ["mexican", "latin"],
      minOrder: 12,
      prepTime: 15,
      deliveryFee: 1.49,
      rating: 4.4,
      totalRatings: 678,
      address: "167 2nd Ave, New York, NY 10003",
      lat: 40.7284,
      lng: -73.9835,
      banner: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1600&q=85",
    },
    {
      name: "Green Bowl",
      description: "Healthy, plant-based bowls, smoothies, and wraps for the health-conscious foodie.",
      cuisineTypes: ["healthy", "vegan", "vegetarian"],
      minOrder: 15,
      prepTime: 20,
      deliveryFee: 2.99,
      rating: 4.5,
      totalRatings: 234,
      address: "455 Park Ave S, New York, NY 10016",
      lat: 40.7445,
      lng: -73.9843,
      banner: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85",
    },
    {
      name: "The Breakfast Club",
      description: "All-day breakfast served with locally sourced eggs, artisan toast, and fresh-pressed juices.",
      cuisineTypes: ["breakfast", "brunch", "american"],
      minOrder: 10,
      prepTime: 20,
      deliveryFee: 2.49,
      rating: 4.6,
      totalRatings: 387,
      address: "789 Amsterdam Ave, New York, NY 10025",
      lat: 40.7893,
      lng: -73.9709,
      banner: "https://images.unsplash.com/photo-1533085230417-61bad90a9abd?w=1600&q=85",
    },
    {
      name: "Thai Orchid",
      description: "Royal Thai cuisine featuring classic pad thai, curries, and aromatic soups with fragrant herbs.",
      cuisineTypes: ["thai", "asian"],
      minOrder: 20,
      prepTime: 28,
      deliveryFee: 2.99,
      rating: 4.7,
      totalRatings: 156,
      address: "342 W 46th St, New York, NY 10036",
      lat: 40.7601,
      lng: -73.9878,
      banner: "https://images.unsplash.com/photo-1584270354945-1cd512b73f1a?w=1600&q=85",
    },
    {
      name: "Sweet Temptations",
      description: "Artisan cakes, pastries, gelato, and dessert boxes crafted by award-winning pastry chefs.",
      cuisineTypes: ["desserts", "bakery"],
      minOrder: 15,
      prepTime: 15,
      deliveryFee: 3.49,
      rating: 4.8,
      totalRatings: 289,
      address: "205 W 57th St, New York, NY 10019",
      lat: 40.7658,
      lng: -73.9792,
      banner: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1600&q=85",
    },
  ];

  const restaurants: any[] = [];
  for (let i = 0; i < restaurantData.length; i++) {
    const r = await prisma.restaurant.create({
      data: {
        ...restaurantData[i],
        ownerId: restaurantOwners[i].id,
        isOpen: true,
        isApproved: true,
        commissionRate: 0.15,
      },
    });
    restaurants.push(r);

    // Operating hours
    for (let day = 0; day < 7; day++) {
      await prisma.operatingHours.create({
        data: {
          restaurantId: r.id,
          day,
          open: "09:00",
          close: day === 0 ? "22:00" : "23:00",
          isClosed: false,
        },
      });
    }
  }

  // ─── Menu Categories & Items ─────────────────────────────────────────────────

  const menuData: Record<
    string,
    { categories: { name: string; items: any[] }[] }
  > = {
    "Burger Republic": {
      categories: [
        {
          name: "Signature Burgers",
          items: [
            {
              name: "Classic Smash Burger",
              description: "Double smashed Angus patty, American cheese, pickles, onions, and secret sauce.",
              price: 14.99,
              dietaryTags: [],
              isFeatured: true,
            },
            {
              name: "BBQ Bacon Blaze",
              description: "Smoky BBQ sauce, crispy bacon, caramelized onions, jalapeños, and cheddar.",
              price: 16.99,
              dietaryTags: ["spicy"],
            },
            {
              name: "Truffle Mushroom Swiss",
              description: "Sautéed wild mushrooms, truffle aioli, Swiss cheese, and arugula.",
              price: 17.99,
              dietaryTags: [],
            },
            {
              name: "Veggie Champion",
              description: "House-made black bean patty, avocado, roasted tomato, and chipotle mayo.",
              price: 13.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
        {
          name: "Sides & Fries",
          items: [
            {
              name: "Truffle Parmesan Fries",
              description: "Crispy shoestring fries tossed in truffle oil and shaved parmesan.",
              price: 7.99,
              dietaryTags: ["vegetarian"],
            },
            {
              name: "Onion Rings Tower",
              description: "Beer-battered golden onion rings with ranch dipping sauce.",
              price: 6.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
        {
          name: "Shakes & Drinks",
          items: [
            {
              name: "Salted Caramel Shake",
              description: "Creamy vanilla ice cream blended with housemade salted caramel.",
              price: 8.99,
              dietaryTags: ["vegetarian"],
            },
            {
              name: "Craft Lemonade",
              description: "Fresh-squeezed lemonade with mint and a hint of ginger.",
              price: 4.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
          ],
        },
      ],
    },
    "Pizza Palazzo": {
      categories: [
        {
          name: "Classic Pizzas",
          items: [
            {
              name: "Margherita DOC",
              description: "San Marzano tomatoes, fresh buffalo mozzarella, basil, and extra virgin olive oil.",
              price: 18.99,
              dietaryTags: ["vegetarian"],
              isFeatured: true,
            },
            {
              name: "Diavola",
              description: "Spicy Calabrian salami, chili flakes, fior di latte, and tomato.",
              price: 21.99,
              dietaryTags: ["spicy"],
            },
            {
              name: "Four Seasons",
              description: "Ham, mushrooms, artichokes, olives, and mozzarella in four sections.",
              price: 22.99,
              dietaryTags: [],
            },
          ],
        },
        {
          name: "Pasta",
          items: [
            {
              name: "Cacio e Pepe",
              description: "Roman classic with Pecorino Romano, Parmigiano-Reggiano, and black pepper.",
              price: 17.99,
              dietaryTags: ["vegetarian"],
            },
            {
              name: "Penne all'Arrabbiata",
              description: "Spicy tomato sauce with garlic, chili, and fresh basil.",
              price: 15.99,
              dietaryTags: ["vegan", "spicy"],
            },
          ],
        },
        {
          name: "Desserts",
          items: [
            {
              name: "Tiramisu",
              description: "Classic Italian dessert with mascarpone, espresso-soaked ladyfingers, and cocoa.",
              price: 9.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
      ],
    },
    "Sushi Sakura": {
      categories: [
        {
          name: "Nigiri & Sashimi",
          items: [
            {
              name: "Salmon Nigiri (2pc)",
              description: "Atlantic salmon over hand-pressed sushi rice with wasabi.",
              price: 8.99,
              dietaryTags: ["gluten-free"],
              isFeatured: true,
            },
            {
              name: "Tuna Sashimi (5pc)",
              description: "Premium bluefin tuna, thinly sliced, served with pickled ginger and soy.",
              price: 16.99,
              dietaryTags: ["gluten-free"],
            },
          ],
        },
        {
          name: "Maki Rolls",
          items: [
            {
              name: "Dragon Roll",
              description: "Shrimp tempura, cucumber, avocado, topped with sliced avocado and eel sauce.",
              price: 16.99,
              dietaryTags: [],
              isFeatured: true,
            },
            {
              name: "Spicy Tuna Roll",
              description: "Chopped tuna with spicy mayo and cucumber, topped with sesame seeds.",
              price: 13.99,
              dietaryTags: ["spicy"],
            },
            {
              name: "Veggie Delight Roll",
              description: "Cucumber, avocado, mango, and pickled radish with ponzu.",
              price: 11.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
          ],
        },
        {
          name: "Hot Dishes",
          items: [
            {
              name: "Miso Soup",
              description: "Traditional dashi broth with tofu, wakame seaweed, and green onion.",
              price: 4.99,
              dietaryTags: ["vegan"],
            },
            {
              name: "Chicken Katsu Curry",
              description: "Crispy panko chicken cutlet over steamed rice with Japanese curry sauce.",
              price: 17.99,
              dietaryTags: [],
            },
          ],
        },
      ],
    },
    "Spice Garden": {
      categories: [
        {
          name: "Starters",
          items: [
            {
              name: "Samosa Platter (4pc)",
              description: "Crispy pastry filled with spiced potatoes and peas, with mint chutney.",
              price: 8.99,
              dietaryTags: ["vegan"],
            },
            {
              name: "Chicken Tikka",
              description: "Tandoor-marinated chicken pieces grilled to perfection with yogurt dip.",
              price: 13.99,
              dietaryTags: ["halal", "gluten-free"],
              isFeatured: true,
            },
          ],
        },
        {
          name: "Curries",
          items: [
            {
              name: "Butter Chicken",
              description: "Tender chicken in a rich, creamy tomato-based sauce with aromatic spices.",
              price: 19.99,
              dietaryTags: ["halal", "gluten-free"],
              isFeatured: true,
            },
            {
              name: "Palak Paneer",
              description: "Cottage cheese cubes in a smooth spinach gravy with garam masala.",
              price: 17.99,
              dietaryTags: ["vegetarian", "gluten-free"],
            },
            {
              name: "Lamb Rogan Josh",
              description: "Slow-cooked Kashmiri lamb with whole spices and yogurt in a deep red gravy.",
              price: 22.99,
              dietaryTags: ["halal"],
            },
          ],
        },
        {
          name: "Breads & Rice",
          items: [
            {
              name: "Garlic Naan (2pc)",
              description: "Fluffy clay oven bread brushed with garlic butter and fresh coriander.",
              price: 5.99,
              dietaryTags: ["vegetarian"],
            },
            {
              name: "Biryani",
              description: "Basmati rice layered with spiced lamb or chicken and saffron.",
              price: 21.99,
              dietaryTags: ["halal"],
            },
          ],
        },
      ],
    },
    "Dragon Palace": {
      categories: [
        {
          name: "Dim Sum",
          items: [
            {
              name: "Har Gow (4pc)",
              description: "Steamed shrimp dumplings in translucent wrapper — a dim sum classic.",
              price: 9.99,
              dietaryTags: [],
              isFeatured: true,
            },
            {
              name: "Siu Mai (4pc)",
              description: "Open-top pork and shrimp dumplings with flying fish roe topping.",
              price: 9.99,
              dietaryTags: [],
            },
            {
              name: "Char Siu Bao (3pc)",
              description: "Fluffy steamed buns filled with sweet BBQ pork.",
              price: 8.99,
              dietaryTags: [],
            },
          ],
        },
        {
          name: "Main Courses",
          items: [
            {
              name: "Kung Pao Chicken",
              description: "Wok-fried chicken with peanuts, dried chili, and Szechuan pepper in savory sauce.",
              price: 16.99,
              dietaryTags: ["spicy"],
            },
            {
              name: "Beef Chow Mein",
              description: "Wok-tossed egg noodles with marinated beef, bean sprouts, and oyster sauce.",
              price: 15.99,
              dietaryTags: [],
            },
            {
              name: "Mapo Tofu",
              description: "Silken tofu in a spicy, aromatic Szechuan sauce with minced pork.",
              price: 14.99,
              dietaryTags: ["spicy"],
            },
          ],
        },
      ],
    },
    "Taco Fiesta": {
      categories: [
        {
          name: "Tacos",
          items: [
            {
              name: "Carne Asada Tacos (3pc)",
              description: "Grilled marinated steak, onion, cilantro, salsa verde on corn tortillas.",
              price: 13.99,
              dietaryTags: ["gluten-free"],
              isFeatured: true,
            },
            {
              name: "Al Pastor Tacos (3pc)",
              description: "Spit-roasted pork with pineapple, onion, and cilantro on corn tortillas.",
              price: 12.99,
              dietaryTags: ["gluten-free"],
            },
            {
              name: "Veggie Black Bean Tacos (3pc)",
              description: "Spiced black beans, roasted corn, avocado, jalapeño slaw on corn tortillas.",
              price: 11.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
          ],
        },
        {
          name: "Burritos & Bowls",
          items: [
            {
              name: "Chicken Burrito Bowl",
              description: "Grilled chicken, cilantro-lime rice, black beans, pico, sour cream, and guac.",
              price: 14.99,
              dietaryTags: ["gluten-free"],
            },
            {
              name: "Loaded Burrito",
              description: "Giant flour tortilla packed with steak, rice, beans, cheese, and jalapeños.",
              price: 15.99,
              dietaryTags: [],
            },
          ],
        },
        {
          name: "Sides & Dips",
          items: [
            {
              name: "Fresh Guacamole & Chips",
              description: "Housemade chunky guacamole with freshly fried tortilla chips and salsa.",
              price: 7.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
          ],
        },
      ],
    },
    "Green Bowl": {
      categories: [
        {
          name: "Bowls",
          items: [
            {
              name: "Buddha Bowl",
              description: "Quinoa, roasted chickpeas, kale, avocado, cucumber, and tahini dressing.",
              price: 15.99,
              dietaryTags: ["vegan", "gluten-free"],
              isFeatured: true,
            },
            {
              name: "Teriyaki Tofu Bowl",
              description: "Pan-seared tofu, brown rice, edamame, pickled ginger, and teriyaki glaze.",
              price: 14.99,
              dietaryTags: ["vegan"],
            },
            {
              name: "Salmon Power Bowl",
              description: "Grilled salmon, farro, roasted beets, arugula, and lemon-herb vinaigrette.",
              price: 18.99,
              dietaryTags: ["gluten-free"],
            },
          ],
        },
        {
          name: "Smoothies & Juices",
          items: [
            {
              name: "Green Goddess Smoothie",
              description: "Spinach, banana, mango, coconut water, and chia seeds.",
              price: 9.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
            {
              name: "Berry Blast Acai Bowl",
              description: "Blended acai, granola, fresh berries, banana, and honey drizzle.",
              price: 13.99,
              dietaryTags: ["vegan"],
              isFeatured: true,
            },
          ],
        },
      ],
    },
    "The Breakfast Club": {
      categories: [
        {
          name: "Egg Dishes",
          items: [
            {
              name: "Eggs Benedict",
              description: "Poached eggs on toasted English muffin with Canadian bacon and hollandaise.",
              price: 16.99,
              dietaryTags: [],
              isFeatured: true,
            },
            {
              name: "Veggie Frittata",
              description: "Oven-baked frittata with seasonal vegetables, goat cheese, and fresh herbs.",
              price: 14.99,
              dietaryTags: ["vegetarian", "gluten-free"],
            },
            {
              name: "Smashed Avocado Toast",
              description: "Sourdough, smashed avocado, cherry tomatoes, feta, microgreens, and chili flakes.",
              price: 13.99,
              dietaryTags: ["vegetarian"],
              isFeatured: true,
            },
          ],
        },
        {
          name: "Pancakes & Waffles",
          items: [
            {
              name: "Buttermilk Pancake Stack",
              description: "Fluffy stack of three buttermilk pancakes with maple syrup and berry compote.",
              price: 12.99,
              dietaryTags: ["vegetarian"],
            },
            {
              name: "Belgian Waffle",
              description: "Crispy Belgian waffle with fresh whipped cream, strawberries, and Nutella.",
              price: 13.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
        {
          name: "Drinks",
          items: [
            {
              name: "Cold Brew Coffee",
              description: "Slow-steeped 24-hour cold brew served over ice with oat milk.",
              price: 5.99,
              dietaryTags: ["vegan"],
            },
            {
              name: "Fresh Orange Juice",
              description: "Freshly squeezed orange juice from Florida navel oranges.",
              price: 6.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
          ],
        },
      ],
    },
    "Thai Orchid": {
      categories: [
        {
          name: "Starters",
          items: [
            {
              name: "Spring Rolls (4pc)",
              description: "Crispy vegetable spring rolls with sweet chili dipping sauce.",
              price: 8.99,
              dietaryTags: ["vegan"],
            },
            {
              name: "Tom Yum Soup",
              description: "Classic Thai lemongrass soup with mushrooms, lime, galangal, and chili.",
              price: 11.99,
              dietaryTags: ["gluten-free", "spicy"],
              isFeatured: true,
            },
          ],
        },
        {
          name: "Noodles & Rice",
          items: [
            {
              name: "Pad Thai",
              description: "Wok-fried rice noodles with shrimp, peanuts, bean sprouts, and tamarind sauce.",
              price: 17.99,
              dietaryTags: ["gluten-free"],
              isFeatured: true,
            },
            {
              name: "Drunken Noodles",
              description: "Wide rice noodles with basil, bell peppers, and your choice of protein.",
              price: 16.99,
              dietaryTags: ["spicy"],
            },
            {
              name: "Mango Sticky Rice",
              description: "Sweet glutinous rice with fresh mango and coconut cream.",
              price: 8.99,
              dietaryTags: ["vegan", "gluten-free"],
            },
          ],
        },
        {
          name: "Curries",
          items: [
            {
              name: "Green Curry",
              description: "Coconut milk curry with vegetables, Thai basil, and jasmine rice.",
              price: 18.99,
              dietaryTags: ["gluten-free", "spicy"],
              isFeatured: true,
            },
            {
              name: "Massaman Curry",
              description: "Mild, rich curry with potatoes, peanuts, and tender beef.",
              price: 19.99,
              dietaryTags: ["gluten-free"],
            },
          ],
        },
      ],
    },
    "Sweet Temptations": {
      categories: [
        {
          name: "Cakes & Pastries",
          items: [
            {
              name: "Dark Chocolate Lava Cake",
              description: "Warm chocolate cake with molten center, vanilla bean ice cream, and raspberry coulis.",
              price: 11.99,
              dietaryTags: ["vegetarian"],
              isFeatured: true,
            },
            {
              name: "New York Cheesecake Slice",
              description: "Classic dense New York cheesecake with graham cracker crust and berry sauce.",
              price: 9.99,
              dietaryTags: ["vegetarian"],
            },
            {
              name: "Croissant Box (4pc)",
              description: "Buttery all-butter croissants baked fresh daily, served with jam and butter.",
              price: 12.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
        {
          name: "Gelato & Ice Cream",
          items: [
            {
              name: "Gelato Trio Cup",
              description: "Three scoops of artisan gelato: choose from 12 rotating flavors.",
              price: 9.99,
              dietaryTags: ["vegetarian", "gluten-free"],
              isFeatured: true,
            },
            {
              name: "Sundae Spectacular",
              description: "Vanilla bean ice cream, hot fudge, caramel sauce, whipped cream, and cherry.",
              price: 10.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
        {
          name: "Drinks",
          items: [
            {
              name: "Matcha Latte",
              description: "Ceremonial grade matcha whisked with steamed oat milk and a touch of honey.",
              price: 6.99,
              dietaryTags: ["vegan"],
            },
            {
              name: "Specialty Hot Chocolate",
              description: "Rich Valrhona hot chocolate with whipped cream and shaved chocolate.",
              price: 7.99,
              dietaryTags: ["vegetarian"],
            },
          ],
        },
      ],
    },
  };

  for (const restaurant of restaurants) {
    const data = menuData[restaurant.name];
    if (!data) continue;

    for (let catIdx = 0; catIdx < data.categories.length; catIdx++) {
      const catData = data.categories[catIdx];
      const category = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: catData.name,
          sortOrder: catIdx,
        },
      });

      for (let itemIdx = 0; itemIdx < catData.items.length; itemIdx++) {
        const item = catData.items[itemIdx];
        const menuItem = await prisma.menuItem.create({
          data: {
            restaurantId: restaurant.id,
            categoryId: category.id,
            name: item.name,
            description: item.description,
            price: item.price,
            photo: seedMenuPhoto(restaurant.id, catIdx, itemIdx, item.name),
            isAvailable: true,
            dietaryTags: item.dietaryTags || [],
            isFeatured: item.isFeatured || false,
            sortOrder: itemIdx,
          },
        });

        // Add modifier groups for main items
        if (catIdx === 0 && itemIdx === 0) {
          const sizeGroup = await prisma.modifierGroup.create({
            data: {
              menuItemId: menuItem.id,
              name: "Size",
              minSelect: 0,
              maxSelect: 1,
            },
          });
          await prisma.modifierOption.createMany({
            data: [
              { groupId: sizeGroup.id, name: "Regular", extraCost: 0 },
              { groupId: sizeGroup.id, name: "Large", extraCost: 2.5 },
            ],
          });

          const extrasGroup = await prisma.modifierGroup.create({
            data: {
              menuItemId: menuItem.id,
              name: "Extra Toppings",
              minSelect: 0,
              maxSelect: 3,
            },
          });
          await prisma.modifierOption.createMany({
            data: [
              { groupId: extrasGroup.id, name: "Extra Cheese", extraCost: 1.5 },
              { groupId: extrasGroup.id, name: "Bacon", extraCost: 2.0 },
              { groupId: extrasGroup.id, name: "Avocado", extraCost: 1.75 },
            ],
          });
        }
      }
    }
  }

  // ─── Riders (5) ─────────────────────────────────────────────────────────────
  const riderData = [
    { name: "Marcus Johnson", email: "marcus@rider.com", vehicleType: "motorcycle" },
    { name: "Sofia Chen", email: "sofia@rider.com", vehicleType: "bicycle" },
    { name: "Ravi Patel", email: "ravi@rider.com", vehicleType: "scooter" },
    { name: "Amara Williams", email: "amara@rider.com", vehicleType: "motorcycle" },
    { name: "Lucas Fernandez", email: "lucas@rider.com", vehicleType: "car" },
  ];

  const riders = await Promise.all(
    riderData.map(async (r) => {
      const user = await prisma.user.create({
        data: {
          name: r.name,
          email: r.email,
          passwordHash: hashedPassword,
          role: "rider",
          roles: ["customer", "rider"],
          isVerified: true,
        },
      });
      const rider = await prisma.rider.create({
        data: {
          userId: user.id,
          vehicleType: r.vehicleType,
          isOnline: true,
          isApproved: true,
          rating: 4.5 + Math.random() * 0.5,
          totalRatings: Math.floor(Math.random() * 200) + 50,
        },
      });
      return { user, rider };
    })
  );

  // ─── Vouchers ────────────────────────────────────────────────────────────────
  await prisma.voucher.createMany({
    data: [
      {
        code: "WELCOME20",
        type: "percentage",
        value: 20,
        minOrder: 15,
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2026-12-31"),
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: "FLAT5OFF",
        type: "flat",
        value: 5,
        minOrder: 25,
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2026-12-31"),
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "FREESHIP",
        type: "flat",
        value: 0,
        minOrder: 20,
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2026-12-31"),
        usageLimit: 200,
        isActive: true,
      },
    ],
  });

  // ─── Sample Orders ───────────────────────────────────────────────────────────
  const burger = restaurants[0];
  const pizza = restaurants[1];

  const customerAddresses = await prisma.address.findMany({
    where: { userId: { in: customers.slice(0, 5).map((c) => c.id) } },
  });

  const burgerItems = await prisma.menuItem.findMany({
    where: { restaurantId: burger.id },
    take: 3,
  });

  if (burgerItems.length > 0 && customerAddresses.length > 0) {
    for (let i = 0; i < 5; i++) {
      const customer = customers[i];
      const address = customerAddresses.find((a) => a.userId === customer.id);
      if (!address) continue;

      const item = burgerItems[0];
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          restaurantId: burger.id,
          riderId: riders[i % riders.length].user.id,
          addressId: address.id,
          status: "delivered",
          subtotal: item.price,
          deliveryFee: 2.99,
          discount: 0,
          total: item.price + 2.99,
          paymentMethod: "card",
          isPaid: true,
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          customisations: [],
        },
      });

      // Rider earning
      await prisma.riderEarning.create({
        data: {
          riderId: riders[i % riders.length].user.id,
          orderId: order.id,
          baseAmount: 3.5,
          bonusAmount: 0,
          settledAt: new Date(),
        },
      });

      // Loyalty points
      await prisma.loyaltyPoint.create({
        data: {
          userId: customer.id,
          orderId: order.id,
          points: Math.floor(item.price + 2.99),
          type: "earned",
        },
      });
    }
  }

  // ─── Promotions ──────────────────────────────────────────────────────────────
  for (const restaurant of restaurants.slice(0, 5)) {
    await prisma.promotion.create({
      data: {
        restaurantId: restaurant.id,
        title: "Weekend Special",
        description: "Get 15% off all orders on weekends",
        type: "percentage",
        value: 15,
        minOrder: 20,
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2026-12-31"),
        isActive: true,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   - 1 admin`);
  console.log(`   - 20 customers`);
  console.log(`   - 10 restaurants with full menus`);
  console.log(`   - 5 riders`);
  console.log(`   - 3 voucher codes: WELCOME20, FLAT5OFF, FREESHIP`);
  console.log(`   - 5 sample completed orders`);
  console.log(`   - 5 restaurant promotions`);
  console.log("\n🔐 Login credentials (all use password: Password123!)");
  console.log("   Admin: admin@swiftbyte.com");
  console.log("   Customer: alice@example.com");
  console.log("   Restaurant: owner1@swiftbyte.com");
  console.log("   Rider: marcus@rider.com");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
