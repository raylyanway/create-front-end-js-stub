#!/usr/bin/env node

import chalk from "chalk";
import { exec, execSync } from "child_process";
import cliProgress from "cli-progress";
import fs from "fs-extra";
import os from "os";
import path from "path";
import process from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).argv;
if (argv["_"].length === 0) {
  console.error("set project names");
  process.exit(1);
}

const bar1 = new cliProgress.SingleBar(
  {
    hideCursor: true,
    barCompleteChar: "\u2588",
  },
  cliProgress.Presets.shades_classic
);
bar1.start(100, 0);

const projectName = argv["_"][0];
const root = path.resolve(projectName);
const prettierConfig = "{}";
const prettierIgnoreConfig = "# Ignore artifacts:\nbuild\ncoverage";
const gitIgnoreConfig = "/.nyc_output";
const eslintConfig = `{
  "extends": ["react-app", "react-app/jest", "prettier"],
  "plugins": ["simple-import-sort", "import"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error"
  },
  "overrides": [
    // override "simple-import-sort" config
    {
      "files": ["*.js", "*.jsx", "*.ts", "*.tsx"],
      "rules": {
        "simple-import-sort/imports": [
          "error",
          {
            "groups": [
              // Packages "react" related packages come first.
              ["^react", "^@?\\\\w"],
              // Side effect imports.
              ["^\\\\u0000"],
              // Internal packages.
              ["^(@|components)(/.*|$)"],
              // Parent imports. Put ".." last.
              ["^\\\\.\\\\.(?!/?$)", "^\\\\.\\\\./?$"],
              // Other relative imports. Put same-folder imports and "." last.
              ["^\\\\./(?=.*/)(?!/?$)", "^\\\\.(?!/?$)", "^\\\\./?$"],
              // Style imports.
              ["^.+\\\\.?(css)$"]
            ]
          }
        ]
      }
    }
  ]
}`;

function run() {
  try {
    const intervalId = updateProgress({ max: 70 });
    exec(`npx create-react-app ${projectName} --template typescript`, () => {
      clearInterval(intervalId);
      const intervalId1 = updateProgress({ start: 71, max: 90 });
      exec(
        `npm --prefix ./${projectName}/ i -D @testing-library/jest-dom @testing-library/react ` +
          "@testing-library/user-event @types/jest @types/node @types/react " +
          "@types/react-dom typescript web-vitals prettier eslint-config-prettier " +
          "eslint-plugin-simple-import-sort cypress @testing-library/cypress " +
          "@frsource/cypress-plugin-visual-regression-diff eslint-plugin-cypress " +
          "@cypress/code-coverage @cypress/instrument-cra cross-env " +
          "start-server-and-test husky",
        () => {
          clearInterval(intervalId1);
          const intervalId2 = updateProgress({ start: 91, max: 95 });
          updatePackageJson();
          clearInterval(intervalId2);
          const intervalId3 = updateProgress({ start: 96, max: 98 });
          createAdditionalFiles();
          clearInterval(intervalId3);
          const intervalId4 = updateProgress({ start: 99, max: 100 });
          process.chdir(`./${projectName}`);
          execSync("npx husky install");
          execSync('npx husky add .husky/pre-commit "npm run format"');
          execSync(
            'npx husky add .husky/pre-push "CI=true npm test && npm run cy"'
          );
          clearInterval(intervalId4);
          bar1.update(100);
          bar1.stop();
          console.log(`${chalk.cyan("Configuration is completed.")}`);
        }
      );
    });
  } catch (e) {
    return;
  }
}

function updateProgress({ max = 100, start = 0, step = 1 }) {
  let current = start;
  bar1.update(current);

  const intervalId = setInterval(() => {
    current += step;
    bar1.update(current);
    if (current === max) {
      clearInterval(intervalId);
    }
  }, 1000);

  return intervalId;
}

function updatePackageJson() {
  const packageJsonRow = fs.readFileSync(
    path.join(root, "package.json"),
    "utf8"
  );
  const packageJson = JSON.parse(packageJsonRow);

  packageJson.scripts = {
    ...packageJson.scripts,
    cy: "start-server-and-test cy:server 3000 cy:run",
    "cy:dev": "start-server-and-test cy:server 3000 cy:open",
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:server":
      "cross-env NODE_ENV=test BROWSER=none react-scripts -r @cypress/instrument-cra start",
    format: "npm run prettier:fix && npm run lint:fix",
    lint: "npx eslint src",
    "lint:fix": "npm run lint -- --fix",
    prepare: "husky install",
    prettier: "npx prettier src --check",
    "prettier:fix": "npm run prettier -- --write",
  };

  if (packageJson.eslintConfig) {
    delete packageJson.eslintConfig;
  }

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
}

function createAdditionalFiles() {
  fs.writeFileSync(path.join(root, ".prettierrc"), prettierConfig + os.EOL);

  fs.writeFileSync(path.join(root, ".eslintrc"), eslintConfig + os.EOL);

  fs.writeFileSync(
    path.join(root, ".prettierignore"),
    prettierIgnoreConfig + os.EOL
  );

  fs.appendFile(path.join(root, ".gitignore"), gitIgnoreConfig + os.EOL);
}

run();
