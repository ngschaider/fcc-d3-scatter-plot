const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

var width = 510;
var height = 400;
var paddingLeft = 40;
var paddingTop = 10;
var paddingRight = 250;
var paddingBottom = 20;

// Create tooltip
var tooltip = d3.select("body").append("div")
  .attr("id", "tooltip");

// Create SVG, assign width and height
var svg = d3.select("body").append("svg")
  .attr("width", width + paddingLeft + paddingRight)
  .attr("height", height + paddingTop + paddingBottom);

var legend = svg.append("g")
  .attr("transform", "translate(" + (width + paddingLeft + 20) + "," + (paddingTop + height/2) + ")")
  .attr("id", "legend")

createLegendLabel(0, "orange", "No doping allegations");
createLegendLabel(1, "purple", "Riders with doping allegations");

function createLegendLabel(index, color, text) {
  var label = legend.append("g")
    .attr("transform", "translate(0, " + index*30 + ")")
  
  label.append("rect")
    .attr("width", "20px")
    .attr("height", "20px")
    .attr("fill", color)
  
  label.append("text")
    .attr("x", "30px")
    .attr("y", "15px")
    .text(text)
}

  


d3.json(dataUrl).then((data) => {
  // convert Time attribute to Date object
  data = data.map(function(d) {
    var split = d.Time.split(":")
    d.Time = new Date(1970, 0, 1, 0, split[0], split[1]);
    return d;
  });
 
  
  
  
  // create scale for x axis
  var xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
    .range([0, width]);
  
  // create scale for y axis
  var yScale = d3.scaleTime()
    .domain([d3.min(data, d => d.Time), d3.max(data, d => d.Time)])
    .range([0, height]);
  
  // create x axis
  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  
  // create y axis
  var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));
  
  // append x axis
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(" + paddingLeft + ", " + (height + paddingTop) + ")")
    .call(xAxis);
  
  // append y axis
  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + paddingLeft + ", " + (paddingTop) + ")")
    .call(yAxis);
  
  
  // create all the dots from the dataset
  var dataContainer = svg.append("g");
  dataContainer.selectAll("circle")
    .data(data)
    .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("fill", d => d.Doping != "" ? "purple" : "orange")
      .attr("stroke", "black")
      .attr("data-xvalue", d => d.Year)
      .attr("data-yvalue", d => d.Time)
      .attr("r", 5)
      .attr("cx", d => xScale(d.Year) + paddingLeft)
      .attr("cy", d => yScale(d.Time) + paddingTop)
      .on("mouseover", handleMouseoverCurry(data))
      .on("mouseout", handleMouseoutCurry(data));
});


function handleMouseoverCurry(data) {
  return function(e) {
    var circle = d3.select(this);
    var year = circle.attr("data-xvalue");
    var time = circle.attr("data-yvalue");
    
    var dp = data.filter(d => d.Year == year && d.Time == time)[0];
    tooltip.html(dp.Name + ": " + dp.Nationality + "<br>Year: " + dp.Year + ", Time: " + dp.Time.getMinutes() + ":" + dp.Time.getSeconds() + "<br><br>" + dp.Doping)
      .attr("data-year", year)
      .style("left", (e.clientX + 30) + "px")
      .style("top", (e.clientY - 50) + "px")
      .transition()
        .duration(100)
        .style("opacity", 0.9);
  }
}

function handleMouseoutCurry(data) {
  return function() {
    tooltip.transition().duration(100).style("opacity", 0);
  }
}