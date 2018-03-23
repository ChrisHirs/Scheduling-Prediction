
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
    $('#div_time').show();
  });

  $('#resolve_scheduling').click(function() {
    callAlgorithm(false);
    $('#div_time').show();
  });

  $('#correct_scheduling').click(function() {
    callAlgorithm(true);
  });
});

// Calls correct algorithm
function callAlgorithm(isCorrecting) {
  var processArray = rowsToArray();

  if (!isCorrecting) {
    emptySchedulingSolTab(processArray);
  }

  if( $('#psjf').is(':checked') ) {
    doPSJF(processArray, isCorrecting);
  }
  else if ( $('#npsjf').is(':checked')) {
    doNPSJF(processArray, isCorrecting);
  }
  else if ( $('#fifo').is(':checked')) {
    doFIFO(processArray, isCorrecting);
  }
  else if ( $('#rr').is(':checked')) {
    var rrnumber = parseInt($('#rr_number').val());
    if (!isNaN(rrnumber)) {
      doRR(rrnumber, processArray, isCorrecting);
    }
    else {
      alert("La valeur du Round Robin ne semble pas être un nombre valide...");
    }
  }
}

//Transform the HTML table to a JS array
function rowsToArray(){
  var processArray = [];
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
  for (var i = 0; i < rowsNumber; i++) {
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

  //run throught the process array to see if arrive time is equal to the current line
  for(j=0; j<processArray.length; j++){
    if(processArray[j][1] == currentLine){
      currentNewArrivedProcessIndex = j; //globale variable to get the index of the new arrived process
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

// Show the solution in the HTML talbe
function printResult(result, processArray){
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var nbRows = getSchedulingSolTabRows(processArray);
  var shift = true;

  for(var i = 0; i<nbRows; i++){
    //get the actual process
    if(shift){
      var currentProcess = result.shift();
      shift = false;
    }

    //check if process is arrived
    if((currentProcess !== undefined)){
      //if process isn't arrive don't print
      if(!(i < tmpProcessArray[currentProcess][1])){
        var tabElem = $('#table_scheduling_responses tbody').find('tr').eq(i).find('td').eq(currentProcess+1); //find the cell to print into
        tabElem.find('div').text(tmpProcessArray[currentProcess][2]);
        tabElem.addClass('grey-cell');
        tmpProcessArray[currentProcess][2]--; //decrement current procress
        shift = true;
      }
    }
  }
  beautifyResult(processArray);
}

function calculateTimes(results, processArray, isCorrecting){
  var processes=[];
  var result = $.extend(true,[],results); //Deep Copy of processArray
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var nbRows = getSchedulingSolTabRows(processArray);
  var shift = true;

  var totalWatingTime=0;
  var totalTurnaroundTime=0;
  var totalResponseTime=0;
  var averageWatingTime;
  var averageTurnaroundTime;
  var averageResponseTime;


  //initialisation of processes
  for(var i=0; i<tmpProcessArray.length;i++){
      processes.push([0,0,0, false])
  }

  for(var i = 0; i<nbRows; i++){

    //get the actual process
    if(shift){
      var currentProcess = result.shift();
      shift = false;
    }

    //check if process is arrived
    if((currentProcess !== undefined)){
      processes[currentProcess][3]=true;
      for(var j=0; j<processes.length; j++){
        //turnaround time
        if(tmpProcessArray[j][2]>0 && tmpProcessArray[j][1]<=i){
          processes[j][0]+=1;
        }
        //waiting time
        if(currentProcess != j && tmpProcessArray[j][2]>0 && tmpProcessArray[j][1]<=i){
          processes[j][1]+=1;
        }
        //respons time
        if(tmpProcessArray[j][1]<=i && !processes[j][3]){
          processes[j][2]+=1;
        }
      }

      //if process isn't arrive don't print
      if(!(i < tmpProcessArray[currentProcess][1])){
        tmpProcessArray[currentProcess][2]--;
        shift = true;
      }
    }
  }

  for(var i=0; i<processes.length; i++){
    totalTurnaroundTime += processes[i][0];
    totalWatingTime += processes[i][1];
    totalResponseTime += processes[i][2];
  }

  averageTurnaroundTime = totalTurnaroundTime/processes.length;
  averageWatingTime = totalWatingTime/processes.length;
  averageResponseTime = totalResponseTime/processes.length;

  console.log("turn "+averageTurnaroundTime+" wating "+averageWatingTime+" response "+averageResponseTime);

  if(isCorrecting){
    printCorrections(averageTurnaroundTime, averageWatingTime, averageResponseTime);
  }
  else{
    printTime(averageTurnaroundTime, averageWatingTime, averageResponseTime);
  }

}

function printCorrections(averageTurnaroundTime, averageWatingTime, averageResponseTime){
  if($('input[id="input_watingtime"]').val()==averageWatingTime){
    $('input[id="input_watingtime"]').css({'background-color' : '#b3f7b3'});
  }
  else{
    $('input[id="input_watingtime"]').css({'background-color' : '#faa'});
  }
  if($('input[id="input_turnaroundtime"]').val()==averageTurnaroundTime){
    $('input[id="input_turnaroundtime"]').css({'background-color' : '#b3f7b3'});
  }
  else{
    $('input[id="input_turnaroundtime"]').css({'background-color' : '#faa'});
  }
  if($('input[id="input_responstime"]').val()==averageResponseTime){
    $('input[id="input_responstime"]').css({'background-color' : '#b3f7b3'});
  }
  else{
    $('input[id="input_responstime"]').css({'background-color' : '#faa'});
  }
}

function printTime(averageTurnaroundTime, averageWatingTime, averageResponseTime){
  document.querySelector('input[id="input_watingtime"]').parentNode.MaterialTextfield.change(averageWatingTime.toString());
  document.querySelector('input[id="input_turnaroundtime"]').parentNode.MaterialTextfield.change(averageTurnaroundTime.toString());
  document.querySelector('input[id="input_responstime"]').parentNode.MaterialTextfield.change(averageResponseTime.toString());
}

// Show the correction in the HTML talbe
function printCorrection(result, processArray) {
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var nbRows = getSchedulingSolTabRows(processArray);
  var shift = true;

  for(var i = 0; i<nbRows; i++){
    if(shift){
      var currentProcess = result.shift();
      shift = false;
    }

    if ((currentProcess !== undefined)){
      if (!(i < tmpProcessArray[currentProcess][1])){
        var tabElem = $('#table_scheduling_responses tbody').find('tr').eq(i).find('td').eq(currentProcess+1);
        var value = parseInt(tabElem.find('div').text());
        if (!isNaN(value)) {
          if (value == tmpProcessArray[currentProcess][2]) {
            var className = 'correct-answer';
          }
          else {
            var className = 'wrong-answer';
          }
        }
        else {
          var className = undefined;
        }
        tabElem.removeClass('wrong-answer correct-answer').addClass(className);
        tmpProcessArray[currentProcess][2]--;
        shift = true;
      }
    }
  }
}

//find the next shortest process index
function findNextProcessNPSJF(actifProcessesIndexes, processArray) {
  var minBurstIndex = 0;
  var minBurst = processArray[actifProcessesIndexes[0]][2]
  var i=0;

  //run throught every index from the actif process array
  actifProcessesIndexes.forEach(function(index, i){
    //find the shortest index
    if(processArray[index][2]<minBurst){
      minBurstIndex=i;
      minBurst = processArray[index][2];
    }
  });
  return minBurstIndex;
}

// preemtif Shortest Job First scheduling algorithme
function doPSJF (processArray, isCorrecting){
  var actifProcessesIndexes = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray

  // run throught every raw of the table
  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){

    //if a new process arrive put it in the array
    if(isNewProcessArrived(i, processArray)){
      actifProcessesIndexes.push(currentNewArrivedProcessIndex); //put the new arrived process in the stack
    }

    //find the index of the next shortest process
    if(actifProcessesIndexes.length > 0){
      var minBurstIndex = findNextProcessNPSJF(actifProcessesIndexes, tmpProcessArray);
    }

    if((minBurstIndex != null) && (actifProcessesIndexes.length > 0)){

      //decrement the actif process
      if(tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2] > 0){
        result.push(actifProcessesIndexes[minBurstIndex]); //put the actual process name in the solution array
        tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]--;
      }

      //remove terminated process from actif process list
      if(tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]==0)
      {
        var shift = actifProcessesIndexes.splice(minBurstIndex,1);
      }
    }
  }


  calculateTimes(result, processArray, isCorrecting);
  if (!isCorrecting) {
    printResult(result, processArray);
  }
  else {
    //Function that print the result array into the HTML array.
    printCorrection(result, processArray);
  }
}

