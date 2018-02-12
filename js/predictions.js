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
      $(newCell).append($('<div contentEditable class="editable data">Cell ' + colCount + '</div>'));

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

    arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);

    console.log(arrayBaseData);
    console.log(arrayDataToCheck);
    console.log("alpha="+alpha);

    var lastPred = arrayDataToCheck.splice(0, 1);

    console.log("inital pred="+lastPred);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)

    console.log(arraySolutionBurst);

    var MORE_OR_LESS = 0.2;

    compareAndCorrect(arrayDataToCheck, arraySolutionBurst, MORE_OR_LESS, this);


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

    var isThereAnyChar = false;

    selector.each(function(i, cell) {
      var value = parseFloat($(cell).text());

      if(isNaN(value)){
        isThereAnyChar = true;
      }

      arrayBaseData.push(value);
    })

    if(isThereAnyChar){
      alert('Only number are accepted, check your datas.');
    }

    return arrayBaseData;
  }

  function getSolutionBurst(firstPred, arrayBaseData, alpha){
    var lastPred = firstPred;
    var arraySolutionBurst = [];
    $(arrayBaseData).each(function(i, val) {
      lastPred = calcNextBurst(lastPred, arrayBaseData[i], alpha)
      arraySolutionBurst.push(lastPred);
    })
    return arraySolutionBurst;
  }

  function getSolutionError(firstPred, arrayBaseData, arraySolutionBurst){
    var lastPred = firstPred;
    var arraySolutionError = [];

    $(arraySolutionBurst).each(function(i, solVal) {
      arraySolutionError.push(Math.abs(lastPred - arrayBaseData[i]));
      lastPred = arraySolutionBurst[i];
    })

    return arraySolutionError;
  }

  function compareAndCorrect(arrayDataToCheck, arraySolution, deltaPrecision, pointer){

    if(!arrayDataToCheck){
      return false;
    }

    $(arraySolution).each(function(i, solVal) {
      console.log(solVal + " compared to " + arrayDataToCheck[i]);
      if(arrayDataToCheck[i] < solVal + deltaPrecision && arrayDataToCheck[i] > solVal - deltaPrecision){
        var className = 'correct-answer';
        console.log('correct');
      }
      else{
        var className = 'wrong-answer';
        console.log('wrong');
      }

      $(pointer).parents('tr').find('td').eq(3+i).removeClass('wrong-answer correct-answer').addClass(className);
    })

  }


  // Table utilisation - check error row
  $('.table-check-error').click(function () {

    arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);
    var lastPred = arrayDataToCheck.splice(0, 1);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)
    var arraySolutionError = getSolutionError(lastPred, arrayBaseData, arraySolutionBurst);

    console.log("alpha="+alpha);
    console.log("inital pred="+lastPred);

    console.log(arraySolutionBurst);
    console.log(arraySolutionError);

    console.log(arrayBaseData);
    console.log(arrayDataToCheck);

    var MORE_OR_LESS = 0.2;

    compareAndCorrect(arrayDataToCheck, arraySolutionError, MORE_OR_LESS, this);

  });

  // Table utilisation - show burst row
  $('.table-show-burst').click(function () {
    console.log('check burst');

    var self = this;

    arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);
    var lastPred = arrayDataToCheck.splice(0, 1);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)

    $(arraySolutionBurst).each(function(i, solVal) {
      $(self).parents('tr').find('td').eq(3+i).removeClass('wrong-answer').addClass('correct-answer').find('div').text(solVal.toFixed(2));
    })
  });

  // Table utilisation - show error row
  $('.table-show-error').click(function () {
    var self = this;

    arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);
    var lastPred = arrayDataToCheck.splice(0, 1);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)
    var arraySolutionError = getSolutionError(lastPred, arrayBaseData, arraySolutionBurst);

    $(arraySolutionError).each(function(i, solVal) {
      $(self).parents('tr').find('td').eq(3+i).removeClass('wrong-answer').addClass('correct-answer').find('div').text(solVal.toFixed(2));
    })

  });

  // Higlighting rows
  $('#table_predictions tbody tr').on( "mouseenter mouseleave", function() {
    var className = $(this).attr('class').split(' ')[0];
    $('.' + className).toggleClass('table-row-hover');
  });

});
