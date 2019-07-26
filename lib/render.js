const ejs = require("ejs");

const render = async (template, file, name, as) => {
  const prom = new Promise((resolve, reject) => {
    ejs.renderFile(
      template,
      {
        file: file,
        component: name,
        as: as
      },
      (error, story) => {
        if (error) {
          reject(story);
        }
        resolve(story);
      }
    );
  });
  return await prom;
};

module.exports = render;
