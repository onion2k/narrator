const jsonata = require("jsonata");

const propTypesProperties = jsonata("properties");
const defaultPropsProperties = jsonata("properties");

const propTypesToObject = ({ pt, pd }) => {

  const propTypes = propTypesProperties.evaluate(pt);
  const defaultProps = defaultPropsProperties.evaluate(pd);

  let props = {};
  if (propTypes) {
    propTypes.forEach((prop) => {
      switch (prop.value.type) {
        case "MemberExpression":
          // console.log(prop.key.name, prop.value.type)
          break;
        case "CallExpression":
          // value callee
          // console.log(prop.key.name, prop.value.callee.type)
          break;
        
      }
      // console.log(prop.value.property ? prop.value.property.name : prop.value.callee.object.property.name)
      props[prop.key.name] = { type: '', value: '', required: false };
    });
  }

  if (defaultProps) {
    defaultProps.forEach((prop) => {
      switch (prop.value.type) {
        case "ArrayExpression":
          props[prop.key.name].value = prop.value.elements.map(element => element.value);
          break;
        case "ObjectExpression":
          // This should recursively return object values based on types
          props[prop.key.name].value = prop.value.properties.reduce((i, element) => { i[element.key.name] = element.value.value;  return i;  }, {});
          break;
        case "StringLiteral":
        case "NumericLiteral":
          props[prop.key.name].value = prop.value.value;
          break;
      }
    });  
  }

  return props;

}

module.exports = {
  propTypesToObject
}
