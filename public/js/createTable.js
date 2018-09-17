// get attributes and categories

$.ajax({
    url: '/api/add-cat',
    type: 'POST',
    data: $('#categoryForm').serialize(),
}).done(function (response) {
    if(response.success) {
        console.log(response);
        showAlert(response.message);
    }
}).fail(function(xhr, status, error) {
    console.log('fail');
    showErrorAlert(xhr.responseJSON.message);
});


var grid = canvasDatagrid();
$('#grid').html(grid);
grid.data = [
    {col1: 'row 1 column 1', col2: 'row 1 column 2', col3: 'row 1 column 3'},
    {col1: 'row 2 column 1', col2: 'row 2 column 2', col3: 'row 2 column 3'}
];