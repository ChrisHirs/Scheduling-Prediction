
var currentNewArrivedProcessesIndexes = [];

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
    var processArray = rowsToArray();
    emptySchedulingSolTab(processArray);
    showCorrectionButton(processArray);
  });

  $('#resolve_scheduling').click(function() {
    var processArray = rowsToArray();
    emptySchedulingSolTab(processArray);

    if( $('#psjf').is(':checked') ) {
      doPSFJ();
    }
    else if ( $('#npsjf').is(':checked')) {
      doNPSFJ(processArray);
    }
    else if ( $('#fifo').is(':checked')) {
      doFIFO(processArray);
    }
    else if ( $('#rr').is(':checked')) {
      var rrnumber = parseInt($('#rr_number').val());
      if (!isNaN(rrnumber)) {
        doRR(rrnumber, processArray);
      }
      else {
        alert("La valeur du Round Robin ne semble pas être un nombre valide...");
      }
    }
  });
});


//Transform the HTML table to a JS array
function rowsToArray(){
  var processArray = [];
  var index = 0;
  $('#table_scheduling_entries tbody tr').each(function(i, row) {
    if (i!=0) {
      var arrival = parseInt($(row).find('td div').eq(1).text());
      var duration = parseInt($(row).find('td div').eq(2).text());
      var currentRow = [$(row).find('td div').eq(0).text(), arrival, duration];
      //console.log("rowToArray currentRow:");
      //console.log(currentRow);
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
  //console.log("rowToArray processArray:");
  //console.log(processArray);
  // console.log(processArray.length)
  return processArray;
}

//Generate à empty HTML table for the user to enter his solution
function emptySchedulingSolTab(processArray) {
  //Initialization
  $('#correct_scheduling').addClass('hide').hide();
  $('#table_scheduling_responses').remove();
  var clone = $('#table_scheduling_copy').clone(true).removeClass('hide').attr('id','table_scheduling_responses').toggle();
  $(clone).insertBefore('#table_scheduling_copy');
  var rowsNumber = getSchedulingSolTabRows(processArray);
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

//get the number of rows needed to generate de solution HTML table.
function getSchedulingSolTabRows(processArray) {
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
  //console.log("Durée totale : " + maxDuration);
  //console.log("Arrivée + Durée max. : " + maxArrival);
  rowsNumber = Math.max(maxDuration, maxArrival) + minArrival + 2; //lol pk 2? tg
  return rowsNumber;
}


//Check if a new Process has arrived
function isNewProcessArrived(currentLine, processArray){

  var isFound = false;
  currentNewArrivedProcessesIndexes = [];

  for(j=0; j<processArray.length; j++){
    //console.log(j)
    if(processArray[j][1] == currentLine){
      // console.log("IS ARRIVED process arr: "+processArray[j][1]+" current: "+currentLine+" i: "+j);
      currentNewArrivedProcessesIndexes.push(j);
      isFound = true;
    }
  }
  return isFound;
}

//enable the solution button
function showCorrectionButton(processArray) {
  $('#correct_scheduling').removeClass('hide').show();
}

//show the solution in the HTML talbe
function printResult(result, processArray){
  var nbRows = getSchedulingSolTabRows(processArray);
  console.log("PRINT nbRows: "+nbRows);
  var shift = true;

  for(var i = 0; i<nbRows; i++){
    if(shift){
      var currentProcess = result.shift();
      shift = false;
    }

    // console.log("PRINT i: "+i);
    // console.log("PRINT currentProcess: "+currentProcess);
    // console.log("PRINT shift: "+currentProcess);

    if((currentProcess !== undefined)){
      if(!(i < processArray[currentProcess][1])){
        $('#table_scheduling_responses tbody').find('tr').eq(i).find('td').eq(currentProcess+1).find('div').text(processArray[currentProcess][2]);
        processArray[currentProcess][2]--;
        shift = true;
      }
    }
    // console.log("printResult processArray durée: "+processArray[result[i]][2]);
  }
}

function findNextProcessNPSFJ(actifProcessesIndexes, processArray){
  var minBurstIndex = 0;

  actifProcessesIndexes.forEach(function(index, i){
    if(processArray[index][2]<minBurst){
      minBurstIndex=i;
    }
  });
  return minBurstIndex;
}

// preemtif Shortest Job First scheduling algorithme
function doPSFJ (){

}

// Non-preemtif Shortest Job First scheduling algorithme
function doNPSFJ(processArray) {
  var actifProcessesIndexes = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray

  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){
    //console.log("fifo arr i: "+i);

    if(isNewProcessArrived(i, processArray)){
        currentNewArrivedProcessesIndexes.forEach(function(process, index) {
          actifProcessesIndexes.push(currentNewArrivedProcessesIndexes[index]); //put the new arrived process in the stack
        });

        var minBurstIndex = findNextProcessNPSFJ(actifProcessesIndexes, processArray);

      //sortIndexDependingOnBurstSize(actifProcessesIndexes, processArray);
      // console.log("processArray puis currentNewArrivedProcessesIndexes");
      // console.log(processArray);
      // console.log(currentNewArrivedProcessesIndexes);
      //console.log("row: "+i+" column: "+currentNewArrivedProcessesIndexes+" value: "+processArray[currentNewArrivedProcessesIndexes[i]][2]);
    }

    for(var i=0; i<processArray[actifProcessesIndexes[minBurstIndex]][2]; i++){
      //decrémenter le process array durée
    }

  }
}

//First In First Out scheduling algorithme
function doFIFO (processArray){
  var actifProcessIndex = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray

  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){
    // console.log("fifo arr i: "+i);

    if(isNewProcessArrived(i, processArray)){
      currentNewArrivedProcessesIndexes.forEach(function(process, index) {
          actifProcessIndex.push(currentNewArrivedProcessesIndexes[index]); //put the new arrived process in the queue
      });
      // console.log("processArray puis currentNewArrivedProcessesIndexes");
      // console.log(processArray);
      // console.log(currentNewArrivedProcessesIndexes);
      //console.log("row: "+i+" column: "+currentNewArrivedProcessesIndexes+" value: "+processArray[currentNewArrivedProcessesIndexes[i]][2]);
    }
  }

  for(var i=0; i<actifProcessIndex.length; i++){
    while(tmpProcessArray[actifProcessIndex[i]][2]>0){
      result.push(actifProcessIndex[i]); //put the actual process name in the solution array
      tmpProcessArray[actifProcessIndex[i]][2]--;
    }
  }

  // console.log("doFIFO process puis tmpProcessArray: ");
  // console.log(processArray);
  // console.log(tmpProcessArray);
  // console.log("doFIFO Résultat: " + result);

  printResult(result, processArray);
}

//Round Robin scheduling algorithme
function doRR(round, processArray) {
  var activeProcessIndex = [];
  var activeArrivalIndex = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray

  for (var i = 0; i <= getSchedulingSolTabRows(processArray); i++) {
    if (isNewProcessArrived(i, processArray)) {
      currentNewArrivedProcessesIndexes.forEach(function(process, index) {
        activeProcessIndex.push(currentNewArrivedProcessesIndexes[index]); //put the new arrived process in the queue
      });
    }
    if (activeProcessIndex.length > 0) {
      for (var j = 0; j < activeProcessIndex.length; j++) {
        for (var h = 0; h < round; h++) {
          if (tmpProcessArray[activeProcessIndex[j]][2] > 0) {
            result.push(activeProcessIndex[j]); //put the actual process name in the solution array
            tmpProcessArray[activeProcessIndex[j]][2]--;
            i++;
            //TODO: Pas du tout DRY
            if (isNewProcessArrived(i, processArray)) {
              currentNewArrivedProcessesIndexes.forEach(function(process, index) {
                activeProcessIndex.push(currentNewArrivedProcessesIndexes[index]); //put the new arrived process in the queue
              });
            }
          }
        }
        tmpProcessArray.forEach(function(process) {
          if (process[2] <= 0) {
            var indexToDelete = tmpProcessArray.indexOf(process);
            if (indexToDelete > -1) {
              activeProcessIndex.splice(i, 1);
            }
          }
        });
      }
    }
  }

  printResult(result, processArray);
}
