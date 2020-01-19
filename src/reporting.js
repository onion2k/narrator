require("colors");
const { ExportDefault, Exports } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");

const padding = 12; // 10 for colors + 2 spaces

module.exports = {
  reporter: (reports) => {
    const maxFileLength = Math.max(...reports.map(report => report.file.length));
    reports.forEach((report) => {
      const { file, b, pt } = report;
      const exports = Exports.evaluate(b);
      if (file.length > maxFileLength) {
        file = file.substring(file.length - maxFileLength + 3)
      }
      console.log(file.brightYellow.padEnd(maxFileLength + padding),
        (React(b) ? "R".green.padEnd(1 + padding) : "R".red.padEnd(1 + padding)),
        (Redux(b) ? "Rdx".green.padEnd(3 + padding) : "Rdx".red.padEnd(3 + padding)),
        (PropTypes(b) ? "PT".green.padEnd(2 + padding) : "PT".red.padEnd(2 + padding)),
        (ExportDefault.evaluate(b) ? "D".green.padEnd(1 + padding) : "D".red.padEnd(1 + padding)),
        (exports ? `N: ${exports.length || 1}`.green.padEnd(5 + padding) : "N".red.padEnd(5 + padding)),
        (Object.keys(pt).length ? `P: ${Object.keys(pt).length}`.green.padEnd(8 + padding) : "No Props".red.padEnd(8 + 10 + 2))
      );

      if (Object.keys(pt).length) {
        Object.keys(pt).forEach((key)=>{
          console.log(key, pt[key]);
        })
      }

    });
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

    return;

    switch (callee.init.type) {
      case "Identifier":
        /**
         * A variable
         */
        console.log("Identifier :", callee.init.name);
        break;
      case "CallExpression":
        /**
         * An object call
         */
        console.log("Call :", callee.init.callee.object.name+"."+callee.init.callee.property.name);
        break;
      case "ArrowFunctionExpression":
        /**
         * Unnamed arrow function
         */
        console.log("ArrowFunction :", callee.init.id);
        break;
      case "FunctionExpression":
        /**
         * Named function
         */
        console.log("Function:", callee.init.id.name);
        break;
      case "StringLiteral":
      case "NumericLiteral":
        console.log(callee.init.type, ":", callee.init.value);
        break;
      case "ObjectExpression":
        console.log("Object : ", callee.init.properties.map((prop)=>prop.key.name));
        break;
      default:
        console.log(callee.init.type);
        break;
      }
  }
}
