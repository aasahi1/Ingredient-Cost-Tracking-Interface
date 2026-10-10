export const A = "/assets";

export type Flavor = {
  name: string;
  price: string;
  cost: string;
  type: "Original" | "Weekly";
  sold: number;
  revenue: string;
  margin: string;
  sellThrough: number;
  waste: string;
  status: string;
  image: string;
};

export type InventoryRecord = {
  name: string;
  quantity: number;
  unit: string;
  supplier: string;
  unitCost: number;
  costUnit: string;
  expiryDate: string;
  daysRemaining: number;
  estimatedValue: number;
  location: string;
  status: "Use today" | "Use soon" | "Low stock" | "In stock";
  recentChange: string;
  products: string[];
};

export const inventoryRecords: InventoryRecord[] = [
  { name: "Heavy cream", quantity: 1.4, unit: "L", supplier: "Sunshine Dairy Co.", unitCost: 5.9, costUnit: "/L", expiryDate: "Jul 15, 2025", daysRemaining: 1, estimatedValue: 8.26, location: "Fridge 1", status: "Use today", recentChange: "−0.8 L · yesterday", products: ["Strawberry Shortcake Parfait", "Coffee Cream Parfait", "Mango Yuzu Parfait"] },
  { name: "Blueberry compote", quantity: 0.48, unit: "kg", supplier: "Berry & Bloom Farm", unitCost: 4.8, costUnit: "/kg", expiryDate: "Jul 18, 2025", daysRemaining: 4, estimatedValue: 2.3, location: "Fridge 2", status: "Use soon", recentChange: "−0.2 kg · yesterday", products: ["Blueberry Lemon Parfait"] },
  { name: "Fresh strawberries", quantity: 6, unit: "kg", supplier: "FreshFarm", unitCost: 6.4, costUnit: "/kg", expiryDate: "Jul 18, 2025", daysRemaining: 4, estimatedValue: 38.4, location: "Cold room", status: "Use soon", recentChange: "+8 kg · Jul 12 delivery", products: ["Strawberry Shortcake Parfait"] },
  { name: "Vanilla yogurt", quantity: 3.2, unit: "kg", supplier: "Sunshine Dairy Co.", unitCost: 3.1, costUnit: "/kg", expiryDate: "Jul 21, 2025", daysRemaining: 7, estimatedValue: 9.92, location: "Fridge 1", status: "In stock", recentChange: "−0.6 kg · yesterday", products: ["Coffee Cream Parfait", "Golden Caramel Parfait", "Blueberry Lemon Parfait"] },
  { name: "Granola", quantity: 2, unit: "kg", supplier: "Golden Grain Supplies", unitCost: 4.2, costUnit: "/kg", expiryDate: "Aug 14, 2025", daysRemaining: 31, estimatedValue: 8.4, location: "Dry goods", status: "Low stock", recentChange: "−1.4 kg · this week", products: ["Coffee Cream Parfait", "Strawberry Shortcake Parfait"] },
  { name: "Coconut cream", quantity: 2, unit: "L", supplier: "FreshFarm", unitCost: 2.4, costUnit: "/L", expiryDate: "Jul 28, 2025", daysRemaining: 14, estimatedValue: 4.8, location: "Fridge 2", status: "Low stock", recentChange: "+2 L · Jul 10 delivery", products: ["Mango Yuzu Parfait"] },
  { name: "Matcha powder", quantity: 3, unit: "kg", supplier: "TopSource", unitCost: 5.1, costUnit: "/kg", expiryDate: "Aug 15, 2025", daysRemaining: 32, estimatedValue: 15.3, location: "Dry goods", status: "In stock", recentChange: "No change this week", products: ["Matcha Cloud Parfait"] },
];

export const flavors: Flavor[] = [
  { name: "Coffee Cream Parfait", price: "$5.50", cost: "$1.90", type: "Original", sold: 38, revenue: "$209", margin: "65%", sellThrough: 100, waste: "$0", status: "Sold out", image: "parfait-coffee.png" },
  { name: "Strawberry Shortcake Parfait", price: "$7.00", cost: "$2.60", type: "Weekly", sold: 24, revenue: "$168", margin: "63%", sellThrough: 96, waste: "$5", status: "Sold out", image: "parfait-strawberry.jpg" },
  { name: "Golden Caramel Parfait", price: "$4.50", cost: "$1.40", type: "Original", sold: 31, revenue: "$139", margin: "69%", sellThrough: 88, waste: "$6", status: "Near expiry", image: "parfait-mango.jpg" },
  { name: "Matcha Cloud Parfait", price: "$6.00", cost: "$2.20", type: "Weekly", sold: 19, revenue: "$114", margin: "63%", sellThrough: 76, waste: "$13", status: "Sitting", image: "parfait-matcha.jpg" },
  { name: "Blueberry Lemon Parfait", price: "$4.00", cost: "$1.60", type: "Original", sold: 14, revenue: "$56", margin: "60%", sellThrough: 56, waste: "$14", status: "Near expiry", image: "parfait-berry.jpg" },
  { name: "Mango Yuzu Parfait", price: "$8.50", cost: "$2.40", type: "Weekly", sold: 34, revenue: "$289", margin: "68%", sellThrough: 97, waste: "$0", status: "Nearly sold out", image: "parfait-mango.jpg" },
];

