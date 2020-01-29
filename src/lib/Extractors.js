const jsonata = require("jsonata");

module.exports = {
  Classes: jsonata("program.body[type='ClassDeclaration']"),
  Variables: jsonata("program.body[type='VariableDeclaration']"),
  Expressions: jsonata("program.body[type='ExpressionStatement']"),
  Exports: jsonata("program.body[type='ExportDefaultDeclaration' or type='ExportNamedDeclaration']"),
  ExportDefault: jsonata("program.body[type='ExportDefaultDeclaration']"),
  ExportSpecifiers: jsonata("program.body[type='ExportNamedDeclaration']"),
  Imports: jsonata("program.body[type='ImportDeclaration']"),
  IdentifierName: jsonata("declaration.name"),
  CalleeName: jsonata("declaration.callee.callee.name"),


}