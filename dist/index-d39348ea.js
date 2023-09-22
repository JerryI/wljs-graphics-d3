function iterate(attrs, path) {
  const keys = Object.keys(attrs), l = keys.length;
  for (let i = 0; i < l; i++){
    const key = keys[i];
    path.attr(key, attrs[key]);
  }
}

function draw(context, attrs, id, scale, refX, refY, d){
  let defs = context.select("defs");
  if (defs.empty()) {
    defs = context.append("defs");
  }

  const path = defs.append("marker")
      .attr("id", id)
      .attr("refX", refX * scale)
      .attr("refY", refY * scale)
      .attr("markerWidth", refX + 2 * scale)
      .attr("markerHeight", refY * 2 * scale)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto-start-reverse")
    .append("path")
      .attr("d", d);

  iterate(attrs, path);
}

function arrow1() {
  let attrs = {
    fill: "black",
    stroke: "black"
  };
  let id = "d3-arrow-1";
  let scale = 1;
  
  function arrow(context){
    draw(
      context,
      attrs,
      id,
      scale,
      15,
      8,
      `M 1 1 Q ${7 * scale} ${5 * scale} ${16 * scale} ${8 * scale} Q ${7 * scale} ${11 * scale} 1 ${15 * scale} L ${4 * scale} ${8 * scale} Z`
    );
  }
  
  arrow.id = function(string){ return arguments.length ? (id = string, arrow) : id; };
  arrow.scale = function(number){ return arguments.length ? (scale = number, arrow) : scale; };
  arrow.attr = function(key, value){ return arguments.length === 2 ? (attrs[key] = value, arrow) : attrs[key]; };
  
  return arrow;
}

export { arrow1 };
