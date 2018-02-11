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
  processArray = {};
  $('#table_scheduling_entries tbody tr').each(function(i, row) {
    if(i!=0){
      processArray[$(row).find('td div').eq(0).text()] = [$(row).find('td div').eq(1).text(), $(row).find('td div').eq(2).text()];
    }
  });
}

function countTableRows(){

}

function doPSFJ (){

}

function doNPSFJ (){

}

function doFIFO (){

}

function doRR (){

}
