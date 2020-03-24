const glob = require('glob');
require('colors');
// const { get } = require('lodash');
const { reporter } = require('./reporting');
const { writeToTest } = require('./output');

const config = require('./narrator.config.json');
const { parseNodeData } = require('./lib/parseNodeData');
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
      const narrator = new Narrator(file);

      // narrator.mapNodes();

      let exps = narrator.listExports();

      if (exps) {
        if (typeof exps === 'object' && !exps.length) {
          exps = [exps];
        }
        exps.forEach((exp) => {
          if (
            Object.prototype.hasOwnProperty.call(exp, 'declaration')
            && exp.declaration !== null
          ) {
            /**
             * Export has it's own declarations, which means it's a reference to something else
             */
            if (
              Object.prototype.hasOwnProperty.call(
                exp.declaration,
                'declarations',
              )
            ) {
              exp.declaration.declarations.forEach((dec) => {
                /**
                 * Recursively look down the tree to find the parsable node
                 */
                console.log(
                  'Sub declaration:',
                  dec.type,
                  dec.id.name,
                  'will need to find the node...',
                );
              });
            } else {
              /**
               * Parse default and named export declarations
               */
              console.log('Declaration:', exp.type);

              reports.push({
                ...parseNodeData(exp, narrator),
                imports: narrator.checkImports([
                  'react',
                  'react-redux',
                  'prop-types',
                ]),
                default: exp.type === 'ExportDefaultDeclaration',
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
