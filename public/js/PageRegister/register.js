$(document).ready(function() {
    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: '/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(response) {
                $('#notification-area').html(`
                    <div class="notification is-success">
                        <button class="delete"></button>
                        ${response.message}
                    </div>
                `);
                $('#registerForm')[0].reset();
            },
            error: function(xhr) {
                $('#notification-area').html(`
                    <div class="notification is-danger">
                        <button class="delete"></button>
                        ${xhr.responseJSON.message}
                    </div>
                `);
            }
        });
    });

    $(document).on('click', '.notification .delete', function() {
        $(this).parent().remove();
    });
});
