class PropTypes {
  static searchJson(json, term, resolve, reject) {
    if (json !== null && typeof json == "object") {
      Object.entries(json).find(([key, node]) => {
        if (node && node.key && node.key.name === term) {
          resolve(node);
          return;
        } else {
          return this.searchJson(node, term, resolve, reject);
        }
      });
    }
  }

  static findPropTypes(jsonObj, resolve, reject) {
    return this.searchJson(jsonObj, "propTypes", resolve, reject);
  }

  static findPropTypeDefaults(jsonObj, resolve, reject) {
    return this.searchJson(jsonObj, "defaultProps", resolve, reject);
  }

  static parsePropTypes(propTypes, defaultProps) {
    const pt = {};
    const defs = {};

    defaultProps.properties.forEach(ptv => {
      defs[ptv.key.name] = ptv.value;
    });

    propTypes.properties.forEach(ptv => {
      let f;
      let req = false;

      /**
       * Loop through the propTypes
       *
       * key is the propTypes object key
       * value is the propType
       * if it's isRequired then it'll be a callExpression
       * if it's not required it'll be a memberExpression
       *
       * need to unwind the callExpressions to get each call
       */

      if (ptv.value.type === "CallExpression") {
        /**
         * Chained?
         */
        f = unchain(ptv)[1];
        req = true;
      } else if (!ptv.value.property) {
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
  }

  static async getPropTypes(jsonObj) {
    const self = this;

    const propTypes = new Promise(function(resolve, reject) {
      self.findPropTypes(jsonObj, resolve, reject);
    });

    const defaultProps = new Promise(function(resolve, reject) {
      self.findPropTypeDefaults(jsonObj, resolve, reject);
    });

    const ptProm = Promise.all([propTypes, defaultProps])
      .then(values => {
        const [propTypes, defaultProps] = values;
        return self.parsePropTypes(propTypes.value, defaultProps.value);
      })
      .catch(err => {
        if (err) console.log("Oopers", err);
      });

    return ptProm;
  }
}

function unchain(node) {
  /**
   * This is 'backwards'. The outermost property is the last property in the chain
   * Might need to recurse this...
   */
  f = [];
  f.push(node.value.callee.property.name);
  f.push(node.value.callee.object.property.name);
  f.push(node.value.callee.object.object.name);
  return f.reverse();
}

module.exports = PropTypes;
