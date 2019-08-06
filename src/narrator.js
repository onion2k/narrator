const fs = require("fs");
const glob = require("glob");

const config = require("./narrator.config.json");

const path = require("path");
const changeCase = require("change-case");
const babelParser = require("@babel/parser");
const helpers = require("./lib/helpers");
const render = require("./lib/render");
const { writeTest } = require("./lib/writeFile");

const getPt = async function(dec) {
  return await helpers.getPropTypes(dec);
};

const narrate = async function(file, contents) {
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

  /**
   *
   * Assuming that the class is being exported later in the file as the default. This is wrong...
   */
  if (classDecs.length === 1) {
    if (classDecs[0].superClass) {
      if (
        classDecs[0].superClass.object &&
        classDecs[0].superClass.object.name === "React"
      ) {
        const name = changeCase.camel(classDecs[0].id.name);
        const pt = await getPt(classDecs);
        renderProps = {
          path: storyToComponentPath,
          name: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
          as: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
          props: pt
        };
        ptProm = Promise.resolve(renderProps);
      }
    }
  } else if (exportDecs.length === 1) {
    if (exportDecs[0].type === "ExportNamedDeclaration") {
      const name = changeCase.camel(exportDecs[0].declaration.name);
      const pt = helpers.getPropTypes(classDecs);
      renderProps = {
        path: storyToComponentPath,
        name: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
        as: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
        props: pt
      };
    } else {
      const name = changeCase.pascal(path.basename(file, ".js"));
      renderProps = {
        path: storyToComponentPath,
        name: `${name}`,
        as: `${name}`
      };
    }
    ptProm = Promise.resolve(renderProps);
  } else if (varDecs.length > 0) {
    // ptProm = helpers.getPropTypes(varDecs);
  }

  if (ptProm) {
    ptProm
      .then(props => {
        console.log(props);
        render(
          "./src/templates/test_default.ejs",
          renderProps.path,
          renderProps.name,
          renderProps.as,
          renderProps.props
        )
          .then(f => {
            return writeTest(config.storyDir, file, renderProps.name, f);
          })
          .catch(error => {
            console.log("Error: ", error);
          });
      })
      .catch(error => {
        console.log(error);
      });
  }
};

// ../Lexograph/client/{,!(static)/**/}/*.js
glob(config.src, {}, function(err, files) {
  if (err) {
    console.log(err);
  }

  files.map(file => {
    fs.readFile(file, "utf8", function(err, contents) {
      narrate(file, contents);
    });
  });
});

/**
 * Test 1
 */
