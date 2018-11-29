function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  // @TODO: Build a Bubble Chart using the sample data
  var url = "/samples/" + sample;
  d3.json(url).then(function (data) {

    var x_values = data.area;
    var y_values = data.sample_values;
    var marker_size = data.sample_values;
    var marker_colors = data.area;
    var text_values = data.community;

    var response = {
      x: x_values,
      y: y_values,
      text: text_values,
      mode: 'markers',
      marker: {
        color: marker_colors,
        size: marker_size
      }
    };

    var data = [response];
    var layout = {
      xaxis: { title: "Crime in Chicago community" },
    };

    Plotly.newPlot('bubble', data, layout);
  })

  // @TODO: Build a Pie Chart
  // HINT: You will need to use slice() to grab the top 10 sample_values,
  // otu_ids, and labels (10 each).
  d3.json(url).then(function (data) {
    var pie_values = data.sample_values.slice(0, 30);
    var pie_labels = data.community.slice(0, 30);;
    var pie_hover = data.community.slice(0, 30);;

    var data = [{
      values: pie_values,
      label: pie_labels,
      hovertext: pie_hover,
      type: 'pie'
    }];

    var layout = {
      showlegend: false
    };

    Plotly.newPlot('pie', data, layout);
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
    const firstSample = sampleNames[1];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
