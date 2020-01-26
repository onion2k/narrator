require("colors");
const { ExportDefault, Exports } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");
const config = require("./narrator.config.json");

function clipper(str, percent) {
  if (typeof str !== 'string') return "";

  const termWidth = process.stdout.columns;
  const width = Math.floor(termWidth / 100 * percent);

  if (str.length > width) {
    return str.toString().substring(0, width);
  } else {
    return str.toString().padEnd(width);
  }
}

module.exports = {
  reporter: (reports) => {
    const maxFileLength = Math.max(...reports.map(report => report.file.length));
    reports.forEach((report) => {
      const { name, file, b, pt } = report;

      const srcfile = './<src>/'+file.replace(config.src, '');

      const exports = Exports.evaluate(b);

      console.log("File: ", srcfile.brightWhite)
      console.log(clipper("Component: "+name, 50).brightYellow,
        (React(b) ? clipper("Rct", 4).green : clipper("Rct", 4).red),
        (Redux(b) ? clipper("Rdx", 4).green : clipper("Rdx", 4).red),
        (PropTypes(b) ? clipper("PTs", 4).green : clipper("PTs", 4).red),
        (ExportDefault.evaluate(b) ? clipper("Def", 4).green : clipper("Def", 4).red),
        (exports ? clipper(`Named: ${exports.length || 1}`, 10).green : clipper("No Named", 10).red),
        (Object.keys(pt).length ? clipper(`Props: ${Object.keys(pt).length}`, 10).green : clipper("No Props", 10).red)
      );

      if (Object.keys(pt).length) {
        const propCount = Object.keys(pt).length;
        Object.keys(pt).forEach((key, index)=>{
          const type = pt[key].type.string || '';
          const connector = index===0 ? "┌" : index===propCount-1 ? "└" : "│";
          console.log(
            connector,
            pt[key].required ? clipper(key, 16).brightGreen : clipper(key, 16).green,
            pt[key].required ? clipper(type, 30).brightWhite : clipper(type, 30).white,
            typeof pt[key].value === 'object' ? clipper('Object', 50) : clipper(pt[key].value, 50),
          );
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
