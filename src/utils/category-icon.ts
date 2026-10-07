import {
  BriefcaseBusiness,
  Car,
  House,
  type LucideIcon,
  PawPrint,
  Puzzle,
  Shirt,
  Smartphone,
  Sofa,
  Tag,
} from 'lucide-react-native';

// The API stores Heroicons names (used by the web client); map them to their Lucide equivalents.
const ICONS: Record<string, LucideIcon> = {
  home: House,
  car: Car,
  'device-phone-mobile': Smartphone,
  sparkles: Shirt,
  'wrench-screwdriver': Sofa,
  identification: BriefcaseBusiness,
  'puzzle-piece': Puzzle,
  heart: PawPrint,
};

export function categoryIcon(name: string | null): LucideIcon {
  return (name && ICONS[name]) || Tag;
}
