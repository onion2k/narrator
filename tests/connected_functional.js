import React from "react";
import { connect } from "react-redux";

const Example = ({ style, string="String", update=()=>{} }, id, count=123, save=()=>{}) => {
  return (
    <div className="example">
      <button onClick={() => {}}>Vertical (Left)</button>
    </div>
  );
}

export default connect(
  createStructuredSelector({
    selectorContent: selectorContentSelector
  }),
  {
    propFunction: () => {}
  }
)(Example);
