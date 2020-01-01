const jsonata = require("jsonata");

module.exports = {
  ClassDeclaration: jsonata("program.body[type='ClassDeclaration'][**.id[name='Example']]"),
  ExportDefaultDeclaration: jsonata("program.body[type='ExportDefaultDeclaration']"),
  VariableDeclaration: jsonata("program.body[type='VariableDeclaration']"),
}