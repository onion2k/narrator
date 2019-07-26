const fs = require("fs");
const util = require("util");
const promise_writeFile = util.promisify(fs.writeFile);
const colors = require("colors");

const writeStory = function(storyDir, file, name, story) {
  return promise_writeFile(`${storyDir}/${name}.stories.js`, story).then(e => {
    console.log(colors.green(file), ":", colors.red(name));
  });
};

const writeTest = function(storyDir, file, name, test) {
  return promise_writeFile(`${storyDir}/${name}.test.js`, test).then(e => {
    console.log(colors.green(file), ":", colors.red(name));
  });
};

module.exports = { writeStory, writeTest };
