# create-front-end-js-stub

This package helps to configure a front-end stub app.
Based on create-react-app it configure:

- formatter (Prettier)
- linter, import / export sorting (Eslint)
- e2e testing, visual snapshots, coverage (Cypress)
- pre-commit / pre-push hooks (Husky)

## Auto installation

Run command:

`npx create-front-end-js-stub <projectName>`

## Manual installation

### Preparation

Install:

- [Code editor](https://code.visualstudio.com/)
- [Nodejs v16.19.0 LTS version](https://nodejs.org/en/). To get v16.19.0 use [nvm](https://github.com/nvm-sh/nvm)
- [Git](https://git-scm.com/)

Set vscode extensions (just copy/paste all rows below in search bar):

```
dbaeumer.vscode-eslint
esbenp.prettier-vscode
rangav.vscode-thunder-client
richie5um2.vscode-sort-json
rohit-gohri.format-code-action
streetsidesoftware.code-spell-checker
yzhang.markdown-all-in-one
```

Set vscode settings:

```
{
  // Runs Prettier, then ESLint
  "editor.codeActionsOnSave": ["source.formatDocument", "source.fixAll.eslint"],
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": false,
  "editor.tabSize": 2,
  "window.zoomLevel": 2,
  "workbench.colorTheme": "Default Dark+"
}
```

### Create new project

`npx create-react-app name-of-your-app --template typescript`

Move dev dependency:

`npm i -D react-scripts @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest @types/node @types/react @types/react-dom typescript web-vitals`

### Install prettier

`npm i -D prettier eslint-config-prettier`

Add in `package.json` file:

```
"scripts": {
  "lint": "npx eslint src",
  "lint:fix": "npm run lint -- --fix",
  "prettier": "npx prettier src --check",
  "prettier:fix": "npm run prettier -- --write",
  "format": "npm run prettier:fix && npm run lint:fix"
}
```

Delete from `package.json` file:

```
"eslintConfig": {
  "extends": [
    "react-app",
    "react-app/jest"
  ]
}
```

Add files in the root of the project:

- .prettierrc

```
{}
```

- .eslintrc

```
{
  "extends": ["react-app", "react-app/jest", "prettier"]
}
```

- .prettierignore

```
# Ignore artifacts:
build
coverage
```

### Add import sort plugin

`npm i -D eslint-plugin-simple-import-sort`

Add in `.eslintrc` file:

```
{
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
              // Packages `react` related packages come first.
              ["^react", "^@?\\w"],
              // Side effect imports.
              ["^\\u0000"],
              // Internal packages.
              ["^(@|components)(/.*|$)"],
              // Parent imports. Put `..` last.
              ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
              // Other relative imports. Put same-folder imports and `.` last.
              ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
              // Style imports.
              ["^.+\\.?(css)$"]
            ]
          }
        ]
      }
    }
  ]
}
```

### Add Cypress:

`npm i -D cypress @testing-library/cypress @frsource/cypress-plugin-visual-regression-diff eslint-plugin-cypress @cypress/code-coverage @cypress/instrument-cra cross-env start-server-and-test`

Add in `package.json` file:

```
"scripts": {
  "cy:server": "cross-env NODE_ENV=test BROWSER=none react-scripts -r @cypress/instrument-cra start",
  "cy:open": "cypress open",
  "cy:run": "cypress run",
  "cy:dev": "start-server-and-test cy:server 3000 cy:open",
  "cy": "start-server-and-test cy:server 3000 cy:run"
}
```

Add in `.gitignore` file:

```
/.nyc_output
```

Run Cypress for install process:

`npm run cy:open`

In open window:

- choose `E2E Testing` for configuration. Follow the steps.
- on `Choose a browser` step click `Switch testing type` to return back.
- choose `Component Testing` for configuration. Follow the steps.
- close the window.

The steps above will create folder structure for Cypress in your project.

Add in `cypress.config.ts` file:

```
import codeCoverage from "@cypress/code-coverage/task";
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
});
```

Add files in `cypress` folder:

- `.eslintrc`

```
{
  "extends": ["plugin:cypress/recommended"]
}
```

- `tsconfig.json`

```
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom"],
    "types": ["cypress", "node"]
  },
  "include": ["**/*.ts"]
}
```

Add in `cypress/support/commands.ts` file:

```
import "@frsource/cypress-plugin-visual-regression-diff";
import "@cypress/code-coverage/support";
```

### Add Git hooks

`npm i -D husky`

`npx husky install`

`npm pkg set scripts.prepare="husky install"`

`npx husky add .husky/pre-commit "npm run format"`

`npx husky add .husky/pre-push "CI=true npm test && npm run cy"`

### Git

Create a new repository on GitHub.
Copy HTTPS of the repository.

`git remote add origin https://github.com/username/reponame.git`

`git add .`

`git commit -m 'feat(*): initial commit'`

`git push -u origin master`
