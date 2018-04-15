$(function () {
    $('#tango-frame-header').html("Testing: " + tangoPage['view_name']);
    $('#tango-frame').attr('src', baseUrl + tangoPage['view_name'])
    $('#pass-button').hide();
    $('#fail-button').hide();
    updateNoCases();
    updateCasesTable();
    updateCurrentCase();
    if (tangoPage['cases'].length) updateCasesExist()
});

$("#test-case-button").click(function () {
    $('#test-case-button').hide();
    $('#pass-button').show();
    $('#fail-button').show();
    runTestCase();
    updateCurrentCase();
});

$("#pass-button").click(function () {
    $('#pass-button').hide();
    $('#fail-button').hide();
    $('#test-case-button').show();
    tangoPage['cases'][0]['status'] = 'Pass';
    updateCases();
});

$("#fail-button").click(function () {
    $('#pass-button').hide();
    $('#fail-button').hide();
    $('#test-case-button').show();
    $("#case-fail-notes").val("");
});

$("#update-fail-button").click(function () {
    tangoPage['cases'][0]['status'] = 'Fail';
    updateFailedCase();
    updateCases();
    failedCaseNotification();
});

$("#add-case-button").click(function () {
    submitCustomCase();
    updateCasesTable();
    updateCurrentCase();
    updateCasesExist();
});

$("#update-notes-button").click(function () {
    updateCurrentNote();
});

$("#results-table").on("click", "tr", function () {
    selectedCaseIndex = $(this).index() - 1;
    if (selectedCaseIndex !== -1) updateSelectedCase();
});

$("#generate-manual-case-button").click(function () {
    generatePermutationAjax();
});

$("#edit-selectors-button").click(function () {
    UIkit.modal('#edit-selectors-modal').show();
    updateSelectorsTable();
});

UIkit.util.on('#generate-cases-button', 'click', function (e) {
    e.preventDefault();
    e.target.blur();
    if (tangoPage['cases'].length > 0) {
        UIkit.modal.confirm('Unsaved cases will be overwritten!').then(function () {
            generatePermutationsAjax();
        }, function () {
        });
    }
    else {
        generatePermutationsAjax();
    }
});

function defaultSelectorsModal() {
    UIkit.modal.confirm('Overwrite all selectors?').then(function () {
        defaultSelectors();
    }, function () {
    });
};

function toggleAllSavesButtonClick() {
    toggleCasesSave();
    saveTangoPage();
    updateCasesTable();
};

function generatePermutationsAjax() {
    let requestUrl = window.location.origin + "/tango/generate-permutations";
    $.get(requestUrl, { viewName: tangoPage['view_name'] },
        function (data) {
            createCases(data);
            updateCasesTable();
            updateCurrentCase();
            updateCasesExist();
        });
}

function generatePermutationAjax() {
    let requestUrl = window.location.origin + "/tango/generate-permutations";
    $.get(requestUrl, { viewName: tangoPage['view_name'] },
        function (data) {
            let newCaseId = createCustomCase();
            updateCustomCaseTable(newCaseId, data);
        });
}

function passedCaseNotification() {
    UIkit.notification({
        message: 'Test Passed!',
        status: 'success',
        pos: 'bottom-right',
        timeout: 1000
    });
}

function failedCaseNotification() {
    UIkit.notification({
        message: 'Test Failed!',
        status: 'danger',
        pos: 'bottom-right',
        timeout: 1000
    });
}

async function runTestCase() {
    resetIFrameFields();
    for (i in tangoPage['cases'][0]['test_data']) {
        await setIFrameField();
        await sleep(125);
    }
    
    tangoPage['cases'][0]['last_ran'] = getCurrentDateTime();

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function setIFrameField() {
        $("#tango-frame").contents().find(getSelector(tangoPage['cases'][0]['test_data'][i]['field_name']))
            .val(tangoPage['cases'][0]['test_data'][i]['test_value']);
    }

    function resetIFrameFields() {
        for (i in tangoPage['cases'][0]['test_data']) {
            $("#tango-frame").contents().find(getSelector(tangoPage['cases'][0]['test_data'][i]['field_name'])).val('');
        }
    }

    function getCurrentDateTime() {
        let now = new Date();

        let hours = now.getHours();
        hours = hours % 12;
        hours = hours ? hours : 12; 

        let minutes = now.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;

        let amOrPm = now.getHours() >= 12 ? 'pm' : 'am';

        return now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + hours + ':' + minutes + ' ' + amOrPm;;
    }
}

