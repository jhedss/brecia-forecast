// Mock API service to fetch products
// In a real app, this would call an actual API endpoint

const generateMockProducts = () => {
  const productNames = [
    "Wireless Mouse", "Mechanical Keyboard", "USB-C Cable", "Laptop Stand",
    "Monitor Stand", "Desk Lamp", "Webcam HD", "USB Hub", "Laptop Sleeve",
    "Mouse Pad", "Headphone Stand", "Cable Organizer", "Phone Stand",
    "Tablet Case", "Screen Protector", "Laptop Charger", "HDMI Cable",
    "Ethernet Cable", "USB Flash Drive", "External Hard Drive",
    "Wireless Earbuds", "Bluetooth Speaker", "Power Bank", "Phone Charger",
    "Laptop Bag", "Backpack", "Notebook", "Pen Set", "Stapler",
    "Paper Clips", "Binder", "Folder", "Sticky Notes", "Highlighter",
    "Calculator", "Ruler", "Scissors", "Tape Dispenser", "Desk Organizer",
    "Water Bottle", "Coffee Mug", "Desk Mat", "Ergonomic Chair",
    "Standing Desk", "Monitor Arm", "Keyboard Tray", "Foot Rest",
    "Blue Light Glasses", "Desk Fan", "USB Heater", "Desk Clock",
    "Calendar", "Whiteboard", "Marker Set", "Eraser", "Pencil Sharpener",
    "Index Cards", "Binder Clips", "Push Pins", "Rubber Bands",
    "File Folders", "Document Holder", "Letter Tray", "In/Out Box",
    "Desk Drawer Organizer", "Cable Management", "Surge Protector",
    "Extension Cord", "LED Strip", "Desk Plant", "Stress Ball",
    "Fidget Spinner", "Desk Toy", "Name Plate", "Photo Frame",
    "Desk Mirror", "Hand Sanitizer", "Tissue Box", "Trash Can",
    "Recycling Bin", "Desk Vacuum", "Cleaning Wipes", "Air Purifier",
    "Humidifier", "Desk Thermometer", "Wall Clock", "Bulletin Board",
    "Cork Board", "Magnetic Board", "Dry Erase Board", "Calendar Board",
    "Desk Sign", "Welcome Mat", "Door Stop", "Bookend", "Magazine Holder",
    "File Cabinet", "Storage Box", "Desk Shelf", "Wall Shelf"
  ];

  const products = [];
  
  for (let i = 0; i < 120; i++) {
    const name = productNames[i % productNames.length] + ` ${Math.floor(i / productNames.length) + 1}`;
    const currentInventory = Math.floor(Math.random() * 200) + 1;
    const avgSalesPerWeek = Math.floor(Math.random() * 50) + 5;
    const daysToReplenish = Math.floor(Math.random() * 14) + 1;
    
    // Generate product image URL using placeholder service
    // Using picsum.photos for random product images
    const imageUrl = `https://picsum.photos/seed/${i + 1}/200/200`;
    
    products.push({
      id: i + 1,
      name,
      imageUrl,
      currentInventory,
      avgSalesPerWeek,
      daysToReplenish
    });
  }
  
  return products;
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchProducts = async () => {
  await delay(800); // Simulate network delay
  return generateMockProducts();
};

