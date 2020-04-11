$(document).ready(async function() {

  var nearest_stops_m1_g = {};
  var unique_nums_g = {};

  var lat_q1 = getParameterByName("lat1", window.location);
  var lon_q1 = getParameterByName("lon1", window.location);
  var lat_q2 = getParameterByName("lat2", window.location);
  var lon_q2 = getParameterByName("lon2", window.location);


// FUNCTION: getParameterByName - Get query params
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
// END FUNCTION: getParameterByName

async function reCaptchaSuccessful(){
  $("#search-btn").prop("disabled", false);
  $("#google-recaptcha").hide();
}

async function verifyreCaptcha(recaptcha_response) {
  let recaptchav2_response = grecaptcha.getResponse();

  if (recaptchav2_response) {

    const result = await $.ajax({
      url: "/.netlify/functions/recaptchaV2-validate",
      type: "GET",
      data: {
        "response": recaptchav2_response,
      },
      dataType: "json"
    });

    if (result.success == true) {
      reCaptchaSuccessful();
    }

  }

  return;

}

// FUNCTION: sortByDistance - Return array sorted by distance to stop
  async function sortByDistance(stops) {
    let stops_sorted = [];
    $.each(stops, async function(i) {
      stops_sorted.push(stops[i]);
    });

    stops_sorted.sort(function(a, b) {
      return parseFloat(a.dist) - parseFloat(b.dist);
    });

    return stops_sorted;
  }
  // END FUNCTION: sortByDistance

  // FUNCTION: compareStops - Returns distance diff of two tables containing stops
  async function compareStops(s1, s2) {
    let stops_diff = [];
    $.each(s1, async function(key, value) {
      let s1_stop_index = key;
      let s1_stopid = s1[s1_stop_index].extId;

      $.each(s2, async function(key, value) {
        let s2_stop_index = key;
        let s2_stopid = s2[s2_stop_index].extId;

        if (s1_stopid == s2_stopid) {
          let diff = s1[s1_stop_index].dist - s2[s2_stop_index].dist;
          s2[s2_stop_index]["diff"] = diff;
          stops_diff.push(s2[s2_stop_index]);
        }

      });

    });
    return await sortByDistance(stops_diff);
  }
  // END FUNCTION: compareStops

// FUNCTION: findRelevantStops - Return array of stops relevant to the transport number, sorted by distance to stop
  async function findRelevantStops(stops, nums, num_sel, direction_sel) {

    let direction = nums[num_sel].directions[direction_sel];
    let possible_stops = {};

    for(var key in stops) {
      let stopid = key;
      $.each(stops[stopid].departures, function(k) {
        let dep_direction = stops[stopid].departures[k].direction;
        let dep_num = stops[stopid].departures[k].transportNumber;
        if ( (dep_direction == direction) && (dep_num == num_sel)  ) {
          possible_stops[stopid] = stops[stopid];
        }
      });

    }

    return await sortByDistance(possible_stops);
  }
  // END FUNCTION: findRelevantStops


  // FUNCTION: nearbyStops - Return nearby stops as provided from Trafiklab API
  async function nearbyStops(lat, lon, radius, maxNo) {
    const result = await $.ajax({
      url: "/.netlify/functions/resrobot-nearby-stops",
      type: "GET",
      data: {
        "lat": lat,
        "lon": lon,
        "radius": radius,
        "maxNo": maxNo
      },
      dataType: "json"
    });

    return result;
  }
  // END FUNCTION: nearbyStops

  // FUNCTION: timetable - Return timetable for a stop, as provided from Trafiklab API
  async function timetable(stopid) {
    const result = await $.ajax({
      url: "/.netlify/functions/resrobot-timetable",
      type: "GET",
      data: {
        "stopid": stopid
      },
      dataType: "json"
    });

    return result;
  }
  // END FUNCTION: timetable

 // FUNCTION: findUniqueNums - Return table of transport numbers and associated directions
  async function findUniqueNums(stops) {
    let nums = {};

    $.each(stops, async function(key, value) {
      let stopid = key;

      // for each timetable, save direction and names for each departure
      $.each(stops[stopid].departures, function(i) {
        let departure = stops[stopid].departures[i];
        let direction = departure.direction;
        let transportNumber = departure.transportNumber;

        if (!(transportNumber in nums)) {
          nums[transportNumber] = {};
          nums[transportNumber]["directions"] = [];
          nums[transportNumber]["directions"].push(direction);
        } else if ($.inArray(direction, nums[transportNumber].directions) == -1) {
          nums[transportNumber]["directions"].push(direction);
        }

      });
    });
    return nums;
  }
  // END FUNCTION: findUniqueNums

  // FUNCTION: findNearestStops - Return table of stops and departures
  async function findNearestStops(lat, lon, getTT, sort) {
    let stops = {};
    let nearby_stops_res = await nearbyStops(lat, lon, false, false);

    for(i = 0; i < nearby_stops_res.StopLocation.length; i++) {
      let stopid = nearby_stops_res.StopLocation[i].id;
      stops[stopid] = nearby_stops_res.StopLocation[i];
    }

    // get departures for each stop
    if (getTT) {
      for(var key in stops) {
        let stopid = key;
        let timetable_res = await timetable(stopid);
        stops[stopid]["departures"] = timetable_res["Departure"];
      }
    }

    if (sort) {
      return await sortByDistance(stops);
    } else {
      return stops;
    }
  }
  // END FUNCTION: findNearestStops

  $("#search-btn").click(async function() {
    $("#searchresult ol").html("<p>Loading..</p>");
    let lat1, lon1;

    if (lat_q1 && lon_q1) {
      lat1 = lat_q1;
      lon1 = lon_q1;
    } else {
      console.log("Get coordinates..");
    }

    nearest_stops_m1_g = await findNearestStops(lat1, lon1, true, false);
    unique_nums_g = await findUniqueNums(nearest_stops_m1_g);

    $("#searchresult ol").html("");
    $.each(unique_nums_g, async function(key, value){
      let transportNumber = key;

      $.each(unique_nums_g[transportNumber].directions, async function(key, value){
        let directionIndex = key;
        let direction = unique_nums_g[transportNumber].directions[directionIndex];
        let linkindex = transportNumber + "-" + directionIndex;
        $("#searchresult ol").append("<li><a id= '" + linkindex + "' href='#" + linkindex + "'>Transport no " + transportNumber + " to " + direction + "</a></li>");
      });

    });
  });

  $("#searchresult").on("click", "ol li a", async function(event) {
    let href_arr = $(this).attr("href").replace("#", "").split("-");
    let rel_stops = await findRelevantStops(
                                nearest_stops_m1_g,
                                unique_nums_g,
                                href_arr[0],
                                href_arr[1]
                          );

    let lat2, lon2;
    if (lat_q2 && lon_q2) {
      lat2 = lat_q2;
      lon2 = lon_q2;
    } else {
      // wait a few seconds to obtain new position..
      console.log("Get coordinates..");
    }

    let nearest_stops_m2 = {};
    nearest_stops_m2 = await findNearestStops(lat2, lon2, false, true);

    let compare_stops_res = await compareStops(rel_stops, nearest_stops_m2);

    let ns = [];
    let ps = [];

    $.each(compare_stops_res, async function(key, value) {
      let stop_index = key;
      if (compare_stops_res[stop_index].diff >= 0) {
        ns.push(compare_stops_res[stop_index]);
      } else {
        ps.push(compare_stops_res[stop_index]);
      }
    });

    console.log("Next stop: " + ns[0].name + " , distance (meters): " + ns[0].dist);
    console.log("Past stop: " + ps[0].name + " , distance (meters): " + ps[0].dist);

  });

});
