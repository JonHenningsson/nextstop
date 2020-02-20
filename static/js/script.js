$(document).ready(async function(){

  var stops = {};

// perform search and show search result
  $("#search-btn").click(async function(){
    var lat = $("#lat-input").val();
    var lon = $("#lon-input").val();

    // find nearby stops
    let nearby_stops_res = await nearbyStops(lat, lon);

    $.each(nearby_stops_res.StopLocation, async function(i) {
      let stopid = nearby_stops_res.StopLocation[i].id;
      stops[stopid] = nearby_stops_res.StopLocation[i];
    });

    stops["unique_nums"] = {};
    $.each(stops, async function(key, value) {
      let stopid = key;
      let timetable_res = await timetable(stopid);
      stops[stopid]['departures'] = timetable_res["Departure"];

      // for each timetable, save direction and names for each departure
      $.each(stops[stopid].departures, function(i) {
        let departure = stops[stopid].departures[i];
        let direction = departure.direction;
        let transportNumber = departure.transportNumber;

        if (!(transportNumber in stops.unique_nums )) {
          stops.unique_nums[transportNumber] = {};
          stops.unique_nums[transportNumber]["directions"] = [];
          stops.unique_nums[transportNumber]["directions"].push(direction);
          let linkindex = transportNumber + "-" + stops.unique_nums[transportNumber]["directions"].indexOf(direction);
          $("#searchresult ol").append("<li><a id= '" + linkindex + "' href='#"+ linkindex + "'>Linje " + transportNumber + " mot " + direction + "</a></li>");
          //$("#searchresult ol").append("<li><a  id= '" + linkindex + "'>Linje " + transportNumber + " mot " + direction + "</a></li>");
        } else if ( $.inArray(direction, stops.unique_nums[transportNumber].directions) == -1) {
          stops.unique_nums[transportNumber]["directions"].push(direction);
          let linkindex = transportNumber + stops.unique_nums[transportNumber]["directions"].indexOf(direction);
          $("#searchresult ol").append("<li><a  id= '" + linkindex + "' href='#"+ linkindex + "'>Linje " + transportNumber + " mot " + direction + "</a></li>");
          //$("#searchresult ol").append("<li><a  id= '" + linkindex + "'>Linje " + transportNumber + " mot " + direction + "</a></li>");
        }

      });
    });

  });

  $("#searchresult").on("click", "ol li a", function (event) {
    let href = $(this).attr("href").replace("#", "");
    let href_arr = href.split("-");
    let num = href_arr[0];
    let directionIndex = href_arr[1];
    findNextStop(num, directionIndex);
  });


// TODO: find next stop
  async function findNextStop(num, directionIndex) {
    let direction = stops.unique_nums[num]["directions"][directionIndex];
    console.log(stops);
  }


// find nearby stops
  async function nearbyStops(lat, lon) {
    const result = await $.ajax({
        url: "/.netlify/functions/resrobot-nearby-stops",
        type: "GET",
        data: {"lat":lat, "lon":lon},
        dataType: "json"
    });

    return result;
  }

// find timetable for given stop
  async function timetable(stopid) {
    const result = await $.ajax({
        url: "/.netlify/functions/resrobot-timetable",
        type: "GET",
        data: {"stopid": stopid},
        dataType: "json"
    });

    return result;
  }

});
