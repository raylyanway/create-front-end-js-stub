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
const cyComponentName = `describe('ComponentName.cy.ts', () => {
  it('playground', () => {
    // cy.mount()
  })
})`;
const cySpec = `describe('empty spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
})`;
const cyExample = `{
  "name": "Using fixtures to represent data",
  "email": "hello@cypress.io",
  "body": "Fixtures are a great way to mock data for responses to routes"
}`;
const cyCommands = `/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import "@frsource/cypress-plugin-visual-regression-diff";
import "@cypress/code-coverage/support";`;
const cyComponentIndex = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Components App</title>
  </head>
  <body>
    <div data-cy-root></div>
  </body>
</html>`;
const cyComponent = `// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// Alternatively you can use CommonJS syntax:
// require('./commands')
import { mount } from "cypress/react18";

import "./commands";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);

// Example use:
// cy.mount(<MyComponent />)
`;
const cyE2e = `// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')`;
const cyEslintrc = `{
  "extends": ["plugin:cypress/recommended"]
}`;
const cyTsconfig = `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"]
  },
  "include": ["**/*.ts"]
}`;
const cyCypressConfig = `import codeCoverage from "@cypress/code-coverage/task";
import { initPlugin } from "@frsource/cypress-plugin-visual-regression-diff/plugins";
import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  env: {
    pluginVisualRegressionCleanupUnusedImages: false,
  },
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {
      initPlugin(on, config);
      codeCoverage(on, config);

      return config;
    },
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      initPlugin(on, config);
      codeCoverage(on, config);

      return config;
    },
  },
});`;

function run() {
  try {
    const intervalId = updateProgress({ max: 70 });
    exec(`npx create-react-app ${projectName} --template typescript`, () => {
      clearInterval(intervalId);
      const intervalId1 = updateProgress({ start: 71, max: 90 });
      process.chdir(`./${projectName}`);
      exec(
        "npm i -D react-scripts @testing-library/jest-dom @testing-library/react " +
          "@testing-library/user-event @types/jest @types/node @types/react " +
          "@types/react-dom typescript web-vitals prettier eslint-config-prettier " +
          "eslint-plugin-simple-import-sort cypress @testing-library/cypress " +
          "@frsource/cypress-plugin-visual-regression-diff eslint-plugin-cypress " +
          "@cypress/code-coverage @cypress/instrument-cra cross-env " +
          "start-server-and-test husky",
        () => {
          clearInterval(intervalId1);
          execSync("npx husky install");
          execSync('npx husky add .husky/pre-commit "npm run format"');
          execSync(
            'npx husky add .husky/pre-push "CI=true npm test && npm run cy"'
          );
          const intervalId2 = updateProgress({ start: 91, max: 95 });
          updatePackageJson();
          clearInterval(intervalId2);
          const intervalId3 = updateProgress({ start: 96, max: 98 });
          createAdditionalFiles();
          clearInterval(intervalId3);
          const intervalId4 = updateProgress({ start: 99, max: 100 });
          execSync("npx eslint --fix src");
          execSync("git config core.autocrlf false");
          execSync("git add .");
          execSync('git commit -m "init configuration" -n');
          execSync("git config core.autocrlf true");
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
  fs.outputFileSync(path.join(root, ".prettierrc"), prettierConfig + os.EOL);

  fs.outputFileSync(path.join(root, ".eslintrc"), eslintConfig + os.EOL);

  fs.outputFileSync(
    path.join(root, ".prettierignore"),
    prettierIgnoreConfig + os.EOL
  );

  fs.outputFileSync(
    path.join(root, "cypress/component/ComponentName.cy.ts"),
    cyComponentName + os.EOL
  );

  fs.outputFileSync(
    path.join(root, "cypress/component/ComponentName.cy.ts"),
    cyComponentName + os.EOL
  );

  fs.outputFileSync(path.join(root, "cypress/e2e/spec.cy.ts"), cySpec + os.EOL);

  fs.outputFileSync(
    path.join(root, "cypress/fixtures/example.json"),
    cyExample + os.EOL
  );

  fs.outputFileSync(
    path.join(root, "cypress/support/commands.ts"),
    cyCommands + os.EOL
  );

  fs.outputFileSync(
    path.join(root, "cypress/support/component-index.html"),
    cyComponentIndex + os.EOL
  );

  fs.outputFileSync(
    path.join(root, "cypress/support/component.ts"),
    cyComponent + os.EOL
  );

  fs.outputFileSync(path.join(root, "cypress/support/e2e.ts"), cyE2e + os.EOL);

  fs.outputFileSync(path.join(root, "cypress/.eslintrc"), cyEslintrc + os.EOL);

  fs.outputFileSync(
    path.join(root, "cypress/tsconfig.json"),
    cyTsconfig + os.EOL
  );
  fs.outputFileSync(
    path.join(root, "cypress.config.ts"),
    cyCypressConfig + os.EOL
  );

  fs.appendFileSync(path.join(root, ".gitignore"), gitIgnoreConfig + os.EOL);
}

run();
