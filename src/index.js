const fs = require("fs");
const glob = require("glob");
require("colors");
const { report, def } = require("./reporting");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { ExportDefault, IdentifierName, CalleeName } = require("./lib/Extractors");
const { find, findExpressionPropTypes, findClassPropTypes } = require("./lib/SearchAST.js");
const { propTypesToObject } = require("./lib/propTypesToObject");
const { declarationParamsToObject } = require('./lib/AST')

glob(config.src, {}, function(err, files) {
    if (err) { console.log(err); }

    files.map(file => {

      fs.readFile(file, "utf8", function(err, contents) {

        let pt = {};

        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: config.babel.plugins
        });

        const exportDefault = ExportDefault.evaluate(b);

        if (exportDefault) {
          if (exportDefault.declaration.type === "Identifier") {
            const identifierName = IdentifierName.evaluate(exportDefault);
            try {
              const x = find(b, identifierName);
              if (!x) return;
              def("Export Def I", x, identifierName)
              if (x.type === "ClassDeclaration") {
                // proptypes might be defined as external expression statements
                pt = propTypesToObject(findClassPropTypes(x, identifierName));
                if (!Object.keys(pt).length) {
                  pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
                }
              } else if (x.type === "VariableDeclaration") {
                pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
              }
              // console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
            } catch(error) {
              console.log(error);
            }
          } else if (exportDefault.declaration.type === "CallExpression") {
            const CallExpressionName = CalleeName.evaluate(exportDefault);
            // console.log("Export Def CE".padEnd(15), "(Function)", CallExpressionName ? CallExpressionName.padStart(5) : "Anonymous" );
            if (CalleeName.evaluate(exportDefault) === 'connect') {
              const identifierName = exportDefault.declaration.arguments[0].name;
              const x = find(b, identifierName);
              def("Callee arg 0", x, identifierName);
              if (x !== null) {
                if (x.type === "ClassDeclaration") {
                  pt = propTypesToObject(findClassPropTypes(x));
                  // console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
                } else if (x.type === "VariableDeclaration") {
                  pt = propTypesToObject(findExpressionPropTypes(x));
                  // console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
                }
              }
            }
          } else if (exportDefault.declaration.type === "FunctionDeclaration") {
            // console.log("Export Default".padEnd(15), "(SFC)", exportDefault.declaration.id.name );
            pt = declarationParamsToObject(exportDefault.declaration);
            // console.log("Props".padEnd(15), JSON.stringify(pt, null, 2));
          } else {
            // console.log("Export Default".padEnd(15), "(Something Else)", exportDefault.declaration.type );
          }
        } else {
          // console.log("Export Default".padEnd(15), "Not found".red );
        }

        report(file, b, pt);

      });
    });
  });
  