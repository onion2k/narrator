const fs = require("fs");
const glob = require("glob");
require("colors");
const { reporter, def, callInterogator } = require("./reporting");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { Exports, ExportDefault, IdentifierName, CalleeName } = require("./lib/Extractors");
const { find, findExpressionPropTypes, findClassPropTypes, declarationParamsToObject } = require("./lib/AST");
const { propTypesToObject } = require("./lib/propTypesToObject");

glob(config.src, {}, function(err, files) {
  if (err) { console.log(err); }
  const reports = [];

  files.map(file => {

    const contents = fs.readFileSync(file, "utf8");

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
            pt = propTypesToObject(findClassPropTypes(x, identifierName), b);
            if (!Object.keys(pt).length) {
              if (identifierName) {
                pt = propTypesToObject(findExpressionPropTypes(b, identifierName), b);
              }
            }
          } else if (x.type === "VariableDeclaration") {
            if (identifierName) {
              pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
            }
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
            } else if (x.type === "VariableDeclaration") {
              pt = propTypesToObject(findExpressionPropTypes(b, identifierName));
            }
          }
        }
      } else if (exportDefault.declaration.type === "FunctionDeclaration") {
        pt = declarationParamsToObject(exportDefault.declaration);
      } else {
        // console.log("Export Default".padEnd(15), "(Something Else)", exportDefault.declaration.type );
      }
    }

    const exps = Exports.evaluate(b);
    if (exps) {
      if (exps.length) {
        exps.map(
          (exp) => {
            // callInterogator(exp.declaration.declarations[0]);
          }
        )
      } else {
        // callInterogator(exps.declaration.declarations[0]);
      }
    }

    reports.push({ file, b, pt })

  });

  // console.log("Report:");
  // reporter(reports);

});
