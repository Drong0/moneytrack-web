import type { LucideIcon } from 'lucide-react'
import {
  // Finance
  CreditCard, Banknote, Wallet, PiggyBank, DollarSign, Coins, Bitcoin,
  Receipt, Landmark, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle,
  // Food & Drink
  Utensils, Coffee, Pizza, Apple, Beer, Wine, Sandwich, IceCream,
  Cake, Cookie, Fish, Beef, ShoppingBasket, Candy, GlassWater, Milk,
  // Transport
  Car, Bus, Train, Plane, Bike, Fuel, Truck, Ship, MapPin,
  // Home & Utilities
  Home, Building, Wrench, Hammer, Lightbulb, Zap, Droplets, Flame,
  Trash2, ShowerHead,
  // Health & Sport
  Heart, Pill, Activity, Dumbbell, Brain, Eye, Baby, Stethoscope,
  PersonStanding, Footprints,
  // Entertainment
  Gamepad2, Music, Film, Tv, Headphones, Camera, Radio, Clapperboard,
  // Education
  BookOpen, GraduationCap, PenLine, School, Library,
  // Shopping
  ShoppingCart, ShoppingBag, Package, Tag, Gift, Star,
  // Nature & Weather
  Leaf, Sun, Moon, Snowflake, Flower,
  // Personal
  User, Users, Smile, Crown, Scissors, Shirt,
  // Business
  Briefcase, Building2, BarChart2, Target, Award, Handshake,
  // Communication
  Phone, Smartphone, Mail, MessageCircle, Globe,
  // Other
  Repeat, Lock, Key, Settings,
  Dog, Cat, Bone, PlayCircle,
} from 'lucide-react'

export type IconKey = string

export interface IconEntry {
  key: string
  Icon: LucideIcon
  label: string
}

export interface IconGroup {
  label: string
  icons: IconEntry[]
}

export const ICON_MAP: Record<string, LucideIcon> = {
  // Finance
  card: CreditCard,
  cash: Banknote,
  wallet: Wallet,
  savings: PiggyBank,
  dollar: DollarSign,
  coins: Coins,
  bitcoin: Bitcoin,
  receipt: Receipt,
  bank: Landmark,
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
  income: ArrowUpCircle,
  expense: ArrowDownCircle,

  // Food & Drink
  food: Utensils,
  coffee: Coffee,
  pizza: Pizza,
  apple: Apple,
  beer: Beer,
  wine: Wine,
  sandwich: Sandwich,
  icecream: IceCream,
  cake: Cake,
  cookie: Cookie,
  fish: Fish,
  meat: Beef,
  grocery: ShoppingBasket,
  candy: Candy,
  water: GlassWater,
  milk: Milk,

  // Transport
  car: Car,
  bus: Bus,
  train: Train,
  plane: Plane,
  bike: Bike,
  fuel: Fuel,
  truck: Truck,
  ship: Ship,
  transport: Car,
  taxi: Car,

  // Home & Utilities
  home: Home,
  building: Building,
  repair: Wrench,
  hammer: Hammer,
  light: Lightbulb,
  electricity: Zap,
  water2: Droplets,
  fire: Flame,
  trash: Trash2,
  shower: ShowerHead,
  rent: Home,
  bills: Zap,

  // Health & Sport
  health: Heart,
  medicine: Pill,
  fitness: Activity,
  gym: Dumbbell,
  brain: Brain,
  eye: Eye,
  baby: Baby,
  doctor: Stethoscope,
  sport: PersonStanding,
  footprints: Footprints,

  // Entertainment
  games: Gamepad2,
  music: Music,
  movie: Film,
  tv: Tv,
  headphones: Headphones,
  camera: Camera,
  radio: Radio,
  cinema: Clapperboard,
  youtube: PlayCircle,
  entertainment: Gamepad2,

  // Education
  book: BookOpen,
  education: GraduationCap,
  study: PenLine,
  school: School,
  library: Library,

  // Shopping
  shopping: ShoppingCart,
  bag: ShoppingBag,
  package: Package,
  tag: Tag,
  gift: Gift,
  star: Star,

  // Nature & Weather
  nature: Leaf,
  sun: Sun,
  moon: Moon,
  snow: Snowflake,
  flower: Flower,
  pet: Bone,
  dog: Dog,
  cat: Cat,

  // Personal
  user: User,
  family: Users,
  smile: Smile,
  crown: Crown,
  beauty: Scissors,
  clothes: Shirt,

  // Business
  work: Briefcase,
  office: Building2,
  analytics: BarChart2,
  target: Target,
  award: Award,
  deal: Handshake,

  // Communication
  phone: Phone,
  mobile: Smartphone,
  mail: Mail,
  chat: MessageCircle,
  internet: Globe,

  // Other
  transfer: Repeat,
  lock: Lock,
  key: Key,
  settings: Settings,
  other: Wallet,
  freelance: BarChart2,
  salary: Banknote,
  travel: Plane,
  shopping2: ShoppingBag,
  'subscription': Repeat,
}

