import bcrypt from "bcrypt";
import { sequelize } from "../config/database.js";
import { User } from "../models/index.js";

const setupTestAccounts = async () => {
  try {
    await sequelize.authenticate();
    console.log("🔥 Database connected. Setting up test accounts...");

    const accounts = [
      {
        username: "Main Admin",
        email: "admin@library.com",
        password: "admin123",
        role: "admin",
        storeName: "Platform Official",
        isVerified: true,
        isBlocked: false,
      },
      {
        username: "Test Seller",
        email: "seller@library.com",
        password: "seller123",
        role: "seller",
        storeName: "The Vintage Page",
        isVerified: true,
        isBlocked: false,
      },
      {
        username: "Test Customer",
        email: "customer@library.com",
        password: "customer123",
        role: "customer",
        storeName: null,
        isVerified: true,
        isBlocked: false,
      },
    ];

    for (const acc of accounts) {
      let user = await User.findOne({ where: { email: acc.email } });
      const hashedPassword = await bcrypt.hash(acc.password, 10);

      if (user) {
        // If it exists, update it to make sure the passwords and roles are perfect
        user.password = hashedPassword;
        user.role = acc.role;
        user.storeName = acc.storeName;
        user.isVerified = true;
        user.isBlocked = false;
        await user.save();
        console.log(
          `✅ Updated existing account: ${acc.email} (Role: ${acc.role})`,
        );
      } else {
        // If it doesn't exist, create it
        await User.create({
          ...acc,
          password: hashedPassword,
        });
        console.log(`✅ Created new account: ${acc.email} (Role: ${acc.role})`);
      }
    }

    console.log("\n🎉 All 3 test accounts are ready!");
    console.log("-----------------------------------------");
    console.log("👑 ADMIN:    admin@library.com    / admin123");
    console.log("🏪 SELLER:   seller@library.com   / seller123");
    console.log("🛒 CUSTOMER: customer@library.com / customer123");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to set up accounts:", err);
    process.exit(1);
  }
};

setupTestAccounts();
