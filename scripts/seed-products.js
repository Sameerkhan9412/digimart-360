const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env file in project directory
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    envVars[match[1]] = value;
  }
});

const mongoUri = envVars.MONGODB_URI;
if (!mongoUri) {
  console.error("MONGODB_URI not found in .env file!");
  process.exit(1);
}

const sellerEmail = 'codewithsameer786@gmail.com';
const sellerPassword = 'Sameer@9412';
const sellerName = 'Sameer Enterprises';

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.");

  // 1. Create or update User
  let user = await mongoose.connection.db.collection('users').findOne({ email: sellerEmail });
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(sellerPassword, salt);

  if (user) {
    console.log("User already exists, updating password and verification...");
    await mongoose.connection.db.collection('users').updateOne(
      { _id: user._id },
      { $set: { passwordHash, role: 'seller', isVerified: true, name: sellerName } }
    );
  } else {
    console.log("Creating new user...");
    const userResult = await mongoose.connection.db.collection('users').insertOne({
      name: sellerName,
      email: sellerEmail,
      passwordHash,
      role: 'seller',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    user = { _id: userResult.insertedId, name: sellerName, email: sellerEmail };
  }

  // 2. Create or update Seller profile
  let seller = await mongoose.connection.db.collection('sellers').findOne({ user: user._id });
  if (seller) {
    console.log("Seller profile already exists, updating verification to approved...");
    await mongoose.connection.db.collection('sellers').updateOne(
      { _id: seller._id },
      { $set: { isVerified: true, verificationStatus: 'approved', subscriptionPlan: 'platinum', companyName: sellerName } }
    );
  } else {
    console.log("Creating new seller profile...");
    const sellerResult = await mongoose.connection.db.collection('sellers').insertOne({
      user: user._id,
      companyName: sellerName,
      slug: 'sameer-enterprises',
      contactInfo: {
        phone: '9999999999',
        email: sellerEmail,
        address: 'Main Industrial Sector, New Delhi, India'
      },
      isVerified: true,
      verificationStatus: 'approved',
      verificationDocuments: [],
      subscriptionPlan: 'platinum',
      theme: {
        primaryColor: '#009E49',
        secondaryColor: '#0F4C5C',
        font: 'Plus Jakarta Sans',
        layoutVariant: 'modern'
      },
      timeline: [],
      certifications: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    seller = { _id: sellerResult.insertedId };
  }

  // 3. Clear existing products of this seller
  console.log("Clearing existing products of this seller...");
  await mongoose.connection.db.collection('products').deleteMany({ seller: seller._id });

  // 4. Query Subcategories
  const categoriesList = await mongoose.connection.db.collection('categories').find({}).toArray();
  const getCatIdBySlug = (slug) => {
    const found = categoriesList.find(c => c.slug === slug);
    if (!found) {
      console.warn(`Category slug '${slug}' not found, using first available category.`);
      return categoriesList[0] ? categoriesList[0]._id : null;
    }
    return found._id;
  };

  // 5. Build 10 Products List
  const productsData = [
    {
      name: "CNC Milling Machine VM-3",
      categorySlug: "cnc-machinery",
      price: 1850000,
      minOrderQuantity: 1,
      unit: "set",
      description: "Heavy-duty 5-Axis vertical CNC milling machine VM-3 designed for precision aerospace and automotive metal components manufacturing. Equipped with Fanuc controller system, dual spindle cooling, and automatic tool changer.",
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800",
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800"
      ],
      customAttributes: { "Spindle Speed (RPM)": "12000", "Number of Axes": "5-Axis", "Motor Power (kW)": "15", "Warranty Period (Months)": "24", "Power Source": "Electric" },
      tags: ["cnc", "industrial", "milling", "machinery"]
    },
    {
      name: "Automatic Liquid Filling Machine",
      categorySlug: "packaging-machinery",
      price: 450500,
      minOrderQuantity: 1,
      unit: "unit",
      description: "High-speed automatic liquid filling machine suitable for pharmaceutical, cosmetic, and food beverage bottles. Featuring anti-drip nozzle technology, PLC touch screen control panel, and premium SS316 fluid paths.",
      images: [
        "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=800",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800"
      ],
      customAttributes: { "Production Speed (pcs/min)": "60", "Seal Width (mm)": "15", "Automation Grade": "Automatic", "Warranty Period (Months)": "12", "Power Source": "Electric" },
      tags: ["filling machine", "packaging", "industrial", "bottling"]
    },
    {
      name: "High-Voltage Power Transformer 11KV",
      categorySlug: "power-transformers",
      price: 950000,
      minOrderQuantity: 1,
      unit: "unit",
      description: "Industrial grade 11KV/433V oil-cooled power transformer. High efficiency copper windings, low load losses, and robust structural steel housing designed for long-term distribution grid operations.",
      images: [
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800",
        "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=800"
      ],
      customAttributes: { "Capacity (kVA)": "500", "Cooling Type": "ONAN (Oil)", "Voltage Ratio (kV)": "11KV/433V", "Certification": "CE" },
      tags: ["transformer", "electrical", "high-voltage", "power grid"]
    },
    {
      name: "Outdoor LED Flood Light 200W",
      categorySlug: "led-lighting-fixtures",
      price: 4200,
      minOrderQuantity: 10,
      unit: "piece",
      description: "IP66 waterproof outdoor LED flood light with high-purity aluminum housing and premium Philips LED chips. Delivering outstanding lumen output for warehouse, stadium, and industrial yard illumination.",
      images: [
        "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=800",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800"
      ],
      customAttributes: { "Wattage (W)": "200", "Lumen Output (lm)": "24000", "Color Temperature (K)": "6500K (Cool White)", "Certification": "CE" },
      tags: ["led floodlight", "stadium light", "outdoor led", "industrial lighting"]
    },
    {
      name: "OPC 53 Grade Cement Bulk Pack",
      categorySlug: "cement-concrete",
      price: 420,
      minOrderQuantity: 100,
      unit: "bag",
      description: "Ultra-high strength Ordinary Portland Cement (OPC) Grade 53. Perfect for load-bearing structures, RCC columns, high-rise buildings, and pre-cast concrete structures. Packaged in moisture-resistant 3-ply bags.",
      images: [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800",
        "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=800"
      ],
      customAttributes: { "Cement Grade": "OPC 53", "Packaging Size (kg)": "50", "Country of Origin": "India" },
      tags: ["cement", "opc 53", "construction raw material", "concrete"]
    },
    {
      name: "Hot-Rolled Structural I-Beams Fe 500",
      categorySlug: "structural-steel",
      price: 56000,
      minOrderQuantity: 2,
      unit: "ton",
      description: "High-tensile hot-rolled structural steel I-beams conforming to IS 2062. Grade Fe 500 ensures exceptional yield strength and weldability for heavy structural frameworks and commercial columns.",
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800"
      ],
      customAttributes: { "Steel Grade": "Fe 500", "Shape/Profile": "I-Beam", "Length per piece (m)": "12", "Country of Origin": "India" },
      tags: ["structural steel", "i-beam", "fe 500", "girders"]
    },
    {
      name: "Cotton Oxford Slim-Fit Men's Shirt",
      categorySlug: "mens-shirts",
      price: 850,
      minOrderQuantity: 50,
      unit: "piece",
      description: "Premium combed 100% cotton Oxford weave slim-fit men's formal shirts. Breathable fabric, tailored collar, double-button cuffs, and neat stitch density. Available in wholesale assorted size sets.",
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800",
        "https://images.unsplash.com/photo-1620012253295-c05518e993be?q=80&w=800"
      ],
      customAttributes: { "Fabric Material": "100% Cotton", "Fit": "Slim Fit", "Sleeve Length": "Full Sleeves", "Care Instructions": "Machine wash cold" },
      tags: ["men shirt", "cotton shirt", "formal shirt", "menswear wholesale"]
    },
    {
      name: "Stainless Steel Surgical Scissors",
      categorySlug: "surgical-instruments",
      price: 1200,
      minOrderQuantity: 20,
      unit: "pair",
      description: "Medical grade SS316 stainless steel straight surgical scissors with sharp/blunt tips. Highly corrosion resistant, autoclavable, and engineered for fine cutting precision during minor and major procedures.",
      images: [
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=800",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800"
      ],
      customAttributes: { "Material": "Medical Grade Stainless Steel", "Sterilization Method": "Autoclavable", "FDA Approved": "true" },
      tags: ["surgical scissors", "medical steel", "instruments", "clinic supplies"]
    },
    {
      name: "Corrugated Packaging Boxes (5-Ply)",
      categorySlug: "corrugated-boxes",
      price: 35,
      minOrderQuantity: 500,
      unit: "piece",
      description: "High-density 5-ply corrugated cardboard boxes for heavy-duty product shipping. Bursting strength tested to ensure safety for e-commerce, warehousing, and export shipments.",
      images: [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800",
        "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=800"
      ],
      customAttributes: { "Ply Count": "5-Ply", "Bursting Strength (kg/cm²)": "15", "Dimensions (L x W x H inches)": "12 x 10 x 8", "Eco-Friendly / Recyclable": "true" },
      tags: ["corrugated box", "shipping box", "cartons", "packaging boxes"]
    },
    {
      name: "A4 White Copy Paper 80 GSM",
      categorySlug: "copy-paper",
      price: 280,
      minOrderQuantity: 100,
      unit: "ream",
      description: "Premium multipurpose copy paper, size A4, 80 GSM weight. Features 98% brightness and high opacity for double-sided jam-free photocopies and laser/inkjet printing.",
      images: [
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800",
        "https://images.unsplash.com/photo-1583521214690-73421a1829a9?q=80&w=800"
      ],
      customAttributes: { "Paper Size": "A4", "Brightness Grade (%)": "98", "GSM Weight": "80 GSM", "Recycled Content (%)": "0" },
      tags: ["a4 paper", "copy paper", "office printing", "ream wholesale"]
    }
  ];

  // 6. Insert Products
  for (const prod of productsData) {
    console.log(`Seeding product: ${prod.name}...`);
    const catId = getCatIdBySlug(prod.categorySlug);
    const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    // Ensure unique slug locally in DB
    let uniqueSlug = slug;
    let count = 1;
    while (await mongoose.connection.db.collection('products').findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    await mongoose.connection.db.collection('products').insertOne({
      name: prod.name,
      slug: uniqueSlug,
      description: prod.description,
      price: prod.price,
      minOrderQuantity: prod.minOrderQuantity,
      unit: prod.unit,
      category: catId,
      images: prod.images,
      customAttributes: prod.customAttributes,
      tags: prod.tags,
      isSponsored: false,
      seller: seller._id,
      rating: 4.5,
      seoMetadata: {
        title: `${prod.name} - Wholesale Trade B2B`,
        description: prod.description.substring(0, 150),
        keywords: prod.tags.join(', ')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  await mongoose.connection.close();
  console.log("Products seeding finished successfully.");
}

seed().catch(err => {
  console.error("Products seeding error:", err);
  process.exit(1);
});
