const ejs = require("ejs");

const propsToString = function(props) {
  return Object.entries(props).reduce((str, y) => {
    if (y[1].required === false) {
      str += "\t\t// ";
    } else {
      str += "\t\t";
    }
    switch (y[1].type) {
      case "string":
        return (str += `${y[0]}: ${
          y[1].value === false ? false : "'" + y[1].value + "'"
        }, //${y[1].type} ${y[1].required ? "required" : ""}\n`);
      case "func":
        return (str += `${y[0]}: ${
          y[1].value === null ? "()=>{}" : "'" + y[1].value + "'"
        }, //${y[1].type} ${y[1].required ? "required" : ""}\n`);
      case "object":
        return (str += `${y[0]}: ${
          y[1].value === null || y[1].value === "undefined"
            ? "{}"
            : "'" + y[1].value + "'"
        }, //${y[1].type} ${y[1].required ? "required" : ""}\n`);
      case "array":
        return (str += `${y[0]}: ${
          y[1].value === null ? "[]" : "'" + y[1].value + "'"
        }, //${y[1].type} ${y[1].required ? "required" : ""}\n`);
      default:
        return (str += `${y[0]}: ${y[1].value}, //${y[1].type} ${
          y[1].required ? "required" : ""
        }\n`);
    }
  }, "");
};

const render = async (template, file, name, as, props) => {
  const prom = new Promise((resolve, reject) => {
    console.log(propsToString(props));
    ejs.renderFile(
      template,
      {
        file: file,
        component: name,
        as: as,
        props: propsToString(props)
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
