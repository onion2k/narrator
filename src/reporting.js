require("colors");
const { ExportDefault, Exports } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");

module.exports = {
  report: (file, b, pt) => {
    const exports = Exports.evaluate(b);
    console.log(file.brightYellow.padEnd(120),
      (React(b) ? "React".green.padEnd(17) : "React".red.padEnd(17)),
      (Redux(b) ? "Redux".green.padEnd(17) : "Redux".red.padEnd(17)),
      (PropTypes(b) ? "PropTypes".green.padEnd(21) : "PropTypes".red.padEnd(21)),
      (ExportDefault.evaluate(b) ? "Default Export".green.padEnd(26) : "Default Export".red.padEnd(26)),
      (exports ? `Named Exports: ${exports.length || 1}`.green.padEnd(28) : "No Named Exports".red.padEnd(28)),
      (Object.keys(pt).length ? `Props: ${Object.keys(pt).length}`.green.padEnd(11) : "No Props".red.padEnd(11))
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
  }
}
