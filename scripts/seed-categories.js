const mongoose = require('mongoose');
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

// 10 main categories, each with 3 sub-categories
const categoriesData = [
  {
    name: "Industrial Machinery",
    slug: "industrial-machinery",
    customFields: [
      { name: "Warranty Period (Months)", fieldType: "number", required: true },
      { name: "Power Source", fieldType: "dropdown", options: ["Electric", "Hydraulic", "Pneumatic", "Diesel"], required: false }
    ],
    subCategories: [
      {
        name: "CNC Machinery",
        slug: "cnc-machinery",
        customFields: [
          { name: "Spindle Speed (RPM)", fieldType: "number", required: true },
          { name: "Number of Axes", fieldType: "dropdown", options: ["3-Axis", "4-Axis", "5-Axis"], required: true },
          { name: "Motor Power (kW)", fieldType: "number", required: false }
        ]
      },
      {
        name: "Packaging Machinery",
        slug: "packaging-machinery",
        customFields: [
          { name: "Production Speed (pcs/min)", fieldType: "number", required: true },
          { name: "Seal Width (mm)", fieldType: "number", required: false },
          { name: "Automation Grade", fieldType: "dropdown", options: ["Automatic", "Semi-Automatic", "Manual"], required: true }
        ]
      },
      {
        name: "Food Processing Machinery",
        slug: "food-processing-machinery",
        customFields: [
          { name: "Throughput Capacity (kg/hr)", fieldType: "number", required: true },
          { name: "Material Grade", fieldType: "dropdown", options: ["SS304", "SS316", "Food-Grade Plastic"], required: true },
          { name: "Voltage (V)", fieldType: "dropdown", options: ["220V", "380V", "440V"], required: false }
        ]
      }
    ]
  },
  {
    name: "Electronics & Electrical",
    slug: "electronics-electrical",
    customFields: [
      { name: "Certification", fieldType: "dropdown", options: ["CE", "RoHS", "UL", "ISO"], required: false }
    ],
    subCategories: [
      {
        name: "Power Transformers",
        slug: "power-transformers",
        customFields: [
          { name: "Capacity (kVA)", fieldType: "number", required: true },
          { name: "Cooling Type", fieldType: "dropdown", options: ["ONAN (Oil)", "Dry Type", "Air Cooled"], required: true },
          { name: "Voltage Ratio (kV)", fieldType: "text", required: true }
        ]
      },
      {
        name: "LED Lighting & Fixtures",
        slug: "led-lighting-fixtures",
        customFields: [
          { name: "Wattage (W)", fieldType: "number", required: true },
          { name: "Lumen Output (lm)", fieldType: "number", required: false },
          { name: "Color Temperature (K)", fieldType: "dropdown", options: ["3000K (Warm)", "4000K (Neutral)", "6500K (Cool White)"], required: true }
        ]
      },
      {
        name: "Industrial Cables & Wires",
        slug: "industrial-cables-wires",
        customFields: [
          { name: "Core Count", fieldType: "number", required: true },
          { name: "Thickness (sq mm)", fieldType: "number", required: true },
          { name: "Conductor Material", fieldType: "dropdown", options: ["Copper", "Aluminum"], required: true }
        ]
      }
    ]
  },
  {
    name: "Construction & Real Estate",
    slug: "construction-real-estate",
    customFields: [
      { name: "Country of Origin", fieldType: "text", required: false }
    ],
    subCategories: [
      {
        name: "Cement & Concrete",
        slug: "cement-concrete",
        customFields: [
          { name: "Cement Grade", fieldType: "dropdown", options: ["OPC 43", "OPC 53", "PPC"], required: true },
          { name: "Packaging Size (kg)", fieldType: "number", required: true }
        ]
      },
      {
        name: "Structural Steel",
        slug: "structural-steel",
        customFields: [
          { name: "Steel Grade", fieldType: "dropdown", options: ["Mild Steel", "Fe 415", "Fe 500", "Fe 550D"], required: true },
          { name: "Shape/Profile", fieldType: "dropdown", options: ["TMT Rebar", "I-Beam", "H-Beam", "Channel", "Angle"], required: true },
          { name: "Length per piece (m)", fieldType: "number", required: false }
        ]
      },
      {
        name: "Ceramic Tiles",
        slug: "ceramic-tiles",
        customFields: [
          { name: "Dimensions (mm x mm)", fieldType: "text", required: true },
          { name: "Thickness (mm)", fieldType: "number", required: true },
          { name: "Finish", fieldType: "dropdown", options: ["Glossy", "Matte", "Satin", "Rustic"], required: true }
        ]
      }
    ]
  },
  {
    name: "Apparel & Garments",
    slug: "apparel-garments",
    customFields: [
      { name: "Care Instructions", fieldType: "text", required: false }
    ],
    subCategories: [
      {
        name: "Men's Shirts",
        slug: "mens-shirts",
        customFields: [
          { name: "Fabric Material", fieldType: "dropdown", options: ["100% Cotton", "Linen", "Polyester Blend", "Satin"], required: true },
          { name: "Fit", fieldType: "dropdown", options: ["Slim Fit", "Regular Fit", "Tailored Fit"], required: true },
          { name: "Sleeve Length", fieldType: "dropdown", options: ["Full Sleeves", "Half Sleeves", "Sleeveless"], required: false }
        ]
      },
      {
        name: "Ladies' Ethnic Wear",
        slug: "ladies-ethnic-wear",
        customFields: [
          { name: "Work Type", fieldType: "dropdown", options: ["Embroidered", "Printed", "Zari Work", "Handwoven"], required: true },
          { name: "Style", fieldType: "dropdown", options: ["Kurti", "Saree", "Anarkali Suit", "Lehenga Choli"], required: true }
        ]
      },
      {
        name: "Cotton Yarn & Fabric",
        slug: "cotton-yarn-fabric",
        customFields: [
          { name: "Thread Count", fieldType: "number", required: true },
          { name: "Weave Pattern", fieldType: "dropdown", options: ["Plain Weave", "Twill", "Sateen", "Jacquard"], required: true }
        ]
      }
    ]
  },
  {
    name: "Medical & Healthcare",
    slug: "medical-healthcare",
    customFields: [
      { name: "FDA Approved", fieldType: "checkbox", required: false }
    ],
    subCategories: [
      {
        name: "Surgical Instruments",
        slug: "surgical-instruments",
        customFields: [
          { name: "Material", fieldType: "dropdown", options: ["Medical Grade Stainless Steel", "Titanium Alloy"], required: true },
          { name: "Sterilization Method", fieldType: "dropdown", options: ["Autoclavable", "EO Gas", "Gamma Radiation"], required: true }
        ]
      },
      {
        name: "Patient Monitoring Devices",
        slug: "patient-monitoring-devices",
        customFields: [
          { name: "Parameters Tracked", fieldType: "text", required: true },
          { name: "Display Size (inches)", fieldType: "number", required: false },
          { name: "Battery Life (Hours)", fieldType: "number", required: false }
        ]
      },
      {
        name: "Disposable Medical Supplies",
        slug: "disposable-medical-supplies",
        customFields: [
          { name: "Quantity per Pack", fieldType: "number", required: true },
          { name: "Sterile Status", fieldType: "dropdown", options: ["Sterile", "Non-Sterile"], required: true }
        ]
      }
    ]
  },
  {
    name: "Chemicals & Solvents",
    slug: "chemicals-solvents",
    customFields: [
      { name: "Hazardous Classification", fieldType: "dropdown", options: ["Flammable", "Toxic", "Corrosive", "Non-Hazardous"], required: true }
    ],
    subCategories: [
      {
        name: "Industrial Solvents",
        slug: "industrial-solvents",
        customFields: [
          { name: "Purity (%)", fieldType: "number", required: true },
          { name: "Density (g/cm³)", fieldType: "number", required: false },
          { name: "Boiling Point (°C)", fieldType: "number", required: false }
        ]
      },
      {
        name: "Plastic Raw Materials",
        slug: "plastic-raw-materials",
        customFields: [
          { name: "Density Grade", fieldType: "dropdown", options: ["LDPE", "HDPE", "PP", "PET", "PVC", "PS"], required: true },
          { name: "Melt Flow Index (g/10min)", fieldType: "number", required: true }
        ]
      },
      {
        name: "Agricultural Fertilizers",
        slug: "agricultural-fertilizers",
        customFields: [
          { name: "NPK Ratio", fieldType: "text", required: true },
          { name: "Formulation Type", fieldType: "dropdown", options: ["Granular", "Liquid", "Powder"], required: true }
        ]
      }
    ]
  },
  {
    name: "Packaging Materials",
    slug: "packaging-materials",
    customFields: [
      { name: "Eco-Friendly / Recyclable", fieldType: "checkbox", required: true }
    ],
    subCategories: [
      {
        name: "Corrugated Boxes",
        slug: "corrugated-boxes",
        customFields: [
          { name: "Ply Count", fieldType: "dropdown", options: ["3-Ply", "5-Ply", "7-Ply", "9-Ply"], required: true },
          { name: "Bursting Strength (kg/cm²)", fieldType: "number", required: true },
          { name: "Dimensions (L x W x H inches)", fieldType: "text", required: true }
        ]
      },
      {
        name: "Plastic Packaging Rolls",
        slug: "plastic-packaging-rolls",
        customFields: [
          { name: "Film Thickness (microns)", fieldType: "number", required: true },
          { name: "Roll Width (mm)", fieldType: "number", required: true }
        ]
      },
      {
        name: "Glass Bottles & Jars",
        slug: "glass-bottles-jars",
        customFields: [
          { name: "Volume Capacity (ml)", fieldType: "number", required: true },
          { name: "Neck Size (mm)", fieldType: "number", required: true },
          { name: "Glass Color", fieldType: "dropdown", options: ["Amber", "Clear", "Green", "Cobalt Blue"], required: true }
        ]
      }
    ]
  },
  {
    name: "Automotive Parts & Spares",
    slug: "automotive-parts-spares",
    customFields: [
      { name: "OEM Compatibility Check", fieldType: "checkbox", required: false }
    ],
    subCategories: [
      {
        name: "Engine Components",
        slug: "engine-components",
        customFields: [
          { name: "Engine Displacement (cc)", fieldType: "number", required: false },
          { name: "Fuel Compatibility", fieldType: "dropdown", options: ["Petrol", "Diesel", "CNG", "Electric"], required: true },
          { name: "Material Grade", fieldType: "text", required: true }
        ]
      },
      {
        name: "Brake Systems & Linings",
        slug: "brake-systems-linings",
        customFields: [
          { name: "Friction Coefficient", fieldType: "text", required: false },
          { name: "Backing Plate Type", fieldType: "dropdown", options: ["Steel", "Cast Iron", "Composite"], required: true }
        ]
      },
      {
        name: "Car Batteries",
        slug: "car-batteries",
        customFields: [
          { name: "Capacity (Ah)", fieldType: "number", required: true },
          { name: "Voltage (V)", fieldType: "dropdown", options: ["12V", "24V"], required: true },
          { name: "Warranty (Months)", fieldType: "number", required: true }
        ]
      }
    ]
  },
  {
    name: "Agriculture & Food",
    slug: "agriculture-food",
    customFields: [
      { name: "FSSAI Registered", fieldType: "checkbox", required: true }
    ],
    subCategories: [
      {
        name: "Basmati Rice",
        slug: "basmati-rice",
        customFields: [
          { name: "Grain Length (mm)", fieldType: "number", required: true },
          { name: "Moisture Content (%)", fieldType: "number", required: false },
          { name: "Packaging Size (kg)", fieldType: "dropdown", options: ["5 kg", "10 kg", "25 kg", "50 kg"], required: true }
        ]
      },
      {
        name: "Edible Oils",
        slug: "edible-oils",
        customFields: [
          { name: "Oil Source Type", fieldType: "dropdown", options: ["Mustard", "Soybean", "Sunflower", "Olive", "Palm"], required: true },
          { name: "Pack Volume (L)", fieldType: "number", required: true }
        ]
      },
      {
        name: "Organic Spices",
        slug: "organic-spices",
        customFields: [
          { name: "Spice Form", fieldType: "dropdown", options: ["Whole", "Powdered", "Flakes"], required: true },
          { name: "Packaging Type", fieldType: "dropdown", options: ["Gunny Bag", "Vacuum Packet", "Pouch"], required: true }
        ]
      }
    ]
  },
  {
    name: "Office Supplies & Stationary",
    slug: "office-supplies-stationary",
    customFields: [
      { name: "Recycled Content (%)", fieldType: "number", required: false }
    ],
    subCategories: [
      {
        name: "Copy Paper",
        slug: "copy-paper",
        customFields: [
          { name: "Paper Size", fieldType: "dropdown", options: ["A4", "A3", "Legal", "Letter"], required: true },
          { name: "Brightness Grade (%)", fieldType: "number", required: true },
          { name: "GSM Weight", fieldType: "dropdown", options: ["70 GSM", "75 GSM", "80 GSM", "100 GSM"], required: true }
        ]
      },
      {
        name: "Office Ergonomic Chairs",
        slug: "office-ergonomic-chairs",
        customFields: [
          { name: "Weight Capacity (kg)", fieldType: "number", required: true },
          { name: "Adjustment Mechanisms", fieldType: "text", required: false },
          { name: "Backrest Material", fieldType: "dropdown", options: ["Mesh", "Leatherette", "Fabric"], required: true }
        ]
      },
      {
        name: "Presentation Whiteboards",
        slug: "presentation-whiteboards",
        customFields: [
          { name: "Board Dimensions (ft x ft)", fieldType: "text", required: true },
          { name: "Surface Material", fieldType: "dropdown", options: ["Magnetic Ceramic", "Non-Magnetic Melamine", "Glass"], required: true }
        ]
      }
    ]
  }
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.");

  // Clear existing categories
  console.log("Clearing existing categories...");
  await mongoose.connection.db.collection('categories').deleteMany({});
  console.log("Categories cleared.");

  for (const mainCat of categoriesData) {
    console.log(`Seeding main category: ${mainCat.name}...`);
    
    // Insert main category
    const mainCategoryResult = await mongoose.connection.db.collection('categories').insertOne({
      name: mainCat.name,
      slug: mainCat.slug,
      parentCategory: null,
      customFields: mainCat.customFields,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const parentId = mainCategoryResult.insertedId;

    // Seed subcategories
    for (const subCat of mainCat.subCategories) {
      console.log(`  Seeding sub-category: ${subCat.name}...`);
      await mongoose.connection.db.collection('categories').insertOne({
        name: subCat.name,
        slug: subCat.slug,
        parentCategory: parentId,
        customFields: subCat.customFields,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  await mongoose.connection.close();
  console.log("Categories seeding finished successfully.");
}

seed().catch(err => {
  console.error("Categories seeding error:", err);
  process.exit(1);
});
