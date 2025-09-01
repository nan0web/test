export default class ReactTestPackage extends TestPackage {
    static DEV_DEPENDENCIES: {
        vitest: string;
        vite: string;
        "@nan0web/release": string;
        "@nan0web/test": string;
        husky: string;
    };
}
import TestPackage from "./TestPackage.js";
