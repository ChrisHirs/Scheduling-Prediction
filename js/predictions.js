$(function(){

  var rowCount = 1;

  function countRowTablePredict(){
    return ($('#table_predictions tbody tr').length - 5)/2;
  }

  function countColTablePredict(){
    return ($('#table_col_title th').length - 4); // 4 = other col than Rx
  }

  // Table utilisation - add row
  $('#add_row').click(function () {

    rowCount++;
    var clone = $(this).closest('table').find('tr.hide').clone(true).removeClass('hide').toggle();
    $(clone).addClass('row-nbr-' + rowCount).find('td:first-child').html(rowCount);

    $(clone).clone(true).insertBefore('#add_row');
    $(clone).insertBefore('.last-line-error');
  });

  // Table utilisation - remove row
  $('.table-remove-row').click(function () {

    var className = $(this).parents('tr').attr('class').split(' ')[0];
    $('.' + className).detach();
    // $('.error-header').prev().detach();
    // $('.last-line-error').prev().detach();
  });

  // Table utilisation - add column
  $('.table-add-col').click(function () {
    $('#table_predictions tr').not('.table-header').each(function(i, row) {

      var newCell = $('<td></td>');
      var colCount = countColTablePredict();
      $(newCell).append($('<div contentEditable style="width: 100%; height: 100%;">Cell ' + colCount + '</div>'));

      if(i == 0){
        newCell = $('<th style="color:white;text-align: center;"></th>');
        colCount++; // Because it needs to be the next columns
        $(newCell).html('R' + colCount);
      }

      $(row).children().last().before(newCell);

    })
  });

  // Table utilisation - remove column
  $('.table-remove-col').click(function () {
    $('#table_predictions tr').not('.table-header').each(function(i, row) {
      $(row).children().last().prev().detach();
    })
  });

  // Higlighting rows
  $('#table_predictions tbody tr').on( "mouseenter mouseleave", function() {
    var className = $(this).attr('class').split(' ')[0];
    $('.' + className).toggleClass('table-row-hover');
  });

});
