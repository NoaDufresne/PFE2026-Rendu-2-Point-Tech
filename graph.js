const numSmall = 50; 
const width = window.innerWidth;
const height = window.innerHeight;

let nodesData = [];
let linksData = [];

nodesData.push({
  id: "center",
  type: "center",
  text: "Central Node",
  class:"central",
  radius:12
});

for(let i=0;i<numSmall;i++){
  nodesData.push({
    id:"small"+i,
    type:"small",
    text:`Node ${i}`,
    class:"small",
    radius:4 + Math.random()*2
  });
}

nodesData.forEach(n=>{
  if(n.type==="small"){
    linksData.push({source:n.id,target:"center"});
  }
});

for(let i=0;i<numSmall;i++){
  for(let j=i+1;j<numSmall;j++){
    if(Math.random()<0.05){ // moins dense, 5% chance
      linksData.push({source:"small"+i,target:"small"+j});
    }
  }
}

const tooltip = d3.select("#tooltip");

const svg = d3.select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const simulation = d3.forceSimulation(nodesData)
  .force("link", d3.forceLink(linksData).id(d=>d.id).distance(120).strength(0.3)) // plus espacées
  .force("charge", d3.forceManyBody().strength(d=>d.type==="center"? -200 : -30)) // moins dense
  .force("center", d3.forceCenter(width/2,height/2))
  .force("collision", d3.forceCollide().radius(d=>d.radius+3))
  .on("tick", ticked);

const link = svg.append("g")
  .selectAll("line")
  .data(linksData)
  .join("line")
  .attr("stroke-width", 1);

const node = svg.append("g")
  .selectAll("circle")
  .data(nodesData)
  .join("circle")
  .attr("class", d=>d.class)
  .attr("r", d=>d.radius)
  .call(drag(simulation))
  .on("mouseover",(event,d)=>{
    tooltip.style("display","block")
           .html(`<strong>${d.type}</strong><br>${d.text}`);
  })
  .on("mousemove", event=>{
    tooltip.style("left",(event.pageX+10)+"px")
           .style("top",(event.pageY+10)+"px");
  })
  .on("mouseout", ()=>{
    tooltip.style("display","none");
  });

function ticked(){
  link
    .attr("x1", d=>d.source.x)
    .attr("y1", d=>d.source.y)
    .attr("x2", d=>d.target.x)
    .attr("y2", d=>d.target.y);

  node
    .attr("cx", d=>d.x)
    .attr("cy", d=>d.y);
}

function drag(sim){
  function dragstarted(event,d){
    if(!event.active) sim.alphaTarget(0.3).restart();
    d.fx=d.x; d.fy=d.y;
  }
  function dragged(event,d){ d.fx=event.x; d.fy=event.y; }
  function dragended(event,d){
    if(!event.active) sim.alphaTarget(0);
    d.fx=null; d.fy=null;
  }
  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// Resize
window.addEventListener("resize", ()=>{
  const w = window.innerWidth;
  const h = window.innerHeight;
  svg.attr("width",w).attr("height",h);
  simulation.force("center", d3.forceCenter(w/2,h/2));
});