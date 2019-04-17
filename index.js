const fs = require("fs");
const path = require("path");
const util = require("util");
const changeCase = require("change-case");
const promise_writeFile = util.promisify(fs.writeFile);
const colors = require("colors");
const ejs = require("ejs");
const glob = require("glob");
const babelParser = require("@babel/parser");

const renderStory = async (template, file, name, as, destructure) => {
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

function recursivelyWalkTree(jsonObj) {
  if (jsonObj !== null && typeof jsonObj == "object") {
    Object.entries(jsonObj).forEach(([key, value]) => {
      // key is either an array index or object key
      if (value !== null) {
        if (value.key) {
          if (value.key.name === "propTypes") console.log(value);
        }
      }
      recursivelyWalkTree(value);
    });
  } else {
    // jsonObj is a number or string
  }
}

// ../Lexograph/client/{,!(static)/**/}/*.js
glob("../Lexograph/client/{,!(static)/**/}/diagrams_list_item.js", {}, function(
  err,
  files
) {
  if (err) {
    console.log(err);
  }

  files.map(file => {
    fs.readFile(file, "utf8", function(err, contents) {
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

      // const c = recursiveFilter(i => {
      //   return i.type === "ClassDeclaration";
      // }, b.program.body);

      // console.log(c);

      recursivelyWalkTree(varDecs);

      // varDecs.map(v => {
      //   if (v.declarations[0].init.type === "ClassExpression") {
      //     return v.declarations[0].init.body.body.map(cp => {
      //       if (cp.key.name === "propTypes") {
      //         console.log(cp);
      //         // return cp.value.properties.map(pt => {
      //         //   console.log(pt);
      //         // });
      //       }
      //     });
      //   }
      //   return null;
      // });

      // let relativePath = path.relative("../Lexograph/stories/", file);
      // relativePath = relativePath.substr(
      //   0,
      //   relativePath.length - path.extname(relativePath).length
      // );

      // if (classDecs.length === 1) {
      //   if (classDecs[0].superClass) {
      //     if (
      //       classDecs[0].superClass.object &&
      //       classDecs[0].superClass.object.name === "React"
      //     ) {
      //       const name = changeCase.camel(classDecs[0].id.name);

      //       renderStory(
      //         "./templates/story_default.ejs",
      //         relativePath,
      //         `${name}`,
      //         `{ ${name} }`,
      //         true
      //       )
      //         .then(story => {
      //           return promise_writeFile(
      //             `../Lexograph/stories/${name}.stories.js`,
      //             story
      //           ).then(e => {
      //             console.log(colors.green(file), ":", colors.red(name));
      //           });
      //         })
      //         .catch(err => {
      //           console.log(err);
      //         });
      //     }
      //   }
      // } else if (exportDecs.length === 1) {
      //   if (exportDecs[0].type === "ExportNamedDeclaration") {
      //     const name = changeCase.camel(exportDecs[0].declaration.name);
      //     renderStory(
      //       "./templates/story_default.ejs",
      //       relativePath,
      //       `${name}`,
      //       `${name}`,
      //       true
      //     )
      //       .then(story => {
      //         return promise_writeFile(
      //           `../Lexograph/stories/${name}.stories.js`,
      //           story
      //         ).then(e => {
      //           console.log(colors.green(file), ":", colors.red(name));
      //         });
      //       })
      //       .catch(err => {
      //         console.log(err);
      //       });
      //   } else {
      //     const name = changeCase.pascal(path.basename(file, ".js"));
      //     renderStory(
      //       "./templates/story_default.ejs",
      //       relativePath,
      //       `${name}`,
      //       `Component${name}`,
      //       true
      //     )
      //       .then(story => {
      //         return promise_writeFile(
      //           `../Lexograph/stories/${name}.stories.js`,
      //           story
      //         ).then(e => {
      //           console.log(colors.green(file), ":", colors.red(name));
      //         });
      //       })
      //       .catch(err => {
      //         console.log(err);
      //       });
      //   }
      // }
    });
  });
});
