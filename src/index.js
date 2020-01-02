const fs = require("fs");
const glob = require("glob");
const colors = require("colors");
const babelParser = require("@babel/parser");

const config = require("./narrator.config.json");

const yep = "Yep".green.padStart(5);
const nope = "Nope".red.padStart(5);

const { React, Redux, PropTypes } = require("./lib/Imports");
const { ExportDefault, Exports, IdentifierName, CalleeName, findClassByName, findVariableByName } = require("./lib/Extractors");

glob(config.src, {}, function(err, files) {
    if (err) { console.log(err); }

    files.map(file => {
      fs.readFile(file, "utf8", function(err, contents) {
        const b = babelParser.parse(contents, {
          sourceType: "module",
          plugins: config.babel.plugins
        });

        console.log(file.brightYellow);
        console.log("React".padEnd(15), (React(b) ? yep : nope) );
        console.log("Redux".padEnd(15), (Redux(b) ? yep : nope) );
        console.log("PropTypes".padEnd(15), (PropTypes(b) ? yep : nope) );

        const exportDefault = ExportDefault.evaluate(b);
        if (exportDefault) {
          if (exportDefault.declaration.type === "Identifier") {
            const identifierName = IdentifierName.evaluate(exportDefault);
            try {
              const c = findClassByName.evaluate(b, { identifierName });
              const v = findVariableByName.evaluate(b, { identifierName });
              console.log("Export Default".padEnd(15), (c ? '(Class)' : v ? '(Variable)' : '(No idea)' ), identifierName );
            } catch(error) {
              console.log(error);
            }
          } else if (exportDefault.declaration.type === "CallExpression") {
            console.log("Export Default".padEnd(15), "Function Call:", CalleeName.evaluate(exportDefault).padStart(5) );
            if (CalleeName.evaluate(exportDefault) === 'connect') {
              const identifierName = exportDefault.declaration.arguments[0].name;
              const c = findClassByName.evaluate(b, { identifierName });
              const v = findVariableByName.evaluate(b, { identifierName });
              console.log("Connected:".padEnd(15), (c ? '(Class)' : v ? '(Variable)' : '(No idea)' ), identifierName );
            }
          }
        } else {
          console.log("Export Default".padEnd(15), nope );
        }

        console.log("Exports".padEnd(15), (Exports.evaluate(b) ? yep : nope) );
        console.log()

      });
    });
  });
  