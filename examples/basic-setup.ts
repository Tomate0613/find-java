import { findJavaInstallations } from '@doublekekse/find-java';

const javaInstallations = findJavaInstallations();
const java8Installations = javaInstallations.get(8);
