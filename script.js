var req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json", true);
req.send();
req.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const json=JSON.parse(req.responseText);
      drawPlot(json);
    }}

function drawPlot(json){
  var w=500;
  var h=500;
  const padding=50;
  const svg = d3.select("body")
  .append("svg")
  .attr("height",h)
  .attr("width",w);
  
  var parser = d3.timeParse("%M:%S");
  var parserYear = d3.timeParse("%Y");
  
  const timeMin = parser(d3.min(json, (d) => d["Time"]));
  const timeMax = parser(d3.max(json, (d) => d["Time"]));
  
  const yScale=d3.scaleTime()
  .domain([timeMin.setSeconds(timeMin.getSeconds()-5),
         timeMax.setSeconds(timeMax.getSeconds()+5)])
  .range([ padding, h-padding ]);
  const xScale=d3.scaleTime()
  .domain([parserYear(d3.min(json, (d) => d["Year"])-1),
           parserYear(d3.max(json, (d) => d["Year"])+1)])
  .range([ padding, w-padding ]);
  
  
  const circles = svg.selectAll("circles")
  .data(json)
  .enter()
  .append("circle")
  .style("fill", (d)=>(d["Doping"]=="")?"cyan":"orange")
  .attr("stroke","black")
  .attr("stroke-width","1")
  .attr("class", "dot")
  .attr("data-xvalue", (d)=>parserYear(d["Year"]))
  .attr("data-yvalue", (d)=>parser(d["Time"]))
  .attr("r", 5)
  .attr("cy", (d)=>yScale(parser(d["Time"])))
  .attr("cx", (d)=>xScale(parserYear(d["Year"])))
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut);
  
  
  var yAxis = svg.append("g")
  .attr("transform", "translate("+padding+",0)")
  .attr("id","y-axis")
  .call(d3
    .axisLeft(yScale)
    .ticks((10))
    .tickFormat(d3.timeFormat("%M:%S")));
  var xAxis = svg.append("g")
  .attr("transform", "translate(0,"+(h-padding)+")")
  .attr("id","x-axis")
  .call(d3
        .axisBottom(xScale)
        .tickFormat(d3.timeFormat("%Y")));
  
  d3.select("body").append("div").attr("id","legend");
  d3.select("#legend").append("p").text("Doping Allegations")
    .append("div").style("background-color","cyan")
    .style("width","10px").style("height","10px").style("margin-left","5px");
  d3.select("#legend").append("p").text("No Doping Allegations")
    .append("div").style("background-color","orange")
    .style("width","10px").style("height","10px").style("margin-left","5px");
  
  d3.select("body")
    .append("div")
    .attr("id","tooltip")
    .style("visibility","hidden")
    .style("position","absolute")
    .style("border-radius","2px")
    .style("border","1px solid black")
    .style("padding","10px");
  
  function handleMouseOver(d,i){
    d3.select("#tooltip")
      .attr("data-year",parserYear(d["Year"]))
      .style("visibility","visible")
      .style("background-color",(d["Doping"]=="")?"cyan":"orange")
      .style("left",event.pageX+0+"px")
      .style("top",event.pageY-45+"px")
      .html(d["Name"]+" "+d["Nationality"]+"<br>"+"Year: "+d["Year"]+", Time: "+d["Time"]+((d["Doping"]=="")?"":("<br><br>"+d["Doping"])));
  }
  function handleMouseOut(){
    d3.select("#tooltip").style("visibility","hidden");
  }
}