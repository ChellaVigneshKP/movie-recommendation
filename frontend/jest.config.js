/** @type {import('jest').Config} */
export default {
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
};
