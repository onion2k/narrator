const glob = require('glob');
require('colors');
const { reporter } = require('./reporting');
const { writeToTest } = require('./output');

const config = require('./narrator.config.json');
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
  console.log('Narrating', config.src, config.files, '\n');

  glob(`${config.src}${config.files}`, {}, (err, files) => {
    if (err) {
      console.log(err);
    }

    const reports = [];

    files.forEach((file) => {
      const n = new Narrator(file);
      // n.mapNodes();

      let exps = n.listExports();

      if (exps) {
        if (typeof exps === 'object' && !exps.length) {
          exps = [exps];
        }
        exps.forEach((exp) => {
          if (exp.type === 'ExportDefaultDeclaration') {
            const expReport = {
              ...buildReportObj(exp, n),
              imports: n.checkImports(['react', 'react-redux', 'prop-types']),
              file,
            };
            reports.push(expReport);
          } else if (
            Object.prototype.hasOwnProperty.call(exp, 'declaration')
            && exp.declaration !== null
          ) {
            /**
             * exported as an equality expression eg export const blah = thing
             */
            if (
              Object.prototype.hasOwnProperty.call(
                exp.declaration,
                'declarations',
              )
            ) {
              exp.declaration.declarations.forEach(() => {
                // console.log('Declaration (sub):', dec.type, dec.id.name);
              });
            } else {
              // const dec = exp.declaration;
              // console.log('Declaration (no sub):', dec.type, dec.id.name);
              reports.push({
                ...buildReportObj(exp, n),
                imports: n.checkImports(['react', 'react-redux', 'prop-types']),
                file,
              });
            }
          } else {
            // exp.specifiers.forEach((spec) => {
            // console.log(
            //   'Declaration:',
            //   spec.exported.type,
            //   spec.exported.name,
            // );
            // console.log(find(n.b, exp.specifiers[0].exported.name).declarations[0].init.type)
            // });
          }
        });
      }
    });

    if (config.reporting === true) {
      reporter(reports);
    }

    if (config.writeFiles === true) {
      writeToTest(reports);
    }
  });
} catch (error) {
  console.log('Error:', error);
}
