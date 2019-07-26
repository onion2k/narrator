const fs = require("fs");
const glob = require("glob");

const config = require("./narrator.config.json");

const path = require("path");
const changeCase = require("change-case");
const babelParser = require("@babel/parser");
const helpers = require("./lib/helpers");
const render = require("./lib/render");
const { writeTest } = require("./lib/writeStory");

const storify = function(file, contents) {
  const b = babelParser.parse(contents, {
    sourceType: "module",
    plugins: ["jsx", "dynamicImport", "classProperties"]
  });

  const varDecs = b.program.body.filter(node => {
    return node.type === "VariableDeclaration";
  });

  const classDecs = b.program.body.filter(node => {
    return node.type === "ClassDeclaration";
  });

  const exportDecs = b.program.body.filter(node => {
    return (
      node.type === "ExportDefaultDeclaration" ||
      node.type === "ExportNamedDeclaration"
    );
  });

  let storyToComponentPath = path.relative(config.storyDir, file);
  storyToComponentPath = storyToComponentPath.substr(
    0,
    storyToComponentPath.length - path.extname(storyToComponentPath).length
  );

  let renderProps;
  let ptProm;

  if (varDecs.length > 0) {
    ptProm = helpers.getPropTypes(varDecs);
  } else {
    ptProm = Promise.resolve();
  }

  if (classDecs.length === 1) {
    if (classDecs[0].superClass) {
      if (
        classDecs[0].superClass.object &&
        classDecs[0].superClass.object.name === "React"
      ) {
        const name = changeCase.camel(classDecs[0].id.name);
        const pt = helpers.getPropTypes(classDecs);
        renderProps = {
          path: storyToComponentPath,
          name: `${name}`,
          as: `{ ${name} }`
        };
      }
    }
  } else if (exportDecs.length === 1) {
    if (exportDecs[0].type === "ExportNamedDeclaration") {
      const name = changeCase.camel(exportDecs[0].declaration.name);
      renderProps = {
        path: storyToComponentPath,
        name: `${name}`,
        as: `${name}`
      };
    } else {
      const name = changeCase.pascal(path.basename(file, ".js"));
      renderProps = {
        path: storyToComponentPath,
        name: `${name}`,
        as: `Component${name}`
      };
    }
  }
};

// ptProm.then(props => {
//   render(
//     "./templates/test_default.ejs",
//     renderProps.path,
//     renderProps.name,
//     renderProps.as
//   )
//     .then(story => {
//       return writeTest(config.storyDir, file, renderProps.name, story);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });

// ../Lexograph/client/{,!(static)/**/}/*.js
glob(config.src, {}, function(err, files) {
  if (err) {
    console.log(err);
  }

  files.map(file => {
    fs.readFile(file, "utf8", function(err, contents) {
      storify(file, contents);
    });
  });
});
