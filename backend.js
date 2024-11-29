const fs = require("fs");
const { execSync } = require("child_process");
const readlineSync = require("readline-sync");

const createBackend = () => {
  try {
    console.log("📂 Setting up backend...");

    // Choose the backend framework
    const backendChoice = readlineSync.keyInSelect(
      ["Express", "Koa", "Fastify"],
      "Choose backend framework:"
    );

    let backendFramework;
    switch (backendChoice) {
      case 0:
        backendFramework = "express";
        break;
      case 1:
        backendFramework = "koa";
        break;
      case 2:
        backendFramework = "fastify";
        break;
      default:
        console.log("❌ No selection made, defaulting to Express.");
        backendFramework = "express";
    }

    // Choose the database (MongoDB, MySQL, PostgreSQL)
    const dbChoice = readlineSync.keyInSelect(
      ["MongoDB", "MySQL", "PostgreSQL"],
      "Choose database:"
    );

    let database;
    switch (dbChoice) {
      case 0:
        database = "mongodb";
        break;
      case 1:
        database = "mysql";
        break;
      case 2:
        database = "postgresql";
        break;
      default:
        console.log("❌ No selection made, defaulting to MongoDB.");
        database = "mongodb";
    }

    process.chdir("backend");

    // Basic dependencies for Express, Mongoose, dotenv, bcryptjs, and database-specific libraries
    const packageJson = {
      name: "backend",
      version: "1.0.0",
      main: "server.js",
      dependencies: {
        dotenv: "^10.0.0",
        bcryptjs: "^2.4.3",
        jsonwebtoken: "^8.5.1",
        express: "^4.18.2", // Default to Express
      },
    };

    // Add database-specific dependencies
    if (database === "mongodb") {
      packageJson.dependencies.mongoose = "^6.7.0";
    } else if (database === "mysql") {
      packageJson.dependencies.mysql2 = "^2.3.3";
    } else if (database === "postgresql") {
      packageJson.dependencies.pg = "^8.8.0";
    }

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

    // Install dependencies
    console.log("🔧 Installing dependencies...");
    execSync("npm install", { stdio: "inherit" });

    // Create folder structure
    const folders = [
      "config",
      "controllers",
      "middleware",
      "models",
      "routes",
      "services",
      "utils",
      "public/uploads",
      "public/assets",
      "tests",
      "logs"
    ];
    folders.forEach(folder => fs.mkdirSync(folder, { recursive: true }));

    // Create .env file for environment variables
    const envContent = `
    DB_URI=${database === 'mongodb' ? 'mongodb://localhost:27017/your_db_name' : ''}
    JWT_SECRET=your_jwt_secret_key
    PORT=3000
    `;
    fs.writeFileSync(".env", envContent);

    // Create basic server.js for Express with database connection
    const serverContent = `
    const express = require('express');
    const dotenv = require('dotenv');
    const mongoose = require('mongoose');
    const { Client } = require('pg');
    const mysql = require('mysql2');
    
    dotenv.config();
    const app = express();
    app.use(express.json());

    // Connect to the database
    let dbConnection;
    if (process.env.DB_URI) {
      mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('🟢 Database connected (MongoDB)'))
        .catch(err => console.log('❌ Error connecting to database: ', err));
    } else {
      // Handle different databases (PostgreSQL, MySQL)
      if (process.env.DB_TYPE === 'postgresql') {
        dbConnection = new Client({ connectionString: process.env.DB_URI });
        dbConnection.connect().then(() => console.log("🟢 PostgreSQL connected")).catch(err => console.error(err));
      } else if (process.env.DB_TYPE === 'mysql') {
        dbConnection = mysql.createConnection(process.env.DB_URI);
        dbConnection.connect(err => {
          if (err) console.error('❌ Error connecting to MySQL:', err.stack);
          else console.log('🟢 MySQL connected');
        });
      }
    }

    // User routes
    const userRoutes = require('./routes/userRoutes');
    app.use('/api/users', userRoutes);

    // Start server
    app.listen(process.env.PORT || 3000, () => {
      console.log("🟢 Server running on port " + (process.env.PORT || 3000));
    });
    `;
    fs.writeFileSync("server.js", serverContent);

    // Create user model (with basic permissions)
    const userModelContent = `
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');

    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, default: 'user' }, // 'admin', 'user'
    });

    // Password hashing middleware
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      this.password = await bcrypt.hash(this.password, 10);
      next();
    });

    userSchema.methods.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    module.exports = mongoose.model('User', userSchema);
    `;
    fs.writeFileSync("models/user.js", userModelContent);

    // Create auth middleware (JWT authentication)
    const authMiddlewareContent = `
    const jwt = require('jsonwebtoken');
    const User = require('../models/user');

    const protect = async (req, res, next) => {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = await User.findById(decoded.id);
          next();
        } catch (error) {
          res.status(401).json({ message: '❌ Not authorized, token failed' });
        }
      }
      if (!token) {
        res.status(401).json({ message: '❌ Not authorized, no token' });
      }
    };

    const admin = (req, res, next) => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ message: '❌ Not authorized as admin' });
      }
    };

    module.exports = { protect, admin };
    `;
    fs.writeFileSync("middleware/authMiddleware.js", authMiddlewareContent);

    // Create user routes (with basic CRUD and auth protection)
    const userRoutesContent = `
    const express = require('express');
    const router = express.Router();
    const { protect, admin } = require('../middleware/authMiddleware');
    const User = require('../models/user');

    // Register a user
    router.post('/register', async (req, res) => {
      const { name, email, password } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: '❌ User already exists' });

      const user = new User({ name, email, password });
      await user.save();
      res.status(201).json({ message: '✅ User registered successfully' });
    });

    // Login a user
    router.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: '❌ Invalid credentials' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(400).json({ message: '❌ Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ token });
    });

    // List all users (new functionality)
    router.get('/list', async (req, res) => {
      const users = await User.find();
      if (users.length === 0) {
        res.status(404).json({ message: '❌ No users found' });
      } else {
        res.status(200).json({ users });
      }
    });

    module.exports = router;
    `;
    fs.writeFileSync("routes/userRoutes.js", userRoutesContent);

    console.log("✅ Backend setup complete!");

  } catch (err) {
    console.log("❌ Error:", err);
  }
};

// Call the function to initiate backend setup
createBackend();
