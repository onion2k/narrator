const fse = require('fs-extra');
const ejs = require("ejs");
const { ExportDefault, Exports } = require("./lib/Extractors");
const { React, Redux, PropTypes } = require("./lib/Imports");

const write = function(type, dir, file, name, content) {
  return fse.outputFile(`./output/${dir}/${name}.${type}.js`, content).then(e => {
      console.log(file, ":", name);
    });
};

module.exports = {
  writeToTest: (reports) => {
    reports.forEach((report, index) => {
      const { file, b, pt } = report;

      const template = Redux(b) ? "./src/templates/test_redux.ejs" : "./src/templates/test_default.ejs";

      ejs.renderFile(
        template,
        {
          file: file,
          component: "Comp" + index,
          as: "asComp",
          props: "Props"
        },
        {
          debug: false,
        },
        (error, result) => {
          if (error) {
            console.log(error);
          }
          write("test", "tests", file, "Comp" + index, result);
        }
      );

    });
  },
}
