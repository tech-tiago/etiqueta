function datePickerPTBR() {
    $('[data-toggle="datepicker"]').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        language: 'pt-BR'
      }).on('changeDate', function(e) {
        var formattedDate = e.format('yyyy-mm-dd');
        $('#formattedDate').val(formattedDate);
    });
}
$(function() {
    datePickerPTBR();
});

