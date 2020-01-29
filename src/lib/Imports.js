const jsonata = require("jsonata");

const ImportLibTest = function(lib) {
  return jsonata(`program.body[type='ImportDeclaration'][**.source[value='${lib}']]`);
}

module.exports = {
  ImportLibTest,
  React: ImportLibTest("react").evaluate,
  Redux: ImportLibTest("react-redux").evaluate,
  PropTypes: ImportLibTest("prop-types").evaluate,
  Imports: jsonata("program.body[type='ImportDeclaration']"),
}