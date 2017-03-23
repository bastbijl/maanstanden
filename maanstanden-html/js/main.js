

function start() {

  var arr = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli', 
    'augustus',
    'september',
    'oktober',
    'november',
    'december'
  ];

  for(i = 0; i < arr.length; i++) {
    document.getElementById("red_box").innerHTML += (arr[i] + "<br />");
  }



}