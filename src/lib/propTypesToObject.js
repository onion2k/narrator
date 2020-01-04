const jsonata = require("jsonata");

const propTypesProperties = jsonata("properties");
const defaultPropsProperties = jsonata("properties");

const propTypesToObject = ({ pt, pd }) => {

  const propTypes = propTypesProperties.evaluate(pt);
  const defaultProps = defaultPropsProperties.evaluate(pd);

  let props = {};

  if (propTypes) {
    propTypes.forEach((prop) => {
      props[prop.key.name] = '';
    });
  }

  if (defaultProps) {
    defaultProps.forEach((prop) => {
      props[prop.key.name] = prop.value.value ? prop.value.value : "Undefined";
    });  
  }

  return props;

}

module.exports = {
  propTypesToObject
}