function getSelector(fieldName) {
    for (i in tangoPage['fields']) {
        if (tangoPage['fields'][i]['name'] === fieldName) return tangoPage['fields'][i]['selector']
    }
}

function updateCases() {
    tangoPage['cases'].push(tangoPage['cases'].splice(0, 1)[0]); 
    console.log(tangoPage);
    updateCasesTable();
    saveTangoPage();
}

function saveTangoPage() {
    let saveTangoPage = Object.assign({}, tangoPage); 
    saveTangoPage['cases'] = saveTangoPage['cases'].filter(function (item) { return item['save'] === "True"; });
    let requestUrl = window.location.origin + "/tango/save-tango-page";
    $.get(requestUrl, { 'tangoPage': JSON.stringify(saveTangoPage) }) // TODO: Make this work as a POST
}

function toggleCasesSave() {
    if (allCasesSaved()) {
        unsaveAllCases()
        return;
    }
    saveAllCases(); 
}

function allCasesSaved() {
    for (i in tangoPage['cases']) {
        if (tangoPage['cases'][i]['save'] == "False") return false;
    }
    return true;
}

function saveAllCases() {
    for (i in tangoPage['cases']) {
        tangoPage['cases'][i]['save'] = "True";
    }
}

function unsaveAllCases() {
    for (i in tangoPage['cases']) {
        tangoPage['cases'][i]['save'] = "False";
    }
}

function updateSelectors() {
    for (i in tangoPage['fields']) {
        tangoPage['fields'][i]['selector'] = $("#custom-selector" + i).val();
    }
    saveTangoPage();
}

function defaultSelectors() {
    for (i in tangoPage['fields']) {
        tangoPage['fields'][i]['selector'] = '#id_' + tangoPage['fields'][i]['name'];
    }
    saveTangoPage();
}

function createCustomCase() {
    newTestCase['id'] = createNewId();
    newTestCase['last_ran'] = "-";
    newTestCase['importance'] = "1";
    newTestCase['notes'] = "";
    newTestCase['status'] = "Not Ran";
    newTestCase['save'] = false;
    return newTestCase["id"];
}

function createCases(permutations) {
    tangoPage['cases'] = tangoPage['cases'].filter(function (item) { return item['save'] === "True"; });

    let amount = getLongestPermutationCount()

    for (let i = 0; i < amount; i++) {
        let testCase = {}
        testCase['id'] = createNewId();
        testCase['last_ran'] = "-";
        testCase['importance'] = "1";
        testCase['notes'] = "";
        testCase['status'] = "Not Ran";
        testCase['save'] = 'False';
        testCase['test_data'] = getTestData(permutations);
        tangoPage['cases'].push(testCase);
    }
    

    function getLongestPermutationCount() {
        let longest = 0

        for (i in permutations) {
            if (permutations[i]['test_values'].length > longest)
                longest = permutations[i]['test_values'].length
        }
        
        return longest;

    }

    function getTestData() {
        let test_data = []

        for (i in permutations) {
            let test_input = {}
            if (permutations[i]['test_values'].length > 0) {
                test_input['test_value'] = permutations[i]['test_values'][0];
            }
            else {
                test_input['test_value'] = permutations[i]['default'];
            }
            test_input['field_name'] = permutations[i]['field_name'];

            test_data.push(test_input);
            permutations[i]['test_values'].shift();
        }

        return test_data;
    }

    function isMoreTestValues() {
        for (i in permutations) {
            if (permutations[i]['test_values'].length > 0) {
                return true;
            }
        }
        return false;
    }
}

function updateFailedCase() {
    tangoPage['cases'][0]['importance'] = $("input[name=importance-rating]:checked").val();
    tangoPage['cases'][0]['notes'] = $("#case-fail-notes").val();
}

function updateCurrentNote(data) {
    tangoPage['cases'][data]['notes'] = $('#notes-textarea').val();
    saveTangoPage();
}

function updateCaseSaveStatus(data) {
    let caseIndex = data.parent().parent().index() - 1;

    if (data[0].checked) tangoPage['cases'][caseIndex]['save'] = "True";
    else tangoPage['cases'][caseIndex]['save'] = "False";

    updateCasesTableSaveAllButton();
    saveTangoPage();
}

function submitCustomCase() {
    newTestCase['id'] = $("#custom-case-id").val();

    let newTestData = [];

    for (i in tangoPage['fields']) {
        let newFieldValue = {};
        newFieldValue['field_name'] = tangoPage['fields'][i]['name'];
        newFieldValue['test_value'] = $('#custom-case-new-' + newFieldValue['field_name']).val();
 
        newTestData.push(newFieldValue);
    }
    newTestCase['test_data'] = newTestData;
    tangoPage['cases'].unshift(newTestCase);
    newTestCase = {};
}

