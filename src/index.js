const glob = require('glob');
require('colors');
// const { get } = require('lodash');
const { reporter } = require('./reporting');
const { writeToTest } = require('./output');

const config = require('./narrator.config.json');
const { parseNodeData, parseClassData } = require('./lib/parseNodeData');
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

      // console.log();
      // console.log(file);

      const fileData = {
        file,
        imports: narrator.checkImports(['react', 'react-redux', 'prop-types']),
        exports: [],
      };

      // narrator.mapNodes();

      let exps = narrator.listExports();

      if (exps) {
        if (typeof exps === 'object' && !exps.length) {
          exps = [exps];
        }
        exps.forEach((exp) => {
          // CallExpression

          // If it's a call exp then it's most like a connect or a flow

          // What is the export declaration?
          // console.log(exp.declaration);
          // exp.declaration.callee <- the function
          // exp.declaration.arguments <- what's inside the brackets

          // console.log(exp.declaration.callee);
          // exp.declaration.callee.type <- what is the function?

          // console.log(exp.declaration.callee.callee);
          // exp.declaration.arguments.name <- the function

          // console.log(exp.declaration.callee.arguments);
          // exp.declaration.arguments.name <- the function

          // Is this the default? Override the identifier resolved report?
          // properties and methods
          // name

          // const resolved = narrator.resolveIdentifier(exp.declaration.arguments[0].name);
          // // exp.declaration.arguments.name <- the function

          // const resreport = {
          //   ...parseNodeData(resolved, narrator),
          //   ...parseClassData(resolved),
          //   default: resolved.type === 'ExportDefaultDeclaration',
          //   file,
          // };

          // console.log(resreport);

          if (
            Object.prototype.hasOwnProperty.call(exp, 'declaration')
            && exp.declaration !== null
          ) {
            /**
             * Export has it's own sub declarations, which means it's a reference to something else
             */
            if (
              Object.prototype.hasOwnProperty.call(
                exp.declaration,
                'declarations',
              )
            ) {
              exp.declaration.declarations.forEach(() => {
                // dec
                // dec
                /**
                 * Recursively look down the tree to find the parsable node
                 */
                // console.log(
                //   'Sub declaration:',
                //   dec.type,
                //   dec.id.name,
                //   'will need to find the node...',
                // );
              });
            } else if (
              Object.prototype.hasOwnProperty.call(exp.declaration, 'callee')
              && exp.declaration.callee !== null
            ) {
              if (exp.declaration.arguments.length > 0) {
                const resolved = narrator.resolveIdentifier(
                  exp.declaration.arguments[0].name,
                );
                const identifierName = narrator.identifyNode(exp);
                const report = {
                  ...parseNodeData(resolved, narrator, identifierName),
                  ...parseClassData(resolved),
                  default: exp.type === 'ExportDefaultDeclaration',
                  file,
                };
                fileData.exports.push(report);
              }
            } else {
              /**
               * Parse default and named export declarations
               */
              const identifierName = narrator.identifyNode(exp);

              const report = {
                ...parseNodeData(exp.declaration, narrator, identifierName),
                ...parseClassData(exp),
                default: exp.type === 'ExportDefaultDeclaration',
                file,
              };
              fileData.exports.push(report);
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

      reports.push(fileData);
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
