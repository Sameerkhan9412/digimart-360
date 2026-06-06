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

const sellerEmail = 'codewithsameer786@gmail.com';

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.");

  // 1. Find User
  const user = await mongoose.connection.db.collection('users').findOne({ email: sellerEmail });
  if (!user) {
    console.error(`User with email '${sellerEmail}' not found!`);
    process.exit(1);
  }

  // 2. Update Seller Profile details
  console.log("Updating Seller profile details...");
  const updateResult = await mongoose.connection.db.collection('sellers').updateOne(
    { user: user._id },
    {
      $set: {
        companyName: "Sameer Enterprises",
        slug: "sameer-enterprises",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
        about: "Sameer Enterprises is a leading manufacturer, global exporter, and supplier of heavy-duty industrial CNC milling machines, automatic liquid filling systems, and high-voltage power distribution transformers. Conforming to ISO 9001 and CE certifications, we focus on engineering excellence, custom attributes flexibility, and dedicated client satisfaction protocols.",
        contactInfo: {
          phone: "9876543210",
          email: sellerEmail,
          address: "Plot No. 42, Industrial Area Phase II, Okhla, New Delhi, 110020, India",
          whatsapp: "9876543210",
          contactPerson: "Sameer"
        },
        isVerified: true,
        verificationStatus: "approved",
        subscriptionPlan: "platinum",
        subscriptionStatus: "active",
        customTheme: {
          primaryColor: "#009E49",
          secondaryColor: "#0F4C5C",
          font: "Outfit",
          layoutVariant: "modern"
        },
        certifications: [
          "ISO 9001:2015 Certified",
          "CE Standard Compliance",
          "WHO-GMP Quality Standard",
          "Dun & Bradstreet Registered"
        ],
        timeline: [
          {
            year: 2018,
            title: "Founding of Sameer Enterprises",
            description: "Established a small workshop in Okhla, New Delhi, specializing in high-voltage transformer repair and retail services."
          },
          {
            year: 2020,
            title: "Manufacturing Expansion",
            description: "Expanded operations into custom packaging machinery, building our first automatic liquid bottling and filling line."
          },
          {
            year: 2023,
            title: "CNC & Heavy Machinery Division",
            description: "Inaugurated a state-of-the-art manufacturing plant for 5-axis vertical CNC milling machines and obtained ISO 9001 certification."
          },
          {
            year: 2025,
            title: "Global B2B Exporter Launch",
            description: "Began export distribution channels across Southeast Asia and the Middle East, serving over 150+ international trade buyers."
          }
        ],
        updatedAt: new Date()
      }
    }
  );

  console.log("Update result:", updateResult);
  await mongoose.connection.close();
  console.log("Seller details updated successfully.");
}

run().catch(err => {
  console.error("Error updating seller details:", err);
  process.exit(1);
});
