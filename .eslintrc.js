module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": ["eslint:recommended", "airbnb"],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 2018,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "rules": {
        "no-console": "off",
    }
};