const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Retrieve stack outputs
const outputs = JSON.parse(
    execSync("sst outputs --stage prod", { encoding: "utf-8" })
);

// Get the API endpoint from the outputs
const resolvedApiUrl = outputs.ApiEndpoint;

// Write the environment variables to the .env file
const environment = {
    EXPO_PUBLIC_PROD_API_URL: resolvedApiUrl,
};

const expoEnvPath = path.resolve(__dirname, "packages/expo-app/.env");
const envContent = Object.entries(environment)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

fs.writeFileSync(expoEnvPath, envContent);

console.log(`Environment variables written to ${expoEnvPath}`);
