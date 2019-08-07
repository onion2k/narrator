const searchJson = (json, term, resolve, reject) => {
  if (json !== null && typeof json == "object") {
    Object.entries(json).find(([key, node]) => {
      if (node && node.key && node.key.name === term) {
        resolve(node);
        return;
      } else {
        return searchJson(node, term, resolve, reject);
      }
    });
  }
};

const findPropTypes = function(jsonObj, resolve, reject) {
  return searchJson(jsonObj, "propTypes", resolve, reject);
};

const findPropTypeDefaults = function(jsonObj, resolve, reject) {
  return searchJson(jsonObj, "defaultProps", resolve, reject);
};

const getPropTypes = async function(jsonObj) {
  const propTypes = new Promise(function(resolve, reject) {
    findPropTypes(jsonObj, resolve, reject);
  });

  const defaultProps = new Promise(function(resolve, reject) {
    findPropTypeDefaults(jsonObj, resolve, reject);
  });

  const ptProm = await Promise.all([propTypes, defaultProps])
    .then(values => {
      const [propTypes, defaultProps] = values;
      return parsePropTypes(propTypes.value, defaultProps.value);
    })
    .catch(err => {
      if (err) console.log("Oopers", err);
    });

  return ptProm;
};

const parsePropTypes = function(propTypes, defaultProps) {
  const pt = {};
  const defs = {};

  defaultProps.properties.forEach(ptv => {
    defs[ptv.key.name] = ptv.value;
  });

  propTypes.properties.forEach(ptv => {
    let f;
    let req = false;

    if (!ptv.value.property) {
      f = ptv.value.callee.property.name;
    } else if (ptv.value.object && ptv.value.object.property) {
      f = ptv.value.object.property.name;
      req = true;
    } else {
      f = ptv.value.property.name;
    }

    pt[ptv.key.name] = {
      type: f,
      required: req,
      value: !!defs[ptv.key.name] ? defs[ptv.key.name].value : null
    };
  });

  return pt;
};

const unwrap = function(obj) {
  if (obj !== null && typeof obj == "object") {
    Object.entries(obj).forEach(([key, node]) => {
      unwrap(node);
    });
  }
};

module.exports.getPropTypes = getPropTypes;
module.exports.parsePropTypes = parsePropTypes;
module.exports.unwrap = unwrap;
