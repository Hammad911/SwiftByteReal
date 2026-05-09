"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

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

interface Item {
  id: string;
  name: string;
  photo?: string;
  price: number;
  description: string;
  modifierGroups: ModifierGroup[];
}

interface Props {
  item: Item;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}

export default function ItemCustomisationModal({ item, restaurantId, restaurantName, onClose }: Props) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  const toggleOption = (group: ModifierGroup, optionId: string) => {
    const current = selected[group.id] || [];
    if (current.includes(optionId)) {
      setSelected({ ...selected, [group.id]: current.filter((id) => id !== optionId) });
    } else {
      if (group.maxSelect === 1) {
        setSelected({ ...selected, [group.id]: [optionId] });
      } else if (current.length < group.maxSelect) {
        setSelected({ ...selected, [group.id]: [...current, optionId] });
      } else {
        toast.error(`Max ${group.maxSelect} options for ${group.name}`);
      }
    }
  };

  const customisations = item.modifierGroups.flatMap((group) =>
    (selected[group.id] || []).map((optId) => {
      const opt = group.options.find((o) => o.id === optId)!;
      return {
        groupId: group.id,
        groupName: group.name,
        optionId: optId,
        optionName: opt.name,
        extraCost: opt.extraCost,
      };
    })
  );

  const extraCost = customisations.reduce((sum, c) => sum + c.extraCost, 0);
  const unitPrice = item.price + extraCost;
  const total = unitPrice * quantity;

  const validate = () => {
    for (const group of item.modifierGroups) {
      const count = (selected[group.id] || []).length;
      if (count < group.minSelect) {
        toast.error(`Please select at least ${group.minSelect} option(s) for ${group.name}`);
        return false;
      }
    }
    return true;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      photo: item.photo,
      price: item.price,
      quantity,
      customisations,
      specialInstructions: specialInstructions.trim() || undefined,
    });
    toast.success(`${item.name} added to cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="relative">
          {item.photo && (
            <div className="relative h-48 bg-gray-100">
              <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="512px" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          <p className="text-lg font-bold text-gray-900 mt-2">${item.price.toFixed(2)}</p>

          {/* Modifier Groups */}
          {item.modifierGroups.map((group) => (
            <div key={group.id} className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">{group.name}</h3>
                <span className="text-xs text-gray-500 badge bg-gray-100">
                  {group.minSelect > 0 ? `Required · ` : "Optional · "}
                  {group.maxSelect === 1 ? "Choose 1" : `Up to ${group.maxSelect}`}
                </span>
              </div>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const isSelected = (selected[group.id] || []).includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(group, option.id)}
                      className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm transition-all ${
                        isSelected
                          ? "border-brand-400 bg-brand-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-brand-500 bg-brand-500" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <span className="font-medium text-gray-900">{option.name}</span>
                      </div>
                      {option.extraCost > 0 && (
                        <span className="text-gray-500">+${option.extraCost.toFixed(2)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="mt-5">
            <label className="text-sm font-bold text-gray-900 block mb-2">
              Special Instructions (optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g. no onions, extra sauce..."
              className="input h-20 resize-none text-sm"
              maxLength={200}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-gray-500 hover:text-brand-500 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-base font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-gray-500 hover:text-brand-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to cart */}
            <button onClick={handleAdd} className="btn-primary flex-1 h-12 text-base">
              Add to Cart · ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
