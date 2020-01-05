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
                // proptypes might be defined as external expression statements
                pt = propTypesToObject(findClassPropTypes(x, identifierName));
                if (!Object.keys(pt).length) {
                  pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
                }
              } else if (x.type === "VariableDeclaration") {
                pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
              }
              console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
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
                if (x.type === "ClassDeclaration") {
                  const pt = propTypesToObject(findClassPropTypes(x));
                  console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
                } else if (x.type === "VariableDeclaration") {
                  const pt = propTypesToObject(findExpressionPropTypes(x));
                  console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
                }
              }
            }
          } else if (exportDefault.declaration.type === "FunctionDeclaration") {
            console.log("Export Default".padEnd(15), "(SFC)", exportDefault.declaration.id.name );
            // needs to be a function for understanding params
            if (exportDefault.declaration.params) {
              const pt = {};
              let objCount = 0;
              // need to evaluate what each param actually is ...
              exportDefault.declaration.params.forEach(param => {
                if (param.type === 'ObjectPattern') {
                  // destructured object
                  objCount++
                  pt[`obj${objCount}`] = {
                    type: 'Object',
                    value: {},
                    required: false
                  };
                  param.properties.forEach(element => {
                    switch (element.value.type) {
                      case "Identifier":
                        pt[`obj${objCount}`].value[element.key.name] = {
                          type: '',
                          value: '',
                          required: true
                        };
                        break;
                      case "AssignmentPattern":
                        // If it's an assignment then there's a default, so it's not required
                        pt[`obj${objCount}`].value[element.key.name] = {
                          type: element.value.right.type,
                          value: element.value.right.value || "Function",
                          required: false
                        };
                        break;
                    }
                  })
                } else if (param.type === 'AssignmentPattern') {
                  // expand using the same recusrive function as propttypes based on types
                  pt[param.left.name] = {
                    type: param.right.type,
                    value: param.right.value,
                    required: false
                  };
                } else if (param.type === 'Identifier') {
                  pt[param.name] = {
                    type: '',
                    value: '',
                    required: false
                  };
                }
              });
              console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
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
  