// Non-preemtif Shortest Job First scheduling algorithme
function doNPSJF(processArray, isCorrecting) {
  var actifProcessesIndexes = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray
  var findnext = true; //if the active process arrives to 0 can find the next shortest job from the actifProcessesIndexes

  // run throught every raw of the table
  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){

    //if a new process arrive put it in the array
    if(isNewProcessArrived(i, processArray)){
      actifProcessesIndexes.push(currentNewArrivedProcessIndex); //put the new arrived process in the stack
    }

    //find the index of the next shortest process
    if(findnext && (actifProcessesIndexes.length > 0)){
      var minBurstIndex = findNextProcessNPSJF(actifProcessesIndexes, processArray);
      findnext = false;
    }

    if((minBurstIndex != null) && (actifProcessesIndexes.length > 0)){

      //decrement the actif process until 0
      if(tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2] > 0){
        result.push(actifProcessesIndexes[minBurstIndex]); //put the actual process name in the solution array
        tmpProcessArray[actifProcessesIndexes[minBurstIndex]][2]--;
      }
      //remove terminated process from actif process list
      else{
        var shift = actifProcessesIndexes.splice(minBurstIndex,1);
        findnext = true;
      }
    }
  }



  calculateTimes(result, processArray, isCorrecting);
  if (!isCorrecting) {
    printResult(result, processArray);
  }
  else {
    //Function that print the result array into the HTML array.
    printCorrection(result, processArray);
  }
}

