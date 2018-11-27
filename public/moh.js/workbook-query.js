let att, cat, worksheetNames;

$(document).ready(function () {
    // get workbooks
    var selectWorkbook = $('#select-workbook');
    $.ajax({
        url: '/api/query/workbook/names',
        type: 'GET',
    }).done(function (response) {
        if (response.success) {
            $.each(response.names, function (i, item) {
                selectWorkbook.append($('<option>', {
                    text: item,
                    value: item,
                }));
            });

            selectWorkbook.selectpicker('refresh');
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
    });
});

document.querySelector('#select-workbook').onchange = (e) => {
    if (e.target.value !== '') {
        console.log('select ' + e.target.value);
        const selectWorksheet = $('#select-worksheet');
        $.ajax({
            url: '/api/query/workbook/detail',
            type: 'GET',
            data: {name: $('#select-workbook').val()}
        }).done(function (response) {
            if (response.success) {
                att = response.att;
                cat = response.cat;
                worksheetNames = response.worksheetNames;
                // select picker for worksheet
                selectWorksheet[0].innerHTML = '';
                selectWorksheet.append('<option value="">Select one</option>');
                $.each(response.worksheetNames, function (i, item) {
                    selectWorksheet.append($('<option>', {
                        text: item,
                        value: item,
                    }));
                });
                $('#worksheet-wrapper').removeClass('hide');
                selectWorksheet.selectpicker('refresh');
                $('#cat-wrapper').addClass('hide');
                $('#att-wrapper').addClass('hide');
            }
        }).fail(function (xhr, status, error) {
            console.log('fail ' + xhr.responseJSON.message);
        });
    }
    else {
        $('#worksheet-wrapper').addClass('hide');
    }
};

document.querySelector('#select-worksheet').onchange = (e) => {
    if (e.target.value !== '') {
        console.log('select ' + e.target.value);
        const index = worksheetNames.indexOf(e.target.value);
        const selectCat = $('#select-cat');
        selectCat.html('');
        selectCat.append('<option value="">Select one</option>');
        $.each(cat[index], function (i, item) {
            if (item !== '' && !isNaN(parseInt(item))) {
                selectCat.append($('<option>', {
                    text: item,
                    value: item,
                }));
            }
        });
        $('#cat-wrapper').removeClass('hide');
        selectCat.selectpicker('refresh');

        const selectAtt = $('#select-att');
        selectAtt.html('');
        selectAtt.append('<option value="">Select one</option>');
        $.each(att[index], function (i, item) {
            if (item !== '' && !isNaN(parseInt(item))) {
                selectAtt.append($('<option>', {
                    text: item,
                    value: item,
                }));
            }
        });
        $('#att-wrapper').removeClass('hide');
        selectAtt.selectpicker('refresh');
    }
    else {
        $('#att-wrapper').addClass('hide');
        $('#cat-wrapper').addClass('hide');
    }
};

document.querySelector('#select-att').onchange = (e) => {
    if (e.target.value !== '' && $('#select-cat').val() !== '')
        requestDate($('#select-workbook').val(), $('#select-worksheet').val(), $('#select-cat').val(), $('#select-att').val());
};

document.querySelector('#select-cat').onchange = (e) => {
    if (e.target.value !== '' && $('#select-att').val() !== '')
        requestDate($('#select-workbook').val(), $('#select-worksheet').val(), $('#select-cat').val(), $('#select-att').val());
};

function requestDate(wb, ws, attId, catId) {
    const onlyFilled = $('#onlyFilledCheck').val() === 'on';
    // construct query data
    const queryData = {
        [ws]: [[attId, catId]]
    };

    $.ajax({
        url: '/api/query/workbook/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({wbName: wb, onlyFilled: onlyFilled, queryData: queryData}),
    }).done(function (response) {
        if (response.success) {
            console.log(response);
            const resultDiv = document.querySelector('#result');
            const wsName = Object.keys(response.result)[0];
            const data = response.result[wsName][0];
            const ul = document.createElement('ul');
            ul.classList.add('list-group');
            for (let i = 0; i < data.length; i++) {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerText = 'user: ' + data[i].username + ', data: ' + JSON.stringify(data[i].data);
                ul.appendChild(li);
            }
            resultDiv.innerHTML = '';
            resultDiv.appendChild(ul);

            if (data.length === 0)
                resultDiv.innerHTML = 'No Data available, no user filled this workbook.';

        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
    });
}
