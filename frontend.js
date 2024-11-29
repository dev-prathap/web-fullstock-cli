const { execSync } = require("child_process");
const readlineSync = require("readline-sync");
const fs = require("fs");

const createFrontend = () => {
  try {
    console.log("📂 Setting up frontend...");

    // Step 1: Choose the frontend framework
    const frontendChoice = readlineSync.keyInSelect(
      ["Next.js", "React", "Vue"],
      "Choose frontend framework:"
    );

    let frontendFramework;
    switch (frontendChoice) {
      case 0:
        frontendFramework = "nextjs";
        break;
      case 1:
        frontendFramework = "react";
        break;
      case 2:
        frontendFramework = "vue";
        break;
      default:
        console.log("No selection made, defaulting to Next.js.");
        frontendFramework = "nextjs";
    }

    // Step 2: Install the selected frontend framework
    console.log(`🚀 Installing ${frontendFramework}...`);
    switch (frontendFramework) {
      case "nextjs":
        execSync("npx create-next-app@latest frontend --use-npm", { stdio: "inherit" });
        break;
      case "react":
        execSync("npx create-react-app frontend", { stdio: "inherit" });
        break;
      case "vue":
        execSync("npm init vue@latest frontend", { stdio: "inherit" });
        break;
    }

    // Step 3: Change directory to frontend
    process.chdir("frontend");

    // Step 4: Install TailwindCSS and initialize config
    console.log("📦 Installing TailwindCSS and initializing config...");
    execSync("npm install tailwindcss postcss autoprefixer", { stdio: "inherit" });
    execSync("npx tailwindcss init", { stdio: "inherit" });

    // Step 5: Ask user for additional libraries installation (Redux, Axios, React Icons)
    const installRedux = readlineSync.keyInYNStrict("Would you like to install Redux?");
    const installAxios = readlineSync.keyInYNStrict("Would you like to install Axios?");
    const installReactIcons = readlineSync.keyInYNStrict("Would you like to install React Icons?");

    let dependencies = [];
    if (installRedux) {
      dependencies.push("redux", "react-redux", "@reduxjs/toolkit");
    }
    if (installAxios) {
      dependencies.push("axios");
    }
    if (installReactIcons) {
      dependencies.push("react-icons");
    }

    // Step 6: Install selected dependencies
    if (dependencies.length > 0) {
      console.log("📦 Installing selected dependencies...");
      execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
    }

    // Step 7: Create folder structure
    console.log("📂 Creating folder structure...");
    const folders = ["components", "auth", "pages", "styles", "assets"];
    folders.forEach((folder) => fs.mkdirSync(folder, { recursive: true }));

    // Step 8: Set up Home page content
    console.log("📝 Setting up Home page...");
    const homePageContent = `
    export default function Home() {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-4xl font-bold text-center text-blue-600">
            CREATED BY Prathap
          </h1>
          <p className="mt-4 text-lg text-center text-gray-700">
            Welcome to your user-friendly frontend setup. This page is customizable.
          </p>
        </div>
      );
    }
    `;
    fs.writeFileSync("pages/index.js", homePageContent);

    // Step 9: Set up Button component
    console.log("📝 Setting up Button component...");
    const buttonComponentContent = `
    export default function Button({ label, onClick }) {
      return (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onClick}
        >
          {label}
        </button>
      );
    }
    `;
    fs.writeFileSync("components/Button.js", buttonComponentContent);

    // Step 10: Set up basic AuthForm component
    console.log("📝 Setting up AuthForm component...");
    const authComponentContent = `
    import { useState } from "react";

    export default function AuthForm() {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");

      const handleSubmit = (e) => {
        e.preventDefault();
        alert(\`Email: \${email}, Password: \${password}\`);
      };

      return (
        <div className="max-w-md mx-auto mt-10 p-4 border border-gray-300 rounded">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Login
            </button>
          </form>
        </div>
      );
    }
    `;
    fs.writeFileSync("auth/AuthForm.js", authComponentContent);

    // Step 11: Set up Tailwind CSS configuration
    console.log("📝 Setting up TailwindCSS configuration...");
    const tailwindConfigContent = `
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./auth/**/*.{js,ts,jsx,tsx}"
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    };
    `;
    fs.writeFileSync("tailwind.config.js", tailwindConfigContent);

    // Step 12: Create custom global styles for TailwindCSS
    console.log("📝 Creating global styles...");
    const globalStylesContent = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Additional custom styles */
    body {
      font-family: 'Arial', sans-serif;
    }
    `;
    fs.writeFileSync("styles/globals.css", globalStylesContent);

    // Step 13: Set up Redux if selected
    if (installRedux) {
      console.log("📝 Setting up Redux...");
      const reduxConfigContent = `
      import { createStore } from "redux";
      import { Provider } from "react-redux";

      const rootReducer = (state = {}, action) => {
        switch (action.type) {
          case "SET_USER":
            return { ...state, user: action.payload };
          default:
            return state;
        }
      };

      const store = createStore(rootReducer);

      function MyApp({ Component, pageProps }) {
        return (
          <Provider store={store}>
            <Component {...pageProps} />
          </Provider>
        );
      }

      export default MyApp;
      `;
      fs.writeFileSync("pages/_app.js", reduxConfigContent);
    }

    // Step 14: Final message and move back to root folder
    console.log("✅ Frontend setup complete!");
    process.chdir("../");

  } catch (error) {
    console.error("❌ Error setting up frontend:", error.message);
    process.exit(1);
  }
};

module.exports = { createFrontend };
