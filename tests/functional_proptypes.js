import React from "react";
import PropTypes from "prop-types";

const Example = ({ content }) => {
  return <div className="example">{content}</div>;
};

Example.propTypes = {
  content: PropTypes.string
};

Example.defaultProps = {
  content: "Default string"
};

export default Example;