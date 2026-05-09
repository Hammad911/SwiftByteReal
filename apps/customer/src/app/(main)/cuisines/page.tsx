import Link from "next/link";
import Image from "next/image";
import { RESTAURANTS_LIST } from "@/lib/restaurantData";

const CUISINE_IMAGES: Record<string, string> = {
  "Local Dishes": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
  Japanese: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600&q=80",
  BBQ: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
  Italian: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  Korean: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80",
  Pakistani: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
  Mexican: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80",
  Chinese: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80",
  Healthy: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  Desserts: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
};

// Derive unique cuisines from real data
const cuisines = [...new Set(RESTAURANTS_LIST.map((r) => r.cuisine))].map((name) => ({
  name,
  count: RESTAURANTS_LIST.filter((r) => r.cuisine === name).length,
  image: CUISINE_IMAGES[name] ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
}));

export const metadata = { title: "Cuisines" };

export default function CuisinesPage() {
  return (
    <div className="min-h-screen bg-night pt-28 pb-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <span className="eyebrow">— Browse by Cuisine</span>
        <h1 className="h-display text-6xl sm:text-7xl mt-3 mb-12">
          What are you <span className="text-gold">craving?</span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cuisines.map((c) => (
            <Link
              key={c.name}
              href={`/restaurants?cuisine=${encodeURIComponent(c.name)}`}
              className="group relative rounded-2xl overflow-hidden border border-gold/15 hover:border-gold/50 hover:-translate-y-1 hover:shadow-amber-glow transition-all duration-300 aspect-[3/4]"
            >
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-playfair italic text-cream text-lg leading-tight">{c.name}</p>
                <p className="font-mono text-[9px] tracking-widest uppercase text-gold mt-0.5">
                  {c.count} {c.count === 1 ? "restaurant" : "restaurants"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
