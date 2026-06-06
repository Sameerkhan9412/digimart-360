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

const adminEmail = 'admin@digimart360.com';
const adminPassword = 'AdminPassword123';
const adminName = 'Admin Digimart';

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.");

  // Check if admin already exists
  const existingUser = await mongoose.connection.db.collection('users').findOne({ email: adminEmail });
  if (existingUser) {
    console.log("Admin user already exists:", existingUser.email);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await mongoose.connection.db.collection('users').updateOne(
      { email: adminEmail },
      { $set: { passwordHash, role: 'admin', isVerified: true, name: adminName } }
    );
    console.log("Updated admin credentials successfully.");
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await mongoose.connection.db.collection('users').insertOne({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Seeded new admin user successfully.");
  }

  await mongoose.connection.close();
  console.log("Done.");
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
