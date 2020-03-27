const jsonata = require('jsonata');

module.exports = {
  Classes: jsonata("program.body[type='ClassDeclaration']"),
  Variables: jsonata("program.body[type='VariableDeclaration']"),
  Expressions: jsonata("program.body[type='ExpressionStatement']"),
  Exports: jsonata(
    "program.body[**[type='ExportDefaultDeclaration' or type='ExportNamedDeclaration']]",
  ),
  ExportDefault: jsonata("program.body[type='ExportDefaultDeclaration']"),
  ExportSpecifiers: jsonata("program.body[type='ExportNamedDeclaration']"),
  IdentifierName: jsonata('name'),
  CalleeName: jsonata('callee.callee.name'),
  SuperClass: jsonata('superClass'),
  ClassMethod: jsonata(
    "body.body[**[type='ClassMethod' or type='ClassProperty']]",
  ),
  ClassMethodReturnStatement: jsonata("body.[*[type='ReturnStatement']]"),
};