//First In First Out scheduling algorithme
function doFIFO (processArray, isCorrecting){
  var actifProcessIndex = [];
  var result = [];
  var tmpProcessArray = $.extend(true,[],processArray); //Deep Copy of processArray

  // run throught every raw of the table
  for(var i=0; i<=getSchedulingSolTabRows(processArray); i++){
      //if a new process arrive put it in the queue
      if(isNewProcessArrived(i, processArray)){
            actifProcessIndex.push(currentNewArrivedProcessIndex); //put the new arrived process in the queue
            //waitingTime[currentNewArrivedProcessIndex] = i;
      }
    }

  //generate the result array running througth the queue
  for(var i=0; i<actifProcessIndex.length; i++){
    //decrement the actif process until 0
    while(tmpProcessArray[actifProcessIndex[i]][2]>0){
      result.push(actifProcessIndex[i]); //put the actual process name in the solution array
      tmpProcessArray[actifProcessIndex[i]][2]--;
    }
  }

  calculateTimes(result, processArray, isCorrecting);
  if (!isCorrecting) {
    printResult(result, processArray);
  }
  else {
    //Function that print the result array into the HTML array.
    printCorrection(result, processArray);
  }
}

//Round Robin scheduling algorithme
function doRR(round, processArray, isCorrecting) {
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

  calculateTimes(result, processArray, isCorrecting);
  if (!isCorrecting) {
    printResult(result, processArray);
  }
  else {
    //Function that print the result array into the HTML array.
    printCorrection(result, processArray);
  }
}
