const prettierConfig = "{}";
const prettierIgnoreConfig = "# Ignore artifacts:\nbuild\ncoverage";
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
    cy.visit("/");
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
const gitIgnoreConfig = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage
/.nyc_output

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
const huskyPreCommit = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format`;
const huskyPrePush = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

CI=true npm test && npm run cy`;
export const files = [
  {
    file: ".prettierrc",
    content: prettierConfig,
  },
  {
    file: ".eslintrc",
    content: eslintConfig,
  },
  {
    file: ".prettierignore",
    content: prettierIgnoreConfig,
  },
  {
    file: "cypress/component/ComponentName.cy.ts",
    content: cyComponentName,
  },
  {
    file: "cypress/e2e/spec.cy.ts",
    content: cySpec,
  },
  {
    file: "cypress/fixtures/example.json",
    content: cyExample,
  },
  {
    file: "cypress/support/commands.ts",
    content: cyCommands,
  },
  {
    file: "cypress/support/component-index.html",
    content: cyComponentIndex,
  },
  {
    file: "cypress/support/component.ts",
    content: cyComponent,
  },
  {
    file: "cypress/support/e2e.ts",
    content: cyE2e,
  },
  {
    file: "cypress/.eslintrc",
    content: cyEslintrc,
  },
  {
    file: "cypress/tsconfig.json",
    content: cyTsconfig,
  },
  {
    file: "cypress.config.ts",
    content: cyCypressConfig,
  },
  {
    file: ".gitignore",
    content: gitIgnoreConfig,
  },
  {
    file: ".husky/pre-commit",
    content: huskyPreCommit,
  },
  {
    file: ".husky/pre-push",
    content: huskyPrePush,
  },
];
export const npmScripts = {
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
export const dependencies = [
  "@cypress/code-coverage@3.10.0",
  "@cypress/instrument-cra@1.4.0",
  "@frsource/cypress-plugin-visual-regression-diff@3.2.8",
  "@testing-library/cypress@9.0.0",
  "@testing-library/jest-dom@5.16.5",
  "@testing-library/react@13.4.0",
  "@testing-library/user-event@14.4.3",
  "@types/jest@29.2.5",
  "@types/node@18.11.18",
  "@types/react@18.0.26",
  "@types/react-dom@18.0.10",
  "cross-env@7.0.3",
  "cypress@12.3.0",
  "eslint-config-prettier@8.6.0",
  "eslint-plugin-cypress@2.12.1",
  "eslint-plugin-simple-import-sort@9.0.0",
  "husky@8.0.3",
  "prettier@2.8.3",
  "react-scripts@5.0.1",
  "start-server-and-test@1.15.2",
  "typescript@4.9.4",
  "web-vitals@3.1.1",
];
