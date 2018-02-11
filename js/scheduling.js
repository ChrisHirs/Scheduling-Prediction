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
  $('.table-add').click(function () {
    var clone = $(this).closest('table').find('tr.hide').clone(true).removeClass('hide').toggle();
    // $(this).closest('table').append(clone);
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
    // Fresh new line
    $('.table-add').trigger('click');
  });

  $('#empty_scheduling').click(function() {
    rowsToArray();
    emptySchedulingSolTab();
  });

  $('#resolve_scheduling').click(function() {
    rowsToArray();

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
      var currentRow = [$(row).find('td div').eq(0).text(), $(row).find('td div').eq(1).text(), $(row).find('td div').eq(2).text()];
      //console.log(currentRow);
      processArray.push(currentRow);
    }
  });
  // Delete last entry in array
  processArray.splice(-1,1)
  //console.log(processArray);
}

function emptySchedulingSolTab() {
  console.log(getSchedulingSolTabRows());
}

function getSchedulingSolTabRows() {
  var rowsNumber = 0;
  // if (Object.keys(processArray).length > 0) {
  //   //Max duration calcul
  //   maxDuration = 0;
  //   for (i = 0; i < Object.keys(processArray).length; i++) {
  //     maxDuration += processArray[i][2];
  //   }
  //   //Max arrival + duration
  //
  // }
  return rowsNumber;
}

function isNewProcessArrived(currentLine){

  for(j=0; j<=processArray.length; j++){
    if(processArray[j][1] == currentLine){
      console.log("IS ARRIVED process arr: "+processArray[j][1]+" current: "+currentLine+" i: "+j);
      currentNewArrivedProcessIndex = j;
      return true;
    }
    else {
      console.log("IS NOT ARRIVED process arr: "+processArray[j][1]+" current: "+currentLine+" i: "+j);
      return false;
    }
  }
}

function doPSFJ (){

}

function doNPSFJ() {

}

function doFIFO (){
  var queue = [];
  console.log("in FIFO");
  console.log(processArray);
  for(i=0; i<=5; i++){
    console.log("fifo arr i: "+i);
    if(isNewProcessArrived(i)){
      queue.push(processArray[currentNewArrivedProcessIndex]);
      //$('#table_scheduling_entries tbody').rows[i].cells[currentNewArrivedProcessIndex+1].text(processArray[currentNewArrivedProcessIndex][2]);
      console.log("row: "+i+" column: "+currentNewArrivedProcessIndex+" value: "+processArray[currentNewArrivedProcessIndex][2]);
    }


    //while()
  }
  console.log(queue);
  console.log(processArray);
}

function doRR() {

}
