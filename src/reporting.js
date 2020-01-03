require("colors");
const { React, Redux, PropTypes } = require("./lib/Imports");

const yep = "Yep".green.padStart(5);
const nope = "Nope".red.padStart(5);

module.exports = {
  report: (file, b) => {
    console.log(file.brightYellow);
    console.log("React".padEnd(15), (React(b) ? yep : nope) );
    console.log("Redux".padEnd(15), (Redux(b) ? yep : nope) );
    console.log("PropTypes".padEnd(15), (PropTypes(b) ? yep : nope) ); 
  },
  def: (type, x, identifierName) => {
    if (x===null) {
      console.log(type.padEnd(15), "NULL", identifierName );
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
      console.log(type.padEnd(15), className, identifierName );
    } else if (x.type==="VariableDeclaration") {
      console.log(type.padEnd(15), '(Variable)', identifierName );
    } else {
      console.log(type.padEnd(15),'(No idea)', identifierName );
    }
  }
}