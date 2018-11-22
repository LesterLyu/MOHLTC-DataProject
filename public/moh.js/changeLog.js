function showChangeLog() {
    const converter = new showdown.Converter({
        tasklists: true,
    });

    fetch('/documents/update-history.md')
        .then(response => {
            return response.text()
        })
        .then(data => {
            const html = converter.makeHtml(data);
            $('#changelog-modal').find('h5').html('Changelog').end().find('p').html(html).end().modal('show');
        })
    }
