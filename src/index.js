const fs = require("fs");
const glob = require("glob");

const config = require("./narrator.config.json");

const path = require("path");

const babelParser = require("@babel/parser");

const { ClassDeclaration, ExportDefaultDeclaration, VariableDeclaration } = require("./Extractors");

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

        console.log(VariableDeclaration.evaluate(b));
        
        // console.log(ClassDeclaration.evaluate(b));
      });
    });
  });
  