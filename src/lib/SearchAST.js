const jsonata = require("jsonata");

const findClassByName = jsonata("program.body[type='ClassDeclaration'][**[name=$identifierName]]");
const findVariableByName =  jsonata("program.body[type='VariableDeclaration'][**[name=$identifierName]]");

const find = (b, identifierName) => {
  const c = findClassByName.evaluate(b, { identifierName });
  const v = findVariableByName.evaluate(b, { identifierName });
  return c || v || null;
}

const findPropTypes = (x) => {
  const pt = jsonata("body.body[type='ClassProperty'][key.name='propTypes']").evaluate(x);
  const pd = jsonata("body.body[type='ClassProperty'][key.name='defaultProps']").evaluate(x);
  return { pt, pd };
  // console.log(pt.value.properties)
  // console.log(pd.value.properties)
}

module.exports = {
  find,
  findPropTypes,
  findClassByName,
  findVariableByName,
}