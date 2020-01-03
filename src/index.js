const fs = require("fs");
const glob = require("glob");
require("colors");
const { report, def } = require("./reporting");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { ExportDefault, IdentifierName, CalleeName } = require("./lib/Extractors");
const { find, findExpressionPropTypes, findClassPropTypes } = require("./lib/SearchAST.js");
const { propTypesToObject } = require("./lib/propTypesToObject");

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
              def("Export Def I", x, identifierName)
              let pt;
              if (x.type === "ClassDeclaration") {
                pt = propTypesToObject(findClassPropTypes(x, identifierName));
              } else if (x.type === "VariableDeclaration") {
                pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
              }
              console.log("Props".padEnd(15), JSON.stringify(pt));
            } catch(error) {
              console.log(error);
            }
          } else if (exportDefault.declaration.type === "CallExpression") {
            const CallExpressionName = CalleeName.evaluate(exportDefault);
            console.log("Export Def CE".padEnd(15), "(Function)", CallExpressionName ? CallExpressionName.padStart(5) : "Anonymous" );
            if (CalleeName.evaluate(exportDefault) === 'connect') {
              const identifierName = exportDefault.declaration.arguments[0].name;
              const x = find(b, identifierName);
              def("Callee arg 0", x, identifierName);
              if (x !== null) {
                console.log(x.type)
                if (x.type === "ClassDeclaration") {
                  const pt = propTypesToObject(findClassPropTypes(x));
                  console.log("Props".padEnd(15), JSON.stringify(pt));
                } else if (x.type === "VariableDeclaration") {
                  const pt = propTypesToObject(findExpressionPropTypes(x));
                  console.log("Props".padEnd(15), JSON.stringify(pt));
                }
              }
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
  