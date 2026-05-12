#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const workspace = "packages/react-motion-gallery";
const packagePath = resolve(workspace, "package.json");
const lockPath = resolve("package-lock.json");
const versionBumps = new Set(["patch", "minor", "major"]);

const usage = `
Usage:
  npm run release:rmg -- --message "Detailed release message"
  npm run release:rmg -- --bump minor --message "Detailed release message"
  npm run release:rmg -- --bump 2.1.0 --message "Detailed release message"

Options:
  --bump <patch|minor|major|x.y.z>  Version bump to apply. Defaults to patch.
  -m, --message <message>           Git commit message. Required.
  --otp <code>                      Forward an npm two-factor code to publish.
  --dry-run                         Print the planned release without changing files.
  -h, --help                        Show this help text.
`;

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  console.log(usage.trim());
  process.exit(0);
}

if (!options.message) {
  fail("Missing required --message value.");
}

const packageJson = readJson(packagePath);
const currentVersion = packageJson.version;
const nextVersion = resolveNextVersion(currentVersion, options.bump);

console.log(`Preparing ${workspace} ${currentVersion} -> ${nextVersion}`);

if (options.dryRun) {
  console.log("Dry run only. No files will be changed and no commands will run.");
} else {
  writeVersion(nextVersion);
}

const publishArgs = ["publish", "-w", workspace];
if (options.otp) {
  publishArgs.push("--otp", options.otp);
}

run("npm", ["run", "build", "-w", workspace], options.dryRun);
run("npm", ["run", "size:readme", "-w", workspace], options.dryRun);
run("npm", publishArgs, options.dryRun);
run("git", ["add", "."], options.dryRun);
run("git", ["commit", "-m", options.message], options.dryRun);
run("git", ["push"], options.dryRun);

if (options.dryRun) {
  console.log(`Dry run completed for ${workspace} v${nextVersion}.`);
} else {
  console.log(`Release pipeline completed for ${workspace} v${nextVersion}.`);
}

function parseArgs(args) {
  const parsed = {
    bump: "patch",
    dryRun: false,
    help: false,
    message: "",
    otp: "",
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "-h" || arg === "--help") {
      parsed.help = true;
      continue;
    }

    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (arg === "--bump") {
      parsed.bump = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "-m" || arg === "--message") {
      parsed.message = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--otp") {
      parsed.otp = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (!arg.startsWith("-") && parsed.bump === "patch") {
      parsed.bump = arg;
      continue;
    }

    fail(`Unknown option: ${arg}`);
  }

  return parsed;
}

function readOptionValue(args, index, option) {
  const value = args[index + 1];

  if (!value || value.startsWith("-")) {
    fail(`${option} requires a value.`);
  }

  return value;
}

function resolveNextVersion(version, bump) {
  if (/^\d+\.\d+\.\d+$/.test(bump)) {
    return bump;
  }

  if (!versionBumps.has(bump)) {
    fail(`Unsupported bump "${bump}". Use patch, minor, major, or an exact x.y.z version.`);
  }

  const parts = version.split(".").map(Number);

  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) {
    fail(`Cannot bump non-standard version "${version}". Use --bump x.y.z instead.`);
  }

  const [major, minor, patch] = parts;

  if (bump === "major") {
    return `${major + 1}.0.0`;
  }

  if (bump === "minor") {
    return `${major}.${minor + 1}.0`;
  }

  return `${major}.${minor}.${patch + 1}`;
}

function writeVersion(version) {
  const nextPackageJson = readJson(packagePath);
  nextPackageJson.version = version;
  writeJson(packagePath, nextPackageJson);

  const lockJson = readJson(lockPath);
  const packageLockEntry = lockJson.packages?.[workspace];

  if (!packageLockEntry) {
    fail(`Could not find ${workspace} in package-lock.json.`);
  }

  packageLockEntry.version = version;
  writeJson(lockPath, lockJson);
}

function run(command, args, dryRun) {
  console.log(`\n$ ${[command, ...args].map(formatArg).join(" ")}`);

  if (dryRun) {
    return;
  }

  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function formatArg(arg) {
  if (/^[A-Za-z0-9_./:@=-]+$/.test(arg)) {
    return arg;
  }

  return JSON.stringify(arg);
}

function fail(message) {
  console.error(message);
  console.error("");
  console.error(usage.trim());
  process.exit(1);
}
