const fs = require("fs");
const util = require("util");
const promise_writeFile = util.promisify(fs.writeFile);
const colors = require("colors");

const write = function(type, dir, file, name, content) {
  return promise_writeFile(`${dir}/${name}.${type}.js`, content).then(e => {
    console.log(colors.green(file), ":", colors.red(name));
  });
};

const writeStory = function(storyDir, file, name, story) {
  write("stories", storyDir, file, name, story);
};

const writeTest = function(storyDir, file, name, story) {
  write("test", storyDir, file, name, story);
};

module.exports = { writeStory, writeTest };
