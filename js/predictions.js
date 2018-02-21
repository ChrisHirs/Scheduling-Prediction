$(function(){

  var rowCount = 1;

  function countRowTablePredict(){
    return ($('#table_predictions tbody tr').length - 5)/2;
  }

  function countColTablePredict(){
    return ($('#table_col_title th').length - 5); // 5 = other col than Rx
  }

  function prependClass(sel, strClass) {
    var $el = jQuery(sel);

    /* prepend class */
    var classes = $el.attr('class');
    classes = strClass +' ' +classes;
    $el.attr('class', classes);
}

  // Table utilisation - add row
  $('#add_row').click(function () {

    rowCount++;
    var cloneBurstRow = $(this).closest('table').find('tr.hide').eq(0).clone(true).removeClass('hide').toggle();
    var cloneErrorRow = $(this).closest('table').find('tr.hide').eq(1).clone(true).removeClass('hide').toggle();

    $(cloneBurstRow).find('td:first-child').html(rowCount);
    $(cloneErrorRow).find('td:first-child').html(rowCount);

    prependClass(cloneBurstRow, 'row-nbr-' + rowCount);
    prependClass(cloneErrorRow, 'row-nbr-' + rowCount);

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
    $('#table_predictions tr').not('.table-row-header').each(function(i, row) {

      var newCell = $('<td></td>');
      var colCount = countColTablePredict();
      $(newCell).append($('<div contentEditable class="editable data">Cell ' + colCount + '</div>'));

      if(i == 0){
        newCell = $('<th class="table-head""></th>');
        colCount++; // Because it needs to be the next columns
        $(newCell).html('R' + colCount);
      }

      $(row).children().eq(-2).before(newCell);

    })
  });

  // Table utilisation - remove column
  $('.table-remove-col').click(function () {
    $('#table_predictions tr').not('.table-row-header').each(function(i, row) {
      $(row).children().eq(-2).prev().detach();
    })
  });

  // Table utilisation - check burst row
  $('.table-check-burst').click(function () {

    console.log('check burst');

    var arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);

    console.log(arrayBaseData);
    console.log(arrayDataToCheck);
    console.log("alpha="+alpha);

    var lastPred = arrayDataToCheck.splice(0, 1);

    console.log("inital pred="+lastPred);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)

    console.log(arraySolutionBurst);

    const MORE_OR_LESS = 0.2;

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

    var arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);
    var lastPred = arrayDataToCheck.splice(0, 1);
    var sum = arrayDataToCheck.splice(arrayDataToCheck.length-1, arrayDataToCheck.length);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)
    var arraySolutionError = getSolutionError(lastPred, arrayBaseData, arraySolutionBurst);

    var correctSum = arraySolutionError.reduce((x, y) => x + y);

    console.log("alpha="+alpha);
    console.log("inital pred="+lastPred);
    console.log("sum="+sum);
    console.log("correctSum="+correctSum);

    console.log(arraySolutionBurst);
    console.log(arraySolutionError);

    console.log(arrayBaseData);
    console.log(arrayDataToCheck);

    const MORE_OR_LESS = 0.2;

    compareAndCorrect(arrayDataToCheck, arraySolutionError, MORE_OR_LESS, this);

    //Sum check
    var tolerableError = arrayDataToCheck.length * MORE_OR_LESS;
    console.log("tolerableErrorOnSum="+tolerableError);
    if(sum < correctSum+tolerableError && sum > correctSum-tolerableError){
      var className = 'correct-answer';
      console.log('sum correct');
    }
    else{
      var className = 'wrong-answer';
      console.log('sum wrong');
    }

    $(this).parents('tr').find('td').eq(-2).removeClass('wrong-answer correct-answer').addClass(className);

  });

  // Table utilisation - show burst row
  $('.table-show-burst').click(function () {
    console.log('check burst');

    var self = this;

    var arrayBaseData = getDataFromRow('#base_data div.data', null);
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

    var arrayBaseData = getDataFromRow('#base_data div.data', null);
    var arrayDataToCheck = getDataFromRow('div.data', $(this).parents('tr'));

    var alpha = arrayDataToCheck.splice(0, 1);
    var lastPred = arrayDataToCheck.splice(0, 1);

    var arraySolutionBurst = getSolutionBurst(lastPred, arrayBaseData, alpha)
    var arraySolutionError = getSolutionError(lastPred, arrayBaseData, arraySolutionBurst);

    var correctSum = arraySolutionError.reduce((x, y) => x + y);

    $(arraySolutionError).each(function(i, solVal) {
      $(self).parents('tr').find('td').eq(3+i).removeClass('wrong-answer').addClass('correct-answer').find('div').text(solVal.toFixed(2));
    })

    // Sum
    $(self).parents('tr').find('td').eq(-2).removeClass('wrong-answer').addClass('correct-answer').find('div').text(correctSum.toFixed(2));

  });

  // Click on btn find best alpha for a given burst series and initial prediction
  $('#btn_find_best_alpha').click(function () {

    var initialPred = $('#input_best_alpha_ip').val();

    if(!isNaN(initialPred)){

      var arrayBaseData = getDataFromRow('#base_data div.data', null);

      console.log(arrayBaseData);

      var bestAlpha = 0;
      var bestError = Number.MAX_SAFE_INTEGER;
      const STEP = 0.01;

      // Calc best alpha between 0 dans 1 by step of 0.01
      for(i = 0.00; i < 1; i += STEP){

        var arraySolutionBurst = getSolutionBurst(initialPred, arrayBaseData, i)
        var arraySolutionError = getSolutionError(initialPred, arrayBaseData, arraySolutionBurst);

        var correctSum = arraySolutionError.reduce((x, y) => x + y);

        if(correctSum < bestError){
          bestAlpha = i;
          bestError = correctSum;
        }

      }

      console.log('best alpha ='+bestAlpha);
      console.log('best error ='+bestError);

      $('#best_alpha').text(bestAlpha.toFixed(2));
      $('#best_error').text(bestError.toFixed(2));
      $('#answer_best_alpha').removeClass('hidden');

    }
  });

  // Button to plot graph burst
  $('#btn_generate_plot_burst').click(function () {
    drawBurst();
  });

  // Button to plot graph error
  $('#btn_generate_plot_error').click(function () {
    drawError();
  });

  function drawBurst()
  {
    // // Answer with
    // var arrayTraceBurstAnswerX = [];
    // for(i = 1; i <= countColTablePredict(); i++){
    //   arrayTraceBurstAnswerX.push(i);
    // }
    // var arrayTraceBurstAnswerX = [];

    var data = [];

    var arrayBaseData = getDataFromRow('#base_data div.data', null);

    var array_x = [];

    for(j = 1; j <= countColTablePredict(); j++){
      array_x.push(j);
    }

    var traceBaseData = {
      x: array_x,
      y: arrayBaseData,
      mode: 'lines+markers',
      name: 'Rafales effectives'
    };

    data.push(traceBaseData);

    $('#table_predictions tr.burst-row').not('.hide').each(function(i, row) {

      var idData = getDataFromRow('.data-id', row);
      var array_y = getDataFromRow('div.data', row);
      var alpha = array_y.splice(0, 1);

      var trace = {
        x: array_x,
        y: array_y,
        mode: 'lines+markers',
        name: 'Ligne ' + idData + ' | α = ' + alpha
      };

      data.push(trace);

    })

    var layout = {
      title:'Rafales'
    };

    Plotly.newPlot('plot_burst', data, layout);
  }

  function drawError()
  {

    var data = [];

    var arrayBaseData = getDataFromRow('#base_data div.data', null);

    var array_x = [];

    var arrayBaseData = [];

    for(j = 1; j <= countColTablePredict(); j++){
      array_x.push(j);
      arrayBaseData.push(0);
    }

    var traceBaseData = {
      x: array_x,
      y: arrayBaseData,
      mode: 'lines+markers',
      name: 'Erreur rafales effectives'
    };

    data.push(traceBaseData);

    $('#table_predictions tr.error-row').not('.hide').each(function(i, row) {

      var idData = getDataFromRow('.data-id', row);

      var array_y = getDataFromRow('div.data', row);
      var alpha = array_y.splice(0, 1);
      array_y = array_y.splice(1, array_y.length);

      var trace = {
        x: array_x,
        y: array_y,
        mode: 'lines+markers',
        name: 'Ligne ' + idData + ' | α = ' + alpha
      };

      data.push(trace);

    })

    var layout = {
      title:'Erreurs'
    };

    Plotly.newPlot('plot_error', data, layout);
  }

  // Higlighting rows
  $('#table_predictions tbody tr').on( "mouseenter mouseleave", function() {
    var className = $(this).attr('class').split(' ')[0];
    $('.' + className).toggleClass('table-row-hover');
  });

  // Update Initial prediction field of Error Array when editing field in Prediction array
  $('.burst-row .data-alpha').focusout(function() {
    var className = $(this).parents('tr').attr('class').split(' ')[0];
    $('.' + className + '.error-row').find('div.data-alpha').text($(this).text());
  })

  // Update Alpha field of Error Array when editing field in Prediction array
  $('.burst-row .data-ip').focusout(function() {
    var className = $(this).parents('tr').attr('class').split(' ')[0];
    $('.' + className + '.error-row').find('div.data-ip').text($(this).text());
  })

});
