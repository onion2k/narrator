const fs = require("fs");
const glob = require("glob");
require("colors");
const { report, def } = require("./reporting");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { ExportDefault, IdentifierName, CalleeName, PropTypes } = require("./lib/Extractors");
const { find, findPropTypes } = require("./lib/SearchAST.js");

glob(config.src, {}, function(err, files) {
    if (err) { console.log(err); }

    files.map(file => {
      fs.readFile(file, "utf8", function(err, contents) {
        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: config.babel.plugins
        });

        report(file, b);

        const exportDefault = ExportDefault.evaluate(b);
        if (exportDefault) {
          if (exportDefault.declaration.type === "Identifier") {
            const identifierName = IdentifierName.evaluate(exportDefault);
            try {
              const x = find(b, identifierName);
              const pt = findPropTypes(x);
              console.log(pt)
              def("Export Default", x, identifierName)
            } catch(error) {
              console.log(error);
            }
          } else if (exportDefault.declaration.type === "CallExpression") {
            const CallExpressionName = CalleeName.evaluate(exportDefault);
            console.log("Export Default".padEnd(15), "(Function)", CallExpressionName ? CallExpressionName.padStart(5) : "Anonymous" );
            if (CalleeName.evaluate(exportDefault) === 'connect') {
              const identifierName = exportDefault.declaration.arguments[0].name;
              const x = find(b, identifierName);
              const pt = findPropTypes(x);
              console.log(pt)
              def("Callee arg 0", x, identifierName)
            }
          } else if (exportDefault.declaration.type === "FunctionDeclaration") {
            console.log("Export Default".padEnd(15), "(SFC)", exportDefault.declaration.id.name );
            if (exportDefault.declaration.params) {
              // need to evaluate what each param actually is ...
              exportDefault.declaration.params.forEach(param => {
                if (param.type === 'ObjectPattern') {
                  // destructured object
                  console.log("{");
                  param.properties.forEach(element => {
                    console.log(" ",element.key.name);
                  })
                  console.log("}");
                } else if (param.type === 'AssignmentPattern') {
                  // variable with default
                  console.log(param.left.name);
                } else if (param.type === 'Identifier') {
                  // variable
                  console.log(param.name);
                }
              });
            }
          } else {
            console.log("Export Default".padEnd(15), "(Something Else)", exportDefault.declaration.type );
          }
        } else {
          console.log("Export Default".padEnd(15), "Not found".red );
        }

        console.log()

      });
    });
  });
  