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
        exp.declaration.callee.callee.name === "connect" // looks like redux
      ) {
        // connect only takes one arg so 0 is fine
        exportName = exp.declaration.arguments[0].name;
      }
      if (exp.declaration.body) {
        /**
         * Attempt to check if the exp is a function that returns JSX
         *
         * This is going to need to unwind the function graph to figure out what the returned value actually is.
         */
        if (
          exp.declaration.body.body.filter(node => {
            return node.type === "ReturnStatement";
          })[0].argument.type === "JSXElement"
        ) {
          exp.enumerated_reactComponent = exp.declaration;
        }
      } else {
        vars.forEach(v => {
          if (exportName === v.declarations[0].id.name) {
            exp.enumerated_reactComponent = v;
          }
        });
        classes.forEach(c => {
          if (c.superClass) {
            if (c.superClass.object && c.superClass.object.name === "React") {
              if (exportName === c.id.name) {
                exp.enumerated_reactComponent = c;
              }
            }
          } else {
            exp.enumerated_class = c;
          }
        });
      }

      this.expressions.forEach(expr => {
        if (exportName === expr.expression.left.object.name) {
          exp[`enumerated_${expr.expression.left.property.name}`] =
            expr.expression.right;
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
    const variables = this.json.filter(node => {
      return node.type === "VariableDeclaration";
    });
    return variables;
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
