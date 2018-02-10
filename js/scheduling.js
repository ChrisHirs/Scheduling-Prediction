var nbRows;
var processArray;

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
    var rowCount = $(this).closest('table').length;
    alert(rowCount);
  });

  $('#empty_scheduling').click(function() {
    //pass
  });

  $('#resolve_scheduling').click(function() {
    rows = $('tr', '#table_scheduling_entries');
    console.log(rows);
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
            var inputEl = $(el).children().get(0);
            $(el).before('<td>Added ' + $(inputEl).attr('type') + '</td>');
        })
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
