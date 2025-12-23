import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

function getJavaVersion(javaPath: string) {
  if (!javaPath.startsWith("java") && !fs.existsSync(javaPath)) return null;

  try {
    const output = execSync(`${javaPath} -version 2>&1`);

    const javaVersion = output.toString().match(/version "(\d+)/);
    if (javaVersion == null) {
      return null;
    }

    if (javaVersion[1] === "1") {
      const javaVersionLegacy = output.toString().match(/version "1.(\d+)/);
      if (javaVersionLegacy == null) {
        return null;
      }
      return parseInt(javaVersionLegacy[1], 10);
    }
    return parseInt(javaVersion[1], 10);
  } catch (err) {
    // Java is not installed or an error occurred
  }

  return null;
}

function extension(): string {
  switch (process.platform) {
    case "win32":
      return ".exe";
    case "darwin":
    case "linux":
      return "";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

class FoundJavaInstallations extends Map<number, string[]> {
  test(dir: string) {
    const file = path.join(dir, "java" + extension());
    const version = getJavaVersion(file);

    if (!version) {
      return;
    }

    this.add(file, version);
  }

  add(path: string, version: number) {
    const found = this.get(version);

    if (found === undefined) {
      this.set(version, [path]);
      return;
    }

    if (!found.includes(path)) {
      found.push(path);
    }
  }
}

function checkEnv(found: FoundJavaInstallations) {
  const paths = process.env.PATH?.split(path.delimiter);

  if (!paths) {
    return;
  }

  for (const p of paths) {
    found.test(p);
  }
}

function checkVanillaLauncher(found: FoundJavaInstallations, dir: string) {
  const javaPaths = [
    "runtime/java-runtime-beta/windows-x64/java-runtime-beta/bin",
    "runtime/java-runtime-beta/windows-x86/java-runtime-beta/bin",
    "runtime/java-runtime-alpha/windows-x64/java-runtime-alpha/bin",
    "runtime/java-runtime-alpha/windows-x86/java-runtime-alpha/bin",
    "runtime/jre-legacy/windows-x64/jre-legacy/bin",
    "runtime/jre-legacy/windows-x86/jre-legacy/bin",
    "runtime/jre-x64/bin",
    "runtime/jre-x86/bin",
    "runtime/java-runtime-gamma/windows-x64/java-runtime-gamma/bin",
    "runtime/java-runtime-gamma/windows-x86/java-runtime-gamma/bin",
  ];

  for (const javaPath of javaPaths) {
    found.test(path.join(dir, javaPath));
  }

  return false;
}

function checkVanillaLaunchers(found: FoundJavaInstallations) {
  if (process.platform === "win32") {
    const launcherPaths = [
      "C:/Program Files (x86)/Minecraft Launcher",
      path.join(
        process.env.LOCALAPPDATA!,
        "Packages/Microsoft.4297127D64EC6_8wekyb3d8bbwe/LocalCache/Local/",
      ),
    ];

    for (const launcherPath of launcherPaths) {
      checkVanillaLauncher(found, launcherPath);
    }
  }
}

function checkJavaHome(found: FoundJavaInstallations) {
  const javaHome = process.env.JAVA_HOME;

  if (javaHome) {
    const javaHomePath = path.join(javaHome, "bin");
    found.test(javaHomePath);
  }
}

export function findJavaInstallations() {
  const found = new FoundJavaInstallations();

  checkVanillaLaunchers(found);
  checkEnv(found);
  checkJavaHome(found);

  return found;
}

