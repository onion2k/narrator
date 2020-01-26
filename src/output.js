const path = require('path');
const fse = require('fs-extra');
const ejs = require("ejs");
const { ExportDefault, Exports } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");
const config = require("./narrator.config.json");

const write = function(type, dir, file, name, content) {
  return fse.outputFile(`./output/${dir}/${path.basename(file, '.js')}.${type}.js`, content).then(e => {
      console.log(file, ":", `./output/${dir}/${path.basename(file, '.js')}.${type}.js`);
    });
};

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
          props: "Props"
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
