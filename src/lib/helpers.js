const searchJson = (json, term, resolve, reject) => {
  if (json !== null && typeof json == "object") {
    Object.entries(json).forEach(([key, node]) => {
      if (node && node.key && node.key.name === term) {
        resolve(node);
        return;
      }
      searchJson(node, term, resolve, reject);
    });
  } else {
    // reject("Not found");
  }
};

const findPropTypes = function(jsonObj, resolve, reject) {
  return searchJson(jsonObj, "propTypes", resolve, reject);
};

const findPropTypeDefaults = function(jsonObj, resolve, reject) {
  return searchJson(jsonObj, "defaultProps", resolve, reject);
};

const getPropTypes = function(jsonObj) {
  const propTypes = new Promise(function(resolve, reject) {
    findPropTypes(jsonObj, resolve, reject);
  });

  const defaultProps = new Promise(function(resolve, reject) {
    findPropTypeDefaults(jsonObj, resolve, reject);
  });

  return Promise.all([propTypes, defaultProps])
    .then(values => {
      const [propTypes, defaultProps] = values;
      // console.log(propTypes, defaultProps);

      const pt = {};
      const defs = {};
      defaultProps.value.properties.forEach(ptv => {
        // console.log("pt:", ptv.key.name, "--", ptv.value.value);
        defs[ptv.key.name] = ptv.value;
      });

      propTypes.value.properties.forEach(ptv => {
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
    })
    .catch(err => {
      if (err) console.log("Oopers", err);
    });

  return propTypes;
};

const unwrap = function(obj) {
  if (obj !== null && typeof obj == "object") {
    Object.entries(obj).forEach(([key, node]) => {
      unwrap(node);
    });
  }
};

module.exports.getPropTypes = getPropTypes;
module.exports.unwrap = unwrap;
