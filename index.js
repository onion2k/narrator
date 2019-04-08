const fs = require("fs");
const colors = require("colors");
const glob = require("glob");
const babelParser = require("@babel/parser");

glob(
  "../Lexograph/client/builder/builder_actions/builder_action.js",
  {},
  function(err, files) {
    if (err) {
      console.log(err);
    }

    files.map(file => {
      fs.readFile(file, "utf8", function(err, contents) {
        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: ["jsx", "dynamicImport", "classProperties"]
        });

        const classDecs = b.program.body.filter(node => {
          return node.type === "ClassDeclaration";
        });

        if (classDecs.length === 1) {
          if (classDecs[0].superClass) {
            if (classDecs[0].superClass.object.name === "React") {
              console.log(file, classDecs[0].id.name);
            }
          }
        }

        // const exportDecs = b.program.body.filter(node => {
        //   return (
        //     node.type === "ExportDefaultDeclaration" ||
        //     node.type === "ExportNamedDeclaration"
        //   );
        // });

        // if (exportDecs.length === 1) {
        //   console.log(
        //     colors.green(file),
        //     ":",
        //     exportDecs[0].declaration.name
        //       ? colors.red(exportDecs[0].declaration.name)
        //       : colors.blue("Unnamed Default")
        //   );
        // }
      });
    });
  }
);
