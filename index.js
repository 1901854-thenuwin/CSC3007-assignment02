var data = {
    resource_id: "83c21090-bd19-4b54-ab6b-d999c251edcf", // the resource id
  };
  $.ajax({
    url: "https://data.gov.sg/api/action/datastore_search",
    data: data,
    success: function (data) {
      //   alert('Total results found: ' + data.result.total)
      console.log(typeof data);
      console.log("data.result = ", data.result);
      console.log(data.result.records);
      var record = data.result.records;
      console.log("Record: ", record.length);
      observe_data(record);
      line_chart(record);
    },
  });
  
  function observe_data(record) {
    // get the types of crime
    var crime_types = ["Murder"];
    for (let row = 0; row < record.length; row++) {
      check_crime_type_inclusion = crime_types.includes(record[row]["level_2"]);
      console.log(check_crime_type_inclusion);
      if (check_crime_type_inclusion == false) {
        crime_types.push(record[row]["level_2"]);
      }
    }
    console.log("Crime Type:", crime_types);
    console.log(typeof record[0]["year"]);
  
    // get the years
    var years = ["2020"];
    for (let row = 0; row < record.length; row++) {
      check_year_inclusion = years.includes(record[row]["year"]);
      if (check_year_inclusion == false) {
        years.push(record[row]["year"]);
      }
    }
    console.log("Years:", years);
  }
  
  function line_chart(record) {
    console.log("Type of data:", typeof data);
    //set canvas margins
    leftMargin = 70;
    topMargin = 30;
  
    //format the year
    var parseTime = d3.timeParse("%Y");
  
    // get years and format
    record.forEach(function (d) {  
      d.year = parseTime(d.year);
    });
  
    //scale xAxis
    var xExtent = d3.extent(record, (d) => d.year);
    xScale = d3.scaleTime().domain(xExtent).range([leftMargin, 900]);
  
    //scale yAxis
    console.log('value type:', typeof(record[0]['value'])) 
    // value(number of cases) is string so need to convert to int
    Object.keys(record).forEach(function(number){
      record[number]['value']= parseInt(record[number]['value'])
    })
  
    var yMax = d3.max(record, (d) => d.value);
    console.log('yMax value:',yMax)
    yScale = d3
      .scaleLinear()
      .domain([0, yMax + topMargin])
      .range([600, 0])    
    //we will draw xAxis and yAxis next
  
    //draw xAxis and xAxis label
    xAxis = d3.axisBottom().scale(xScale);
  
    d3.select("svg")
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0,620)")
      .call(xAxis)
      .append("text")
      .attr("x", (900 + 70) / 2) //middle of the xAxis
      .attr("y", "50") // a little bit below xAxis
      .text("Year");
  
    //yAxis and yAxis label
    yAxis = d3.axisLeft().scale(yScale).ticks(10);
  
    d3.select("svg")
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${leftMargin},20)`) //use variable in translate
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", "-180")
      .attr("y", "-60")
      .attr("text-anchor", "end")
      .text("Total number of cases");
  
    //use .nest()function to group data so the line can be computed for each group
    var sumstat = d3
      .nest()
      .key((d) => d.level_2)
      .entries(record);
  
    console.log(sumstat);
  
    //set color pallete for different vairables
    var mediaName = sumstat.map((d) => d.key);
    var color = d3.scaleOrdinal().domain(mediaName).range(colorbrewer.Set2[6]);
  
    //select path - three types: curveBasis,curveStep, curveCardinal
    d3.select("svg")
      .selectAll(".line")
      .append("g")
      .attr("class", "line")
      .data(sumstat)
      .enter()
      .append("path")
      .attr("d", function (d) {
        return d3
          .line()
          .x((d) => xScale(d.year))
          .y((d) => yScale(d.value))
          .curve(d3.curveCardinal)(d.values);
      })
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.key))
      .attr("stroke-width", 2);
  
    //append circle
    d3.select("svg")
      .selectAll("circle")
      .append("g")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 6)
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.value))
      .style("fill", (d) => color(d.level_2));
    //append legends
    var legend = d3
      .select("svg")
      .selectAll("g.legend")
      .data(sumstat)
      .enter()
      .append("g")
      .attr("class", "legend");
  
    legend
      .append("circle")
      .attr("cx", 1000)
      .attr("cy", (d, i) => i * 30 + 350)
      .attr("r", 6)
      .style("fill", (d) => color(d.key));
  
    legend
      .append("text")
      .attr("x", 1020)
      .attr("y", (d, i) => i * 30 + 355)
      .text((d) => d.key);
  
    //append title
    d3.select("svg")
      .append("text")
      .attr("x", 485)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Cases Recorded for Selected Major Offences")
      .style("fill", "black")
      .style("font-size", 20)
      .style("font-family", "Arial Black");
  
    //apend source
    d3.select("svg")
      .append("text")
      .attr("x", 70)
      .attr("y", 700)
      .text("Source: data.gov.sg, cases recorded for selected major offences")
      .style("fill", "black")
      .style("font-size", 14)
      .style("font-family", "Arial Black");
  }