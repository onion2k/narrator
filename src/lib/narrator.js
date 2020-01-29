const fs = require("fs");
const babelParser = require("@babel/parser");
const config = require("../narrator.config.json");

class Narrator {

  constructor(file) {

    const contents = fs.readFileSync(file, "utf8");

    const b = babelParser.parse(contents, {
      sourceType: "module",
      plugins: config.babel.plugins
    });

    this.file = file;
    this.b = b;

  }
}

module.exports = { Narrator }