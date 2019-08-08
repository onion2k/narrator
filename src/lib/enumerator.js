const babelParser = require("@babel/parser");

class Enumerator {
  constructor(contents) {
    this.json = this.parseFile(contents);
  }
  /**
   * Parse the incoming file to get the AST
   */
  parseFile(contents) {
    const b = babelParser.parse(contents, {
      sourceType: "module",
      plugins: ["jsx", "dynamicImport", "classProperties"]
    });
    return b.program.body;
  }

  /**
   * Check if react is used. This will come back to bite me in the future if anyone sees this project. :/
   */
  get react() {
    const react = this.imports.filter(imp => {
      return imp.source.value === "react";
    });
    if (react.length > 0) return true;
    return false;
  }

  /**
   * Find the imports
   */
  get imports() {
    return this.json.filter(node => {
      return node.type === "ImportDeclaration";
    });
  }

  /**
   * Find the exports
   */
  get exports() {
    const exports = this.json.filter(node => {
      return (
        node.type === "ExportDefaultDeclaration" ||
        node.type === "ExportNamedDeclaration"
      );
    });
    const vars = this.vars;
    const classes = this.classes;
    exports.map(exp => {
      let exportName = exp.declaration.name;
      if (
        exp.declaration.callee &&
        exp.declaration.callee.callee.name === "connect"
      ) {
        exportName = exp.declaration.arguments[0].name;
      }
      vars.forEach(v => {
        if (exportName === v.declarations[0].id.name) {
          exp.enumeratedReactComponent = v;
        }
      });
      classes.forEach(c => {
        if (exportName === c.id.name) {
          exp.enumeratedReactComponent = c;
        }
      });
    });
    return exports;
  }
  // console.log(exportDecs[0].declaration.name);

  /**
   * Find the root level variable declarations
   */
  get expressions() {
    return this.json.filter(node => {
      return node.type === "ExpressionStatement";
    });
  }
  /**
   * these are the propTypes and defaultProps
   */
  // if(expressionDecs) {
  //   pt = helpers.parsePropTypes(
  //     expressionDecs[0].expression.right,
  //     expressionDecs[1].expression.right
  //   );
  // }

  /**
   * Find the root level variable declarations
   */
  get vars() {
    return this.json.filter(node => {
      return node.type === "VariableDeclaration";
    });
  }
  // console.log(varDecs[0].declarations[0].id.name); // name
  // console.log(varDecs[0].declarations[0].init.body.body[0].type); // ReturnStatement
  // console.log(varDecs[0].declarations[0].init.body.body[0].argument.type); // JSXElement

  /**
   * Find the root level class declarations
   */
  get classes() {
    return this.json.filter(node => {
      return node.type === "ClassDeclaration";
    });
  }
}

module.exports = Enumerator;