export const ICON_GROUPS: IconGroup[] = [
  {
    label: 'Финансы',
    icons: [
      { key: 'card', Icon: CreditCard, label: 'Карта' },
      { key: 'cash', Icon: Banknote, label: 'Наличные' },
      { key: 'wallet', Icon: Wallet, label: 'Кошелёк' },
      { key: 'savings', Icon: PiggyBank, label: 'Копилка' },
      { key: 'bank', Icon: Landmark, label: 'Банк' },
      { key: 'bitcoin', Icon: Bitcoin, label: 'Крипто' },
      { key: 'receipt', Icon: Receipt, label: 'Чек' },
      { key: 'coins', Icon: Coins, label: 'Монеты' },
      { key: 'trend-up', Icon: TrendingUp, label: 'Рост' },
      { key: 'income', Icon: ArrowUpCircle, label: 'Доход' },
    ],
  },
  {
    label: 'Еда и напитки',
    icons: [
      { key: 'food', Icon: Utensils, label: 'Еда' },
      { key: 'coffee', Icon: Coffee, label: 'Кофе' },
      { key: 'pizza', Icon: Pizza, label: 'Пицца' },
      { key: 'sandwich', Icon: Sandwich, label: 'Фастфуд' },
      { key: 'beer', Icon: Beer, label: 'Пиво' },
      { key: 'wine', Icon: Wine, label: 'Вино' },
      { key: 'cake', Icon: Cake, label: 'Торт' },
      { key: 'icecream', Icon: IceCream, label: 'Мороженое' },
      { key: 'fish', Icon: Fish, label: 'Рыба' },
      { key: 'meat', Icon: Beef, label: 'Мясо' },
      { key: 'grocery', Icon: ShoppingBasket, label: 'Продукты' },
      { key: 'candy', Icon: Candy, label: 'Сладкое' },
      { key: 'water', Icon: GlassWater, label: 'Вода' },
      { key: 'milk', Icon: Milk, label: 'Молоко' },
      { key: 'apple', Icon: Apple, label: 'Фрукты' },
    ],
  },
  {
    label: 'Транспорт',
    icons: [
      { key: 'car', Icon: Car, label: 'Машина' },
      { key: 'taxi', Icon: Car, label: 'Такси' },
      { key: 'bus', Icon: Bus, label: 'Автобус' },
      { key: 'train', Icon: Train, label: 'Поезд' },
      { key: 'plane', Icon: Plane, label: 'Самолёт' },
      { key: 'bike', Icon: Bike, label: 'Велосипед' },
      { key: 'fuel', Icon: Fuel, label: 'Бензин' },
      { key: 'truck', Icon: Truck, label: 'Грузовик' },
      { key: 'ship', Icon: Ship, label: 'Корабль' },
    ],
  },
  {
    label: 'Дом и ЖКХ',
    icons: [
      { key: 'home', Icon: Home, label: 'Дом' },
      { key: 'rent', Icon: Home, label: 'Аренда' },
      { key: 'bills', Icon: Zap, label: 'ЖКХ' },
      { key: 'electricity', Icon: Zap, label: 'Свет' },
      { key: 'water2', Icon: Droplets, label: 'Вода' },
      { key: 'fire', Icon: Flame, label: 'Газ' },
      { key: 'repair', Icon: Wrench, label: 'Ремонт' },
      { key: 'hammer', Icon: Hammer, label: 'Инструмент' },
      { key: 'light', Icon: Lightbulb, label: 'Свет' },
      { key: 'trash', Icon: Trash2, label: 'Мусор' },
    ],
  },
  {
    label: 'Здоровье и спорт',
    icons: [
      { key: 'health', Icon: Heart, label: 'Здоровье' },
      { key: 'medicine', Icon: Pill, label: 'Аптека' },
      { key: 'doctor', Icon: Stethoscope, label: 'Врач' },
      { key: 'gym', Icon: Dumbbell, label: 'Спортзал' },
      { key: 'fitness', Icon: Activity, label: 'Фитнес' },
      { key: 'sport', Icon: PersonStanding, label: 'Спорт' },
      { key: 'baby', Icon: Baby, label: 'Ребёнок' },
      { key: 'brain', Icon: Brain, label: 'Психолог' },
      { key: 'eye', Icon: Eye, label: 'Зрение' },
    ],
  },
  {
    label: 'Развлечения',
    icons: [
      { key: 'games', Icon: Gamepad2, label: 'Игры' },
      { key: 'cinema', Icon: Clapperboard, label: 'Кино' },
      { key: 'movie', Icon: Film, label: 'Фильмы' },
      { key: 'music', Icon: Music, label: 'Музыка' },
      { key: 'headphones', Icon: Headphones, label: 'Наушники' },
      { key: 'tv', Icon: Tv, label: 'ТВ' },
      { key: 'camera', Icon: Camera, label: 'Фото' },
      { key: 'youtube', Icon: PlayCircle, label: 'Ютуб' },
      { key: 'subscription', Icon: Repeat, label: 'Подписка' },
    ],
  },
  {
    label: 'Образование',
    icons: [
      { key: 'education', Icon: GraduationCap, label: 'Учёба' },
      { key: 'book', Icon: BookOpen, label: 'Книги' },
      { key: 'study', Icon: PenLine, label: 'Курсы' },
      { key: 'school', Icon: School, label: 'Школа' },
      { key: 'library', Icon: Library, label: 'Библиотека' },
    ],
  },
  {
    label: 'Шопинг',
    icons: [
      { key: 'shopping', Icon: ShoppingCart, label: 'Магазин' },
      { key: 'bag', Icon: ShoppingBag, label: 'Сумка' },
      { key: 'clothes', Icon: Shirt, label: 'Одежда' },
      { key: 'gift', Icon: Gift, label: 'Подарок' },
      { key: 'tag', Icon: Tag, label: 'Скидки' },
      { key: 'package', Icon: Package, label: 'Доставка' },
      { key: 'beauty', Icon: Scissors, label: 'Красота' },
      { key: 'crown', Icon: Crown, label: 'Люкс' },
    ],
  },
  {
    label: 'Работа и бизнес',
    icons: [
      { key: 'salary', Icon: Banknote, label: 'Зарплата' },
      { key: 'work', Icon: Briefcase, label: 'Работа' },
      { key: 'freelance', Icon: BarChart2, label: 'Фриланс' },
      { key: 'office', Icon: Building2, label: 'Офис' },
      { key: 'target', Icon: Target, label: 'Цель' },
      { key: 'award', Icon: Award, label: 'Премия' },
      { key: 'deal', Icon: Handshake, label: 'Сделка' },
      { key: 'analytics', Icon: BarChart2, label: 'Аналитика' },
    ],
  },
  {
    label: 'Связь и интернет',
    icons: [
      { key: 'mobile', Icon: Smartphone, label: 'Телефон' },
      { key: 'internet', Icon: Globe, label: 'Интернет' },
      { key: 'mail', Icon: Mail, label: 'Почта' },
      { key: 'chat', Icon: MessageCircle, label: 'Мессенджер' },
      { key: 'phone', Icon: Phone, label: 'Звонки' },
    ],
  },
  {
    label: 'Питомцы и прочее',
    icons: [
      { key: 'pet', Icon: Bone, label: 'Питомец' },
      { key: 'dog', Icon: Dog, label: 'Собака' },
      { key: 'cat', Icon: Cat, label: 'Кошка' },
      { key: 'nature', Icon: Leaf, label: 'Природа' },
      { key: 'flower', Icon: Flower, label: 'Цветы' },
      { key: 'travel', Icon: MapPin, label: 'Путешествия' },
      { key: 'family', Icon: Users, label: 'Семья' },
      { key: 'transfer', Icon: Repeat, label: 'Перевод' },
      { key: 'other', Icon: Wallet, label: 'Другое' },
    ],
  },
]

export function getIconComponent(key: string): LucideIcon {
  return ICON_MAP[key] ?? Wallet
}
