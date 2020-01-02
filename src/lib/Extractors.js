const jsonata = require("jsonata");

module.exports = {
  Classes: jsonata("program.body[type='ClassDeclaration'][**.id[name='Example']]"),
  Variables: jsonata("program.body[type='VariableDeclaration']"),
  Expressions: jsonata("program.body[type='ExpressionStatement']"),
  ExportDefault: jsonata("program.body[type='ExportDefaultDeclaration']"),
  Exports: jsonata("program.body[type='ExportNamedDeclaration']"),
  Imports: jsonata("program.body[type='ImportDeclaration']"),
  React: jsonata("program.body[type='ImportDeclaration'][**.source[value='react']]"),
  Redux: jsonata("program.body[type='ImportDeclaration'][**.source[value='react-redux']]"),
  PropTypes: jsonata("program.body[type='ImportDeclaration'][**.source[value='prop-types']]"),
}