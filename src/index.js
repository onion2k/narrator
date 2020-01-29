const glob = require("glob");
require("colors");
const { reporter, def, callInterogator } = require("./reporting");
const { writeToTest } = require("./output");

const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { AllExports, Exports, ExportDefault, IdentifierName, CalleeName } = require("./lib/Extractors");
const { find, findExpressionPropTypes, findClassPropTypes, declarationParamsToObject } = require("./lib/AST");
const { propTypesToObject } = require("./lib/propTypesToObject");
const { buildReportObj } = require('./lib/buildReportObj')

const { Narrator } = require('./lib/narrator')

try {
  /**
   * Clear screen
   */
  console.clear();

  /**
   * Title
   */
  console.log("Narrating", config.src, "\n")

  glob(config.src+'*.js', {}, function(err, files) {
    if (err) { console.log(err); }
    const reports = [];

    files.map(file => {

      const n = new Narrator(file);

      let exps = Exports.evaluate(n.b);
      if (exps) {
        if (typeof exps === 'object' && !exps.length) {
          exps = [exps];
        }
        exps.map(
          (exp) => {
            if (exp.type === 'ExportDefaultDeclaration') {
              reports.push({ ...buildReportObj(exp, n.b), file });
            }
            if (exp.hasOwnProperty('declaration') && exp.declaration !== null) {
              if (exp.declaration.hasOwnProperty('declarations')) {
                exp.declaration.declarations.forEach((dec) => {
                  console.log(dec.init.type)
                });
              } else {
                const dec = exp.declaration;
                console.log(dec.type)
              }  
            } else {
              console.log(find(n.b, exp.specifiers[0].exported.name).declarations[0].init.type)
            }
          }
        )
      }

    });

    reporter(reports);
    // writeToTest(reports);

  })
} catch(error) {
  console.log(error);
};
