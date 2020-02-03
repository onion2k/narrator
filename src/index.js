const glob = require("glob");
require("colors");
const { reporter, def, callInterogator } = require("./reporting");
const { writeToTest } = require("./output");

const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { Exports } = require("./lib/Extractors");
const { find } = require("./lib/AST");
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
  // console.log("Narrating", config.src, "\n")

  glob(config.src+'*.js?(x)', {}, function(err, files) {

    if (err) { console.log(err); }

    const reports = [];

    files.map(file => {

      console.log(file);

      const n = new Narrator(file);


      let exps = Exports.evaluate(n.b);

      if (exps) {
        if (typeof exps === 'object' && !exps.length) { exps = [exps]; }
        exps.map(
          (exp) => {
            if (exp.type === 'ExportDefaultDeclaration') {
              const dec = exp.declaration;
              reports.push({
                ...buildReportObj(exp, n),
                imports: n.checkImports(['react', 'react-redux', 'prop-types']), file
              });
            } else if (exp.hasOwnProperty('declaration') && exp.declaration !== null) {
              /**
               * exported as an equality expression eg export const blah = thing
               */
              if (exp.declaration.hasOwnProperty('declarations')) {
                exp.declaration.declarations.forEach((dec) => {
                  console.log("Declaration (sub):", dec.type, dec.id.name)
                });
              } else {
                const dec = exp.declaration;
                console.log("Declaration (no sub):", dec.type, dec.id.name)
                reports.push({
                  ...buildReportObj(exp, n),
                  imports: n.checkImports(['react', 'react-redux', 'prop-types']), file
                });
              }  
            } else {
              exp.specifiers.forEach((spec)=>{
                console.log("Declaration:", spec.exported.type, spec.exported.name)
                // console.log(find(n.b, exp.specifiers[0].exported.name).declarations[0].init.type)
              })
            }
          }
        )
      }

      console.log();

    });

    reporter(reports);
    // writeToTest(reports);

  })
} catch(error) {
  console.log("Error:", error);
};
