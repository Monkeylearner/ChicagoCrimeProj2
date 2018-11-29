// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();
// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    // var svgWidth = window.innerWidth;
    // var svgHeight = window.innerHeight;
    var svgWidth = 960;
    var svgHeight = 650;

    var margin = {
        top: 50,
        right: 50,
        bottom: 160,
        left: 120
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "assault";
    var chosenYAxis = "morning";

    // function used for updating x-scale var upon click on axis label
    function xScale(crimeData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(crimeData, d => d[chosenXAxis]) * 1,
            d3.max(crimeData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(crimeData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(crimeData, d => d[chosenYAxis]) * 1,
            d3.max(crimeData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles when clicking on new axis
    function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // function used for updating the text in the circles group with a transition to
    // new circles when clicking on new axis
    function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis])+6);
        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {

        if (chosenXAxis === "assault") {
            var xlabel = "Assault:";
        }
        else if (chosenXAxis === "burglary") {
            var xlabel = "Burglary:";
        }
        else if (chosenXAxis === "deception") {
            var xlabel = "Deceptive Practices:";
        }
        else if (chosenXAxis === "motortheft") {
            var xlabel = "Motor Vehicle Thefts:";
        }
        else if (chosenXAxis === "narcotics") {
            var xlabel = "Narcotics (Drugs):";
        }
        else {
            var xlabel = "Robbery:";
        }

        if (chosenYAxis === "morning") {
            var ylabel = "Total Morning Crimes:";
        }
        else if (chosenYAxis === "afternoon") {
            var ylabel = "Total Afternoon Crimes";
        }
        else if (chosenYAxis === "evening") {
            var ylabel = "Total Evening Crimes";
        }
        else {
            var ylabel = "Total Night Crimes";
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) {
            return (`${d.community}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        textGroup.call(toolTip);

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return textGroup;
    }

    // Import Data from csv file
    var file = "/static/assets/data/crime.csv"
    d3.csv(file).then(fileData, exception);

    function exception(error){
        console.log("Not able to download");
        throw err;
    }

    function fileData(crimeData) {
        // Step 1: Parse Data/Cast as numbers
        // ==============================
        crimeData.forEach(function(data) {
            data.assault = +data.assault;
            data.burglary = +data.burglary;
            data.deception = +data.deception;
            data.motortheft = +data.motortheft;
            data.narcotics = +data.narcotics;
            data.robbery = +data.robbery;
            data.morning = +data.morning;
            data.afternoon = +data.afternoon;
            data.evening = +data.evening;
            data.night = +data.night;
        });
        console.log(crimeData);

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = xScale(crimeData, chosenXAxis);
        var yLinearScale = yScale(crimeData, chosenYAxis);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // console.log("Hi world 1");
        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
            .data(crimeData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "15")
            .attr("fill", "red")
            .attr("opacity", ".60");

        // console.log("Hi world 2");

        var textGroup = chartGroup.selectAll(".label")
            .data(crimeData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.abbr;}) 
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+6)
            .attr("fill", "white")
            .attr("font-family","Tahoma", "Geneva", "sans-serif")
            .attr("font-size",10);

        // console.log("Hi world 3");

        // Create group for 4 y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
            .attr("class", "axisText")
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle");

        var morningLabel = ylabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "morning")
            .classed("active", true)
            .attr("dy", "1em")
            .text("Morning Crimes");

        var afternoonLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "afternoon")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Afternoon Crimes");

        var eveningLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "evening")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Evening Crimes");

        var nightLabel = ylabelsGroup.append("text")
            .attr("y", 60 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "night")
            .classed("inactive", true)
            .attr("dy", "1em")
            .text("Night Crimes");

        // Create group for 6 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var assaultLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "assault")
            .classed("active", true)
            .text("Assault Crimes");

        var burglaryLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "burglary")
            .classed("inactive", true)
            .text("Burglary Crimes");

        var deceptionLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "deception")
            .classed("inactive", true)
            .text("Deceptive Practice Crimes");

        var motortheftLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 80)
            .attr("value", "motortheft")
            .classed("inactive", true)
            .text("Motor Vehicle Theft Crimes");

        var narcoticsLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 100)
            .attr("value", "narcotics")
            .classed("inactive", true)
            .text("Narcotic (Drugs) Crimes");

        var robberyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 120)
            .attr("value", "robbery")
            .classed("inactive", true)
            .text("Robbery Crimes");

        // updateToolTip function above csv import
        var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var xvalue = d3.select(this).attr("value");
            if (xvalue !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = xvalue;
                // updates x scale for new data
                xLinearScale = xScale(crimeData, chosenXAxis);
                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // updates text in circles with new x values
                textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // updates tooltips with new info
                textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);
                // changes classes to change bold text
                if (chosenXAxis === "assault") {
                    assaultLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    burglaryLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    deceptionLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    motortheftLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    narcoticsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    robberyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                }
                else if (chosenXAxis === "burglary") {
                    assaultLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    burglaryLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    deceptionLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    motortheftLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    narcoticsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    robberyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                
                }
                else if (chosenXAxis === "deception") {
                    assaultLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    burglaryLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    deceptionLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    motortheftLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    narcoticsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    robberyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                }
                else if (chosenXAxis === "motortheft") {
                    assaultLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    burglaryLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    deceptionLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    motortheftLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    narcoticsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    robberyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                }
                else if (chosenXAxis === "narcotics") {
                    assaultLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    burglaryLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    deceptionLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    motortheftLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    narcoticsLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    robberyLabel
                        .classed("active", false)
                        .classed("inactive", true);    
                }
                else {
                    assaultLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    burglaryLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    deceptionLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    motortheftLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    narcoticsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    robberyLabel
                        .classed("active", true)
                        .classed("inactive", false);    
                }
            }
        });
        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = yvalue;

            // updates y scale for new data
            yLinearScale = yScale(crimeData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates text in circles with new y values
            textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            text = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

            // changes classes to change bold text
            if (chosenYAxis === "morning") {
                morningLabel
                    .classed("active", true)
                    .classed("inactive", false);
                afternoonLabel
                    .classed("active", false)
                    .classed("inactive", true);
                eveningLabel
                    .classed("active", false)
                    .classed("inactive", true);
                nightLabel
                    .classed("active", false)
                    .classed("inactive", true);
        
            }
            else if (chosenYAxis === "afternoon") {
                morningLabel
                    .classed("active", false)
                    .classed("inactive", true);
                afternoonLabel
                    .classed("active", true)
                    .classed("inactive", false);
                eveningLabel
                    .classed("active", false)
                    .classed("inactive", true);
                nightLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "evening") {
                morningLabel
                    .classed("active", false)
                    .classed("inactive", true);
                afternoonLabel
                    .classed("active", false)
                    .classed("inactive", true);
                eveningLabel
                    .classed("active", true)
                    .classed("inactive", false);
                nightLabel
                    .classed("active", false)
                    .classed("inactive", true);
        
            }
            else {
                morningLabel
                    .classed("active", false)
                    .classed("inactive", true);
                afternoonLabel
                    .classed("active", false)
                    .classed("inactive", true);
                eveningLabel
                    .classed("active", false)
                    .classed("inactive", true);
                nightLabel
                    .classed("active", true)
                    .classed("inactive", false);
        
                }
            }
        });

    }
}