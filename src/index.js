const fs = require("fs");
const glob = require("glob");
require("colors");
const { reporter, def, callInterogator } = require("./reporting");
const { writeToTest } = require("./output");

const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { Exports, ExportDefault, IdentifierName, CalleeName } = require("./lib/Extractors");
const { find, findExpressionPropTypes, findClassPropTypes, declarationParamsToObject } = require("./lib/AST");
const { propTypesToObject } = require("./lib/propTypesToObject");
try {
  glob(config.src+'**/*.js', {}, function(err, files) {
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
          } catch(error) {
            console.log(error);
          }

          reports.push({ name: identifierName, file, b, pt })

        } else if (exportDefault.declaration.type === "CallExpression") {
          const CallExpressionName = CalleeName.evaluate(exportDefault);
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
            reports.push({ name: identifierName, file, b, pt })
          }
        } else if (exportDefault.declaration.type === "FunctionDeclaration") {
          const identifierName = exportDefault.declaration.id ? exportDefault.declaration.id.name : "Anon";
          pt = declarationParamsToObject(exportDefault.declaration);
          reports.push({ name: identifierName, file, b, pt })
        } else {
          // console.log("Export Default".padEnd(15), "(Something Else)", exportDefault.declaration.type );
        }
      }

      let exps = Exports.evaluate(b);
      if (exps) {
        if (typeof exps === 'object' && !exps.length) {
          exps = [exps];
        }
        exps.map(
          (exp) => {
            if (exp.declaration.hasOwnProperty('declarations')) {
              exp.declaration.declarations.forEach((dec) => {
                console.log(dec.id.name)
              });
            } else {
              console.log(exp.declaration.id.name)
            }
          }
        )
      }


    });

    // console.log("Report:");
    // reporter(reports);
    // writeToTest(reports);

  })
} catch(error) {
  console.log(error);
};
