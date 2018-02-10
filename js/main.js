$(function(){

  // Upgrade DOM MDL
  // $('.mdl-layout__tab').click(function(){
  //   componentHandler.upgradeDom();
  // });

  // Table utilisation - add
  $('.table-add').click(function () {
    var $clone = $(this).closest('table').find('tr.hide').clone(true).removeClass('hide').toggle();
    $(this).closest('table').append($clone);
  });

  // Table utilisation - delete
  $('.table-remove').click(function () {
    $(this).parents('tr').detach();
  });

});
