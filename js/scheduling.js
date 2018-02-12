var processArray = [];
var currentNewArrivedProcessIndex;

$(function(){

  // Toggle Round Robin number
  $('input[name=algorithm]').click(function() {
    if( $('#rr').is(':checked') ) {
      $('.roundrobinnumber').show();
    } else {
      $('.roundrobinnumber').hide();
    }
  });

  // Table utilisation - add
  $('#add_row_scheduling').click(function () {
    var clone = $(this).closest('table').find('tr.hide').clone(true).removeClass('hide').toggle();
    $(clone).insertBefore('#add_row_scheduling');
  });

  // Table utilisation - delete
  $('.table-remove').click(function () {
    $(this).parents('tr').detach();
  });

  //Buttons
  $('#reset_scheduling').click(function() {
    var rowCount = $('#table_scheduling_entries tbody tr').length;
    var i = 1;
    // Delete all lines
    while (i < rowCount - 1) {
      $('#table_scheduling_entries tbody tr:last').prev('tr').detach();
      i++;
    }
  });

  $('#empty_scheduling').click(function() {
    rowsToArray();
    emptySchedulingSolTab();
    showCorrectionButton();
  });

  $('#resolve_scheduling').click(function() {
    rowsToArray();
    emptySchedulingSolTab();

    if( $('#psjf').is(':checked') ) {
      doPSFJ();
    }
    else if ( $('#npsjf').is(':checked')) {
      doNPSFJ();
    }
    else if ( $('#fifo').is(':checked')) {
      doFIFO();
    }
    else if ( $('#rr').is(':checked')) {
      doRR();
    }
  });
});

function rowsToArray(){
  processArray = [];
  var index = 0;
  $('#table_scheduling_entries tbody tr').each(function(i, row) {
    if (i!=0) {
      var arrival = parseInt($(row).find('td div').eq(1).text());
      var duration = parseInt($(row).find('td div').eq(2).text());
      var currentRow = [$(row).find('td div').eq(0).text(), arrival, duration];
      processArray.push(currentRow);
    }
  });
  // Delete last entry in array
  processArray.splice(-1,1)
  //Tests INT
  processArray.forEach(function(process) {
    if (isNaN(process[1]) || isNaN(process[2])) {
      alert("Une ou plusieurs entrées sont incorrectes. Vérifiez le tableau à nouveau.");
    }
  });
  console.log("----")
  console.log(processArray);
  // console.log(processArray.length)
}

function emptySchedulingSolTab() {
  //Initialization
  $('#correct_scheduling').addClass('hide').hide();
  $('#table_scheduling_responses').remove();
  var clone = $('#table_scheduling_copy').clone(true).removeClass('hide').attr('id','table_scheduling_responses').toggle();
  $(clone).insertBefore('#table_scheduling_copy');
  var rowsNumber = getSchedulingSolTabRows();
  //Columns construction
  processArray.forEach(function(process) {
    var node = $('<th style="color:white;text-align: center;">'+ process[0] +'</th>');
    $('#table_scheduling_responses thead tr').eq(1).append(node);
  });
  //Rows construction
  for (i = 0; i < rowsNumber; i++) {
    var node = $('<tr></tr>');
    $(node).append($('<td><div>'+ i +'</div></td>'));
    processArray.forEach(function(process) {
      $(node).append($('<td><div contentEditable class="editable">...</div></td>'));
    });
    $('#table_scheduling_responses tbody').append(node);
    $('.editable').on('click', function () { document.execCommand('selectAll', false, null); });
  }
}

function getSchedulingSolTabRows() {
  var rowsNumber = 0;
  var maxDuration = 0;
  var maxArrival = 0;
  var minArrival = 999;
  if (processArray.length > 0) {
    //Max duration calcul and max duration + arrival
    processArray.forEach(function(process) {
      maxDuration += process[2];
      currentArrival = process[1];
      currentArrivalDuration = process[1] + process[2];
      if (currentArrivalDuration > maxArrival) {
        maxArrival = currentArrivalDuration;
      }
      if (currentArrival < minArrival) {
        minArrival = currentArrival;
      }
    });
  }
  // console.log("Durée totale : " + maxDuration);
  // console.log("Arrivée + Durée max. : " + maxArrival);
  rowsNumber = Math.max(maxDuration, maxArrival) + minArrival + 1;
  return rowsNumber;
}

function isNewProcessArrived(currentLine){

  for(j=0; j<processArray.length; j++){
    //console.log(j)
    if(processArray[j][1] == currentLine){
      //console.log("IS ARRIVED process arr: "+processArray[j][1]+" current: "+currentLine+" i: "+j);
      currentNewArrivedProcessIndex = j;
      return true;
    }
  }
  return false;
}

function showCorrectionButton() {
  $('#correct_scheduling').removeClass('hide').show();
}

function printResult(result){
  for(var i = 0; i<result.length; i++){
    //$('#table_scheduling_responses tbody').find('tr').eq(i).find('td').eq(result[i]).find('div').text(processArray[result[i]][2]);
    console.log($('#table_scheduling_responses tbody').find('tr').eq(i).find('td').eq(1).find('div').text(processArray[result[i]][2]));
    console.log("process array durée: "+processArray[result[i]][2]);
    processArray[result[i]][2]--;
  }
}

function doPSFJ (){

}

function doNPSFJ() {

}

function doFIFO (){
  var actifProcessIndex = [];
  var result = [];
  var tmpProcessArray = processArray.slice();

  for(var i=0; i<=getSchedulingSolTabRows(); i++){
    //console.log("fifo arr i: "+i);

    if(isNewProcessArrived(i)){
      actifProcessIndex.push(currentNewArrivedProcessIndex);
      //console.log("row: "+i+" column: "+currentNewArrivedProcessIndex+" value: "+processArray[currentNewArrivedProcessIndex][2]);
    }
  }
  console.log(processArray);
  console.log(tmpProcessArray);

  for(var i=0; i<actifProcessIndex.length; i++){
    while(tmpProcessArray[actifProcessIndex[i]][2]>0){
      result.push(actifProcessIndex[i]);
      tmpProcessArray[actifProcessIndex[i]][2]--;
    }
  }


  console.log("Résultat FIFO : " + result);

  printResult(result);
}

function doRR() {

}
