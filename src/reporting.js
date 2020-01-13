require("colors");
const { ExportDefault, Exports } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");

module.exports = {
  report: (file, b, pt) => {
    const exports = Exports.evaluate(b);
    if (file.length > 100) {
      file = file.substring(file.length - 103)
    }
    console.log(file.brightYellow.padEnd(100),
      (React(b) ? "R".green.padEnd(11) : "R".red.padEnd(11)),
      (Redux(b) ? "Rdx".green.padEnd(13) : "Rdx".red.padEnd(13)),
      (PropTypes(b) ? "PT".green.padEnd(13) : "PT".red.padEnd(13)),
      (ExportDefault.evaluate(b) ? "D".green.padEnd(12) : "D".red.padEnd(12)),
      (exports ? `N: ${exports.length || 1}`.green.padEnd(16) : "N".red.padEnd(16)),
      (Object.keys(pt).length ? `P: ${Object.keys(pt).length}`.green.padEnd(11) : "No Props".red.padEnd(11))
    );
  },
  def: (type, x, identifierName) => {
    if (x===null) {
      // console.log(type.padEnd(15), "NULL", identifierName );
      return;
    }
    if (x.type==="ClassDeclaration") {
      let className = '(Class)';
      if (x.superClass) {
        switch (x.superClass.type) {
          case "MemberExpression":
            className = `(Class extends ${x.superClass.object.name}.${x.superClass.property.name})`;
            break;
          case "Identifier":
            className = `(Class extends ${x.superClass.name})`;
            break;
        }
      }
      // console.log(type.padEnd(15), className, identifierName );
    } else if (x.type==="VariableDeclaration") {
      // console.log(type.padEnd(15), '(Variable)', identifierName );
    } else {
      // console.log(type.padEnd(15),'(No idea)', identifierName );
    }
  },
  callInterogator: (callee) => {
    switch (callee.init.type) {
      case "Identifier":
        console.log(callee.init.name);
        break;
      case "CallExpression":
        /**
         * An object call
         */
        console.log(callee.init.callee.object.name, callee.init.callee.property.name);
        break;
      case "ArrowFunctionExpression":
      console.log(callee.init.type, callee.init.id);
        break;
      case "FunctionExpression":
      console.log(callee.init.type, callee.init.id.name);
        break;
      case "StringLiteral":
      case "NumericLiteral":
        console.log(callee.init.type, callee.init.value);
        break;
      default:
        console.log(callee.init.type);
        break;
      }
  }
}
