const jsonata = require("jsonata");

const propTypesProperties = jsonata("properties");
const defaultPropsProperties = jsonata("properties");

const propTypesToObject = ({ pt, pd }) => {

  const propTypes = propTypesProperties.evaluate(pt);
  const defaultProps = defaultPropsProperties.evaluate(pd);

  let props = {};

  propTypes.forEach((prop) => {
    props[prop.key.name] = '';
  });

  defaultProps.forEach((prop) => {
    props[prop.key.name] = prop.value.value;
  });

  return props;

}

module.exports = {
  propTypesToObject
}
