const glob = require('glob');
require('colors');
// const babelParser = require('@babel/parser');
const { reporter } = require('./reporting');
// const { writeToTest } = require('./output');

const config = require('./narrator.config.json');

// const { Exports } = require('./lib/Extractors');
// const { find } = require('./lib/AST');
const { buildReportObj } = require('./lib/buildReportObj');

const { Narrator } = require('./lib/narrator');

try {
  /**
   * Clear screen
   */
  console.clear();

  /**
   * Title
   */
  // console.log("Narrating", config.src, "\n")

  glob(`${config.src}*.js?(x)`, {}, (err, files) => {
    if (err) {
      console.log(err);
    }

    const reports = [];

    files.forEach((file) => {
      console.log(file);

      const n = new Narrator(file);

      let exps = n.listExports();

      if (exps) {
        if (typeof exps === 'object' && !exps.length) {
          exps = [exps];
        }
        exps.forEach((exp) => {
          if (exp.type === 'ExportDefaultDeclaration') {
            reports.push({
              ...buildReportObj(exp, n),
              imports: n.checkImports(['react', 'react-redux', 'prop-types']),
              file,
            });
          } else if (
            Object.prototype.hasOwnProperty.call(exp, 'declaration')
            && exp.declaration !== null
          ) {
            /**
             * exported as an equality expression eg export const blah = thing
             */
            if (
              Object.prototype.hasOwnProperty.call(exp.declaration, 'declarations')) {
              exp.declaration.declarations.forEach((dec) => {
                console.log('Declaration (sub):', dec.type, dec.id.name);
              });
            } else {
              const dec = exp.declaration;
              console.log('Declaration (no sub):', dec.type, dec.id.name);
              reports.push({
                ...buildReportObj(exp, n),
                imports: n.checkImports(['react', 'react-redux', 'prop-types']),
                file,
              });
            }
          } else {
            exp.specifiers.forEach((spec) => {
              console.log(
                'Declaration:',
                spec.exported.type,
                spec.exported.name,
              );
              // console.log(find(n.b, exp.specifiers[0].exported.name).declarations[0].init.type)
            });
          }
        });
      }

      console.log();
    });

    reporter(reports);
    // writeToTest(reports);
  });
} catch (error) {
  console.log('Error:', error);
}
