#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const readlineSync = require("readline-sync");
const { createFrontend } = require("./frontend");
const { createBackend } = require("./backend");

const createProject = (projectName) => {
  try {
    console.log("🖋️ Created By: dev-prathap (dev.prathap@outlook.com)");

    // Ask for project name if not provided
    if (!projectName) {
      console.log("Please enter your project name:");
      projectName = readlineSync.question("Project Name: ");
    }

    console.log(`🚀 Starting the creation of your project: ${projectName}...`);

    // Create project directory if it doesn't exist
    if (!fs.existsSync(projectName)) {
      console.log("📂 Creating project directory...");
      fs.mkdirSync(projectName);
    }
    process.chdir(projectName);

    // Initialize package.json
    console.log("📄 Initializing package.json...");
    execSync("npm init -y", { stdio: "inherit" });

    // Frontend Setup
    console.log("⚙️ Setting up the frontend...");
    createFrontend(); // Assuming this function takes care of frontend creation

    // Ask for backend technology choice
    const setupBackendChoice = readlineSync.keyInSelect(
      ["Express", "Node.js with MongoDB", "Django (Python)", "None (Frontend only)"],
      "Which backend technology would you like to use? 🤔"
    );

    let backendChoice;
    switch (setupBackendChoice) {
      case 0:
        backendChoice = "express";
        break;
      case 1:
        backendChoice = "node-mongo";
        break;
      case 2:
        backendChoice = "django";
        break;
      case 3:
        backendChoice = null;
        break;
      default:
        console.log("❌ No backend selected, proceeding with frontend only.");
        backendChoice = null;
    }

    // Ask for TailwindCSS setup
    const useTailwindCSS = readlineSync.keyInYNStrict("🎨 Would you like to add TailwindCSS for styling?");

    // Ask if the user wants a database setup (only if backend is chosen)
    const setupDatabase = backendChoice ? readlineSync.keyInYNStrict("💾 Would you like to set up a database for your backend?") : false;

    // Set up backend only if selected
    if (backendChoice) {
      console.log("⚙️ Setting up the backend...");
      fs.mkdirSync("backend");
      createBackend(backendChoice, setupDatabase); // This function handles backend creation
    }

    // Additional Libraries/Features
    const additionalLibraries = readlineSync.keyInYNStrict("📚 Would you like to add additional libraries (e.g., JWT, Passport, etc.)?");

    if (additionalLibraries) {
      console.log("🔧 Installing additional libraries...");
      // Example of installing libraries (you can customize this based on selected libraries)
      execSync("npm install jsonwebtoken passport", { stdio: "inherit" });
      console.log("✅ Additional libraries installed successfully.");
    }

    console.log("✅ Project created successfully!");
    displayRunInstructions();

    // Provide deployment options (Heroku, Render, DigitalOcean)
    const deploymentChoice = readlineSync.keyInSelect(
      ["Heroku", "Render", "DigitalOcean", "None (Skip deployment)"],
      "🌍 Would you like to deploy your app?"
    );

    if (deploymentChoice !== -1) {
      handleDeployment(deploymentChoice);
    }

  } catch (error) {
    console.error("❌ Error creating the project:", error.message);
    process.exit(1);
  }
};

const displayRunInstructions = () => {
  console.log(` 
    🎉 Project Setup Complete! 🎉

    👉 Frontend:
      - Navigate to the frontend folder: 'cd frontend'
      - Start the frontend with 'npm run dev' (use 'yarn dev' if you prefer Yarn)

    👉 Backend:
      - Navigate to the backend folder: 'cd backend'
      - Start the backend server with 'npm run dev' (or use nodemon for auto-reloading)

    🔄 Ensure both the frontend and backend are running simultaneously for a full-stack experience.

    **Additional Notes:**
    - If you set up a database, please configure the connection settings in the backend folder.
    - TailwindCSS has been set up (if selected) and is ready for styling.
  `);
};

const handleDeployment = (choice) => {
  let deploymentPlatform;
  switch (choice) {
    case 0:
      deploymentPlatform = "Heroku";
      break;
    case 1:
      deploymentPlatform = "Render";
      break;
    case 2:
      deploymentPlatform = "DigitalOcean";
      break;
    default:
      console.log("Skipping deployment.");
      return;
  }

  console.log(`🚀 Preparing to deploy on ${deploymentPlatform}...`);

  // Add deployment steps based on the platform (for now, provide simple instructions)
  if (deploymentPlatform === "Heroku") {
    console.log(`
      1. Make sure you have the Heroku CLI installed.
      2. Login to your Heroku account: 'heroku login'
      3. Create a new Heroku app: 'heroku create <app-name>'
      4. Push your code to Heroku: 'git push heroku main'
      5. Open your app: 'heroku open'
    `);
  } else if (deploymentPlatform === "Render") {
    console.log(`
      1. Create a Render account at https://render.com
      2. Link your GitHub repository to Render
      3. Deploy your app using the Render dashboard
      4. Follow the Render documentation for setup and environment variables
    `);
  } else if (deploymentPlatform === "DigitalOcean") {
    console.log(`
      1. Create an account on DigitalOcean: https://www.digitalocean.com
      2. Set up a Droplet or App Platform for your app.
      3. Push your code to your server or use the App Platform deployment guide.
    `);
  }
};

// Handling Ctrl+C press
process.on('SIGINT', () => {
  console.log("\n🚨 Project creation has been canceled.");
  process.exit(0);
});

const args = process.argv.slice(2);
const projectName = args[0] || "";

// Start the project creation process
createProject(projectName);
