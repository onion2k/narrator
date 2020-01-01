const fs = require("fs");
const glob = require("glob");

const config = require("./narrator.config.json");

const path = require("path");

const jsonata = require("jsonata");
const babelParser = require("@babel/parser");

const classDeclaration = jsonata("program.body[type='ClassDeclaration'][**.id[name='Example']]");

glob(config.src, {}, function(err, files) {
    if (err) {
      console.log(err);
    }
  
    files.map(file => {
      fs.readFile(file, "utf8", function(err, contents) {

        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: ["jsx", "dynamicImport", "classProperties"]
        });

        console.log(classDeclaration.evaluate(b));

      });
    });
  });
  