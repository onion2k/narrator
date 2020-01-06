require("colors");
const { ExportDefault } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");

module.exports = {
  report: (file, b) => {
    console.log(file.brightYellow.padEnd(48),
      (React(b) ? "React".green.padEnd(16) : "React".red.padEnd(16)),
      (Redux(b) ? "Redux".green.padEnd(16) : "Redux".red.padEnd(16)),
      (PropTypes(b) ? "PropTypes".green.padEnd(20) : "PropTypes".red.padEnd(20)),
      (ExportDefault.evaluate(b) ? "ExportDefault".green.padEnd(24) : "ExportDefault".red.padEnd(24))
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
