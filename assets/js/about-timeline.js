/* About Timeline — Horizontal Gantt-style layout with D3.js v7 */
/* Simplified from cv-timeline.js for location history */

(function () {
  "use strict";

  if (!window.locationData || !window.locationData.length) return;

  var dataset = window.locationData.slice().sort(function (a, b) {
    return d3.ascending(a.startdate, b.startdate);
  });

  var container = d3.select("#about-timeline");
  if (container.empty()) return;

  var LANE_HEIGHT = 28;
  var LANE_PAD = 4;
  var AXIS_HEIGHT = 24;
  var MIN_BAR_WIDTH = 8;
  var LABEL_PAD = 12;
  var MARGIN = { top: 10, right: 20, bottom: AXIS_HEIGHT + 10, left: 20 };
  var x, svg, tooltip;
  var PRESENT = new Date(new Date().getFullYear() + 1, 0, 1);

  /* ---- Color gradient ---- */
  function isDarkMode() {
    return document.body.classList.contains("colorscheme-dark") ||
      (document.body.classList.contains("colorscheme-auto") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function getColorScale() {
    var start = isDarkMode() ? "#3498db" : "#2980b9";
    var end = isDarkMode() ? "#e74c3c" : "#c0392b";
    return d3.scaleSequential()
      .domain([0, dataset.length - 1])
      .interpolator(d3.interpolateHsl(start, end));
  }

  /* ---- Assign swim lanes so overlapping bars stack ---- */
  function assignLanes() {
    var laneEnds = [];
    dataset.forEach(function (d) {
      var start = new Date(d.startdate);
      var end = d.enddate ? new Date(d.enddate) : PRESENT;
      var placed = false;
      for (var i = 0; i < laneEnds.length; i++) {
        if (start >= laneEnds[i]) {
          d._lane = i;
          laneEnds[i] = end;
          placed = true;
          break;
        }
      }
      if (!placed) {
        d._lane = laneEnds.length;
        laneEnds.push(end);
      }
    });
    return laneEnds.length;
  }

  function barWidth(d) {
    var end = d.enddate ? new Date(d.enddate) : PRESENT;
    return Math.max(x(end) - x(new Date(d.startdate)), MIN_BAR_WIDTH);
  }

  function getDate(d) {
    var fmtYear = d3.timeFormat("%Y");
    var start = new Date(d.startdate);
    var sy = fmtYear(start);
    if (!d.enddate) return sy + " \u2013 Present";
    var end = new Date(d.enddate);
    var ey = fmtYear(end);
    if (sy === ey) return sy;
    return sy + " \u2013 " + ey;
  }

  function tickInterval() {
    var minDate = d3.min(dataset, function (d) { return new Date(d.startdate); });
    var yearSpan = PRESENT.getFullYear() - minDate.getFullYear();
    return yearSpan > 30 ? 5 : yearSpan > 15 ? 2 : 1;
  }

  /* ---- Draw ---- */
  function draw() {
    var numLanes = assignLanes();
    var colorScale = getColorScale();
    var containerNode = container.node();
    var containerWidth = containerNode.parentElement.clientWidth || containerNode.clientWidth || 600;
    var svgWidth = containerWidth;
    var width = svgWidth - MARGIN.left - MARGIN.right;
    var height = numLanes * (LANE_HEIGHT + LANE_PAD) + MARGIN.top + MARGIN.bottom;

    var minDate = d3.min(dataset, function (d) { return new Date(d.startdate); });
    var maxDate = PRESENT;

    x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

    svg = container.append("svg")
      .attr("width", svgWidth)
      .attr("height", height)
      .attr("class", "timeline-svg");

    var g = svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

    // Year grid lines
    var years = d3.timeYears(minDate, maxDate);
    g.selectAll(".grid-line")
      .data(years)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", function (d) { return x(d); })
      .attr("x2", function (d) { return x(d); })
      .attr("y1", 0)
      .attr("y2", numLanes * (LANE_HEIGHT + LANE_PAD));

    // Time axis
    var axisG = g.append("g")
      .attr("class", "time-axis")
      .attr("transform", "translate(0," + (numLanes * (LANE_HEIGHT + LANE_PAD) + 4) + ")");

    var fmtYear = d3.timeFormat("%Y");
    var presentYear = PRESENT.getFullYear();
    var interval = tickInterval();
    var axis = d3.axisBottom(x)
      .ticks(d3.timeYear.every(interval))
      .tickFormat(function (d) {
        return d.getFullYear() === presentYear ? "Present" : fmtYear(d);
      })
      .tickSize(4);

    axisG.call(axis);

    // Present marker
    g.append("line")
      .attr("class", "present-line")
      .attr("x1", x(PRESENT))
      .attr("x2", x(PRESENT))
      .attr("y1", 0)
      .attr("y2", numLanes * (LANE_HEIGHT + LANE_PAD));

    // Tooltip
    tooltip = d3.select("body").append("div").attr("class", "tl-tooltip");

    // Bars
    var bars = g.selectAll(".tl-bar")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "tl-bar");

    bars.append("rect")
      .attr("class", "bar-rect location")
      .style("fill", function (d, i) { return colorScale(i); })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD); })
      .attr("height", LANE_HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", function (d) { return x(new Date(d.startdate)); })
      .attr("width", 0)
      .on("mouseover", function (event, d) { showTooltip(event, d); highlight(d); })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", function () { hideTooltip(); resetHighlight(); })
      .transition()
      .ease(d3.easeCubicOut)
      .duration(800)
      .delay(function (d, i) { return i * 60; })
      .attr("width", function (d) { return barWidth(d); });

    // Bar labels — hidden if text doesn't fit
    var labels = bars.append("text")
      .attr("class", "bar-label")
      .attr("x", function (d) { return x(new Date(d.startdate)) + 6; })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD) + LANE_HEIGHT / 2; })
      .attr("dy", "0.35em")
      .text(function (d) { return d.shorttitle; })
      .style("opacity", 0)
      .on("mouseover", function (event, d) { showTooltip(event, d); highlight(d); })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", function () { hideTooltip(); resetHighlight(); });

    labels.each(function (d) {
      var textWidth = this.getComputedTextLength();
      var bw = barWidth(d);
      if (textWidth + LABEL_PAD > bw) {
        d3.select(this).remove();
      }
    });

    labels
      .transition()
      .delay(function (d, i) { return i * 60 + 400; })
      .duration(400)
      .style("opacity", 1);
  }

  /* ---- Tooltip ---- */
  function showTooltip(event, d) {
    tooltip
      .html("<strong>" + d.title + "</strong><br>" + getDate(d))
      .style("opacity", 1);
    moveTooltip(event);
  }

  function moveTooltip(event) {
    var left = event.pageX + 14;
    var top = event.pageY - 14;
    var tipNode = tooltip.node();
    var tipWidth = tipNode.offsetWidth;
    var tipHeight = tipNode.offsetHeight;
    if (left + tipWidth > window.innerWidth - 10) {
      left = event.pageX - tipWidth - 14;
    }
    if (top + tipHeight > window.innerHeight + window.pageYOffset - 10) {
      top = event.pageY - tipHeight - 14;
    }
    tooltip.style("left", left + "px").style("top", top + "px");
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }

  /* ---- Highlight ---- */
  function highlight(d) {
    svg.selectAll(".bar-rect")
      .transition().duration(200)
      .style("opacity", function (dd) { return dd === d ? 1 : 0.25; });
    svg.selectAll(".bar-label")
      .transition().duration(200)
      .style("opacity", function (dd) { return dd === d ? 1 : 0.15; });
  }

  function resetHighlight() {
    svg.selectAll(".bar-rect")
      .transition().duration(300)
      .style("opacity", null);
    svg.selectAll(".bar-label")
      .transition().duration(300)
      .style("opacity", 1);
  }

  /* ---- Resize / Redraw ---- */
  function redraw() {
    container.select("svg").remove();
    if (tooltip) tooltip.remove();

    var numLanes = assignLanes();
    var colorScale = getColorScale();
    var containerNode = container.node();
    var containerWidth = containerNode.parentElement.clientWidth || containerNode.clientWidth || 600;
    var svgWidth = containerWidth;
    var width = svgWidth - MARGIN.left - MARGIN.right;
    var height = numLanes * (LANE_HEIGHT + LANE_PAD) + MARGIN.top + MARGIN.bottom;

    var minDate = d3.min(dataset, function (d) { return new Date(d.startdate); });
    var maxDate = PRESENT;

    x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

    svg = container.append("svg")
      .attr("width", svgWidth)
      .attr("height", height)
      .attr("class", "timeline-svg");

    var g = svg.append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

    var years = d3.timeYears(minDate, maxDate);
    g.selectAll(".grid-line")
      .data(years)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", function (d) { return x(d); })
      .attr("x2", function (d) { return x(d); })
      .attr("y1", 0)
      .attr("y2", numLanes * (LANE_HEIGHT + LANE_PAD));

    var axisG = g.append("g")
      .attr("class", "time-axis")
      .attr("transform", "translate(0," + (numLanes * (LANE_HEIGHT + LANE_PAD) + 4) + ")");

    var fmtYearR = d3.timeFormat("%Y");
    var presentYearR = PRESENT.getFullYear();
    var interval = tickInterval();
    axisG.call(
      d3.axisBottom(x)
        .ticks(d3.timeYear.every(interval))
        .tickFormat(function (d) {
          return d.getFullYear() === presentYearR ? "Present" : fmtYearR(d);
        })
        .tickSize(4)
    );

    g.append("line")
      .attr("class", "present-line")
      .attr("x1", x(PRESENT))
      .attr("x2", x(PRESENT))
      .attr("y1", 0)
      .attr("y2", numLanes * (LANE_HEIGHT + LANE_PAD));

    tooltip = d3.select("body").append("div").attr("class", "tl-tooltip");

    var bars = g.selectAll(".tl-bar")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "tl-bar");

    bars.append("rect")
      .attr("class", "bar-rect location")
      .style("fill", function (d, i) { return colorScale(i); })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD); })
      .attr("height", LANE_HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", function (d) { return x(new Date(d.startdate)); })
      .attr("width", function (d) { return barWidth(d); })
      .on("mouseover", function (event, d) { showTooltip(event, d); highlight(d); })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", function () { hideTooltip(); resetHighlight(); });

    var resizeLabels = bars.append("text")
      .attr("class", "bar-label")
      .attr("x", function (d) { return x(new Date(d.startdate)) + 6; })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD) + LANE_HEIGHT / 2; })
      .attr("dy", "0.35em")
      .text(function (d) { return d.shorttitle; })
      .on("mouseover", function (event, d) { showTooltip(event, d); highlight(d); })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", function () { hideTooltip(); resetHighlight(); });

    resizeLabels.each(function (d) {
      var textWidth = this.getComputedTextLength();
      var bw = barWidth(d);
      if (textWidth + LABEL_PAD > bw) {
        d3.select(this).remove();
      }
    });
  }

  /* ---- Init ---- */
  draw();

  var resizeTimer;
  d3.select(window).on("resize.about", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(redraw, 150);
  });

  // Redraw on color scheme toggle
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", function () { redraw(); });
  new MutationObserver(function () { redraw(); })
    .observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
