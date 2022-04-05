$(document).ready(function() {
    var csrftoken = Cookies.get('csrftoken'); //getCookie('csrftoken');

    function update_add_request(row, doorbell_id, lampi_id, vals, is_add=false) {
        data_to_send = {
            csrfmiddlewaretoken: csrftoken,
            doorbell: doorbell_id,
            lampi: lampi_id,
            is_add: is_add,
        };

        if (vals['color'])
            data_to_send.color = vals['color']
        if (vals['number_flashes'])
            data_to_send.number_flashes = vals['number_flashes']

        $.post("/lampi/links/update/", data_to_send, function(data, status) {
            var vals = JSON.parse(data);
            console.log(data);
            if (vals.outcome === "updated") {
                var alert = $('<div class="alert alert-success fade show" role="alert">Successfully Updated!</div>').appendTo("#alert-container");
                createAutoClosingAlert(alert, 2000);
                row.replaceWith(build_table_row(vals.link));
            } else if (vals.outcome === "created") {
                var alert = $('<div class="alert alert-success fade show" role="alert">Successfully Added!</div>').appendTo("#alert-container");
                createAutoClosingAlert(alert, 2000);
                $('#linkTable').append(build_table_row(vals.link))
                $('#addLinkForm').trigger('reset')
            } else if (vals.outcome === "failed") {
                if (is_add) {
                    var alert = $('<div class="alert alert-danger fade show" role="alert">' + vals.message + '</div>').appendTo("#alert-container");
                    createAutoClosingAlert(alert, 2000);
                } else {
                    var alert = $('<div class="alert alert-danger fade show" role="alert">Failed to update link!</div>').appendTo("#alert-container");
                    createAutoClosingAlert(alert, 2000);
                }
            }
        });
    }

    function createAutoClosingAlert(selector, delay) {
        var alert = selector.alert();
        window.setTimeout(function() { alert.alert('close');}, delay);
        /*window.setTimeout(function()
                {selector.hide(500, function() {
                    selector.remove();
                })}, delay);*/
    }

    $("#linkTable").on('change', '.input-listen-changes', function() {
        console.log("detected change")
        let row = $(this).closest(".editable-table-row");
        let doorbell = row.data('doorbell-uid');
        let lampi = row.data('lampi-uid');
        let name = $(this).attr('name');
        var vals = {};
        vals[name] = $(this).val();
        if (doorbell != "" && lampi != "") {
            update_add_request(row, doorbell, lampi, vals);
        }
    });

    $("#saveNewLink").click(function() {
       let doorbellSelect = $('#doorbellSelect :selected').val();
       let lampiSelect = $('#lampiSelect :selected').val();
       let newColor = $('#newColor').val();
       let newNumberFlashes = $('#newNumberFlashes').val();

       var vals = {};
       if (doorbellSelect != "" && lampiSelect != "") {
           if (newColor != "") {
               vals['color'] = newColor;
           }
           if (newNumberFlashes != "") {
               vals['number_flashes'] = newNumberFlashes;
           }
           update_add_request(null, doorbellSelect, lampiSelect, vals, true);
       }
    });

    $('.remove-link-button').click(function() {
        let row = $(this).closest(".editable-table-row");
        let doorbell = row.data('doorbell-uid');
        let lampi = row.data('lampi-uid');

        if (doorbell === "" || lampi === "")
            return;

        $.post("/lampi/links/delete/",
            {
                csrfmiddlewaretoken: csrftoken,
                doorbell: doorbell,
                lampi: lampi
            }, function(data, status) {
                var vals = JSON.parse(data);
                console.log(data);
                if (vals.outcome === "success") {
                    var alert = $('<div class="alert alert-success fade show" role="alert">Successfully deleted link!</div>').appendTo("#alert-container");
                    createAutoClosingAlert(alert, 2000);
                    row.fadeOut("slow", function(){});
                } else if (vals.outcome === "failed") {
                    var alert = $('<div class="alert alert-danger fade show" role="alert">' + vals.message + '</div>').appendTo("#alert-container");
                    createAutoClosingAlert(alert, 2000);
                }
        });
    });

    function build_table_row(link) {
        return '<tr class="editable-table-row" data-doorbell-uid="' + link.doorbell.device_id + '" data-lampi-uid="' + link.lampi.device_id + '">\
            <td><a href="/lampi/devices/' + link.doorbell.device_id + '/">' + link.doorbell.name + '</a></td>\
            <td><a href="/lampi/devices/' + link.lampi.device_id + '/">' + link.lampi.name + '</a></td>\
            <td>\
                <div class="input-group mb-3">\
                    <input type="color" class="form-control form-control-color input-listen-changes" name="color" value="' + link.hex_color + '" title="Choose the Color to Flash">\
                </div>\
            </td>\
            <td>\
                <div class="input-group mb-3">\
                    <input type="number" min="1" max="25" step="1" class="form-control input-listen-changes" name="number_flashes"\
                           placeholder="Number Flashes" value="' + link.number_flashes + '">\
                </div>\
            </td>\
            <td>\
                <button class="btn btn-danger remove-link-button" type="button">\
                    <i class="bi bi-x"></i>\
                </button>\
            </td>\
        </tr>';
    }
});