const fs = require("fs");
const babelParser = require("@babel/parser");
const config = require("../narrator.config.json");
const { Exports } = require("./Extractors");
const { Imports, ImportLibTest } = require("./Imports");
const { find, findExpressionPropTypes, findClassPropTypes, declarationParamsToObject } = require("./AST");

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

  findPropTypes = (declaration) => {
    return findClassPropTypes(declaration);
  }

  listExports = () => Exports.evaluate(this.b);

  listImports = () => {
    const imports = Imports.evaluate(this.b);
    if (!imports) { return []; }
    if (!imports.sequence) { return [imports]; }
    delete imports.sequence;
    return imports;
  }

  checkImports = (imports) => {
    return Object.fromEntries(imports.map(
      (i)=>[i, ImportLibTest(i).evaluate(this.b) ? true : false]
    ));
  }

  resolveIdentifier = (identifier) => {
    /**
     * Take an identifier and return the node it identifies
     */
  }

}

module.exports = { Narrator }