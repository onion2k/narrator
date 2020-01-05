import React from "react";
import PropTypes from "prop-types";

const Example = ({ content }) => {
  return <div className="example">{content}</div>;
};

Example.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string,
  content2: PropTypes.string,
};

Example.defaultProps = {
  content: "Default string",
  content2: "More content"
};

export default Example;
