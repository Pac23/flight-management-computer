// ==UserScript==
// @name FMC Extension for GEFS-Online
// @description This extension (by Ethan Shields) adds an FMC which controls other features included such as auto-climb, auto-descent, progress information, etc.
// @namespace GEFS-Plugins
// @match http://www.gefs-online.com/gefs.php*
// @match http://gefs-online.com/gefs.php*
// @run-at document-end
// @version 0.4.1.1505
// @grant none
// ==/UserScript==

/*
    Copyright (C) 2015 Ethan Shields

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, please visit http://www.gnu.org/licenses/gpl-3.0.html.
*/

// Kudos to Harry Xue for cleaning and restructuring code

function updateProgress(){var t=ges.aircraft.llaLocation[0]||0,a=ges.aircraft.llaLocation[1]||0,e=arrival[1]||0,n=arrival[2]||0,s=["--","--","--","--","--"],i=getRouteDistance(fmc.waypoints.nextWaypoint);i=10>i?Math.round(10*i)/10:Math.round(i);for(var d,p=0,r=!0;p<fmc.waypoints.route.length;p++)fmc.waypoints.route[p][1]||(r=!1);d=r?getRouteDistance(fmc.waypoints.route.length+1):fmc.math.getDistance(t,a,e,n);ges.aircraft.name;!ges.aircraft.groundContact&&arrival&&(s[0]=getete(d,!0),s[1]=geteta(s[0][0],s[0][1]),s[4]=getete(i,!1),d-tod>0&&(s[2]=getete(d-tod,!1),s[3]=geteta(s[2][0],s[2][1]))),print(d,i,s)}function updateLNAV(){var t=getRouteDistance(fmc.waypoints.nextWaypoint);t<=getTurnDistance(60)&&activateLeg(fmc.waypoints.nextWaypoint+1),clearInterval(LNAVTimer),LNAVTimer=t<ges.aircraft.animationValue.kias/60?setInterval(updateLNAV,500):setInterval(updateLNAV,3e4)}function updateVNAV(){var t,a,e,n,s=fmc.waypoints.route,i=getFlightParameters(),d=getNextWaypointWithAltRestriction(),p=-1!==d,r=ges.aircraft.animationValue.altitude;p&&(t=s[d-1][3],a=t-r,e=getRouteDistance(d),n=getTargetDist(a));var o,c,l,u=$("#tSpd").hasClass("btn-warning");if(u&&(o=i[0]),"climb"==phase)if(p){var h=getTargetDist(cruise-r)+getTargetDist(t-cruise);h>e?(c=n>e?fmc.math.getClimbrate(a,e):i[1],l=t):(c=i[1],l=cruise)}else c=i[1],l=cruise;else"descent"==phase&&(p?n>e&&(c=fmc.math.getClimbrate(a,e),l=t):(c=i[1],r>12e3+fieldElev&&(l=100*Math.round((12e3+fieldElev)/100))));(todCalc||!tod)&&(p?(tod=getRouteDistance(s.length)-e,tod+=getTargetDist(t-cruise)):tod=getTargetDist(fieldElev-cruise),tod=Math.round(tod),$("#todInput").val(""+tod).change()),o&&$("#Qantas94Heavy-ap-spd > input").val(""+o).change(),c&&$("#Qantas94Heavy-ap-vs > input").val(""+c).change(),l&&$("#Qantas94Heavy-ap-alt > input").val(""+l).change(),updatePhase()}function updateLog(t){if(!ges.pause&&!flight.recorder.playing&&!flight.recorder.paused){var a=Math.round(ges.aircraft.animationValue.ktas),e=Math.round(ges.aircraft.animationValue.heading360),n=Math.round(ges.aircraft.animationValue.altitude),s=ges.debug.fps,i=Math.round(1e4*ges.aircraft.llaLocation[0])/1e4,d=Math.round(1e4*ges.aircraft.llaLocation[1])/1e4,p=new Date,r=p.getUTCHours(),o=p.getUTCMinutes(),c=formatTime(timeCheck(r,o));t=t||"none",$("<tr>").addClass("data").append($("<td>"+c+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+a+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+e+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+n+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+i+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+d+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+s+"</td>").css("padding","0px 10px 0px 10px"),$("<td>"+t+"</td>").css("padding","0px 10px 0px 10px")).appendTo("#logData")}clearInterval(logTimer),logTimer=ges.aircraft.animationValue.altitude>18e3?setInterval(updateLog,12e4):setInterval(updateLog,3e4)}function checkGear(){ges.aircraft.animationValue.gearPosition!==ges.aircraft.animationValue.gearTarget&&updateLog(1===ges.aircraft.animationValue.gearTarget?"Gear Up":"Gear Down"),clearInterval(gearTimer),gearTimer=ges.aircraft.animationValue.altitude<1e4?setInterval(checkGear,12e3):setInterval(checkGear,6e4)}function checkFlaps(){ges.aircraft.animationValue.flapsPosition!==ges.aircraft.animationValue.flapsTarget&&updateLog("Flaps set to "+ges.aircraft.animationValue.flapsTarget)}function checkSpeed(){var t=ges.aircraft.animationValue.kcas,a=ges.aircraft.animationValue.altitude;t>255&&1e4>a&&updateLog("Overspeed"),clearInterval(speedTimer),speedTimer=1e4>a?setInterval(checkSpeed,15e3):setInterval(checkSpeed,3e4)}function updatePhase(){var t=100*Math.round(ges.aircraft.animationValue.altitude/100);if("climb"===phase&&t===Number(cruise))$("#phaseBtn").click();else if("cruise"===phase){var a=getRouteDistance(fmc.waypoints.route.length+1);t!==Number(cruise)?$("#phaseBtn").click():tod>=a&&$("#phaseBtn").click()}}function print(t,a,e){for(var n=0;n<e.length;n++)e[n]=formatTime(e[n]);t=10>t?Math.round(10*t)/10:Math.round(t),$("#flightete").text("ETE: "+e[0]),$("#flighteta").text("ETA: "+e[1]),$("#todete").text("ETE: "+e[2]),$("#todeta").text("ETA: "+e[3]),$("#flightdist").text(t+" nm"),$("#externaldist").text(t+" nm"),$("#toddist").text(t-tod+" nm"),$("#nextDist").text(a+" nm"),$("#nextETE").text(e[4])}function getFlightParameters(){var t,a,e=ges.aircraft.name,n=ges.groundElevation*metersToFeet,s=ges.aircraft.animationValue.altitude,i="M."===$("#Qantas94Heavy-ap-spd span:last-child").text().trim(),d=function(){$("#Qantas94Heavy-ap-spd span:last-child").click()};if("climb"==phase){if(s>1500+n&&4e3+n>=s)switch(i&&d(),e){case"a380":case"md11":case"concorde":case"156":case"161":case"162":case"164":case"166":case"167":case"172":case"183":case"187":case"200":t=210,a=3e3}else if(s>4e3+n&&1e4+n>=s)switch(i&&d(),e){case"a380":case"md11":case"concorde":case"156":case"161":case"162":case"164":case"166":case"167":case"172":case"183":case"187":case"200":t=245,a=2500}else if(s>1e4+n&&18e3>=s)switch(i&&d(),e){case"a380":case"md11":case"concorde":case"156":case"161":case"164":case"167":case"172":case"183":case"187":t=295,a=2200;break;case"162":case"166":case"200":t=290,a=2200}else if(s>18e3&&24e3>=s)switch(i&&d(),e){case"concorde":case"a380":case"156":case"161":case"167":case"172":case"183":t=310,a=1800;break;case"md11":case"164":case"187":t=300,a=1800;break;case"162":case"166":case"200":t=295,a=1800}else if(s>24e3&&26e3>=s)switch(i&&d(),e){case"a380":case"156":case"161":case"167":case"172":a=1500}else if(s>26e3&&28e3>=s)switch(i&&d(),e){case"md11":case"162":case"164":case"166":case"183":case"187":case"200":a=1500}else if(s>29500)switch(i||d(),e){case"162":case"166":case"200":t=.76;break;case"a380":case"156":case"161":case"167":case"172":t=.82;break;case"md11":case"164":case"187":t=.78,a=1200;break;case"183":t=.8}if(s>cruise-100&&cruise>18e3)switch(i||d(),e){case"162":t=.785;break;case"166":case"200":t=.78;break;case"161":case"172":t=.84;break;case"a380":case"156":case"167":t=.85;break;case"md11":case"164":case"187":t=.8;break;case"183":t=.82;break;case"concorde":t=2}}else if("descent"==phase)if(s>cruise-700&&cruise>=31e3)i||d(),a=-1e3;else if(s>45e3)switch(i||d(),e){case"concorde":t=1.5,a=-2e3}else if(s>3e4&&45e3>=s)switch(i||d(),e){case"concorde":a=-3600;break;case"a380":case"156":case"161":case"167":case"172":t=.83,a=-2400;break;case"183":t=.81,a=-2300;break;case"md11":case"162":case"164":case"166":case"187":case"200":t=.77,a=-2300}else if(s>18e3&&3e4>s)switch(i&&d(),e){case"162":case"166":case"200":t=295,a=-2100;break;case"a380":case"md11":case"156":case"161":case"164":case"167":case"172":case"183":case"187":t=310,a=-2200;break;case"concorde":t=330,a=-2400}else if(s>12e3+fieldElev&&18e3>=s)switch(i&&d(),e){case"a380":case"md11":case"concorde":case"156":case"161":case"162":case"164":case"166":case"167":case"172":case"183":case"187":case"200":t=280,a=-1800}return[t,a]}function activateLeg(t){if(fmc.waypoints.nextWaypoint!=t)if(t<=fmc.waypoints.route.length){fmc.waypoints.nextWaypoint=t;var a=fmc.waypoints.route[fmc.waypoints.nextWaypoint-1];a[4]?$("#Qantas94Heavy-ap-icao > input").val(a[0]).change():($("#Qantas94Heavy-ap-gc-lat > input").val(a[1]).change(),$("#Qantas94Heavy-ap-gc-lon > input").val(a[2]).change()),$(".activate").removeClass("btn-warning"),$("#waypoints tr:nth-child("+(t+1)+") .btn").addClass("btn-warning")}else $("#Qantas94Heavy-ap-icao > input").val(arrival[0]).change(),$(".activate").removeClass("btn-warning");else $(".activate").removeClass("btn-warning"),fmc.waypoints.nextWaypoint=void 0,$("#Qantas94Heavy-ap-icao > input").val("").change()}function getNextWaypointWithAltRestriction(){for(var t=fmc.waypoints.nextWaypoint;t<=fmc.waypoints.route.length;t++)if(fmc.waypoints.route[t-1][3])return t;return-1}function formatTime(t){return t[1]=checkZeros(t[1]),t[0]+":"+t[1]}function checkZeros(t){return 10>t&&(t="0"+t),t}function timeCheck(t,a){return a>=60&&(a-=60,t++),t>=24&&(t-=24),[t,a]}function getete(t,a){var e=t/ges.aircraft.animationValue.ktas,n=parseInt(e),s=Math.round(60*(e-n));return a&&(s+=Math.round(ges.aircraft.animationValue.altitude/4e3)),timeCheck(n,s)}function geteta(t,a){var e=new Date,n=e.getHours(),s=e.getMinutes();return n+=t,s+=Number(a),timeCheck(n,s)}function getRouteDistance(t){var a,e=ges.aircraft.llaLocation||[0,0,0],n=fmc.waypoints.nextWaypoint||0,s=fmc.waypoints.route;if(0!==s.length&&fmc.waypoints.nextWaypoint){a=fmc.math.getDistance(e[0],e[1],s[n-1][1],s[n-1][2]);for(var i=n;t>i&&i<s.length;i++)a+=fmc.math.getDistance(s[i-1][1],s[i-1][2],s[i][1],s[i][2]);t>s.length&&(a+=fmc.math.getDistance(s[s.length-1][1],s[s.length-1][2],arrival[1],arrival[2]))}else a=fmc.math.getDistance(e[0],e[1],arrival[1],arrival[2]);return a}function getTargetDist(t){var a;return a=0>t?t/-1e3*3.4:t/1e3*2.5}function getTurnDistance(t){var a=ges.aircraft.animationValue.kcas,e=.107917*Math.pow(Math.E,.0128693*a),n=fmc.math.toRadians(t);return e*Math.tan(n/2)+.2}function toggleVNAV(){VNAV?(VNAV=!1,$("#vnavButton").removeClass("btn btn-warning").addClass("btn"),clearInterval(VNAVTimer)):cruise?(VNAV=!0,$("#vnavButton").removeClass("btn").addClass("btn btn-warning"),VNAVTimer=setInterval(updateVNAV,5e3)):alert("Please enter a cruising altitude.")}function toggleSpeed(){$("#tSpd").hasClass("btn-warning")?($("#tSpd").removeClass("btn-warning").addClass("btn-default").text("OFF"),spdControl=!1):($("#tSpd").removeClass("btn-default").addClass("btn-warning").text("ON"),spdControl=!0)}function removeLogData(){$("#logData tr").remove(".data")}var tod,VNAV=!1,arrival=[],cruise,phase="climb",todCalc=!1,fieldElev=0;window.feetToNM=1/6076,window.nmToFeet=6076,window.fmc={math:{toRadians:function(t){return t*Math.PI/180},toDegrees:function(t){return 180*t/Math.PI},earthRadiusNM:3440.06},waypoints:{input:"",route:[],nextWaypoint:"",makeFixesArray:function(){var t=[],a=$("#departureInput").val();a&&t.push(a),$(".waypoint td:first-child div > input").each(function(){t.push($(this).val())});var e=$("#arrivalInput").val();return e&&t.push(e),t},toFixesString:function(){return fmc.waypoints.makeFixesArray().join(" ")},toRouteString:function(){return JSON.stringify([$("#departureInput").val(),$("#arrivalInput").val(),$("#flightNumInput").val(),fmc.waypoints.route])}}};var progTimer=setInterval(updateProgress,5e3),LNAVTimer=setInterval(updateLNAV,5e3),VNAVTimer,logTimer=setInterval(updateLog,12e4),gearTimer=setInterval(checkGear,12e3),flapsTimer=setInterval(checkFlaps,5e3),speedTimer=setInterval(checkSpeed,15e3);fmc.math.getGroundSpeed=function(){var t=ges.aircraft.animationValue.ktas,a=60*ges.aircraft.animationValue.climbrate*feetToNM;return Math.sqrt(t*t-a*a)},fmc.math.getClimbrate=function(t,a){var e=fmc.math.getGroundSpeed(),n=100*Math.round(e*(t/(a*nmToFeet))*nmToFeet/60/100);return n},fmc.math.getDistance=function(t,a,e,n){var s=fmc.math,i=s.toRadians(e-t),d=s.toRadians(n-a);t=s.toRadians(t),e=s.toRadians(e);var p=Math.sin(i/2)*Math.sin(i/2)+Math.cos(t)*Math.cos(e)*Math.sin(d/2)*Math.sin(d/2),r=2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p));return s.earthRadiusNM*r},fmc.math.getBearing=function(t,a,e,n){var s=fmc.math;t=s.toRadians(t),e=s.toRadians(e),a=s.toRadians(a),n=s.toRadians(n);var i=Math.sin(n-a)*Math.cos(e),d=Math.cos(t)*Math.sin(e)-Math.sin(t)*Math.cos(e)*Math.cos(n-a),p=s.toDegrees(Math.atan2(i,d));return p},fmc.waypoints.getCoords=function(t){return autopilot_pp.require("icaoairports")[t]?autopilot_pp.require("icaoairports")[t]:autopilot_pp.require("waypoints")[t]?autopilot_pp.require("waypoints")[t]:!1},fmc.waypoints.formatCoords=function(t){if(t.indexOf(" ")>-1){var a,e=t.split(" "),n=Number(e[0]),s=Number(e[1])/60;return a=0>n?n-s:n+s}return Number(t)},fmc.waypoints.toRoute=function(t){if(0===t.indexOf('["'))fmc.waypoints.loadFromSave(t);else{var a,e=t.indexOf("fpl="),n=-1!==t.indexOf("skyvector.com")&&-1!==e,s=!0,i=$("#wptDeparture")[0].checked,d=$("#wptArrival")[0].checked,p=$("#waypoints tbody tr").length-1,r=[];if(n)r=t.substring(e+4).trim().split(" ");else{r=t.trim().toUpperCase().split("%20");for(var o=0;o<r.length;o++)(r[o].length>5||r[o].length<1||!/^\w+$/.test(r[o]))&&(s=!1)}if(n||s){for(var o=0;p>o;o++)fmc.waypoints.removeWaypoint(1);if(fmc.waypoints.route=[],i){var c=r[0];$("#departureInput").val(c).change(),a=1}else a=0,$("#departureInput").val("").change();for(var o=0;o+a<r.length;o++){fmc.waypoints.addWaypoint();var c=r[o+a];$("#waypoints input.wpt:eq("+o+")").val(c).change()}if(d){var c=r[r.length-1];$("#arrivalInput").val(c).change()}}else s||alert(n?"Invalid Waypoints Input":"Invalid Skyvector Link")}},fmc.waypoints.addWaypoint=function(){var t=fmc.waypoints;t.route.length++;t.route.length;t.route[t.route.length-1]=[],$("<tr>").addClass("waypoint").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<input>").addClass("input-medium").addClass("wpt").css("width","75px").attr("type","text").attr("placeholder","Fix/Apt.").change(function(){var a=$(this).val(),e=t.getCoords(a),n=$(this).parents().eq(2).index()-1;e?($(this).parents().eq(2).children(".position").children("div").children(".lat").val(e[0]),$(this).parents().eq(2).children(".position").children("div").children(".lon").val(e[1]),t.route[n]=[a,e[0],e[1],void 0,!0]):(t.route[n][0]=a,t.route[n][4]=!1)}))),$("<td>").addClass("position").append($("<div>").addClass("input-prepend input-append").append($("<input>").addClass("input-medium lat").css("width","80px").attr({type:"text",tabindex:"-1"}).change(function(){var a=$(this).parents().eq(2).index()-1;t.route[a][1]=t.formatCoords($(this).val()),t.route[a][4]=!1}),$("<input>").addClass("input-medium lon").css("width","80px").attr({type:"text",tabindex:"-1"}).change(function(){var a=$(this).parents().eq(2).index()-1;t.route[a][2]=t.formatCoords($(this).val()),t.route[a][4]=!1}))),$("<td>").addClass("altitude").append($("<div>").addClass("input-prepend input-append").append($("<input>").addClass("input-medium alt").css("width","40px").attr({type:"text",tabindex:"-1",placeholder:"Ft."}).change(function(){var a=$(this).parents().eq(2).index()-1;t.route[a][3]=Number($(this).val())}))),$("<td>").append($("<div>").addClass("input-prepend input-append").append($("<button>").attr("type","button").addClass("btn btn-standard activate").text("Activate").click(function(){var t=$(this).parents().eq(2).index();activateLeg(t)}),$("<button>").attr("type","button").addClass("btn btn-info").append($("<i>").addClass("icon-arrow-up")).click(function(){var t=$(this).parents().eq(2);fmc.waypoints.shiftWaypoint(t,t.index(),"up")}),$("<button>").attr("type","button").addClass("btn btn-info").append($("<i>").addClass("icon-arrow-down")).click(function(){var t=$(this).parents().eq(2);fmc.waypoints.shiftWaypoint(t,t.index(),"down")}),$("<button>").attr("type","button").addClass("btn btn-danger").append($("<i>").addClass("icon-remove")).click(function(){var a=$(this).parents().eq(2).index();t.removeWaypoint(a)})))).appendTo("#waypoints")},fmc.waypoints.removeWaypoint=function(t){$("#waypoints tr:nth-child("+(t+1)+")").remove(),fmc.waypoints.route.splice(t-1,1),fmc.waypoints.nextWaypoint==t&&(fmc.waypoints.nextWaypoint=null)},fmc.waypoints.saveData=function(){if(fmc.waypoints.route.length<1||!fmc.waypoints.route[0][0])alert("There is no route to save");else{localStorage.removeItem("fmcWaypoints");var t=fmc.waypoints.toRouteString();localStorage.setItem("fmcWaypoints",t)}},fmc.waypoints.loadFromSave=function(t){t=t||localStorage.getItem("fmcWaypoints");var a=fmc.waypoints,e=JSON.parse(t);if(localStorage.removeItem("fmcWaypoints"),e){a.route=[];for(var n=e[3],s=$("#waypoints tbody tr").length-1,i=0;s>i;i++)a.removeWaypoint(1);n.forEach(function(t){t[3]&&null!=t[3]&&0!=t[3]||(t[3]=void 0)}),e[0]&&$("#departureInput").val(e[0]).change(),e[1]&&$("#arrivalInput").val(e[1]).change(),e[2]&&$("#flightNumInput").val(e[2]).change();for(var i=0;i<n.length;i++)a.addWaypoint(),$("#waypoints input.wpt:eq("+i+")").val(n[i][0]).change(),n[i][4]&&$("#waypoints input.lat:eq("+i+")").val()||($("#waypoints input.lat:eq("+i+")").val(n[i][1]).change(),$("#waypoints input.lon:eq("+i+")").val(n[i][2]).change()),n[i][3]&&$("#waypoints input.alt:eq("+i+")").val(n[i][3]).change();a.saveData()}else alert("You did not save the waypoints or you cleared the browser's cache")},fmc.waypoints.shiftWaypoint=function(t,a,e){var n=fmc.waypoints;"up"==e&&1==a||"down"==e&&a==n.route.length||("up"==e?(n.route.move(a-1,a-2),t.insertBefore(t.prev()),n.nextWaypoint==a?n.nextWaypoint=a-1:n.nextWaypoint==a-1&&(n.nextWaypoint=a+1)):(n.route.move(a-1,a),t.insertAfter(t.next()),n.nextWaypoint==a?n.nextWaypoint=a+1:n.nextWaypoint==a+1&&(n.nextWaypoint=a-1)))},ges.resetFlight=function(){window.confirm("Reset Flight?")&&ges.lastFlightCoordinates&&(ges.flyTo(ges.lastFlightCoordinates,!0),updateLog("Flight reset"))},ges.togglePause=function(){ges.pause?(ges.undoPause(),updateLog("Flight resumed")):(updateLog("Flight paused"),ges.doPause())},fmc.ui={modal:$("<div>").addClass("modal hide gefs-stopPropagation").attr("data-backdrop","static").attr("id","fmcModal").attr("tabindex","-1").attr("role","dialog").attr("aria-labelledby","fmcDialogBoxLabel").attr("aria-hidden","true").css("width","590px").append($("<div>").addClass("modal-dialog").append($("<div>").addClass("modal-content").append($("<div>").addClass("modal-header").append($("<button>").addClass("close").attr("type","button").attr("data-dismiss","modal").attr("aria-hidden","true").text("×"),$("<h3>").addClass("modal-title").attr("id","myModalLabel").css("text-align","center").text("Flight Management Computer")),$("<div>").addClass("modal-body").append($("<ul>").addClass("nav nav-tabs").append($("<li>").addClass("active").append('<a href="#rte" data-toggle="tab">RTE</a>'),$("<li>").append('<a href="#arr" data-toggle="tab">DEP/ARR</a>'),$("<li>").append('<a href="#vnav" data-toggle="tab">VNAV</a>'),$("<li>").append('<a href="#prog" data-toggle="tab">PROG</a>'),$("<li>").append('<a href="#load" data-toggle="tab">LOAD</a>'),$("<li>").append('<a href="#log" data-toggle="tab">LOG</a>')),$("<div>").addClass("tab-content").css("padding","5px").append($("<div>").addClass("tab-pane active").attr("id","rte").append($("<table>").append($("<tr>").append($("<table>").append($("<tr>").append($("<td>").css("padding","5px").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Departure"),$("<input>").addClass("input-mini").attr("id","departureInput").attr("type","text").attr("placeholder","ICAO"))),$("<td>").css("padding","5px").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Arrival"),$("<input>").addClass("input-mini").attr("type","text").attr("id","arrivalInput").attr("placeholder","ICAO").change(function(){var t=$(this).val(),a=fmc.waypoints.getCoords(t);a?arrival=[t,a[0],a[1]]:(alert("Invalid Airport code"),$(this).val(""))}))),$("<td>").css("padding","5px").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Flight #"),$("<input>").addClass("input-mini").attr("id","flightNumInput").css("width","80px").attr("type","text")))))),$("<tr>").append($("<table>").attr("id","waypoints").append($("<tr>").append($("<td>").append("<th>Waypoints</th>"),$("<td>").append("<th>Position</th>"),$("<td>").append("<th>Altitude</th>"),$("<td>").append("<th>Actions</th>")))),$("<tr>").append($("<div>").attr("id","waypointsAddDel").append($("<table>").append($("<tr>").append($("<td>").append($("<button>").addClass("btn btn-primary").attr("type","button").text("Add Waypoint ").append($("<i>").addClass("icon-plus")).click(function(){fmc.waypoints.addWaypoint()}).css("margin-right","3px")))))),$("<tr>").append($("<div>").attr("id","saveRoute").append($("<table>").append($("<tr>").append($("<td>").append($("<button>").addClass("btn btn-info").attr("type","button").text("Save Route ").append($("<i>").addClass("icon-file icon-white")).click(function(){fmc.waypoints.saveData()}).css("margin-right","3px"),$("<button>").addClass("btn btn-info").attr("type","button").text("Retrieve Route ").append($("<i>").addClass("icon-refresh icon-white")).click(function(){fmc.waypoints.loadFromSave()})))))))),$("<div>").addClass("tab-pane").attr("id","arr").append($("<table>").append($("<tr>").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("TOD Dist."),$("<input>").attr("id","todInput").attr("type","number").attr("min","0").attr("placeholder","nm").css("width","38px").change(function(){tod=$(this).val()}))),$("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Automatically calculate TOD"),$("<button>").addClass("btn btn-standard").attr("type","button").text("OFF").click(function(){todCalc?($(this).removeClass("btn btn-warning").addClass("btn btn-standard").text("OFF"),todCalc=!1):($(this).removeClass("btn btn-standard").addClass("btn btn-warning").text("ON"),todCalc=!0)})))),$("<tr>").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Arrival Field Elev."),$("<input>").attr("type","number").attr("placeholder","ft.").css("width","55px").change(function(){fieldElev=Number($(this).val())})))))),$("<div>").addClass("tab-pane").attr("id","vnav").append($("<table>").append($("<tr>").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<button>").addClass("btn").attr("id","vnavButton").text("VNAV ").append($("<i>").addClass("icon icon-resize-vertical")).click(function(){toggleVNAV()}),$("<span>").addClass("add-on").text("Cruise Alt."),$("<input>").attr("type","number").attr("step","100").attr("min","0").attr("max","100000").attr("placeholder","ft").css("width","80px").change(function(){cruise=Number($(this).val())})))),$("<tr>").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Phase"),$("<button>").addClass("btn btn-info").attr("id","phaseBtn").text("Climb").css("height","30px").css("width","77px").click(function(){$("#phaseLock").hasClass("btn-default")&&("climb"==phase?($(this).text("Cruise"),phase="cruise"):"cruise"==phase?($(this).text("Descent"),phase="descent"):($(this).text("Climb"),phase="climb"))}),$("<button>").addClass("btn btn-default").attr("id","phaseLock").append($('<i class="icon-lock"></i>')).click(function(){$(this).hasClass("btn-default")?$(this).removeClass("btn-default").addClass("btn-danger"):$(this).removeClass("btn-danger").addClass("btn-default")}))),$("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("SPD Control"),$("<button>").addClass("btn btn-warning").attr("id","tSpd").text("ON").css("width","60px").click(function(){toggleSpeed()})))))),$("<div>").addClass("tab-pane").attr("id","prog").append($("<table>").append($("<tr>").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Dest"),$("<span>").addClass("add-on").css("background-color","white").css("width","53px").append($("<div>").attr("id","flightdist")),$("<span>").addClass("add-on").css("background-color","white").css("width","50px").append($("<table>").css({position:"relative",top:"-6px"}).append($("<tr>").append($("<td>").append($("<div>").attr("id","flightete").css("font-size","70%").css("height","10px"))),$("<tr>").append($("<td>").append($("<div>").attr("id","flighteta").css("font-size","70%").css("height","10px"))))))),$("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("TOD"),$("<span>").addClass("add-on").css("background-color","white").css("width","53px").append($("<div>").attr("id","toddist")),$("<span>").addClass("add-on").css("background-color","white").css("width","50px").append($("<table>").css({position:"relative",top:"-6px"}).append($("<tr>").append($("<td>").append($("<div>").attr("id","todete").css("font-size","70%").css("height","10px"))),$("<tr>").append($("<td>").append($("<div>").attr("id","todeta").css("font-size","70%").css("height","10px")))))))),$("<tr>").append($("<td>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Next Waypoint ").append($("<i>").addClass("icon-map-marker")),$("<span>").addClass("add-on").css("background-color","white").css("width","53px").append($("<div>").attr("id","nextDist")),$("<span>").addClass("add-on").css("background-color","white").css("width","53px").append($("<div>").attr("id","nextETE"))))))),$("<div>").addClass("tab-pane").attr("id","load").append($("<th>Enter waypoints seperated by spaces or a generated route</th>"),$("<form>").attr("action","javascript:fmc.waypoints.toRoute(fmc.waypoints.input);").addClass("form-horizontal").append($("<fieldset>").append($("<div>").addClass("input-prepend input-append").append($("<span>").addClass("add-on").text("Waypoints ").append($("<i>").addClass("icon-pencil")),$("<input>").attr("type","text").addClass("input-xlarge gefs-stopPropagation").change(function(){fmc.waypoints.input=$(this).val()})),$('<label class = "checkbox"><input type="checkbox" id="wptDeparture" value="true" checked> First waypoint is departure airport</label>'),$('<label class = "checkbox"><input type="checkbox" id="wptArrival" value="true" checked> Last waypoint is arrival airport</label>'),$("<button>").attr("type","submit").addClass("btn btn-primary").text("Load Route ").append($("<i>").addClass("icon-play"))),$("<fieldset>").css("margin-top","10px").append($("<button>").addClass("btn btn-warning").attr("type","button").text("Generate").click(function(){$("#generateRoute").val(fmc.waypoints.toRouteString()).change()}),$("<button>").addClass("btn btn-warning").attr("type","button").css("margin-left","5px").text("Clear").click(function(){$("#generateRoute").val("").change()}),$("<div>").css("margin-top","10px").append($("<textarea>").attr("id","generateRoute").attr("placeholder","Generate route. Save it or share it").css("margin","0px 0px 10px").css("width","350px").css("height","65px").css("resize","none"))))),$("<div>").addClass("tab-pane").attr("id","log").append($("<table>").attr("id","logData").append($("<tr>").append($("<th>Time</th>").css("padding","0px 10px 0px 10px"),$("<th>Speed</th>").css("padding","0px 10px 0px 10px"),$("<th>Heading</th>").css("padding","0px 10px 0px 10px"),$("<th>Altitude</th>").css("padding","0px 10px 0px 10px"),$("<th>Lat.</th>").css("padding","0px 10px 0px 10px"),$("<th>Lon.</th>").css("padding","0px 10px 0px 10px"),$("<th>FPS</th>").css("padding","0px 10px 0px 10px"),$("<th>Other</th>").css("padding","0px 10px 0px 10px"))),$("<button>").addClass("btn btn-danger").attr("type","button").click(function(){removeLogData()}).text("Clear Log ").append($("<i>").addClass("icon-remove-circle"))))),$("<div>").addClass("modal-footer").append($("<button>").addClass("btn btn-default").attr("type","button").attr("data-dismiss","modal").text("Close"),$("<button>").addClass("btn btn-primary").attr("type","button").text("Save changes ").append($("<i>").addClass("icon-hdd"))))),$('<iframe frame-border="no" class="gefs-shim-iframe"></iframe>')).appendTo("body"),externalDist:$("<div>").addClass("setup-section").css("padding-bottom","0px").append($("<div>").addClass("input-prepend input-append").css("margin-bottom","4px").append($("<span>").addClass("add-on").text("Dest"),$("<span>").addClass("add-on").css("background-color","white").css("width","53px").append($("<div>").attr("id","externaldist")))).appendTo("td.gefs-f-standard"),button:$("<button>").addClass("btn btn-success gefs-stopPropagation").attr("type","button").attr("data-toggle","modal").attr("data-target","#fmcModal").css("margin-left","1px").text("FMC ").append($("<i>").addClass("icon-list-alt")).appendTo("div.setup-section:nth-child(2)")},$("#fmcModal").modal({backdrop:!1,show:!1}),$("#fmcModal").keyup(function(t){t.stopImmediatePropagation()}),fmc.waypoints.addWaypoint(),Array.prototype.move=function(t,a){if(a>=this.length)for(var e=a-this.length;e--+1;)this.push(void 0);return this.splice(a,0,this.splice(t,1)[0]),this};