export const voteItems = [
  { name: "Coffee Cream Parfait", votes: 63, image: "parfait-coffee.png", note: "Sold out this week" },
  { name: "Chocolate Mochi Parfait", votes: 51, image: "parfait-chocolate.jpg", note: "Was a weekly special" },
  { name: "Salted Caramel Parfait", votes: 44, image: "parfait-mango.jpg", note: "Original · High margin" },
  { name: "Matcha Cloud Parfait", votes: 38, image: "parfait-matcha.jpg", note: "Sitting in stock" },
];

export const productInventory: Record<string, { ingredient: string; used: string; remaining: string; coverage: string; attention?: string }[]> = {
  "Coffee Cream Parfait": [
    { ingredient: "Vanilla yogurt cream", used: "4.6 kg used this week", remaining: "3.2 kg", coverage: "2 production days" },
    { ingredient: "Espresso syrup", used: "920 ml used this week", remaining: "1.8 L", coverage: "4 production days" },
    { ingredient: "Oat granola", used: "1.4 kg used this week", remaining: "2 kg", coverage: "Low stock", attention: "Reorder soon" },
  ],
  "Strawberry Shortcake Parfait": [
    { ingredient: "Fresh strawberries", used: "5.8 kg used this week", remaining: "6 kg", coverage: "4 production days", attention: "Expires in 4 days" },
    { ingredient: "Heavy cream", used: "3.1 L used this week", remaining: "1.4 L", coverage: "1 production day", attention: "Expires tomorrow" },
    { ingredient: "Berry compote", used: "1.2 kg used this week", remaining: "480 g", coverage: "2 production days" },
  ],
  "Golden Caramel Parfait": [
    { ingredient: "Vanilla yogurt", used: "3.7 kg used this week", remaining: "3.2 kg", coverage: "3 production days" },
    { ingredient: "Caramel granola", used: "1.6 kg used this week", remaining: "2.4 kg", coverage: "4 production days" },
    { ingredient: "Mango pieces", used: "2.2 kg used this week", remaining: "4 kg", coverage: "5 production days" },
  ],
  "Matcha Cloud Parfait": [
    { ingredient: "Matcha powder", used: "420 g used this week", remaining: "3 kg", coverage: "12 production days" },
    { ingredient: "Vanilla yogurt", used: "2.3 kg used this week", remaining: "3.2 kg", coverage: "4 production days" },
    { ingredient: "Sesame granola", used: "900 g used this week", remaining: "1.4 kg", coverage: "4 production days" },
  ],
  "Blueberry Lemon Parfait": [
    { ingredient: "Blueberry compote", used: "680 g used this week", remaining: "480 g", coverage: "3 production days", attention: "Expires in 4 days" },
    { ingredient: "Vanilla yogurt", used: "1.6 kg used this week", remaining: "3.2 kg", coverage: "7 production days" },
    { ingredient: "Lemon granola", used: "620 g used this week", remaining: "2.8 kg", coverage: "10 production days" },
  ],
  "Mango Yuzu Parfait": [
    { ingredient: "Frozen mango", used: "4.2 kg used this week", remaining: "8 kg", coverage: "6 production days" },
    { ingredient: "Yuzu curd", used: "1.1 kg used this week", remaining: "1.8 kg", coverage: "4 production days" },
    { ingredient: "Vanilla yogurt", used: "2.6 kg used this week", remaining: "3.2 kg", coverage: "4 production days" },
  ],
};

export const recentSales = [
  { time: "10:42 AM", product: "Coffee Cream Parfait", quantity: 2, total: "$11.00", payment: "Card", inventory: "Sample only" },
  { time: "10:35 AM", product: "Mango Yuzu Parfait", quantity: 1, total: "$8.50", payment: "Cash", inventory: "Sample only" },
  { time: "10:18 AM", product: "Strawberry Shortcake Parfait", quantity: 2, total: "$14.00", payment: "Card", inventory: "Sample only" },
  { time: "9:56 AM", product: "Golden Caramel Parfait", quantity: 1, total: "$4.50", payment: "QR Pay", inventory: "Sample only" },
  { time: "9:41 AM", product: "Matcha Cloud Parfait", quantity: 1, total: "$6.00", payment: "Card", inventory: "Sample only" },
];

export const primaryNav = [
  { route: "Overview", label: "Today" },
  { route: "Inventory", label: "Inventory" },
  { route: "Sales & Votes", label: "Sales" },
  { route: "Flavor Lab", label: "Weekly Special" },
];

export const purchasingNav = [
  { route: "Suppliers", label: "Suppliers", description: "Compare costs and create orders" },
  { route: "Orders", label: "Orders", description: "Deliveries, bills, and payments" },
];

export const moreNav = [
  { route: "Recipes", label: "Recipes", description: "Product methods and costs" },
  { route: "Taxes", label: "Taxes", description: "Review and prepare tax records" },
];

export const allNavigation = [
  ...primaryNav.slice(0, 2),
  ...purchasingNav.map(({ route, label }) => ({ route, label })),
  ...primaryNav.slice(2),
  ...moreNav.map(({ route, label }) => ({ route, label })),
];