function deleteCase() {
    $('#test-case-button').show();
    $('#pass-button').hide();
    $('#fail-button').hide();

    tangoPage['cases'].splice(selectedCaseIndex, 1);
    updateCasesTable();
    saveTangoPage();
    updateCurrentCase();
    updateCasesExist();
    if (!tangoPage['cases'].length) updateNoCases();
}

function setCurrentCase() {
    $('#pass-button').hide();
    $('#fail-button').hide();
    $('#test-case-button').show();
    tangoPage['cases'][0] = tangoPage['cases'].splice(selectedCaseIndex, 1, tangoPage['cases'][0])[0];
    updateCasesTable();
}

function updateNoCases() {
    $("#test-case-button").prop('disabled', true);
}

function updateCasesExist() {
    $("#test-case-button").prop('disabled', false);
}

function updateModifiedCase() {
    tangoPage['cases'][selectedCaseIndex]['id'] = $("#selected-case-id").val();
    tangoPage['cases'][selectedCaseIndex]['importance'] = $("input[name=importance-rating]:checked").val();
    tangoPage['cases'][selectedCaseIndex]['status'] = $("input[name=status-selection]:checked").val();

    for (i in tangoPage['cases'][selectedCaseIndex]['test_data']) {
        tangoPage['cases'][selectedCaseIndex]['test_data'][i]['test_value']
            = $("#custom-case-update-" + tangoPage['cases'][selectedCaseIndex]['test_data'][i]['field_name']).val();
    }
    updateCasesTable();
    updateCurrentCase();
    saveTangoPage();
}

function createNewId() {
    let maxId = 1;
    for (i in tangoPage['cases']) {
        if (parseInt(tangoPage['cases'][i]['id']) >= maxId) {
            maxId = parseInt(tangoPage['cases'][i]['id']) + 1
        } 
    }
    return maxId.toString();
}

function openNotesModal(data) {
    var caseIndex = data.parent().parent().index() - 1;
    let html = '<h3 class="uk-heading-divider">Notes for Case - ' + tangoPage['cases'][caseIndex]['id'] + '</h1>';
    $('#notes-text').html(html);

    html = ' <button onclick= "updateCurrentNote(' + caseIndex + ')" style= "float: left"class="uk-button uk-button-default uk-modal-close uk-button-primary" type= "button" id= "update-notes-button" > Update</button >';
    html += ' <button class="uk-button uk-button-default uk-modal-close" type="button">Close</button>';
    $('#notes-footer').html(html);

    $('#notes-textarea').val(tangoPage['cases'][caseIndex]['notes']);

    UIkit.modal('#case-notes-modal').show();
}

function updateCasesTableSaveAllButton() {
    if (!allCasesSaved()) {
        html = '<button type="button" onclick="toggleAllSavesButtonClick()" class="uk-button uk-button-primary uk-button-small uk-float-right" uk-toggle>Check All</button>'
    }
    else {
        html = '<button type="button" onclick="toggleAllSavesButtonClick()" class="uk-button uk-button-primary uk-button-small uk-float-right" uk-toggle>Uncheck All</button>'
    }
    $('#toggle-all-saves').html(html);
}

function updateCasesTable() {
    if (!tangoPage['cases'].length) {
        $('#results-table').html("");
        $('#toggle-all-saves').html("");
        return;
    }

    var html = '<h3 class="uk-heading-divider">All Cases</h1>';
    html += '<table class="uk-table uk-table-striped all-cases-table">';

    html += '<tr>';
    html += '<th>ID</th>';
    html += '<th>Last Ran</th>';
    html += '<th>Importance</th>';
    html += '<th>Notes</th>';
    html += '<th>Save</th>';
    html += '</tr>';

    for (let i = 0; i < tangoPage['cases'].length; i++) {
        if (tangoPage['cases'][i]['status'] === "Pass") {
            html += '<tr style="background-color: #CCFFCC; cursor: pointer" href="#case-details-modal" uk-toggle>';
        }
        else if (tangoPage['cases'][i]['status'] === "Fail") {
            html += '<tr style="background-color: #FFAD99; cursor: pointer" href="#case-details-modal" uk-toggle>';
        }
        else {
            html += '<tr href="#case-details-modal" style="cursor: pointer" uk-toggle>';
        }
        html += '<td>' + tangoPage['cases'][i]['id'] + '</td>';
        html += '<td>' + tangoPage['cases'][i]['last_ran'] + '</td>';
        html += '<td>' + tangoPage['cases'][i]['importance'] + '</td>';
        html += '<td> <a uk-icon="warning" onclick= "openNotesModal($(this)); event.stopPropagation()" /> </td > ';

        if (tangoPage['cases'][i]['save'] === "True") html += '<td> <input checked '
        else html += '<td> <input '

        html += 'class="uk-checkbox" type= "checkbox" onclick= "updateCaseSaveStatus($(this)); event.stopPropagation()" /> </td > ';
        html += '</tr>';
    }

    html += '</table>';
    $('#results-table').html(html);

    updateCasesTableSaveAllButton();
}

