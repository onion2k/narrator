const findPropTypes = function(jsonObj, resolve) {
  if (jsonObj !== null && typeof jsonObj == "object") {
    Object.entries(jsonObj).forEach(([key, node]) => {
      if (node && node.key && node.key.name === "propTypes") {
        resolve(node);
        return;
      }
      findPropTypes(node, resolve);
    });
  }
};

const getPropTypes = function(jsonObj) {
  const pt = new Promise(function(resolve, reject) {
    findPropTypes(jsonObj, resolve);
  });

  pt.then(v => {
    v.value.properties.forEach(ptv => {
      console.log("pt:", ptv.key.name);
      // console.log("pt:", ptv.value.object);
      // console.log("pt:", ptv.value.object.property.name);
      // console.log("pt:", ptv.key.name, ptv.value.property.name);
    });
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
module.exports.unwrap = unwrap;
