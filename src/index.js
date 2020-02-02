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

  glob(config.src+'mul*.js?(x)', {}, function(err, files) {
    if (err) { console.log(err); }
    const reports = [];

    files.map(file => {

      const n = new Narrator(file);

      let exps = Exports.evaluate(n.b);

      if (exps) {
        if (typeof exps === 'object' && !exps.length) { exps = [exps]; }
        exps.map(
          (exp) => {
            if (exp.type === 'ExportDefaultDeclaration') {
              console.log('Default exp in', file)
              /**
               * report on node.declaration
               */
              reports.push({
                ...buildReportObj(exp, n.b),
                imports: n.checkImports(['react', 'react-redux', 'prop-types']), file 
              });
            } else if (exp.hasOwnProperty('declaration') && exp.declaration !== null) {
              console.log('Named exp in', file, exp.type)
              if (exp.declaration.hasOwnProperty('declarations')) {
                exp.declaration.declarations.forEach((dec) => {
                  console.log(dec.type)
                });
              } else {
              /**
               * report on node.declaration
               */
              console.log(buildReportObj(exp, n.b))
                const dec = exp.declaration;
                // console.log(dec.type)
              }  
            } else {
              // console.log(find(n.b, exp.specifiers[0].exported.name).declarations[0].init.type)
            }
          }
        )
      }

    });

    // reporter(reports);
    // writeToTest(reports);

  })
} catch(error) {
  console.log(error);
};
