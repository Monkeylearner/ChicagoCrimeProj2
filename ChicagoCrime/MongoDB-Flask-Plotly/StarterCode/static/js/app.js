function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  // @TODO: Build a Bubble Chart using the sample data
  var url = "/samples/" + sample;
  d3.json(url).then(function(data) {
   
    result = [];
    for (var i = 0; i < data.community.length; i++) {
      result.push({"area": data.area[i], "community": data.community[i], "sample_values": data.sample_values[i]});
    };
    result.sort((a, b) => b.sample_values - a.sample_values);
    result = result.slice(0, 40);
    console.log(result);

    // Trace1 for the sample data
    var trace1 = {
      values: result.map(row => row.sample_values),
      labels: result.map(row => row.community),
      //hovertext: result.map(row => row.community),
      type: "pie",
      orientation: "h"
    };
    var pieChart = [trace1];
    Plotly.newPlot("pie", pieChart);

    // @TODO: Build a Bubble Chart using the sample data
    var trace2 = {
      x: data.area,
      y: data.sample_values,
      type: "scatter",
      mode: "markers",
      marker: {
        size: data.sample_values,
        color: data.area
      },
      text: data.community
    };
    var bubbleChart = [trace2];
    var layout = {
      xaxis: {title: "Crime in Chicago community"},
    };
    Plotly.newPlot("bubble", bubbleChart, layout);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/types").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
}

// Initialize the dashboard
init();

