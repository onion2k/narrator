const path = require('path');
const fse = require('fs-extra');
const ejs = require("ejs");
const { Redux } = require("./lib/Imports");

const write = function(type, dir, file, name, content) {
  return fse.outputFile(`./output/${dir}/${path.basename(file, '.js')}.${type}.js`, content).then(e => {
      console.log(file, ":", `./output/${dir}/${path.basename(file, '.js')}.${type}.js`);
    });
};

const propTypeDefs = {
  'string': '"Test String"',
  'number': '1234',
  'func': '() => {}',
  'array': '["Test Array 1", "Test Array 2", "Test Array 3"]',
  'object': "{}",
}

const propsToTestProps = function(pt) {
  return Object.entries(pt).map(([key, value]) => {
    console.log(value)

    return value.required
      ? `    ${key}: ${value.value || propTypeDefs[value.type.chain[1]]}, //${value.type.string}` 
      : `    // ${key}: ${value.value || "''"}, //${value.type.string}`;
  }).join('\n')
}

module.exports = {
  writeToTest: (reports) => {
    reports.forEach((report, index) => {
      const { name, file, b, pt } = report;

      const template = Redux(b) ? "./src/templates/test_redux.ejs" : "./src/templates/test_default.ejs";

      ejs.renderFile(
        template,
        {
          file: file,
          component: name,
          as: name,
          props: propsToTestProps(pt)
        },
        {
          debug: false,
        },
        (error, result) => {
          if (error) {
            console.log(error);
          }
          write("test", "tests", file, name, result);
        }
      );

    });
  },
}
