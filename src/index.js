const fs = require("fs");
const glob = require("glob");
const colors = require("colors");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const { React, Redux, PropTypes } = require("./lib/Imports");
const { Classes, ExportDefault, Exports, Variables } = require("./lib/Extractors");

glob(config.src, {}, function(err, files) {
    if (err) { console.log(err); }
  
    files.map(file => {
      fs.readFile(file, "utf8", function(err, contents) {

        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: ["jsx", "dynamicImport", "classProperties"]
        });

        console.log(file)
        console.log("React", React(b) ? "Yep" : "nope" );
        console.log("Redux", Redux(b) ? "Yep" : "nope" );
        console.log("PropTypes", PropTypes(b) ? "Yep" : "nope" ); 
        console.log("Export Def", ExportDefault.evaluate(b) ? "Yep" : "nope" );
        console.log("Exports", Exports.evaluate(b) ? "Yep" : "nope" );
      });
    });
  });
  