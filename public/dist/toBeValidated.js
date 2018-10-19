"use strict";

$(document).ready(function () {
  $('#resend').click(function () {
    var btn = $(this);
    var statusText = $('#status');
    statusText.html('<i class="fas fa-spinner fa-spin"></i> Sending...');
    btn.prop('disabled', true);
    $.ajax({
      url: '/api/send-validation-email',
      type: 'GET'
    }).done(function (response) {
      if (response.success) {
        statusText.html('<i class="fas fa-check"></i> Sent');
        btn.prop('disabled', false);
      }
    }).fail(function (xhr, status, error) {
      console.log('fail');
      showModalAlert('Error', xhr.responseJSON.message);
      btn.prop('disabled', false);
    });
  });
});
//# sourceMappingURL=toBeValidated.js.map
