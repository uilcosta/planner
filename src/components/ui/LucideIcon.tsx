'use client';

import { forwardRef, SVGAttributes } from 'react';
import {
  Home,
  ShoppingCart,
  Car,
  Bus,
  Plane,
  Utensils,
  Coffee,
  Heart,
  Dumbbell,
  Book,
  Gamepad2,
  Music,
  Film,
  Camera,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Shirt,
  ShoppingBag,
  Gift,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  Coins,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Pill,
  Syringe,
  Dna,
  Leaf,
  Trees,
  Flower,
  Sun,
  Cloud,
  Droplet,
  Flame,
  Wind,
  Zap,
  Battery,
  Plug,
  Wifi,
  Signal,
  Bluetooth,
  Usb,
  HardDrive,
  Database,
  Server,
  Cpu,
  MemoryStick,
  Monitor,
  Keyboard,
  Mouse,
  Printer,
  Mic,
  Speaker,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  PlusCircle,
  MinusCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Check,
  Star,
  Flag,
  Bookmark,
  Tag,
  Folder,
  File,
  Image,
  Video,
  Code,
  Terminal,
  GitBranch,
  Building,
  TrendingUp,
} from 'lucide-react';

interface LucideIconProps extends SVGAttributes<SVGSVGElement> {
  name: string;
}

const iconMap: Record<string, React.ForwardRefExoticComponent<SVGAttributes<SVGSVGElement> & { ref?: React.Ref<SVGSVGElement> }>> = {
  home: Home,
  'shopping-cart': ShoppingCart,
  car: Car,
  bus: Bus,
  plane: Plane,
  utensils: Utensils,
  coffee: Coffee,
  heart: Heart,
  dumbbell: Dumbbell,
  book: Book,
  'gamepad-2': Gamepad2,
  music: Music,
  film: Film,
  camera: Camera,
  smartphone: Smartphone,
  laptop: Laptop,
  tv: Tv,
  headphones: Headphones,
  watch: Watch,
  shirt: Shirt,
  'shopping-bag': ShoppingBag,
  gift: Gift,
  'credit-card': CreditCard,
  wallet: Wallet,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  coins: Coins,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  stethoscope: Stethoscope,
  pill: Pill,
  syringe: Syringe,
  dna: Dna,
  leaf: Leaf,
  tree: Trees,
  flower: Flower,
  sun: Sun,
  cloud: Cloud,
  droplet: Droplet,
  flame: Flame,
  wind: Wind,
  zap: Zap,
  battery: Battery,
  plug: Plug,
  wifi: Wifi,
  signal: Signal,
  bluetooth: Bluetooth,
  usb: Usb,
  'hard-drive': HardDrive,
  database: Database,
  server: Server,
  cpu: Cpu,
  'memory-stick': MemoryStick,
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  printer: Printer,
  mic: Mic,
  speaker: Speaker,
  bell: Bell,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  info: Info,
  'help-circle': HelpCircle,
  'plus-circle': PlusCircle,
  'minus-circle': MinusCircle,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  menu: Menu,
  x: X,
  check: Check,
  star: Star,
  flag: Flag,
  bookmark: Bookmark,
  tag: Tag,
  folder: Folder,
  file: File,
  image: Image,
  video: Video,
  code: Code,
  terminal: Terminal,
  'git-branch': GitBranch,
  // Institution icons
  building: Building,
  'trending-up': TrendingUp,
};

/**
 * Dynamic Lucide icon renderer
 * Allows rendering any Lucide icon by name string
 */
export const LucideIcon = forwardRef<SVGSVGElement, LucideIconProps>(
  ({ name, className, ...props }, ref) => {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
      console.warn(`Lucide icon "${name}" not found`);
      return (
        <svg
          ref={ref}
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    }

    return <IconComponent ref={ref} className={className} {...props} />;
  }
);

LucideIcon.displayName = 'LucideIcon';