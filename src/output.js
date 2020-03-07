const path = require('path');
const fse = require('fs-extra');
const ejs = require('ejs');
const { Redux } = require('./lib/Imports');
const { sortRequiredFirst } = require('./lib/sort');

const write = (type, dir, file, name, content) => fse
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
    return sortedPt
      .map(([key, value]) => (value.required
        ? `    ${key}: ${value.value
              || propTypeDefs[value.type.chain[1]]}, //${value.type.string}`
        : `    // ${key}: ${value.value || "''"}, //${value.type.string}`))
      .join('\n');
  }
  return false;
};

const writeToTest = (reports) => {
  reports.forEach((report) => {
    const {
      name, file, b, pt,
    } = report;

    const template = Redux(b)
      ? './src/templates/test_redux.ejs'
      : './src/templates/test_default.ejs';

    ejs.renderFile(
      template,
      {
        file,
        component: name,
        as: name,
        props: propsToTestProps(pt),
      },
      {
        debug: false,
      },
      (error, result) => {
        if (error) {
          console.log(error);
        }
        write('test', 'tests', file, name, result);
      },
    );
  });
};

module.exports = {
  writeToTest,
};
