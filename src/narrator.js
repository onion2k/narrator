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
  let pt;
  /**
   * Parse the incoming file to get the AST
   */
  const b = babelParser.parse(contents, {
    sourceType: "module",
    plugins: ["jsx", "dynamicImport", "classProperties"]
  });

  /**
   * Find the root level variable declarations
   */
  const expressionDecs = b.program.body.filter(node => {
    return node.type === "ExpressionStatement";
  });

  /**
   * these are the propTypes and defaultProps
   */
  if (expressionDecs) {
    pt = helpers.parsePropTypes(
      expressionDecs[0].expression.right,
      expressionDecs[1].expression.right
    );
  }

  /**
   * Find the root level variable declarations
   */
  const varDecs = b.program.body.filter(node => {
    return node.type === "VariableDeclaration";
  });
  console.log(varDecs[0].declarations[0].id.name); // name
  // console.log(varDecs[0].declarations[0].init.body.body[0].type); // ReturnStatement
  // console.log(varDecs[0].declarations[0].init.body.body[0].argument.type); // JSXElement

  /**
   * Find the root level class declarations
   */
  const classDecs = b.program.body.filter(node => {
    return node.type === "ClassDeclaration";
  });

  /**
   * Find the exports
   */
  const exportDecs = b.program.body.filter(node => {
    return (
      node.type === "ExportDefaultDeclaration" ||
      node.type === "ExportNamedDeclaration"
    );
  });
  console.log(exportDecs[0].declaration.name);

  /**
   * Define some things that we'll need to write the file
   */

  /**
   * Find the path from the component to whereever we're saving the tests
   */
  const relativeComponentPath = path.relative(config.storyDir, file);

  /**
   * Imports in tests don't use the extension, so strip it off.
   */
  const relativeComponentPathWithoutExtension = relativeComponentPath.substr(
    0,
    relativeComponentPath.length - path.extname(relativeComponentPath).length
  );

  let renderProps;
  let ptProm = new Promise((resolve, reject) => {
    if (exportDecs.length > 0) {
      exportDecs.forEach(exp => {
        const name =
          exp.type === "ExportNamedDeclaration"
            ? changeCase.camel(exp.declaration.name)
            : changeCase.pascal(path.basename(file, ".js"));
        pt = getPt(classDecs);
        pt.then(data => {
          renderProps = {
            path: relativeComponentPathWithoutExtension,
            name: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
            as: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
            props: data
          };
          resolve(renderProps);
        });
      });
    }
  });

  /**
   *
   */

  if (ptProm) {
    ptProm
      .then(props => {
        console.log(props);
        if (props) {
          render(
            "./src/templates/test_default.ejs",
            props.path,
            props.name,
            props.as,
            props.props
          )
            .then(f => {
              return writeTest(config.storyDir, file, renderProps.name, f);
            })
            .catch(error => {
              console.log("Error: ", error);
            });
        }
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
