const path = require('path');
const fse = require('fs-extra');
const ejs = require('ejs');
const { sortRequiredFirst } = require('./lib/sort');

const write = (type, dir, file, content) => fse
  .outputFile(
    `./output/${dir}/${path.basename(file, '.js')}.${type}.js`,
    content,
  )
  .then((error) => {
    if (error) {
      console.log(error);
    }
    console.log(
      `Wrote ./output/${dir}/${path.basename(file, '.js')}.${type}.js`,
    );
  });

const propTypeDefs = {
  string: '"Test String"',
  number: '1234',
  func: '() => {}',
  array: '["Test Array 1", "Test Array 2", "Test Array 3"]',
  object: '{}',
};

const propsToTestProps = (pt) => {
  if (pt) {
    const sortedPt = Object.entries(pt).sort(sortRequiredFirst);
    console.log(sortedPt);
    if (sortedPt.length === 0) {
      return [];
    }
    return sortedPt.map(([key, value]) => (value.required
      ? `    ${key}: ${value.value || propTypeDefs[value.type.chain[1]]}, //${
        value.type.string
      }`
      : `    // ${key}: ${value.value || "''"}, //${value.type.string}`));
  }
  return false;
};

const writeToTest = (reports) => {
  reports.forEach((report) => {
    const { file, imports, exports } = report;

    const template = imports.redux
      ? './src/templates/test_redux.ejs'
      : './src/templates/test_default.ejs';

    console.log('pt:', propsToTestProps(exports));

    ejs.renderFile(
      template,
      {
        file,
        exports: propsToTestProps(exports),
        // component: name,
        // as: name,
        // props: propsToTestProps(pt),
      },
      {
        debug: false,
      },
      (error, result) => {
        if (error) {
          console.log(error);
        }
        write('test', 'tests', file, result);
      },
    );
  });
};

module.exports = {
  writeToTest,
};
