const fs = require("fs");
const glob = require("glob");
const colors = require("colors");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const yep = "Yep".green;
const nope = "Nope".red;

const { React, Redux, PropTypes } = require("./lib/Imports");
const { Classes, ExportDefault, Exports, Variables } = require("./lib/Extractors");

glob(config.src, {}, function(err, files) {
    if (err) { console.log(err); }
  
    files.map(file => {
      fs.readFile(file, "utf8", function(err, contents) {
        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: config.babel.plugins
        });

        console.log(file.brightYellow)
        console.log("React".padEnd(15), (React(b) ? yep : nope).padStart(5) );
        console.log("Redux".padEnd(15), (Redux(b) ? yep : nope).padStart(5) );
        console.log("PropTypes".padEnd(15), (PropTypes(b) ? yep : nope).padStart(5) );

        const exportDefault = ExportDefault.evaluate(b);
        if (exportDefault) {
          if (exportDefault.declaration.type === "Identifier") {
            console.log(exportDefault.declaration)
            console.log("Export Default".padEnd(15), exportDefault.declaration.name.padStart(5) );
            } else if (exportDefault.declaration.type === "CallExpression") {
            console.log("Export Default".padEnd(15), "Function Call" );
          }
        } else {
          console.log("Export Default".padEnd(15), nope.padStart(5) );
        }

        console.log("Exports".padEnd(15), (Exports.evaluate(b) ? yep : nope).padStart(5) );
        console.log()

      });

    });
  });
  