#!/usr/bin/env node

console.log("Update starts...");
console.log(333);

const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const execSync = require("child_process").execSync;
const yargs = require("yargs");
const cliProgress = require("cli-progress");
// const packageJson = require("./package.json");

if (yargs.argv["_"].length === 0) {
  console.error("set project names");
  process.exit(1);
}
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar1.start(200, 0);

const projectName = yargs.argv["_"][0];
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

function install() {
  try {
    execSync(`npx create-react-app ${projectName} --template typescript`);
    updatePackageJson();
    createAdditionalFiles();
  } catch (e) {
    return;
  }
}

function updatePackageJson() {
  bar1.update(100);
  console.log(333);
  const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf8");
  console.log(11, packageJson);

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
  bar1.update(200);
  fs.writeFileSync(path.join(root, ".prettierrc"), prettierConfig + os.EOL);

  fs.writeFileSync(path.join(root, ".eslintrc"), eslintConfig + os.EOL);

  fs.writeFileSync(
    path.join(root, ".prettierignore"),
    prettierIgnoreConfig + os.EOL
  );

  fs.appendFile(path.join(root, ".gitignore"), gitIgnoreConfig + os.EOL);
}

install();

bar1.stop();
console.log("Update finished.");
