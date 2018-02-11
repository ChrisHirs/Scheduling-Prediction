$(function(){

  // Upgrade DOM MDL
  // $('.mdl-layout__tab').click(function(){
  //   componentHandler.upgradeDom();
  // });

  $('.editable').on('click', function () { document.execCommand('selectAll', false, null); });
});
