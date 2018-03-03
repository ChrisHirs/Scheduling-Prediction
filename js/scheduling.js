
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
    var processArray = rowsToArray();
    emptySchedulingSolTab(processArray);
    showCorrectionButton(processArray);
  });

  $('#resolve_scheduling').click(function() {
    var processArray = rowsToArray();
    emptySchedulingSolTab(processArray);

    if( $('#psjf').is(':checked') ) {
      doPSJF();
    }
    else if ( $('#npsjf').is(':checked')) {
      doNPSJF(processArray);
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
  currentNewArrivedProcessIndex = null;

  for(j=0; j<processArray.length; j++){
    //console.log(j)
    if(processArray[j][1] == currentLine){
      // console.log("IS ARRIVED process arr: "+processArray[j][1]+" current: "+currentLine+" i: "+j);
      currentNewArrivedProcessIndex = j;
      isFound = true;
    }
  }
  return isFound;
}

//enable the solution button
function showCorrectionButton(processArray) {
  $('#correct_scheduling').removeClass('hide').show();
}

//add additionnal numbers on post-processed table
function beautifyResult(processArray) {
  processArray.forEach(function(process, indexProc) {
    var currentColumn = $('#table_scheduling_responses tbody tr > td:nth-child('+ (indexProc+2) +')');
    // Parcours des lignes de la colonne en cours
    currentColumn.each(function(indexCell) {
      // Si la ligne actuelle >= à l'arrivée du processus
      if(indexCell >= process[1]) {
        var currentCell = $(this).find('div');
        // Si la valeur de la cellule vaut '...'
        if(currentCell.text() == "...") {
          if(indexCell > 0) {
            var prevCell = $('#table_scheduling_responses tbody').find('tr').eq(indexCell-1).find('td').eq(indexProc+1).find('div');
            var valuePrevCell = parseInt(prevCell.text());
            if(!isNaN(valuePrevCell)) {
              if(valuePrevCell > 1) {
                currentCell.text(valuePrevCell);
              }
              else if(valuePrevCell == 0) {
                return false; // Joue le role de break dans un .each
              }
              else {
                currentCell.text(0);
              }
            }
            else {
              currentCell.text(process[2]);
            }
          }
          else {
            currentCell.text(process[2]);
          }
        }
      }
     });
  });
}

//show the solution in the HTML talbe
function printResult(result, processArray){
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var nbRows = getSchedulingSolTabRows(processArray);
  //console.log("PRINT nbRows: "+nbRows);
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
      if(!(i < tmpProcessArray[currentProcess][1])){
        var tabElem = $('#table_scheduling_responses tbody').find('tr').eq(i).find('td').eq(currentProcess+1);
        tabElem.find('div').text(tmpProcessArray[currentProcess][2]);
        tabElem.addClass('grey-cell');
        tmpProcessArray[currentProcess][2]--;
        shift = true;
      }
    }
    // console.log("printResult processArray durée: "+processArray[result[i]][2]);
  }
  beautifyResult(processArray);
}

function findNextProcessNPSJF(actifProcessesIndexes, processArray){
  var minBurstIndex = 0;
  var minBurst = processArray[actifProcessesIndexes[0]][2]
  var i=0;

  actifProcessesIndexes.forEach(function(index, i){
    console.log("find processArray: "+processArray[index][2]);
    console.log(processArray);
    console.log("i: "+i);
    if(processArray[index][2]<minBurst){
      console.log("find i: "+i+" index: "+index);
      minBurstIndex=i;
      minBurst = processArray[index][2];
    }
  });
  console.log("minBurstIndex: "+minBurstIndex+" minBurst: "+minBurst);
  return minBurstIndex;
}

// preemtif Shortest Job First scheduling algorithme
function doPSJF (){
  var actifProcessesIndexes = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var findnext = true;

  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){
    //console.log("fifo arr i: "+i);
    console.log("i: "+i);
    if(isNewProcessArrived(i, processArray)){
      actifProcessesIndexes.push(currentNewArrivedProcessIndex); //put the new arrived process in the stack
    }
    console.log("actifProcessesIndexes");
    console.log(actifProcessesIndexes);
    console.log("findnext:"+findnext);
    if(findnext && (actifProcessesIndexes.length > 0)){
      var minBurstIndex = findNextProcessNPSJF(actifProcessesIndexes, processArray);
      findnext = false;
    }

    console.log("minBurstIndex: "+minBurstIndex+" actifProcessesIndexes: "+actifProcessesIndexes);

    if((minBurstIndex != null) && (actifProcessesIndexes.length > 0)){
      console.log("tmpProcessArray: "+tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]);
      if(tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2] > 0){
        result.push(actifProcessesIndexes[minBurstIndex]);
        tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]--;
      }
      else{
        var shift = actifProcessesIndexes.splice(minBurstIndex,1);
        console.log("actifProcessIndex shift: "+shift);

        findnext = true;
      }
    }
    console.log("");
  }
  console.log("result");
  console.log(result);
  printResult(result, processArray);
}

// Non-preemtif Shortest Job First scheduling algorithme
function doNPSJF(processArray) {
  var actifProcessesIndexes = [];
  var result = [];

  var tmpProcessArrayass = $.extend(true,[],processArray); //Deep Copy of processArray
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var findnext = true;

  console.log("--processArray--");
  console.log(tmpProcessArrayass);


  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){
    //console.log("fifo arr i: "+i);
    console.log("i: "+i);
    if(isNewProcessArrived(i, processArray)){
      actifProcessesIndexes.push(currentNewArrivedProcessIndex); //put the new arrived process in the stack
    }
    console.log("actifProcessesIndexes");
    console.log(actifProcessesIndexes);
    console.log("findnext:"+findnext);
    if(findnext && (actifProcessesIndexes.length > 0)){
      var minBurstIndex = findNextProcessNPSJF(actifProcessesIndexes, processArray);
      findnext = false;
    }

    console.log("minBurstIndex: "+minBurstIndex+" actifProcessesIndexes: "+actifProcessesIndexes);

    if((minBurstIndex != null) && (actifProcessesIndexes.length > 0)){
      console.log("tmpProcessArray: "+tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]);
      if(tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2] > 0){
        result.push(actifProcessesIndexes[minBurstIndex]);
        tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]--;
      }
      else{
        var shift = actifProcessesIndexes.splice(minBurstIndex,1);
        console.log("actifProcessIndex shift: "+shift);

        findnext = true;
      }
    }
    console.log("");
  }
  console.log("result");
  console.log(result);
  printResult(result, processArray);
}

//First In First Out scheduling algorithme
function doFIFO (processArray){
  var actifProcessIndex = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray

  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){
    // console.log("fifo arr i: "+i);

    if(isNewProcessArrived(i, processArray)){
          actifProcessIndex.push(currentNewArrivedProcessIndex); //put the new arrived process in the queue
    }
      // console.log("processArray puis currentNewArrivedProcessIndex");
      // console.log(processArray);
      // console.log(currentNewArrivedProcessIndex);
      //console.log("row: "+i+" column: "+currentNewArrivedProcessIndex+" value: "+processArray[currentNewArrivedProcessIndex[i]][2]);
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
      activeProcessIndex.push(currentNewArrivedProcessIndex); //put the new arrived process in the queue
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
              activeProcessIndex.push(currentNewArrivedProcessIndex); //put the new arrived process in the queue
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
