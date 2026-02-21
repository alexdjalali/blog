/* CV Timeline — Horizontal Gantt-style layout with D3.js v7 */
/* Adapted from martisak/resume (MIT) for Hugo + Coder theme */

(function () {
  "use strict";

  if (!window.timelineData || !window.timelineData.length) return;

  var dataset = window.timelineData.slice().sort(function (a, b) {
    return d3.ascending(a.startdate, b.startdate);
  });

  var container = d3.select("#timeline");
  var LANE_HEIGHT = 28;
  var LANE_PAD = 4;
  var AXIS_HEIGHT = 24;
  var MIN_BAR_WIDTH = 8; // minimum bar width so tiny periods are still hoverable
  var LABEL_PAD = 12; // horizontal padding inside bar for label fit check
  var MARGIN = { top: 10, right: 20, bottom: AXIS_HEIGHT + 10, left: 20 };
  var x, svg, tooltip;
  var PRESENT = new Date(new Date().getFullYear() + 1, 0, 1); // Jan 1 next year = "Present"

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
    var fmtMonth = d3.timeFormat("%b");
    var fmtYear = d3.timeFormat("%Y");
    var start = new Date(d.startdate);
    var sm = fmtMonth(start), sy = fmtYear(start);

    if (!d.enddate) return sm + " " + sy + " \u2013 Present";

    var end = new Date(d.enddate);
    var em = fmtMonth(end), ey = fmtYear(end);

    if (sy === ey) return sm + " \u2013 " + em + " " + sy;
    return sm + " " + sy + " \u2013 " + em + " " + ey;
  }

  function scrollToEntry(d) {
    var idx = dataset.indexOf(d);
    var target = document.getElementById("target_" + idx);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  /* ---- Draw ---- */
  function draw() {
    var numLanes = assignLanes();
    var containerNode = container.node();
    var containerWidth = containerNode.parentElement.clientWidth || containerNode.clientWidth || 600;
    var svgWidth = containerWidth;
    var width = svgWidth - MARGIN.left - MARGIN.right;
    var height = numLanes * (LANE_HEIGHT + LANE_PAD) + MARGIN.top + MARGIN.bottom;

    var minDate = d3.min(dataset, function (d) { return new Date(d.startdate); });
    var maxDate = PRESENT;

    x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);

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

    // Time axis — every year if wide enough
    var axisG = g.append("g")
      .attr("class", "time-axis")
      .attr("transform", "translate(0," + (numLanes * (LANE_HEIGHT + LANE_PAD) + 4) + ")");

    var fmtYear = d3.timeFormat("%Y");
    var presentYear = PRESENT.getFullYear();
    var axis = d3.axisBottom(x)
      .ticks(d3.timeYear.every(1))
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

    // Tooltip (appended to body so it's not clipped by overflow)
    tooltip = d3.select("body").append("div").attr("class", "tl-tooltip");

    // Bars
    var bars = g.selectAll(".tl-bar")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "tl-bar");

    bars.append("rect")
      .attr("class", function (d) { return "bar-rect " + d.type; })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD); })
      .attr("height", LANE_HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", function (d) { return x(new Date(d.startdate)); })
      .attr("width", 0)
      .on("click", function (event, d) { scrollToEntry(d); })
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
      .on("click", function (event, d) { scrollToEntry(d); })
      .on("mouseover", function (event, d) { showTooltip(event, d); highlight(d); })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", function () { hideTooltip(); resetHighlight(); });

    // Show labels only if they fit inside the bar
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

    // Legend
    var legend = container.append("div").attr("class", "timeline-legend");
    legend.append("span").html('<span class="legend-swatch job"></span> Experience');
    legend.append("span").html('<span class="legend-swatch education"></span> Education');

    // Detail sections
    buildSection("#experience", "job");
    buildSection("#education", "education");

    // Move honors/publications into the education column (honors first)
    var eduCol = document.getElementById("education");
    var honors = document.getElementById("honors");
    if (honors && eduCol) eduCol.appendChild(honors);
    var pubs = document.getElementById("publications");
    if (pubs && eduCol) eduCol.appendChild(pubs);

    observeEntries();
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

    // Keep tooltip on screen
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

  /* ---- Detail sections ---- */
  function buildSection(selector, type) {
    var filtered = dataset
      .filter(function (d) { return d.type === type; })
      .sort(function (a, b) { return d3.descending(a.startdate, b.startdate); });

    var section = d3.select(selector);
    var entries = section.selectAll("div.cv-entry")
      .data(filtered)
      .enter()
      .append("div")
      .attr("class", "cv-entry");

    var title = entries.append("h3")
      .attr("id", function (d) { return "target_" + dataset.indexOf(d); });

    var logoLink = title.append("a")
      .attr("href", function (d) { return d.url; })
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer");

    logoLink.append("img")
      .attr("class", "cv-entry-logo")
      .attr("src", function (d) { return siteBaseURL + d.logo; })
      .attr("alt", function (d) { return d.shorttitle + " logo"; })
      .attr("width", 20)
      .attr("height", 20);

    title.append("b").html(function (d) { return getDate(d); });
    title.append("a")
      .attr("href", function (d) { return d.url; })
      .attr("target", "_blank")
      .attr("rel", "noopener noreferrer")
      .html(function (d) { return d.title; });

    entries.each(function (d) {
      if (d.summary) {
        d3.select(this).append("p")
          .attr("class", "cv-summary")
          .text(d.summary);
      }
    });

    entries.append("div")
      .attr("class", "description collapsed")
      .html(function (d) { return d.description; });

    entries.append("a")
      .attr("class", "learn-more")
      .attr("href", "#")
      .text("Learn more")
      .on("click", function (event) {
        event.preventDefault();
        var entry = this.parentNode;
        var desc = entry.querySelector(".description");
        var isCollapsed = desc.classList.contains("collapsed");
        desc.classList.toggle("collapsed");
        this.textContent = isCollapsed ? "Show less" : "Learn more";
      });
  }

  /* ---- Resize ---- */
  function resize() {
    // Remove old elements
    container.select("svg").remove();
    container.select(".timeline-legend").remove();
    if (tooltip) tooltip.remove();

    var numLanes = assignLanes();
    var containerNode = container.node();
    var containerWidth = containerNode.parentElement.clientWidth || containerNode.clientWidth || 600;
    var svgWidth = containerWidth;
    var width = svgWidth - MARGIN.left - MARGIN.right;
    var height = numLanes * (LANE_HEIGHT + LANE_PAD) + MARGIN.top + MARGIN.bottom;

    var minDate = d3.min(dataset, function (d) { return new Date(d.startdate); });
    var maxDate = PRESENT;

    x = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);

    svg = container.insert("svg", ":first-child")
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
    axisG.call(
      d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(function (d) {
        return d.getFullYear() === presentYearR ? "Present" : fmtYearR(d);
      }).tickSize(4)
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
      .attr("class", function (d) { return "bar-rect " + d.type; })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD); })
      .attr("height", LANE_HEIGHT)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("x", function (d) { return x(new Date(d.startdate)); })
      .attr("width", function (d) { return barWidth(d); })
      .on("click", function (event, d) { scrollToEntry(d); })
      .on("mouseover", function (event, d) { showTooltip(event, d); highlight(d); })
      .on("mousemove", function (event) { moveTooltip(event); })
      .on("mouseout", function () { hideTooltip(); resetHighlight(); });

    var resizeLabels = bars.append("text")
      .attr("class", "bar-label")
      .attr("x", function (d) { return x(new Date(d.startdate)) + 6; })
      .attr("y", function (d) { return d._lane * (LANE_HEIGHT + LANE_PAD) + LANE_HEIGHT / 2; })
      .attr("dy", "0.35em")
      .text(function (d) { return d.shorttitle; })
      .on("click", function (event, d) { scrollToEntry(d); })
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

    var legend = container.append("div").attr("class", "timeline-legend");
    legend.append("span").html('<span class="legend-swatch job"></span> Experience');
    legend.append("span").html('<span class="legend-swatch education"></span> Education');
  }

  /* ---- Scroll-triggered fade-in ---- */
  function observeEntries() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".cv-entry, #honors, #publications").forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".cv-entry, #honors, #publications").forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- Init ---- */
  draw();
  var resizeTimer;
  d3.select(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
})();
