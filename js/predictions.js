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
    var cloneBurstRow = $(this).closest('table').find('tr.hide').eq(0).clone(true).removeClass('hide').toggle();
    var cloneErrorRow = $(this).closest('table').find('tr.hide').eq(1).clone(true).removeClass('hide').toggle();

    $(cloneBurstRow).addClass('row-nbr-' + rowCount).find('td:first-child').html(rowCount);
    $(cloneErrorRow).addClass('row-nbr-' + rowCount).find('td:first-child').html(rowCount);

    $(cloneBurstRow).insertBefore('#add_row');
    $(cloneErrorRow).insertBefore('.last-line-error');
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

  // Table utilisation - check burst row
  $('.table-check-burst').click(function () {

    console.log('check burst');

    var self = this;

    arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);

    console.log(arrayBaseData);
    console.log(arrayDataToCheck);
    console.log("alpha="+alpha);

    var lastPred = arrayDataToCheck.splice(0, 1);;

    console.log("inital pred="+lastPred);

    var arraySolutionData = [];

    $(arrayBaseData).each(function(i, val) {
      lastPred = calcNextBurst(lastPred, arrayBaseData[i], alpha)
      arraySolutionData.push(lastPred);
    })

    console.log(arraySolutionData);

    var MORE_OR_LESS = 0.2;

    $(arraySolutionData).each(function(i, solVal) {
      console.log(solVal + " compared to " + arrayDataToCheck[i]);
      if(arrayDataToCheck[i] > solVal + MORE_OR_LESS || arrayDataToCheck[i] < solVal - MORE_OR_LESS){
        var className = 'wrong-answer';
        console.log('wrong');
      }
      else{
        var className = 'correct-answer';
        console.log('correct');
      }

      $(self).parents('tr').find('td').eq(3+i).removeClass('wrong-answer correct-answer').addClass(className);

    })
  });

  function calcNextBurst(prediction, burst, alpha){
    return alpha*burst + (1-alpha)*prediction;
  }

  // Retrive an array of float from an indicated row
  function getDataFromRow(rowSelect, pointer){
    var arrayBaseData = [];

    if(pointer){
      var selector = $(pointer).find(rowSelect);
    }
    else{
      var selector = $(rowSelect)
    }

    selector.each(function(i, cell) {
      var value = parseFloat($(cell).text());

      if(isNaN(value)){
        alert('Only number are accepted, check your base data.');
        return false;
      }

      arrayBaseData.push(value);
    })

    return arrayBaseData;
  }

  // Table utilisation - check error row
  $('.table-check-error').click(function () {
    alert('lol');
  });

  // Higlighting rows
  $('#table_predictions tbody tr').on( "mouseenter mouseleave", function() {
    var className = $(this).attr('class').split(' ')[0];
    $('.' + className).toggleClass('table-row-hover');
  });

});