function updateCurrentCase() {
    if (!tangoPage['cases'].length) {
        $('#current-case').html("");
        return;
    }

    var html = '<h3 class="uk-heading-divider">Current Case - ' + tangoPage['cases'][0]['id'] + '</h1>';
    html += '<table class="uk-table uk-table-striped">';

    html += '<tr>';
    html += '<th>Field Name</th>';
    html += '<th>Test Value</th>';
    html += '</tr>';
    for (i in tangoPage['cases'][0]['test_data']) {
        html += '<tr>';
        html += '<td>' + tangoPage['cases'][0]['test_data'][i]['field_name'] + '</td>';
        html += '<td class="uk-panel uk-panel-box uk-text-truncate">'
                + tangoPage['cases'][0]['test_data'][i]['test_value'] + '</td>';
        html += '</tr>';
    }
    html += '</table>';
    $('#current-case').html(html);
}

function updateSelectedCase() {
    let html = '<h3 class="uk-heading-divider">Selected Case - ' + '<input class="uk-input uk-form-width-medium" type="text" id="selected-case-id" value="' + tangoPage['cases'][selectedCaseIndex]['id'] + '"/></h3>';
    html += '<table class="uk-table uk-table-striped">';
    html += '<tr>';
    html += '<th>Field Name</th>';
    html += '<th>Test Value</th>';
    html += '</tr>';

    for (i in tangoPage['cases'][selectedCaseIndex]['test_data']) {
        html += '<tr>';
        html += '<td>' + tangoPage['cases'][selectedCaseIndex]['test_data'][i]['field_name'] + '</td>';
        html += '<td> <input id="custom-case-update-'
                + tangoPage['cases'][selectedCaseIndex]['test_data'][i]['field_name']
                + '" class="uk-input" type="text" value="'
                + tangoPage['cases'][selectedCaseIndex]['test_data'][i]['test_value'] + '"></td>';
        html += '</tr>';
    }
    html += '</table>';
    $('#selected-case-details').html(html);

    $('#importance-rating' + tangoPage['cases'][selectedCaseIndex]['importance']).prop('checked', true);

    let status = tangoPage['cases'][selectedCaseIndex]['status'];
    if (status === 'Pass') $('#pass-status').prop('checked', true);
    else if (status === 'Fail') $('#fail-status').prop('checked', true);
    else $('#not-ran-status').prop('checked', true);
}

function updateSelectorsTable() {
    var html = '<h3 class="uk-heading-divider">Selectors</h1>';
    html += '<table class="uk-table uk-table-striped">';
    html += '<tr>';
    html += '<th>Field Name</th>';
    html += '<th>Selector</th>';
    html += '</tr>';

    for (i in tangoPage['fields']) {
        html += '<tr>';
        html += '<td>' + tangoPage['fields'][i]['name'] + '</td>';
        html += '<td> <input id="custom-selector' + i + '" class="uk-input" type="text" value="' + tangoPage['fields'][i]['selector'] + '"></td>';
        html += '</tr>';
    }
    html += '</table>';
    $('#selectors-table').html(html)
}

function updateCustomCaseTable(caseId, permutation) {
    let html = '<h3 class="uk-heading-divider">New Case - ' + '<input class="uk-input uk-form-width-medium" type="text" id="custom-case-id" value="' + caseId + '"/></h3>';
    html += '<table class="uk-table uk-table-striped">';

    html += '<tr>';
    html += '<th>Field Name</th>';
    html += '<th>Value</th>';
    html += '</tr>';
    for (i in tangoPage['fields']) {
        html += '<tr>';
        html += '<td>' + tangoPage['fields'][i]['name'] + '</td>';
        html += '<td> <input id="custom-case-new-' + tangoPage['fields'][i]['name']+ '" class="uk-input" type="text" value="' + permutation[i]['test_values'][0] + '"/></td>';
        html += '</tr>';
    }

    html += '</table>';
    $('#custom-case-details').html(html);
}