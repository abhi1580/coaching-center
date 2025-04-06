import fs from "fs";
import path from "path";

const baseDir = "src";

// Function to process a JavaScript file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Replace console.log statements
    const logRegex = /\s*console\.log\(.*?\);?\n?/g;
    content = content.replace(logRegex, "");

    // Replace console.error statements
    const errorRegex = /\s*console\.error\(.*?\);?\n?/g;
    content = content.replace(errorRegex, "");

    // Remove commented out console logs
    const commentedLogRegex = /\s*\/\/\s*console\.(log|error)\(.*\n?/g;
    content = content.replace(commentedLogRegex, "");

    // Write back to file
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Function to recursively process directories
function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (path.extname(file) === ".js") {
      processFile(fullPath);
    }
  }
}

// Start processing from the base directory
console.log("Starting to remove console statements from JS files...");
processDirectory(baseDir);
console.log("Completed removing console statements.");
