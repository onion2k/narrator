import React from "react";

export default function({ style, string="String", update=()=>{} }, id, count=123, save=()=>{}) {
  return (
    <div className="example">
      <button onClick={() => {}}>Vertical (Left)</button>
    </div>
  );
}
