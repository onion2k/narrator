import React from "react";
import PropTypes from "prop-types";

class Example extends React.Component {
  static propTypes = {
    selectorContent: PropTypes.func.isRequired,
    propFunction: PropTypes.func.isRequired,
    content: PropTypes.string
  };

  static defaultProps = {
    content: "Default content"
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
