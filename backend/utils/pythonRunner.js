const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const backendRoot = path.join(__dirname, "..");
const localPythonBin = path.join(backendRoot, "venv", "bin", "python");
const pythonBin =
  process.env.PYTHON_BIN ||
  (fs.existsSync(localPythonBin) ? localPythonBin : "python3");

const extractFeaturesScript = path.join(
  backendRoot,
  "ml_model",
  "extract_features.py"
);

const extractImageFeatures = (imageUrl) =>
  new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonBin, [extractFeaturesScript, imageUrl], {
      cwd: backendRoot,
    });

    let resultData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(
        new Error(
          `Could not start Python feature extraction with "${pythonBin}": ${error.message}`
        )
      );
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(errorData || `Feature extraction exited with code ${code}`)
        );
      }

      try {
        resolve(JSON.parse(resultData));
      } catch (error) {
        reject(new Error(`Invalid feature extraction output: ${error.message}`));
      }
    });
  });

module.exports = {
  extractImageFeatures,
  pythonBin,
};
