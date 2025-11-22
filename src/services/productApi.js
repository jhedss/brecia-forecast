const productNames = [
  "Laptop Pro 15", "Wireless Mouse", "Mechanical Keyboard", "USB-C Cable",
  "Monitor 27inch", "Webcam HD", "Headphones", "Speaker System",
  "Tablet Stand", "Laptop Bag", "USB Hub", "HDMI Cable",
  "Power Bank", "Phone Case", "Screen Protector", "Keyboard Wrist Rest",
  "Desk Lamp", "Cable Organizer", "USB Flash Drive", "External SSD",
  "Gaming Mouse", "RGB Keyboard", "Gaming Chair", "Desk Mat",
  "Microphone", "Audio Interface", "Studio Monitor", "MIDI Controller",
  "Graphics Tablet", "Printer", "Scanner", "Projector",
  "Router", "Ethernet Switch", "WiFi Extender", "Network Cable",
  "Hard Drive 1TB", "Hard Drive 2TB", "SSD 500GB", "SSD 1TB",
  "RAM 8GB", "RAM 16GB", "CPU Cooler", "Case Fan",
  "Power Supply", "Motherboard", "Graphics Card", "CPU",
  "Thermal Paste", "Cable Sleeves", "LED Strip", "Fan Controller",
  "Smart Watch", "Fitness Tracker", "Bluetooth Earbuds", "Car Charger",
  "Wireless Charger", "Phone Stand", "Laptop Cooler", "Docking Station",
  "Thunderbolt Cable", "DisplayPort Cable", "VGA Adapter", "DVI Adapter",
  "SD Card", "MicroSD Card", "Card Reader", "USB Adapter",
  "Extension Cord", "Surge Protector", "Battery Pack", "Solar Charger",
  "Action Camera", "Drone", "Gimbal", "Tripod",
  "Camera Lens", "Memory Card 64GB", "Memory Card 128GB", "Camera Bag",
  "Lens Filter", "Lens Cap", "Camera Strap", "Remote Shutter",
  "Ring Light", "Softbox", "Green Screen", "Backdrop",
  "Microphone Stand", "Pop Filter", "Shock Mount", "XLR Cable",
  "Audio Mixer", "DJ Controller", "Turntable", "Vinyl Record",
  "Gaming Console", "Game Controller", "Gaming Headset", "Racing Wheel",
  "VR Headset", "Motion Controller", "VR Stand", "VR Cover"
];

function generateProduct(id) {
  const name = productNames[Math.floor(Math.random() * productNames.length)];
  
  const currentInventory = Math.floor(Math.random() * 50) + 1;
  const avgSalesPerWeek = Math.floor(Math.random() * 30) + 5;
  const daysToReplenish = Math.floor(Math.random() * 10) + 1;
  
  return {
    id,
    name: name,
    currentInventory,
    avgSalesPerWeek,
    daysToReplenish
  };
}

export async function fetchProducts(count = 100) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push(generateProduct(i));
  }
  
  return products;
}
