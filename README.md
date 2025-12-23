# Find Java

`find-java` finds java installations installed on the system.
By default it searches
- The Minecraft Launcher
- The Minecraft UWP Launcher
- `PATH`
- Java home

## Installation
```bash
npm install @doublekekse/find-java
```

## Usage
```ts
import { findJavaInstallations } from '@doublekekse/find-java';

const javaInstallations = findJavaInstallations();
const java8Installations = javaInstallations.get(8);
```

