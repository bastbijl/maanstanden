
var moon = require('/moon');
console.log(moon);

function marginLeft(input) {
  return input;
}
function width(input) {
  return input;
}


function start() {

  var days = 31;
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

    row = document.createElement("TR");

    td = document.createElement("TD");
    td.innerHTML = arr[i];
    row.appendChild(td);

    for(j = 1; j <= days; j+=2) {


      td = document.createElement("TD");
      td.style.backgroundColor = 'black';

      div = document.createElement("DIV");
      div.innerHTML = '&nbsp;';
      div.style.width = width(j) + 'px';
      div.style.marginLeft = marginLeft(days - j) + 'px';
      div.style.height = '30px';
      div.style.backgroundColor = 'white';

      td.appendChild(div)
      row.appendChild(td);

    }

    for(j = days; j >= 1; j-=2) {


      td = document.createElement("TD");
      td.style.backgroundColor = 'black';

      div = document.createElement("DIV");
      div.innerHTML = '&nbsp;';
      div.style.width = width(j) + 'px';
      div.style.marginLeft = marginLeft(0) + 'px';
      div.style.height = '30px';
      div.style.backgroundColor = 'white';

      td.appendChild(div)
      row.appendChild(td);

    }

    document.getElementById("main_table").appendChild(row);
  }



}