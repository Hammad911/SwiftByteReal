"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Truck, BadgeCheck } from "lucide-react";

interface RestaurantCardProps {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  cuisineTypes: string[];
  rating: number;
  totalRatings: number;
  prepTime: number;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  distance?: number;
}

export default function RestaurantCard({
  id,
  name,
  logo,
  banner,
  cuisineTypes,
  rating,
  totalRatings,
  prepTime,
  deliveryFee,
  minOrder,
  isOpen,
  distance,
}: RestaurantCardProps) {
  const placeholder = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80`;

  return (
    <Link
      href={`/restaurants/${id}`}
      className="card group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md block"
    >
      {/* Banner */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <Image
          src={banner || placeholder}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow">
              Closed
            </span>
          </div>
        )}
        {logo && (
          <div className="absolute bottom-3 left-3 h-12 w-12 overflow-hidden rounded-xl border-2 border-white shadow-md bg-white">
            <Image src={logo} alt={`${name} logo`} fill className="object-cover" sizes="48px" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-brand-500 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate capitalize">
              {cuisineTypes.join(" • ")}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
            <span className="text-sm font-bold text-green-700">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{prepTime}–{prepTime + 10} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            <span>{deliveryFee === 0 ? "Free delivery" : `$${deliveryFee.toFixed(2)} delivery`}</span>
          </div>
          {distance !== undefined && (
            <span>{distance.toFixed(1)} km</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <BadgeCheck className="h-3.5 w-3.5 text-green-400" />
          <span>Min. order ${minOrder}</span>
          <span>•</span>
          <span>{totalRatings.toLocaleString()} ratings</span>
        </div>
      </div>
    </Link>
  );
}
