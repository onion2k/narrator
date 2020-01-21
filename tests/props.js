import React from "react";
import PropTypes from "prop-types";

class Example extends React.Component {
  static propTypes = {
    selectorContent: PropTypes.thing.something.somethingelse.isRequired,
    selectorContent: PropTypes.func.isRequired,
    content: PropTypes.string,
    arrayOneOf: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    either: PropTypes.object || PropTypes.bool, // Not really valid but detectable...
    slow: PropTypes.array.isRequired,
    defobj: PropTypes.object,
  };

  static defaultProps = {
    content: "Default content",
    defobj: {
      key1: 'string',
      key2: 123,
      key3: []
    }
  };

  shouldComponentUpdate(nextProps) {
    return true;
  }

  render() {
    const { content } = this.props;
    return <div>{content}</div>;
  }
}

export default Example;

/**
 * Jsonata
 *
 * program.body[type='ClassDeclaration'][**.id[name='Example']]
 *
 */
