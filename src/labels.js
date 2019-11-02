/** @module labels */

function dateLabel (v) {
  if (v == Math.floor(v)) { return v.toString(); }
  return '';
}

function timeLabelSimple (v) {
  let times = ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM',
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM',
    '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'];
  if (v == Math.floor(v)) { return times[v % 24]; }
  return '';
}

function timeLabelAdjusted (v) {
  let hr = (new Date(Date.now())).getHours();
  let times = ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM',
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM',
    '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'];
  if (v == Math.floor(v)) { return times[(v + hr) % 24]; }
  return '';
}

function dayOfWeekLabel (v) {
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];
  if (v == Math.floor(v)) { return days[v % 7]; }
  return '';
}

function dayOfWeekLabelAdjusted (v) {
  let day = (new Date(Date.now())).getDay();
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'];
  if (v == 0) {
    return '';
  }
  if (v == Math.floor(v)) { return days[((v + day) % 7)]; }
  return '';
}

function stringLabel (v) {
  return v.toString();
}

export default {dateLabel, timeLabelSimple, timeLabelAdjusted, dayOfWeekLabel, dayOfWeekLabelAdjusted, stringLabel};
