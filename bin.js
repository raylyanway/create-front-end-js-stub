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

import { dependencies, files, npmScripts } from "./constants.js";

const argv = yargs(hideBin(process.argv)).argv;
if (argv["_"].length === 0) {
  console.log(`${chalk.red("Set project name.")}`);

  process.exit(1);
}
try {
  execSync("git config --global --get user.name");
} catch {
  console.log(`${chalk.red("Set user name for your git global config.")}`);
  console.log(`${chalk.yellow("git config --global user.name 'Your Name'")}`);

  process.exit(1);
}
try {
  execSync("git config --global --get user.email");
} catch {
  console.log(`${chalk.red("Set user email for your git global config.")}`);
  console.log(`${chalk.yellow("git config --global user.email 'Your email'")}`);

  process.exit(1);
}

const progress = new cliProgress.SingleBar(
  {
    hideCursor: true,
  },
  cliProgress.Presets.shades_classic
);
progress.start(100, 0);

const projectName = argv["_"][0];
const root = path.resolve(projectName);

function updateProgress({ max = 100, start = 0, step = 1 }) {
  let current = start;
  progress.update(current);

  const intervalId = setInterval(() => {
    current += step;
    progress.update(current);
    if (current === max) {
      clearInterval(intervalId);
    }
  }, 1000);

  return intervalId;
}

function updatePackageJson() {
  const intervalId = updateProgress({ start: 85, max: 90 });

  const packageJsonRow = fs.readFileSync(
    path.join(root, "package.json"),
    "utf8"
  );
  const packageJson = JSON.parse(packageJsonRow);

  packageJson.scripts = {
    ...packageJson.scripts,
    ...npmScripts,
  };

  if (packageJson.eslintConfig) {
    delete packageJson.eslintConfig;
  }

  fs.outputFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  clearInterval(intervalId);
}

function createAdditionalFiles() {
  const intervalId = updateProgress({ start: 90, max: 95 });

  execSync("npx husky install");

  files.forEach(({ file, content }) =>
    fs.outputFileSync(path.join(root, file), content + os.EOL)
  );

  execSync("npx eslint --fix src");

  clearInterval(intervalId);
}

function commitToGit() {
  const intervalId = updateProgress({ start: 95, max: 100 });

  execSync("git config core.autocrlf false");
  execSync("git add .");
  execSync('git commit -m "init configuration" -n');
  execSync("git config core.autocrlf true");

  clearInterval(intervalId);
}

function run() {
  try {
    const intervalId = updateProgress({ max: 60 });
    exec(`npx create-react-app ${projectName} --template typescript`, () => {
      clearInterval(intervalId);
      const intervalId1 = updateProgress({ start: 60, max: 85 });
      process.chdir(`./${projectName}`);
      exec(["npm i -D", ...dependencies].join(" "), () => {
        clearInterval(intervalId1);

        updatePackageJson();
        createAdditionalFiles();
        commitToGit();

        progress.update(100);
        progress.stop();
        console.log(`${chalk.cyan("Configuration is completed.")}`);
      });
    });
  } catch (e) {
    console.log(e);
    console.log(`${chalk.redBright("Something goes wrong.")}`);
    console.log(
      `${chalk.yellow(
        "Please say about the error in GitHub here: https://github.com/raylyanway/create-front-end-js-stub/issues"
      )}`
    );

    process.exit(1);
  }
}

run();
