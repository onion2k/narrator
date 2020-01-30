const fs = require("fs");
const babelParser = require("@babel/parser");
const config = require("../narrator.config.json");
const { Imports, ImportLibTest } = require("./Imports");

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

  listImports = () => {
    return Imports.evaluate(this.b);
  }

  checkImports = (imports) => {
    return Object.fromEntries(imports.map(
      (i)=>[i, ImportLibTest(i).evaluate(this.b) ? true : false]
    ));
  }
  
}

module.exports = { Narrator }