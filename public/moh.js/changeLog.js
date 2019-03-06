function showChangeLog() {
    const converter = new showdown.Converter({
        tasklists: true,
    });

    $.get('/documents/update-history.md')
        .done(data => {
            const html = converter.makeHtml(data);
            $('#changelog-modal').find('h5').html('Changelog').end().find('p').html(html).end().modal('show');
        })
}
