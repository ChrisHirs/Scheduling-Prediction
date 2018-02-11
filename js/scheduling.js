var nbRows;
var processArray = {};

$(function(){

  // Toggle Round Robin number
  $('input[name=algorithm]').click(function() {
    if( $('#rr').is(':checked') ) {
      $('.roundrobinnumber').show();
    } else {
      $('.roundrobinnumber').hide();
    }
  });

  //Buttons
  $('#reset_scheduling').click(function() {
    var rowCount = $('#table_scheduling_entries tbody tr').length;
    var i = 1;
    // Delete all lines
    while (i < rowCount) {
      $('#table_scheduling_entries tbody tr:last').detach();
      i++;
    }
    // Fresh new line
    $('.table-add').trigger('click');
  });

  $('#empty_scheduling').click(function() {
    //pass
  });

  $('#resolve_scheduling').click(function() {
    rowsToArray();
    countTableRows();

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
  $('#table_scheduling_entries tbody tr').each(function(i, row) {

    if(i!=0){
      console.log($(row).find('td div').eq(0).textContent);
      processArray[$(row).find('td div').eq(0).textContent] = 0;

    }

  });
  console.log(processArray);
}

function countTableRows(){

}

function doPSFJ (){
  alert("psjf");
}

function doNPSFJ (){
  alert("npsjf");
}

function doFIFO (){

  alert("fifo");
}

function doRR (){
  alert("rr");
}
