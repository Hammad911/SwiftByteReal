"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import ItemCustomisationModal from "./ItemCustomisationModal";

interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  extraCost: number;
}

interface ModifierGroup {
  id: string;
  menuItemId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

interface MenuItemCardProps {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  photo?: string;
  price: number;
  isAvailable: boolean;
  dietaryTags: string[];
  modifierGroups?: ModifierGroup[];
}

const DIETARY_COLORS: Record<string, { bg: string; text: string }> = {
  vegan: { bg: "bg-green-100", text: "text-green-700" },
  vegetarian: { bg: "bg-lime-100", text: "text-lime-700" },
  halal: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "gluten-free": { bg: "bg-yellow-100", text: "text-yellow-700" },
  spicy: { bg: "bg-red-100", text: "text-red-700" },
  "nut-free": { bg: "bg-orange-100", text: "text-orange-700" },
};

export default function MenuItemCard({
  id,
  restaurantId,
  restaurantName,
  name,
  description,
  photo,
  price,
  isAvailable,
  dietaryTags,
  modifierGroups,
}: MenuItemCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { addItem } = useCartStore();

  const handleAdd = () => {
    if (!isAvailable) return;
    if (modifierGroups && modifierGroups.length > 0) {
      setModalOpen(true);
    } else {
      addItem({
        menuItemId: id,
        name,
        photo,
        price,
        quantity: 1,
        customisations: [],
      });
    }
  };

  return (
    <>
      <div
        className={`card flex gap-4 p-4 cursor-pointer transition-all hover:shadow-md ${
          !isAvailable ? "opacity-60" : ""
        }`}
        onClick={handleAdd}
      >
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1.5">
            {dietaryTags.map((tag) => {
              const colors = DIETARY_COLORS[tag] || { bg: "bg-gray-100", text: "text-gray-600" };
              return (
                <span key={tag} className={`badge ${colors.bg} ${colors.text} capitalize`}>
                  {tag}
                </span>
              );
            })}
            {!isAvailable && (
              <span className="badge bg-gray-100 text-gray-500">Sold Out</span>
            )}
          </div>
          <h4 className="text-sm font-bold text-gray-900">{name}</h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
          <p className="text-base font-bold text-gray-900 mt-2">${price.toFixed(2)}</p>
        </div>

        {/* Photo & Add */}
        <div className="relative flex-shrink-0">
          {photo ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
              <Image src={photo} alt={name} fill className="object-cover" sizes="96px" />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
              🍽️
            </div>
          )}
          {isAvailable && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-md transition-transform hover:scale-110 active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <ItemCustomisationModal
          item={{ id, name, photo, price, description, modifierGroups: modifierGroups || [] }}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
