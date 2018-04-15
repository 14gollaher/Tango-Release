$(function () {
    updateViewList();
});

function updateViewList() {
    if (!views.length) {
        $('#view-table').html = "No Views found";
        return;
    }

    let html = '';
    for (i in views) {
        html += '<a href=' + views[i]['name'] + '>';
        html += '<div class="uk-card-default uk-card-hover">';
        html += '<h3 style="color: black; font-weight: bold;">' + views[i]['name'] + '</h3>';
        html += '<iframe class="uk-border-rounded" src="' + baseUrl + '/' + views[i]['name'] + '" style="width:90%; height:500px; resize: both; overflow: auto;"></iframe>';
        html += '</div>';
        html += '</a>';
    }

    $('#view-table')[0].innerHTML = html;
}
