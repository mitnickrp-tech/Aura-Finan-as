import React from 'react';
import {
  Utensils,
  Home,
  Car,
  Coffee,
  HeartPulse,
  GraduationCap,
  Tv,
  ShoppingBag,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  MoreHorizontal,
  Wallet,
  Zap,
  CreditCard,
  Building,
  PiggyBank,
  ShieldCheck,
  Palmtree,
  Sparkles,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Home,
  Car,
  Coffee,
  HeartPulse,
  GraduationCap,
  Tv,
  ShoppingBag,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  MoreHorizontal,
  Wallet,
  Zap,
  CreditCard,
  Building,
  PiggyBank,
  ShieldCheck,
  Palmtree,
  Sparkles,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', color }) => {
  const IconComponent = ICON_MAP[name] || MoreHorizontal;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
